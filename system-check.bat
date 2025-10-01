@echo off
echo ====================================
echo  System Check for Build Environment
echo ====================================
echo.

echo Current directory: %CD%
echo.

echo Files in current directory:
dir /b *.html *.js *.json
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo Node.js NOT found!
    echo Please install from https://nodejs.org/
) else (
    echo Node.js OK!
)
echo.

echo Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo npm NOT found!
) else (
    echo npm OK!
)
echo.

echo Checking required files...
if exist squid_game_red_light-2.html (
    echo ✅ Main game file found
) else (
    echo ❌ squid_game_red_light-2.html NOT found
)

if exist electron-main.js (
    echo ✅ Electron main file found
) else (
    echo ❌ electron-main.js NOT found
)

if exist package.json (
    echo ✅ package.json found
) else (
    echo ❌ package.json NOT found
)

if exist package-electron.json (
    echo ✅ package-electron.json found
) else (
    echo ❌ package-electron.json NOT found
)

if exist node_modules (
    echo ✅ node_modules folder found
) else (
    echo ❌ node_modules folder NOT found - need to run npm install
)

echo.
echo System check complete!
echo.
pause