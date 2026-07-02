import { contextBridge, ipcRenderer } from 'electron';

// Expose APIs to the main world
contextBridge.exposeInMainWorld('electronAPI', {
    isElectron: true,
    getBackendPort: () => ipcRenderer.invoke('get-backend-port'),
    getBackendPortSync: () => ipcRenderer.sendSync('get-backend-port-sync'),
    restartBackend: () => ipcRenderer.invoke('restart-backend'),
    onBackendStatus: (callback: (status: string) => void) => {
        const listener = (_event: any, status: string) => callback(status);
        ipcRenderer.on('backend-status', listener);
        return () => {
            ipcRenderer.off('backend-status', listener);
        };
    },
    onBackendLog: (callback: (log: string) => void) => {
        const listener = (_event: any, log: string) => callback(log);
        ipcRenderer.on('backend-log', listener);
        return () => {
            ipcRenderer.off('backend-log', listener);
        };
    }
});

// Backward compatibility or DOM updates
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector: string, text: string) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency] || 'unknown');
    }
});
