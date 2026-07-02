import fs from 'fs';
import path from 'path';

const asarPath = path.resolve('dist-electron-build/win-unpacked/resources/app.asar');

console.log('Testing access to app.asar...');
try {
    if (fs.existsSync(asarPath)) {
        // Try to rename it
        const bakPath = asarPath + '.bak';
        if (fs.existsSync(bakPath)) {
            fs.unlinkSync(bakPath);
        }
        fs.renameSync(asarPath, bakPath);
        console.log('Successfully renamed app.asar to app.asar.bak! It is NOT locked.');
        // Rename it back
        fs.renameSync(bakPath, asarPath);
    } else {
        console.log('app.asar does not exist.');
    }
} catch (err) {
    console.error('Failed to access app.asar:', err.message);
    console.error(err);
}
