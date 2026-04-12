@echo off
cd /d "%~dp0"

echo.
echo ========================================
echo   PRUDHVI PORTFOLIO - DEPLOY TO GITHUB
echo ========================================
echo.

git add -A

echo Enter commit message (or press Enter for default):
set /p MSG="> "

if "%MSG%"=="" set MSG=Update portfolio

git commit -m "%MSG%"

if %errorlevel%==0 (
    git push origin master
    echo.
    echo ========================================
    echo   PUSHED! Netlify will auto-deploy now.
    echo   Site: https://prudhvi-rdj.netlify.app
    echo ========================================
) else (
    echo.
    echo Nothing to commit - already up to date.
)

echo.
pause
