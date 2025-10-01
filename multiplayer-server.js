const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create HTTP server
const server = http.createServer((req, res) => {
    // Serve static files
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './squid_game_red_light-2.html';
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Game state
const gameRooms = new Map();
const playerSessions = new Map();

class GameRoom {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = new Map();
        this.gameState = {
            isActive: false,
            currentRound: 1,
            maxRounds: 5,
            currentPhase: 'waiting', // waiting, green, red, finished
            currentEquation: null,
            phaseStartTime: null,
            leaderboard: []
        };
        this.gameTimer = null;
    }

    addPlayer(playerId, playerData) {
        this.players.set(playerId, {
            id: playerId,
            name: playerData.name,
            websocket: playerData.websocket,
            position: 50,
            score: 0,
            solveTime: 0,
            isAlive: true,
            currentAnswer: null,
            difficulty: playerData.difficulty || 'beginner'
        });
        
        this.broadcastToRoom({
            type: 'player_joined',
            player: {
                id: playerId,
                name: playerData.name,
                position: 50,
                score: 0
            },
            totalPlayers: this.players.size
        });
        
        this.updateLeaderboard();
    }

    removePlayer(playerId) {
        if (this.players.has(playerId)) {
            this.players.delete(playerId);
            this.broadcastToRoom({
                type: 'player_left',
                playerId: playerId,
                totalPlayers: this.players.size
            });
            
            if (this.players.size === 0) {
                this.stopGame();
            } else {
                this.updateLeaderboard();
            }
        }
    }

    startGame() {
        if (this.players.size < 1) return;
        
        this.gameState.isActive = true;
        this.gameState.currentRound = 1;
        this.gameState.currentPhase = 'green';
        this.gameState.phaseStartTime = Date.now();
        
        // Reset all players
        for (let player of this.players.values()) {
            player.position = 50;
            player.score = 0;
            player.isAlive = true;
        }
        
        this.broadcastToRoom({
            type: 'game_started',
            gameState: this.gameState
        });
        
        this.startGreenLightPhase();
    }

    startGreenLightPhase() {
        this.gameState.currentPhase = 'green';
        this.gameState.phaseStartTime = Date.now();
        
        this.broadcastToRoom({
            type: 'phase_change',
            phase: 'green',
            message: 'GREEN LIGHT!'
        });
        
        // Green light lasts 5 seconds
        this.gameTimer = setTimeout(() => {
            this.startRedLightPhase();
        }, 5000);
    }

    startRedLightPhase() {
        this.gameState.currentPhase = 'red';
        this.gameState.phaseStartTime = Date.now();
        
        // Generate equation based on room difficulty (use first player's difficulty)
        const firstPlayer = this.players.values().next().value;
        const equation = this.generateEquation(firstPlayer?.difficulty || 'beginner');
        this.gameState.currentEquation = equation;
        
        this.broadcastToRoom({
            type: 'phase_change',
            phase: 'red',
            message: 'RED LIGHT!',
            equation: equation.display,
            timeLimit: 75
        });
        
        // Red light lasts 75 seconds max
        this.gameTimer = setTimeout(() => {
            this.eliminateSlowPlayers();
        }, 75000);
    }

    generateEquation(difficulty) {
        if (difficulty === 'beginner') {
            const solution = Math.floor(Math.random() * 21) - 10;
            const a = Math.floor(Math.random() * 9) + 2;
            const b = Math.floor(Math.random() * 21) - 10;
            const c = a * solution + b;
            
            let display = `${a}x `;
            if (b > 0) display += `+ ${b} = ${c}`;
            else if (b < 0) display += `${b} = ${c}`;
            else display += `= ${c}`;
            
            return { display, solutions: [solution] };
        } else {
            const solution1 = Math.floor(Math.random() * 21) - 10;
            let solution2 = Math.floor(Math.random() * 21) - 10;
            
            if (solution1 === solution2) {
                solution2 = solution1 + (Math.random() < 0.5 ? 1 : -1);
            }
            
            const b = -(solution1 + solution2);
            const c = solution1 * solution2;
            
            let display = `x² `;
            if (b > 0) display += `+ ${b}x `;
            else if (b < 0) display += `${b}x `;
            
            if (c > 0) display += `+ ${c} = 0`;
            else if (c < 0) display += `${c} = 0`;
            else display += `= 0`;
            
            return { 
                display, 
                solutions: [solution1, solution2].sort((a, b) => a - b) 
            };
        }
    }

    submitAnswer(playerId, answer, solveTime) {
        const player = this.players.get(playerId);
        if (!player || !player.isAlive || this.gameState.currentPhase !== 'red') {
            return;
        }

        const isCorrect = this.gameState.currentEquation.solutions.includes(parseInt(answer));
        
        if (isCorrect) {
            player.currentAnswer = answer;
            player.solveTime = solveTime;
            player.score += Math.max(1000 - solveTime * 10, 100); // Score based on speed
            player.position += 150; // Move forward
            
            this.broadcastToRoom({
                type: 'player_solved',
                playerId: playerId,
                solveTime: solveTime,
                newPosition: player.position,
                score: player.score
            });
            
            this.checkRoundCompletion();
        } else {
            player.isAlive = false;
            this.broadcastToRoom({
                type: 'player_eliminated',
                playerId: playerId,
                reason: 'wrong_answer',
                correctAnswers: this.gameState.currentEquation.solutions
            });
            
            this.checkGameEnd();
        }
    }

    eliminateSlowPlayers() {
        let eliminatedCount = 0;
        
        for (let player of this.players.values()) {
            if (player.isAlive && !player.currentAnswer) {
                player.isAlive = false;
                eliminatedCount++;
                
                this.broadcastToRoom({
                    type: 'player_eliminated',
                    playerId: player.id,
                    reason: 'timeout'
                });
            }
        }
        
        if (eliminatedCount > 0) {
            this.checkGameEnd();
        }
    }

    checkRoundCompletion() {
        const alivePlayers = Array.from(this.players.values()).filter(p => p.isAlive);
        const solvedPlayers = alivePlayers.filter(p => p.currentAnswer !== null);
        
        if (solvedPlayers.length === alivePlayers.length) {
            // All alive players solved the equation
            clearTimeout(this.gameTimer);
            this.nextRound();
        }
    }

    nextRound() {
        // Reset current answers
        for (let player of this.players.values()) {
            player.currentAnswer = null;
        }
        
        if (this.gameState.currentRound >= this.gameState.maxRounds) {
            this.endGame();
        } else {
            this.gameState.currentRound++;
            this.updateLeaderboard();
            
            setTimeout(() => {
                this.startGreenLightPhase();
            }, 3000);
        }
    }

    checkGameEnd() {
        const alivePlayers = Array.from(this.players.values()).filter(p => p.isAlive);
        
        if (alivePlayers.length === 0) {
            this.endGame();
        }
    }

    endGame() {
        this.gameState.isActive = false;
        this.gameState.currentPhase = 'finished';
        
        if (this.gameTimer) {
            clearTimeout(this.gameTimer);
        }
        
        this.updateLeaderboard();
        
        this.broadcastToRoom({
            type: 'game_ended',
            finalLeaderboard: this.gameState.leaderboard
        });
    }

    stopGame() {
        this.gameState.isActive = false;
        if (this.gameTimer) {
            clearTimeout(this.gameTimer);
        }
    }

    updateLeaderboard() {
        this.gameState.leaderboard = Array.from(this.players.values())
            .filter(p => p.isAlive)
            .sort((a, b) => b.score - a.score)
            .map((p, index) => ({
                rank: index + 1,
                id: p.id,
                name: p.name,
                score: p.score,
                position: p.position,
                isAlive: p.isAlive
            }));
        
        this.broadcastToRoom({
            type: 'leaderboard_update',
            leaderboard: this.gameState.leaderboard
        });
    }

    broadcastToRoom(message, excludePlayerId = null) {
        for (let player of this.players.values()) {
            if (player.id !== excludePlayerId && player.websocket.readyState === WebSocket.OPEN) {
                player.websocket.send(JSON.stringify(message));
            }
        }
    }

    getGameState() {
        return {
            ...this.gameState,
            players: Array.from(this.players.values()).map(p => ({
                id: p.id,
                name: p.name,
                position: p.position,
                score: p.score,
                isAlive: p.isAlive
            }))
        };
    }
}

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    
    ws.on('close', () => {
        // Remove player from room when disconnected
        for (let [sessionId, session] of playerSessions.entries()) {
            if (session.websocket === ws) {
                const room = gameRooms.get(session.roomId);
                if (room) {
                    room.removePlayer(sessionId);
                }
                playerSessions.delete(sessionId);
                break;
            }
        }
    });
});

function handleMessage(ws, data) {
    switch (data.type) {
        case 'join_room':
            joinRoom(ws, data);
            break;
        case 'start_game':
            startGame(ws, data);
            break;
        case 'submit_answer':
            submitAnswer(ws, data);
            break;
        case 'get_leaderboard':
            getLeaderboard(ws, data);
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
}

function joinRoom(ws, data) {
    const { roomId, playerName, difficulty } = data;
    const playerId = generatePlayerId();
    
    // Create room if it doesn't exist
    if (!gameRooms.has(roomId)) {
        gameRooms.set(roomId, new GameRoom(roomId));
    }
    
    const room = gameRooms.get(roomId);
    
    // Add player to room
    room.addPlayer(playerId, {
        name: playerName,
        websocket: ws,
        difficulty: difficulty
    });
    
    // Store player session
    playerSessions.set(playerId, {
        websocket: ws,
        roomId: roomId,
        playerId: playerId
    });
    
    // Send join confirmation
    ws.send(JSON.stringify({
        type: 'joined_room',
        playerId: playerId,
        roomId: roomId,
        gameState: room.getGameState()
    }));
}

function startGame(ws, data) {
    const session = findPlayerSession(ws);
    if (!session) return;
    
    const room = gameRooms.get(session.roomId);
    if (room) {
        room.startGame();
    }
}

function submitAnswer(ws, data) {
    const session = findPlayerSession(ws);
    if (!session) return;
    
    const room = gameRooms.get(session.roomId);
    if (room) {
        room.submitAnswer(session.playerId, data.answer, data.solveTime);
    }
}

function getLeaderboard(ws, data) {
    const session = findPlayerSession(ws);
    if (!session) return;
    
    const room = gameRooms.get(session.roomId);
    if (room) {
        ws.send(JSON.stringify({
            type: 'leaderboard_update',
            leaderboard: room.gameState.leaderboard
        }));
    }
}

function findPlayerSession(ws) {
    for (let session of playerSessions.values()) {
        if (session.websocket === ws) {
            return session;
        }
    }
    return null;
}

function generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
}

function generateRoomId() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🎮 Squid Game Multiplayer Server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} to play!`);
});

// Cleanup inactive rooms every 5 minutes
setInterval(() => {
    for (let [roomId, room] of gameRooms.entries()) {
        if (room.players.size === 0) {
            gameRooms.delete(roomId);
            console.log(`Cleaned up empty room: ${roomId}`);
        }
    }
}, 5 * 60 * 1000);