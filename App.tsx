import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import VictoryScreen from './components/VictoryScreen';
import { GamePhase, GameSettings } from './types';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [winner, setWinner] = useState<string>('');

  const startGame = (newSettings: GameSettings) => {
    setSettings(newSettings);
    setPhase('playing');
  };

  const endGame = (winnerName: string) => {
    setWinner(winnerName);
    setPhase('victory');
  };

  const restartGame = () => {
    setPhase('setup');
    setSettings(null);
    setWinner('');
  };

  return (
    <div className="min-h-screen">
      {phase === 'setup' && <SetupScreen onStartGame={startGame} />}
      
      {phase === 'playing' && settings && (
        <GameScreen 
          settings={settings} 
          onGameOver={endGame} 
        />
      )}
      
      {phase === 'victory' && (
        <VictoryScreen 
          winnerName={winner} 
          onRestart={restartGame} 
        />
      )}
    </div>
  );
};

export default App;
