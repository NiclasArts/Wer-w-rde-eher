import React from 'react';
import { GameState } from '../types';
import Card from './Card';
import { CrownIcon } from './icons';

interface GameOverScreenProps {
  gameState: GameState;
  socket: any;
  playerIsHost: boolean;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ gameState, socket, playerIsHost }) => {
    const { players, gameCode } = gameState;
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];
    const maxScore = winner ? winner.score : 0;
    const winners = sortedPlayers.filter(p => p.score === maxScore && maxScore > 0);

    const handlePlayAgain = () => {
        socket.emit('playAgain', { gameCode });
    };

  return (
    <Card>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-100">Spiel vorbei!</h1>
        <div className="my-8 flex flex-col items-center">
            <CrownIcon className="w-20 h-20 text-yellow-400 mb-4" />
            <p className="text-lg text-slate-300">
                {winners.length > 1 ? 'Die "Schlimmsten" sind:' : 'Der/Die "Schlimmste" ist:'}
            </p>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mt-2">
                {winners.length > 0 ? winners.map(w => w.name).join(' & ') : 'Niemand!'}
            </h2>
             <p className="text-slate-400 mt-1">{winners.length > 0 ? `mit ${maxScore} Stimmen!` : 'Was für eine brave Runde.'}</p>
        </div>

        <h3 className="text-xl font-semibold mb-4 text-slate-200">Endstand</h3>
        <ul className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <li
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                winners.some(w => w.id === player.id) ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-slate-700/70'
              }`}
            >
              <span className="flex items-center gap-3">
                 <span className="font-bold text-lg w-6">{index + 1}.</span>
                 <span className="font-medium text-slate-100">{player.name}</span>
              </span>
              <span className="font-bold text-xl text-slate-200">{player.score}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
            {playerIsHost ? (
                <button
                    onClick={handlePlayAgain}
                    className="w-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold py-3 text-lg rounded-lg shadow-lg hover:shadow-pink-500/30 transition-all transform hover:scale-105"
                >
                    Nochmal spielen
                </button>
            ) : (
                <p className="text-center text-slate-400">Warte darauf, dass der Host ein neues Spiel startet...</p>
            )}
        </div>
      </div>
    </Card>
  );
};

export default GameOverScreen;
