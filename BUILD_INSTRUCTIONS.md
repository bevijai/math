# Squid Game Math Challenge - Build Instructions

## 📦 Creating a Self-Installable Application

### Method 1: Electron Desktop App (Recommended)

#### Prerequisites:
1. Install Node.js (https://nodejs.org/)
2. Open terminal in the project folder

#### Build Steps:

```bash
# 1. Copy the electron package.json
cp package-electron.json package.json

# 2. Install dependencies
npm install

# 3. Test the app locally
npm start

# 4. Build installer for Windows
npm run build-win

# 5. Build for Mac (on Mac only)
npm run build-mac

# 6. Build for Linux
npm run build-linux
```

#### Output:
- **Windows**: `dist/Squid Game Math Challenge Setup 1.0.0.exe`
- **Mac**: `dist/Squid Game Math Challenge-1.0.0.dmg`
- **Linux**: `dist/Squid Game Math Challenge-1.0.0.AppImage`

---

### Method 2: Portable HTML Package

#### For a simple portable solution:

```bash
# Create a standalone folder
mkdir "Squid Game Math Challenge Portable"
cd "Squid Game Math Challenge Portable"

# Copy game files
cp ../squid_game_red_light-2.html index.html
cp ../multiplayer-server.js ./
cp ../package.json ./

# Create run scripts
echo 'start "" "index.html"' > run-game.bat
echo '#!/bin/bash\nopen index.html' > run-game.sh
chmod +x run-game.sh

# Zip the folder
zip -r "Squid Game Math Challenge.zip" .
```

---

### Method 3: Progressive Web App (PWA)

Add these files to make it installable from browser:

#### manifest.json:
```json
{
  "name": "Squid Game Math Challenge",
  "short_name": "Math Challenge",
  "description": "Educational math game for kids",
  "start_url": "./squid_game_red_light-2.html",
  "display": "standalone",
  "background_color": "#87CEEB",
  "theme_color": "#ff0000",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to HTML head:
```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#ff0000">
```

---

### File Sizes (Approximate):
- **Electron App**: 150-200 MB (includes Chromium)
- **Portable HTML**: 1-2 MB (requires browser)
- **PWA**: 1-2 MB (installable from web)

### Recommended Approach:
**Electron** for professional distribution, **Portable HTML** for quick sharing.

### Next Steps:
1. Choose your preferred method
2. Follow the build instructions above
3. Test the installer on target machines
4. Distribute the installer file

The Electron app will create a professional installer that users can double-click to install the game on their computer with desktop shortcuts and start menu entries!