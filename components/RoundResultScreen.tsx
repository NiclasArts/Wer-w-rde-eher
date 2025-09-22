import React from 'react';
import { GameState } from '../types';
import Card from './Card';

interface RoundResultScreenProps {
  question: string;
  gameState: GameState;
  socket: any;
  playerIsHost: boolean;
}

const RoundResultScreen: React.FC<RoundResultScreenProps> = ({ question, gameState, socket, playerIsHost }) => {
  const { players, votes, gameCode } = gameState;

  const getPlayerName = (id: string): string => {
    return players.find(p => p.id === id)?.name || 'Unbekannt';
  };

  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote.votedForId] = (acc[vote.votedForId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxVotes = Math.max(0, ...Object.values(voteCounts));
  const mostVotedPlayerIds = Object.keys(voteCounts)
    .filter(id => voteCounts[id] === maxVotes && maxVotes > 0)
    .map(String);

  const handleNextRound = () => {
    socket.emit('nextRound', { gameCode });
  };

  return (
    <Card>
      <div className="text-center">
        <p className="text-slate-400 mb-2">Die Frage war:</p>
        <h2 className="text-2xl font-bold mb-6 text-slate-100">"{question}"</h2>
        
        <h3 className="text-xl font-semibold text-pink-400 mb-4">Ergebnisse der Runde</h3>
        
        <div className="space-y-2 text-left bg-slate-900/50 p-4 rounded-lg max-h-60 overflow-y-auto mb-6">
            {votes.map((vote, index) => (
                <p key={index} className="text-slate-300">
                    <span className="font-bold text-violet-300">{getPlayerName(vote.voterId)}</span>
                    {' '} hat für {' '}
                    <span className="font-bold text-white">{getPlayerName(vote.votedForId)}</span>
                    {' '} gestimmt.
                </p>
            ))}
        </div>

        <div className="bg-slate-700/50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-slate-200 mb-2">Am häufigsten gewählt wurde:</h4>
          {mostVotedPlayerIds.length > 0 ? (
             <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
                {mostVotedPlayerIds.map(id => getPlayerName(id)).join(', ')}
            </p>
          ) : (
            <p className="text-lg text-slate-400">Niemand!</p>
          )}
        </div>
        
        <div className="mt-8">
          {playerIsHost ? (
            <button
              onClick={handleNextRound}
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold py-3 text-lg rounded-lg shadow-lg hover:shadow-pink-500/30 transition-all transform hover:scale-105"
            >
              Nächste Frage
            </button>
          ) : (
             <p className="text-center text-slate-400">Warte darauf, dass der Host die nächste Runde startet...</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RoundResultScreen;
