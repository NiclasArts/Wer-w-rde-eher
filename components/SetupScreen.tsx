import React from 'react';
import Card from './Card';
import { UsersIcon } from './icons';
import { GameState } from '../types';

interface SetupScreenProps {
  gameState: GameState;
  socket: any;
  playerIsHost: boolean;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ gameState, socket, playerIsHost }) => {
    
  const handleStart = () => {
    if (gameState.players.length < 2) return;
    socket.emit('startGame', { gameCode: gameState.gameCode });
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(gameState.gameCode).then(() => {
        // Optional: show a temporary confirmation message
    });
  };

  return (
    <Card>
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-200 mb-4">Lobby</h1>
        <p className="text-slate-400 mb-6">Lade deine Freunde mit dem Spiel-Code ein.</p>
        
        <div className="mb-8">
            <p className="text-slate-300 mb-2">Spiel-Code:</p>
            <div 
                className="inline-block bg-slate-900/70 border border-slate-700 rounded-lg px-8 py-3 text-4xl font-bold tracking-widest text-pink-400 cursor-pointer"
                onClick={copyCodeToClipboard}
                title="Klicken zum Kopieren"
            >
                {gameState.gameCode}
            </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-200">
            <UsersIcon className="w-6 h-6" />
            Spieler ({gameState.players.length})
        </h3>
        <ul className="space-y-3 min-h-[100px] max-h-48 overflow-y-auto pr-2">
            {gameState.players.map((player) => (
                <li key={player.id} className="flex items-center justify-between bg-slate-700/70 rounded-lg p-3 animate-fade-in">
                    <span className="text-slate-100 font-medium">{player.name} {player.isHost && '(Host)'}</span>
                    {player.isHost && <span className="text-yellow-400 text-xs font-bold">👑</span>}
                </li>
            ))}
        </ul>
      </div>

      <div className="mt-8">
        {playerIsHost ? (
            <button
              onClick={handleStart}
              disabled={gameState.players.length < 2}
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold py-4 text-xl rounded-lg shadow-lg hover:shadow-pink-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {gameState.players.length < 2 ? 'Warte auf Spieler...' : 'Spiel starten'}
            </button>
        ) : (
            <p className="text-center text-slate-400">Warte darauf, dass der Host das Spiel startet...</p>
        )}
      </div>
    </Card>
  );
};

export default SetupScreen;
