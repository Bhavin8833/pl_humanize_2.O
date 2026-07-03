@echo off
echo ===================================================
echo Pushing your project to GitHub...
echo ===================================================

git add .
git commit -m "chore: fix vercel and github pages white screen issues"
git branch -M main
git remote add origin git@github.com:Bhavin8833/pl_humanize_2.O.git
git push -u origin main

echo.
echo ===================================================
echo Done! Your code should now be uploaded to GitHub.
echo If you saw an error about "origin already exists", ignore it or run this:
echo git remote set-url origin git@github.com:Bhavin8833/pl_humanize_2.O.git ^&^& git push -u origin main
echo ===================================================
pause
