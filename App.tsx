import React, { useState, useEffect } from 'react';
import { GameState, GamePhase } from './types';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import RoundResultScreen from './components/RoundResultScreen';
import GameOverScreen from './components/GameOverScreen';

declare const io: any;

const App: React.FC = () => {
    const [socket, setSocket] = useState<any>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const newSocket = io({
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server with id:', newSocket.id);
            setPlayerId(newSocket.id);
        });

        newSocket.on('gameStateUpdate', (newGameState: GameState) => {
            setGameState(newGameState);
            setError(null); // Clear previous errors on successful update
        });

        newSocket.on('error', (data: { message: string }) => {
            setError(data.message);
            setTimeout(() => setError(null), 5000); // Auto-hide error after 5s
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setGameState(null); // Reset game state on disconnect
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const renderGameState = (): React.ReactNode => {
        if (!gameState || !playerId) {
            return <HomeScreen socket={socket} />;
        }

        const playerIsHost = gameState.players.find(p => p.id === playerId)?.isHost || false;
        const currentQuestion = gameState.shuffledQuestions[gameState.currentQuestionIndex];

        switch (gameState.phase) {
            case 'LOBBY':
                return <SetupScreen gameState={gameState} socket={socket} playerIsHost={playerIsHost} />;
            case 'GAME':
                return <GameScreen
                            question={currentQuestion}
                            gameState={gameState}
                            socket={socket}
                            playerId={playerId}
                        />;
            case 'ROUND_RESULT':
                 return <RoundResultScreen
                            question={currentQuestion}
                            gameState={gameState}
                            socket={socket}
                            playerIsHost={playerIsHost}
                        />;
            case 'GAME_OVER':
                return <GameOverScreen 
                            gameState={gameState} 
                            socket={socket} 
                            playerIsHost={playerIsHost} 
                        />;
            default:
                return <HomeScreen socket={socket} />;
        }
    };

    return (
        <div className="gradient-bg min-h-screen text-white flex items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto relative">
                {error && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-4 w-full max-w-md bg-red-500/90 text-white text-center p-3 rounded-lg shadow-lg animate-fade-in">
                        {error}
                    </div>
                )}
                {renderGameState()}
            </div>
        </div>
    );
};

export default App;
