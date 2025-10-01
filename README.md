# 🎮 Squid Game Math Challenge

An educational math game inspired by the popular Netflix series "Squid Game". This interactive web application combines learning with entertainment, featuring two exciting game modes.

## 🎯 Game Modes

### 🔴 Red Light Green Light 🟢
- Solve math equations while the doll watches
- Move forward only during "Green Light" phases
- Complete 5 rounds to win
- Features both beginner (linear equations) and advanced (quadratic equations) difficulty levels

### 🌉 Glass Bridge Challenge
- Choose the correct answer to step on safe glass panels
- 10 steps to cross the bridge
- Wrong answers break the glass and cost you a life
- Timer-based challenges with heartbeat sound effects

## ✨ Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Audio System**: Background music, sound effects, and timer alerts
- **Player Movement**: Visual character progression through game levels
- **Multiple Difficulty Levels**: Beginner and Advanced math problems
- **Timer System**: Countdown timers with visual and audio feedback
- **Life System**: Multiple attempts with visual life indicators
- **Pause/Resume**: Music and game controls
- **Electron App**: Desktop application support

## 🚀 How to Play

### Web Version
1. Open `squid_game_red_light-2.html` in your web browser
2. Choose your game mode (Red Light Green Light or Glass Bridge)
3. Select difficulty level (Beginner or Advanced)
4. Follow on-screen instructions and solve math problems to progress

### Desktop App
1. Run `npm start` to launch the Electron desktop application
2. Or use the portable version in the "Squid Game Math Challenge Portable" folder

### Portable Version
1. Navigate to the "Squid Game Math Challenge Portable" folder
2. Run `run-game.bat` to start the game instantly

## 🛠️ Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Audio**: Web Audio API with multiple sound effects
- **Responsive**: CSS Grid and Flexbox layouts
- **Desktop**: Electron framework
- **Build Tools**: Node.js build scripts and installers

## 📁 Project Structure

```
├── squid_game_red_light-2.html    # Main game file
├── assets/                        # Game assets (music, sounds)
├── Squid Game Math Challenge Portable/  # Portable version
├── electron-main.js               # Electron main process
├── package.json                   # Node.js dependencies
├── build-installer.bat            # Windows installer builder
└── README.md                      # This file
```

## 🎵 Audio Features

- Background music with fade-in/out effects
- Sound effects for success, failure, and alerts
- Timer heartbeat sounds for urgency
- Music pause/resume functionality
- Volume controls

## 🏗️ Installation & Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Setup
```bash
# Clone the repository
git clone https://github.com/bevijai/math.git

# Navigate to project directory
cd math

# Install dependencies
npm install

# Run the desktop app
npm start
```

### Building Executables
```bash
# Build Windows installer
./build-installer.bat

# Or use PowerShell script
./build-installer.ps1
```

## 🎓 Educational Value

This game helps students practice:
- **Linear Equations**: Basic algebraic problem solving
- **Quadratic Equations**: Advanced mathematical concepts
- **Quick Mental Math**: Time-pressure calculations
- **Problem-Solving Skills**: Strategic thinking under pressure

## 🎨 Game Design

Inspired by the visual aesthetics and tension of Squid Game, featuring:
- Authentic color schemes and visual elements
- Character animations and movement systems
- Progressive difficulty scaling
- Immersive audio-visual experience

## 🔧 Recent Updates

- Fixed player movement calculations for precise finish line reaching
- Improved glass bridge player positioning on glass panels
- Enhanced music pause/resume functionality across both games
- Implemented timeout handling with user confirmations
- UI overlap fixes for better visual clarity
- Responsive movement calculations for different screen sizes

## 👥 Credits

**Concept and Development**: Samyuktha, Anantiyaa & Elaine
**Repository**: [bevijai/math](https://github.com/bevijai/math)

---

**🎮 Ready to test your math skills under pressure? Launch the game and see if you can survive the Squid Game Math Challenge!**