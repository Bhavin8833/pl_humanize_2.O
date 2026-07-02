import fs from 'fs';
import path from 'path';

const src = "C:\\Users\\Bhavin Parmar\\.gemini\\antigravity-ide\\brain\\126c49ed-e595-4215-a052-34f65c99e184\\media__1781755561203.jpg";
const dest1 = "F:\\Project\\PL_Humanize_New\\public\\logo.png";
const dest2 = "F:\\Project\\PL_Humanize_New\\electron\\icon.png";

// Ensure directories exist
fs.mkdirSync(path.dirname(dest1), { recursive: true });
fs.mkdirSync(path.dirname(dest2), { recursive: true });

try {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest1);
    fs.copyFileSync(src, dest2);
    console.log("Success: Logo copied to public/logo.png and electron/icon.png");
  } else {
    console.error("Error: Source file does not exist at", src);
  }
} catch (err) {
  console.error("Error copying file:", err.message);
}
