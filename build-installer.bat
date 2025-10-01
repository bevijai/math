@echo off
echo ====================================
echo  Squid Game Math Challenge Builder
echo ====================================
echo.

echo Current directory: %CD%
echo.

echo Checking if Node.js is installed...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Checking if package.json exists...
if exist package.json (
    echo package.json found!
) else (
    echo Setting up Electron build environment...
    if exist package-electron.json (
        copy package-electron.json package.json
        echo Copied package-electron.json to package.json
    ) else (
        echo ERROR: package-electron.json not found!
        echo Please make sure you're in the correct directory.
        pause
        exit /b 1
    )
)

echo.
echo Checking if dependencies are installed...
if exist node_modules (
    echo Dependencies already installed!
) else (
    echo Installing dependencies...
    echo This may take a few minutes...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        echo Please check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
)

echo.
echo ====================================
echo Choose build option:
echo ====================================
echo 1. Test app locally
echo 2. Build Windows installer (.exe)
echo 3. Build all platforms
echo 4. Create portable package
echo 5. Just install dependencies and exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Starting app locally...
    echo Press Ctrl+C to stop the app
    echo.
    npm start
    if %errorlevel% neq 0 (
        echo ERROR: Failed to start app
        pause
    )
) else if "%choice%"=="2" (
    echo.
    echo Building Windows installer...
    echo This may take several minutes...
    npm run build-win
    if %errorlevel% neq 0 (
        echo ERROR: Build failed!
        pause
    ) else (
        echo.
        echo ✅ Build complete! 
        echo Check the 'dist' folder for the installer.
        echo Look for: "Squid Game Math Challenge Setup 1.0.0.exe"
    )
) else if "%choice%"=="3" (
    echo.
    echo Building for all platforms...
    echo This may take several minutes...
    npm run dist
    if %errorlevel% neq 0 (
        echo ERROR: Build failed!
        pause
    ) else (
        echo.
        echo ✅ Build complete! 
        echo Check the 'dist' folder for installers.
    )
) else if "%choice%"=="4" (
    echo.
    echo Creating portable package...
    if not exist "Squid Game Math Challenge Portable" mkdir "Squid Game Math Challenge Portable"
    
    if exist squid_game_red_light-2.html (
        copy squid_game_red_light-2.html "Squid Game Math Challenge Portable\index.html"
        echo Copied main game file
    ) else (
        echo ERROR: squid_game_red_light-2.html not found!
        pause
        exit /b 1
    )
    
    if exist multiplayer-server.js (
        copy multiplayer-server.js "Squid Game Math Challenge Portable\"
        echo Copied multiplayer server
    )
    
    echo @echo off > "Squid Game Math Challenge Portable\run-game.bat"
    echo echo Starting Squid Game Math Challenge... >> "Squid Game Math Challenge Portable\run-game.bat"
    echo start "" "index.html" >> "Squid Game Math Challenge Portable\run-game.bat"
    
    echo.
    echo ✅ Portable package created!
    echo Folder: 'Squid Game Math Challenge Portable'
    echo To play: Double-click 'run-game.bat'
) else if "%choice%"=="5" (
    echo Dependencies installation complete!
) else (
    echo Invalid choice! Please enter 1, 2, 3, 4, or 5.
)

echo.
pause