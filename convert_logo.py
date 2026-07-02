from PIL import Image
import os

jpg_path = r"C:\Users\Bhavin Parmar\.gemini\antigravity-ide\brain\126c49ed-e595-4215-a052-34f65c99e184\media__1781755561203.jpg"
public_dir = r"F:\Project\PL_Humanize_New\public"
electron_dir = r"F:\Project\PL_Humanize_New\electron"

# Ensure directories exist
os.makedirs(public_dir, exist_ok=True)
os.makedirs(electron_dir, exist_ok=True)

if os.path.exists(jpg_path):
    img = Image.open(jpg_path)
    
    # Save as logo.png in public
    png_path = os.path.join(public_dir, "logo.png")
    img.save(png_path, "PNG")
    print(f"Saved PNG to {png_path}")
    
    # Save as icon.ico in electron
    ico_path = os.path.join(electron_dir, "icon.ico")
    # ICO supports sizes up to 256x256
    img_resized = img.resize((256, 256))
    img_resized.save(ico_path, format="ICO", sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)])
    print(f"Saved ICO to {ico_path}")
    
    # Also save as icon.png in electron
    img_resized.save(os.path.join(electron_dir, "icon.png"), "PNG")
    print("Saved icon.png to electron")
else:
    print(f"JPG not found at {jpg_path}")
