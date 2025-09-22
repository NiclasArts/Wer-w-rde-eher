import React, { useState } from 'react';
import Card from './Card';

interface HomeScreenProps {
    socket: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ socket }) => {
    const [playerName, setPlayerName] = useState('');
    const [gameCode, setGameCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);


    const validateAndExecute = (action: () => void) => {
        if (playerName.trim().length < 2) {
            setError('Dein Spielername muss mindestens 2 Zeichen lang sein.');
            return;
        }
        setError(null);
        setIsLoading(true);
        action();
    };

    const handleCreateGame = () => {
        validateAndExecute(() => {
            socket.emit('createGame', { playerName: playerName.trim() });
        });
    };

    const handleJoinGame = () => {
        if (gameCode.trim().length !== 4) {
            setError('Der Spiel-Code muss genau 4 Zeichen lang sein.');
            return;
        }
        validateAndExecute(() => {
            socket.emit('joinGame', { gameCode: gameCode.trim().toUpperCase(), playerName: playerName.trim() });
        });
    };

    if (!socket) {
        return (
            <Card>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-300">Verbinde mit Server...</h1>
                     <div className="mt-4 flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-1">Wer würde Eher?</h1>
                <p className="text-lg text-slate-400">Stammtisch Kollnau Edt.</p>
            </div>

            <div className="my-8 space-y-4">
                <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Dein Spielername"
                    maxLength={15}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                />

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </div>

            <div className="space-y-4">
                <button
                    onClick={handleCreateGame}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold py-4 text-xl rounded-lg shadow-lg hover:shadow-pink-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Erstelle...' : 'Neues Spiel erstellen'}
                </button>

                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                        placeholder="Spiel-Code"
                        maxLength={4}
                        className="flex-grow bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    />
                    <button
                        onClick={handleJoinGame}
                        disabled={isLoading}
                        className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50"
                    >
                         {isLoading ? '...' : 'Beitreten'}
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default HomeScreen;