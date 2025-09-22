import React from 'react';
import { GameState, Player } from '../types';
import Card from './Card';

interface GameScreenProps {
  question: string;
  gameState: GameState;
  socket: any;
  playerId: string;
}

const GameScreen: React.FC<GameScreenProps> = ({ question, gameState, socket, playerId }) => {
  const { players, votes, gameCode } = gameState;
  const currentPlayer = players.find(p => p.id === playerId);
  const hasVoted = votes.some(v => v.voterId === playerId);

  const handleVote = (votedForId: string) => {
    if (hasVoted) return;
    socket.emit('vote', { gameCode, votedForId });
  };
  
  const votersWhoVoted = new Set(votes.map(v => v.voterId));
  const playersWhoHaventVoted = players.filter(p => !votersWhoVoted.has(p.id));

  return (
    <Card className="flex flex-col items-center text-center">
        <div className="w-full mb-6">
            <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
                <span>Frage</span>
                <span>{gameState.currentQuestionIndex + 1} / {gameState.shuffledQuestions.length}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                    className="bg-gradient-to-r from-pink-500 to-violet-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${((gameState.currentQuestionIndex + 1) / gameState.shuffledQuestions.length) * 100}%` }}
                ></div>
            </div>
        </div>
        
        <p className="text-slate-300 text-lg mb-4">Wer würde eher...</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-8 min-h-[100px] flex items-center justify-center">{question}</h2>
        
        {hasVoted ? (
            <div className="mb-8 w-full text-center">
                <p className="text-lg font-semibold text-violet-300">Deine Stimme wurde gezählt!</p>
                <p className="text-slate-400 mt-2">Warte auf: {playersWhoHaventVoted.map(p => p.name).join(', ')}</p>
                 <div className="mt-4 flex justify-center items-center">
                    <div className="w-6 h-6 border-4 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        ) : (
             <div className="mb-8 w-full">
                <p className="text-lg font-semibold text-violet-300">
                  Wer passt am besten zur Frage?
                </p>
                <p className="text-slate-400">Du wählst als: <span className="text-white font-bold">{currentPlayer?.name}</span></p>
            </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {players.map((player) => (
                <button
                    key={player.id}
                    onClick={() => handleVote(player.id)}
                    disabled={hasVoted}
                    className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg text-lg font-semibold text-white hover:bg-violet-600 hover:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-slate-700/50 disabled:hover:border-slate-600 disabled:hover:scale-100"
                >
                    {player.name}
                </button>
            ))}
        </div>
    </Card>
  );
};

export default GameScreen;
