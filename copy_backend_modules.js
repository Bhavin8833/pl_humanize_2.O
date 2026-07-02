import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('backend/node_modules');
const destDir = path.resolve('dist-electron-build/win-unpacked/resources/backend/node_modules');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('Copying backend node_modules to packaged app resources...');
try {
    if (fs.existsSync(srcDir)) {
        copyDir(srcDir, destDir);
        console.log('Successfully copied backend node_modules!');
    } else {
        console.error('Source backend/node_modules does not exist. Please run npm install inside backend directory first.');
    }
} catch (err) {
    console.error('Failed to copy backend node_modules:', err.message);
}
