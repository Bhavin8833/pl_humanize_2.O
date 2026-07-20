@echo off
echo ===================================================
echo Pushing your project to GitHub...
echo ===================================================

git config user.name "Bhavin Parmar"
git config user.email "bhavinparmar8833@gmail.com"
git add .
git commit -m "feat: add Plagiarism Checker feature"
git push origin main

echo.
echo ===================================================
echo Done! Your code should now be uploaded to GitHub.
echo ===================================================
pause
