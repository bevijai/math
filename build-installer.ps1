# Squid Game Math Challenge Builder
# PowerShell version for better error handling

Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Squid Game Math Challenge Builder" -ForegroundColor Cyan  
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Check Node.js
Write-Host "Checking if Node.js is installed..." -ForegroundColor Green
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check package.json
if (Test-Path "package.json") {
    Write-Host "package.json found!" -ForegroundColor Green
} else {
    Write-Host "Setting up Electron build environment..." -ForegroundColor Yellow
    if (Test-Path "package-electron.json") {
        Copy-Item "package-electron.json" "package.json"
        Write-Host "Copied package-electron.json to package.json" -ForegroundColor Green
    } else {
        Write-Host "ERROR: package-electron.json not found!" -ForegroundColor Red
        Write-Host "Please make sure you're in the correct directory." -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""

# Check dependencies
if (Test-Path "node_modules") {
    Write-Host "Dependencies already installed!" -ForegroundColor Green
} else {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    
    try {
        npm install
        Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
        Write-Host "Please check your internet connection and try again." -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Choose build option:" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "1. Test app locally" -ForegroundColor White
Write-Host "2. Build Windows installer (.exe)" -ForegroundColor White
Write-Host "3. Build all platforms" -ForegroundColor White
Write-Host "4. Create portable package" -ForegroundColor White
Write-Host "5. Just install dependencies and exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Starting app locally..." -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop the app" -ForegroundColor Yellow
        Write-Host ""
        try {
            npm start
        } catch {
            Write-Host "ERROR: Failed to start app" -ForegroundColor Red
            Read-Host "Press Enter to exit"
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "Building Windows installer..." -ForegroundColor Green
        Write-Host "This may take several minutes..." -ForegroundColor Yellow
        try {
            npm run build-win
            Write-Host ""
            Write-Host "✅ Build complete!" -ForegroundColor Green
            Write-Host "Check the 'dist' folder for the installer." -ForegroundColor Yellow
            Write-Host "Look for: 'Squid Game Math Challenge Setup 1.0.0.exe'" -ForegroundColor Yellow
        } catch {
            Write-Host "ERROR: Build failed!" -ForegroundColor Red
            Write-Host $_.Exception.Message -ForegroundColor Red
            Read-Host "Press Enter to exit"
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "Building for all platforms..." -ForegroundColor Green
        Write-Host "This may take several minutes..." -ForegroundColor Yellow
        try {
            npm run dist
            Write-Host ""
            Write-Host "✅ Build complete!" -ForegroundColor Green
            Write-Host "Check the 'dist' folder for installers." -ForegroundColor Yellow
        } catch {
            Write-Host "ERROR: Build failed!" -ForegroundColor Red
            Write-Host $_.Exception.Message -ForegroundColor Red
            Read-Host "Press Enter to exit"
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "Creating portable package..." -ForegroundColor Green
        
        $portableDir = "Squid Game Math Challenge Portable"
        if (!(Test-Path $portableDir)) {
            New-Item -ItemType Directory -Path $portableDir | Out-Null
        }
        
        if (Test-Path "squid_game_red_light-2.html") {
            Copy-Item "squid_game_red_light-2.html" "$portableDir\index.html"
            Write-Host "Copied main game file" -ForegroundColor Green
        } else {
            Write-Host "ERROR: squid_game_red_light-2.html not found!" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
        
        if (Test-Path "multiplayer-server.js") {
            Copy-Item "multiplayer-server.js" $portableDir
            Write-Host "Copied multiplayer server" -ForegroundColor Green
        }
        
        # Create run script
        $runScript = @"
@echo off
echo Starting Squid Game Math Challenge...
start "" "index.html"
"@
        $runScript | Out-File -FilePath "$portableDir\run-game.bat" -Encoding ASCII
        
        Write-Host ""
        Write-Host "✅ Portable package created!" -ForegroundColor Green
        Write-Host "Folder: '$portableDir'" -ForegroundColor Yellow
        Write-Host "To play: Double-click 'run-game.bat'" -ForegroundColor Yellow
    }
    
    "5" {
        Write-Host "Dependencies installation complete!" -ForegroundColor Green
    }
    
    default {
        Write-Host "Invalid choice! Please enter 1, 2, 3, 4, or 5." -ForegroundColor Red
    }
}

Write-Host ""
Read-Host "Press Enter to exit"