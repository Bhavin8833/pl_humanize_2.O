import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import net from 'net';

// Override the user data directory to a fresh path to avoid file locks from zombie processes or permission corruption
app.setName('PL Humanizer Desktop');
try {
    const appDataPath = app.getPath('appData');
    const userDataPath = path.join(appDataPath, 'PL Humanizer Desktop');
    app.setPath('userData', userDataPath);

    // Clean up old cache directories from previous launches that are no longer locked
    if (fs.existsSync(userDataPath)) {
        const files = fs.readdirSync(userDataPath);
        for (const file of files) {
            if (file.startsWith('Cache_') || file.startsWith('GPUCache_')) {
                const fullPath = path.join(userDataPath, file);
                try {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                } catch (e) {
                    // Folder is locked by a zombie process, ignore and proceed
                }
            }
        }
    }

    // Set unique cache paths for this launch to prevent "Access is denied" startup crashes
    const launchId = Date.now().toString();
    app.commandLine.appendSwitch('disk-cache-dir', path.join(userDataPath, 'Cache_' + launchId));
    app.commandLine.appendSwitch('gpu-disk-cache-dir', path.join(userDataPath, 'GPUCache_' + launchId));
} catch (e) {
    console.error('Failed to set userData path or initialize cache settings:', e);
}


// Disable GPU Hardware Acceleration to prevent GPU process crashes on AMD/Windows laptops
app.disableHardwareAcceleration();

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('disable-3d-apis');
app.commandLine.appendSwitch('disable-webgpu');
app.commandLine.appendSwitch('disable-webgl');

// Additional safeguards to prevent Access Denied / Sandbox crashes on startup
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-features', 'NetworkServiceSandbox');





// Robust crash logging to userData directory
function logCrash(type: string, details: string) {
    try {
        const logDir = app.getPath('userData');
        const crashLogPath = path.join(logDir, 'crash-log.txt');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        const timestamp = new Date().toISOString();
        fs.appendFileSync(crashLogPath, `[${timestamp}] ${type}: ${details}\n\n`);
    } catch (e) {
        console.error('Failed to write crash log:', e);
    }
}

process.on('uncaughtException', (error) => {
    logCrash('Uncaught Exception', error.stack || error.message || String(error));
    app.quit();
});

process.on('unhandledRejection', (reason) => {
    logCrash('Unhandled Rejection', String(reason));
});

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let backendPort = 5000;
let backendStatus = 'stopped'; // 'stopped' | 'starting' | 'ready' | 'error'
const logBuffer: string[] = [];

const isDev = !app.isPackaged;

// Bootstrap assets: copy logo from user's appData brain folder to workspace on start (Dev only)
function bootstrapAssets() {
    if (app.isPackaged) return; // Skip entirely in production (app.asar is read-only)
    const brainDir = "C:\\Users\\Bhavin Parmar\\.gemini\\antigravity-ide\\brain\\126c49ed-e595-4215-a052-34f65c99e184";
    const destLogo = path.join(__dirname, '../public/logo.png');
    const destLogoAssets = path.join(__dirname, '../src/assets/logo.png');
    const destIcon = path.join(__dirname, '../electron/icon.png');
    
    try {
        if (fs.existsSync(brainDir)) {
            const files = fs.readdirSync(brainDir);
            // Filter files starting with media__ and ending with .jpg (excluding PNG files of screenshots)
            const mediaJpgFiles = files.filter(f => f.startsWith('media__') && f.endsWith('.jpg'));
            if (mediaJpgFiles.length > 0) {
                // Sort to get the latest one (which contains the latest uploaded logo)
                mediaJpgFiles.sort();
                const latestJpg = mediaJpgFiles[mediaJpgFiles.length - 1];
                const srcJpg = path.join(brainDir, latestJpg);
                
                // Ensure folders exist
                fs.mkdirSync(path.dirname(destLogo), { recursive: true });
                fs.mkdirSync(path.dirname(destLogoAssets), { recursive: true });
                fs.mkdirSync(path.dirname(destIcon), { recursive: true });
                
                fs.copyFileSync(srcJpg, destLogo);
                fs.copyFileSync(srcJpg, destLogoAssets);
                fs.copyFileSync(srcJpg, destIcon);
                console.log(`[Bootstrap]: Successfully copied ${latestJpg} to public, assets and electron!`);
            } else {
                console.log("[Bootstrap]: No media__*.jpg files found in brain directory.");
            }
        } else {
            console.log("[Bootstrap]: Brain folder logo source not found. Skipping bootstrap.");
        }
    } catch (err: any) {
        console.error("[Bootstrap Error]: Failed to copy logo assets:", err.message);
    }
}

// Helper to keep log history, save to AppData, and send to renderer
function addLog(data: string) {
    const text = data.toString().trim();
    if (!text) return;
    
    // Write to a persistent backend-log.txt file in userData
    try {
        const logDir = app.getPath('userData');
        const logPath = path.join(logDir, 'backend-log.txt');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${text}\n`);
    } catch (e) {
        console.error('Failed to write backend log file:', e);
    }

    // Split multi-line logs and add timestamp
    const lines = text.split(/\r?\n/);
    lines.forEach(line => {
        const timestamp = new Date().toLocaleTimeString();
        const formattedLog = `[${timestamp}] ${line}`;
        logBuffer.push(formattedLog);
        
        // Keep buffer size reasonable
        if (logBuffer.length > 200) {
            logBuffer.shift();
        }

        // Send to renderer if window exists
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('backend-log', formattedLog);
        }
    });
}


function updateStatus(status: string) {
    backendStatus = status;
    console.log(`Backend Status: ${status} (Port: ${backendPort})`);
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('backend-status', { status, port: backendPort });
    }
}


// Net helper to find an available port
function getFreePort(startPort: number): Promise<number> {
    return new Promise((resolve) => {
        const checkPort = (port: number) => {
            const server = net.createServer();
            server.once('error', (err: any) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`Port ${port} in use, trying ${port + 1}`);
                    checkPort(port + 1);
                } else {
                    resolve(port);
                }
            });
            server.once('listening', () => {
                server.close(() => {
                    resolve(port);
                });
            });
            server.listen(port, '127.0.0.1');
        };
        checkPort(startPort);
    });
}

function launchBackend(): Promise<void> {
    return new Promise(async (resolve) => {
        let resolved = false;
        const done = () => {
            if (!resolved) {
                resolved = true;
                resolve();
            }
        };

        // 5-second safety fallback timeout to ensure window opens even if server crashes/hangs
        const timeout = setTimeout(() => {
            addLog("Warning: Backend start timed out. Continuing to open window.");
            done();
        }, 5000);

        updateStatus('starting');
        
        // Resolve port dynamically
        backendPort = await getFreePort(5000);
        addLog(`Starting local offline backend on port ${backendPort}...`);

        const backendPath = isDev
            ? path.join(__dirname, '../backend/server.js')
            : path.join(process.resourcesPath, 'backend/server.js');

        addLog(`Backend Path: ${backendPath}`);

        if (!fs.existsSync(backendPath)) {
            const err = `Backend file not found at: ${backendPath}`;
            addLog(err);
            updateStatus('error');
            clearTimeout(timeout);
            done();
            return;
        }

        try {
            // Spawn the backend using node with explicit working directory (cwd)
            backendProcess = spawn('node', [backendPath], {
                cwd: path.dirname(backendPath),
                env: { 
                    ...process.env, 
                    PORT: backendPort.toString()
                },
                stdio: 'pipe',
            });

            backendProcess.on('error', (err) => {
                addLog(`Failed to start backend: ${err.message}`);
                updateStatus('error');
                clearTimeout(timeout);
                done();
            });

            if (backendProcess.stdout) {
                backendProcess.stdout.on('data', (data) => {
                    const text = data.toString();
                    addLog(text);
                    if (text.includes('Server is running on') || text.includes('Also accessible at')) {
                        updateStatus('ready');
                        clearTimeout(timeout);
                        done();
                    }
                });
            }

            if (backendProcess.stderr) {
                backendProcess.stderr.on('data', (data) => {
                    addLog(`[Error] ${data.toString()}`);
                });
            }

            backendProcess.on('exit', (code) => {
                addLog(`Backend exited with code ${code}`);
                if (backendStatus !== 'starting') {
                    updateStatus('stopped');
                }
                clearTimeout(timeout);
                done();
            });
        } catch (err: any) {
            addLog(`Spawn exception: ${err.message}`);
            updateStatus('error');
            clearTimeout(timeout);
            done();
        }
    });
}

function killBackend() {
    if (backendProcess) {
        addLog('Stopping backend process...');
        backendProcess.kill();
        backendProcess = null;
        updateStatus('stopped');
    }
}

function createWindow() {
    const windowOptions: any = {
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true, // Secure mode
            nodeIntegration: false, // Secure mode
        },
        title: 'PL Humanizer',
    };

    if (isDev) {
        windowOptions.icon = path.join(__dirname, '../electron/icon.png');
    }

    mainWindow = new BrowserWindow(windowOptions);

    const backendUrl = `http://127.0.0.1:${backendPort}`;

    if (isDev) {
        mainWindow.loadURL(`http://localhost:8080/pl_humanize_2.O/?backendUrl=${encodeURIComponent(backendUrl)}`);
        mainWindow.webContents.openDevTools({ mode: 'detach' });
        mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
            console.error('Failed to load:', code, desc);
        });
    } else {
        // In production, load the index.html from the dist folder
        const indexHtml = path.join(__dirname, '../dist/index.html');
        mainWindow.loadFile(indexHtml, {
            query: {
                backendUrl: backendUrl
            }
        });
    }

    // When frontend is loaded, push the current log buffer
    mainWindow.webContents.on('did-finish-load', () => {
        if (mainWindow) {
            // Send connection details to the frontend
            mainWindow.webContents.send('backend-status', { status: backendStatus, port: backendPort });
            logBuffer.forEach(log => {
                mainWindow?.webContents.send('backend-log', log);
            });
        }
    });
}

// Setup IPC handlers
ipcMain.handle('get-backend-port', () => {
    return backendPort;
});

ipcMain.on('get-backend-port-sync', (event) => {
    event.returnValue = backendPort;
});

ipcMain.handle('restart-backend', async () => {
    addLog('Restarting backend requested by renderer...');
    killBackend();
    await launchBackend();
    return { port: backendPort, status: backendStatus };
});

app.whenReady().then(() => {
    bootstrapAssets();
    createWindow();
    launchBackend(); // Start the backend in the background to avoid blocking and race conditions

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    killBackend();
});

