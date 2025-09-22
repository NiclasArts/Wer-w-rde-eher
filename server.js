import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { DIRTY_QUESTIONS } from './constants/questions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '')));


// In-memory game storage
const games = {};

const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
};

const generateGameCode = () => {
    let code;
    do {
        code = Math.random().toString(36).substring(2, 6).toUpperCase();
    } while (games[code]);
    return code;
};


io.on('connection', (socket) => {

    const emitGameState = (gameCode) => {
        if (games[gameCode]) {
            io.to(gameCode).emit('gameStateUpdate', games[gameCode]);
        }
    };

    socket.on('createGame', ({ playerName }) => {
        const gameCode = generateGameCode();
        socket.join(gameCode);

        const player = {
            id: socket.id,
            name: playerName,
            score: 0,
            isHost: true,
        };

        games[gameCode] = {
            gameCode,
            phase: 'LOBBY',
            players: [player],
            shuffledQuestions: shuffleArray(DIRTY_QUESTIONS),
            currentQuestionIndex: 0,
            votes: [],
        };
        emitGameState(gameCode);
    });

    socket.on('joinGame', ({ gameCode, playerName }) => {
        const game = games[gameCode];
        if (!game) {
            socket.emit('error', { message: 'Spiel nicht gefunden.' });
            return;
        }
        if (game.phase !== 'LOBBY') {
            socket.emit('error', { message: 'Das Spiel hat bereits begonnen.' });
            return;
        }
        if (game.players.find(p => p.name === playerName)) {
            socket.emit('error', { message: 'Dieser Spielername ist bereits vergeben.' });
            return;
        }

        socket.join(gameCode);
        const player = {
            id: socket.id,
            name: playerName,
            score: 0,
            isHost: false,
        };
        game.players.push(player);
        emitGameState(gameCode);
    });

    socket.on('startGame', ({ gameCode }) => {
        const game = games[gameCode];
        if (game && game.players.find(p => p.id === socket.id && p.isHost)) {
            game.phase = 'GAME';
            emitGameState(gameCode);
        }
    });

    socket.on('vote', ({ gameCode, votedForId }) => {
        const game = games[gameCode];
        if (!game || game.phase !== 'GAME') return;

        const voterId = socket.id;
        // Prevent double voting
        if (game.votes.some(v => v.voterId === voterId)) return;

        game.votes.push({ voterId, votedForId });

        // If all players have voted, move to results
        if (game.votes.length === game.players.length) {
            const voteCounts = new Map();
            game.votes.forEach(vote => {
                voteCounts.set(vote.votedForId, (voteCounts.get(vote.votedForId) || 0) + 1);
            });

            game.players.forEach(p => {
                p.score += (voteCounts.get(p.id) || 0);
            });
            
            game.phase = 'ROUND_RESULT';
        }
        emitGameState(gameCode);
    });

    socket.on('nextRound', ({ gameCode }) => {
        const game = games[gameCode];
         if (game && game.players.find(p => p.id === socket.id && p.isHost)) {
            if (game.currentQuestionIndex + 1 < game.shuffledQuestions.length) {
                game.currentQuestionIndex++;
                game.votes = [];
                game.phase = 'GAME';
            } else {
                game.phase = 'GAME_OVER';
            }
            emitGameState(gameCode);
        }
    });
    
    socket.on('playAgain', ({ gameCode }) => {
        const game = games[gameCode];
        if (game && game.players.find(p => p.id === socket.id && p.isHost)) {
            game.phase = 'LOBBY';
            game.currentQuestionIndex = 0;
            game.votes = [];
            game.shuffledQuestions = shuffleArray(DIRTY_QUESTIONS);
            game.players.forEach(p => p.score = 0);
            emitGameState(gameCode);
        }
    });


    socket.on('disconnect', () => {
        // Find which game the player was in
        for (const gameCode in games) {
            const game = games[gameCode];
            const playerIndex = game.players.findIndex(p => p.id === socket.id);

            if (playerIndex > -1) {
                const wasHost = game.players[playerIndex].isHost;
                game.players.splice(playerIndex, 1);

                // If room is empty, delete it
                if (game.players.length === 0) {
                    delete games[gameCode];
                    break;
                }

                // If host left, assign a new host
                if (wasHost) {
                    game.players[0].isHost = true;
                }
                
                // If game was in progress and now all remaining players have voted
                if(game.phase === 'GAME' && game.votes.length === game.players.length) {
                     const voteCounts = new Map();
                    game.votes.forEach(vote => {
                        voteCounts.set(vote.votedForId, (voteCounts.get(vote.votedForId) || 0) + 1);
                    });
                    game.players.forEach(p => {
                        p.score += (voteCounts.get(p.id) || 0);
                    });
                    game.phase = 'ROUND_RESULT';
                }

                emitGameState(gameCode);
                break;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
