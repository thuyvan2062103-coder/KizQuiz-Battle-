import React, { useEffect, useState, useRef } from 'react';
import { GameSettings, GameState, RoundPhase, Question } from '../types';
import { soundManager } from '../utils/sound';

interface GameScreenProps {
  settings: GameSettings;
  onGameOver: (winner: string) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ settings, onGameOver }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    team1Score: 0,
    team2Score: 0,
    timeLeft: settings.timePerQuestion,
    team1Selection: null,
    team2Selection: null,
    roundPhase: 'answering',
  });

  const timerRef = useRef<number | null>(null);
  const currentQuestion = settings.questions[gameState.currentQuestionIndex];

  // Sound & Timer Logic
  useEffect(() => {
    // Start BGM when answering starts
    if (gameState.roundPhase === 'answering') {
      soundManager.playLoop('bgm');
      
      // Countdown Logic
      if (gameState.timeLeft > 0) {
        
        // Trigger specific sounds for last 3 seconds
        if (gameState.timeLeft === 3) soundManager.play('count3');
        if (gameState.timeLeft === 2) soundManager.play('count2');
        if (gameState.timeLeft === 1) soundManager.play('count1');

        timerRef.current = window.setTimeout(() => {
          setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
        }, 1000);
      } else {
        // Time is up (0s)
        handleTimeUp();
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      // Ensure BGM stops if we unmount or change phase externally
      if (gameState.timeLeft === 0 || gameState.roundPhase !== 'answering') {
         soundManager.stop('bgm');
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.timeLeft, gameState.roundPhase]);

  const handleTimeUp = () => {
      // 1. Stop BGM
      soundManager.stop('bgm');
      
      // 2. Play Alarm (Bell) for 1.5 seconds
      soundManager.play('alarm');

      // 3. Wait 1.5 seconds before revealing answers
      setTimeout(() => {
          soundManager.stop('alarm'); 
          handleRoundEnd();
      }, 1500);
  };

  // Logic to calculate score and show result
  const handleRoundEnd = () => {
    setGameState(prev => ({ ...prev, roundPhase: 'revealed' }));

    // Small delay to ensure visual state transition before scoring sounds
    setTimeout(() => {
        let t1Correct = false;
        let t2Correct = false;

        if (gameState.team1Selection === currentQuestion.correctIndex) t1Correct = true;
        if (gameState.team2Selection === currentQuestion.correctIndex) t2Correct = true;

        // Play feedback sounds
        if (t1Correct || t2Correct) {
             soundManager.play('correct');
        } else if (gameState.team1Selection !== null || gameState.team2Selection !== null) {
             soundManager.play('wrong');
        }

        // Calculate NEW scores immediately to pass to the next step
        const newTeam1Score = gameState.team1Score + (t1Correct ? 1 : 0);
        const newTeam2Score = gameState.team2Score + (t2Correct ? 1 : 0);

        setGameState(prev => ({
            ...prev,
            team1Score: newTeam1Score,
            team2Score: newTeam2Score,
        }));

        // Move to next question after showing results, passing the UPDATED scores
        setTimeout(() => moveToNextQuestion(newTeam1Score, newTeam2Score), 4000);

    }, 100); 
  };

  const moveToNextQuestion = (currentT1Score: number, currentT2Score: number) => {
    soundManager.stop('correct');
    soundManager.stop('wrong');
    
    if (gameState.currentQuestionIndex < settings.questions.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        timeLeft: settings.timePerQuestion,
        team1Selection: null,
        team2Selection: null,
        roundPhase: 'answering',
      }));
    } else {
      // Game Over
      soundManager.stop('bgm');
      
      // Determine winner using the passed (latest) scores
      let winner = "Hòa nhau";
      if (currentT1Score > currentT2Score) {
          winner = settings.team1Name;
      } else if (currentT2Score > currentT1Score) {
          winner = settings.team2Name;
      }
      
      onGameOver(winner);
    }
  };

  const handleSelection = (team: 1 | 2, optionIndex: number) => {
    if (gameState.roundPhase !== 'answering') return;
    
    // ALLOW CHANGE: Removed the check that prevented changing selection
    if (team === 1) {
      setGameState(prev => ({ ...prev, team1Selection: optionIndex }));
    }
    if (team === 2) {
      setGameState(prev => ({ ...prev, team2Selection: optionIndex }));
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans relative">
      {/* Central Timer Overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className={`
          flex items-center justify-center w-24 h-24 rounded-full border-8 shadow-2xl transition-all duration-300
          ${gameState.timeLeft <= 3 ? 'bg-red-600 border-red-300 animate-ping' : gameState.timeLeft <= 5 ? 'bg-orange-500 border-orange-200 animate-pulse scale-110' : 'bg-white border-yellow-400'}
        `}>
          <span className={`text-4xl font-black ${gameState.timeLeft <= 5 ? 'text-white' : 'text-gray-800'}`}>
            {gameState.timeLeft}
          </span>
        </div>
      </div>

      {/* TEAM 1 PANEL (Left) */}
      <TeamPanel 
        teamName={settings.team1Name}
        score={gameState.team1Score}
        question={currentQuestion}
        selectedOption={gameState.team1Selection}
        onSelect={(idx) => handleSelection(1, idx)}
        phase={gameState.roundPhase}
        theme="blue"
        timeLeft={gameState.timeLeft}
      />

      {/* Divider */}
      <div className="w-2 h-full bg-gray-200 z-10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200"></div>
      </div>

      {/* TEAM 2 PANEL (Right) */}
      <TeamPanel 
        teamName={settings.team2Name}
        score={gameState.team2Score}
        question={currentQuestion}
        selectedOption={gameState.team2Selection}
        onSelect={(idx) => handleSelection(2, idx)}
        phase={gameState.roundPhase}
        theme="pink"
        timeLeft={gameState.timeLeft}
      />
    </div>
  );
};

// Sub-component for each team's side
interface TeamPanelProps {
  teamName: string;
  score: number;
  question: Question;
  selectedOption: number | null;
  onSelect: (idx: number) => void;
  phase: RoundPhase;
  theme: 'blue' | 'pink';
  timeLeft: number;
}

const TeamPanel: React.FC<TeamPanelProps> = ({ 
  teamName, score, question, selectedOption, onSelect, phase, theme, timeLeft
}) => {
  const isBlue = theme === 'blue';
  const bgClass = isBlue ? 'bg-blue-50' : 'bg-pink-50';
  const headerClass = isBlue ? 'bg-blue-500' : 'bg-pink-500';
  const textClass = isBlue ? 'text-blue-700' : 'text-pink-700';
  
  return (
    <div className={`flex-1 flex flex-col ${bgClass} p-6 relative`}>
      {/* Header / Score */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-opacity-50 border-gray-200">
        <h2 className={`text-2xl font-bold ${textClass}`}>{teamName}</h2>
        <div className={`${headerClass} text-white px-6 py-2 rounded-xl text-2xl font-black shadow-lg`}>
          {score} <span className="text-sm font-normal opacity-80">điểm</span>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col justify-center items-center">
        {question.image && (
          <img 
            src={question.image} 
            alt="Question" 
            className="h-48 object-cover rounded-xl shadow-md mb-4 border-4 border-white"
          />
        )}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 w-full mb-8 text-center">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800">
            {question.text}
          </h3>
        </div>

        {/* Answers Grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {question.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === question.correctIndex;
            
            let btnClass = "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-400"; // Default
            
            if (phase === 'answering') {
              if (isSelected) {
                btnClass = isBlue 
                  ? "bg-blue-500 border-blue-600 text-white shadow-inner transform scale-95" 
                  : "bg-pink-500 border-pink-600 text-white shadow-inner transform scale-95";
              } else {
                btnClass += " hover:-translate-y-1 hover:shadow-md cursor-pointer";
              }
            } else if (phase === 'revealed') {
              if (isCorrect) {
                btnClass = "bg-green-500 border-green-600 text-white shadow-lg scale-105 z-10 animate-bounce-slow"; // Correct reveal
              } else if (isSelected && !isCorrect) {
                btnClass = "bg-red-500 border-red-600 text-white opacity-80"; // Wrong selected
              } else {
                btnClass = "bg-gray-100 text-gray-400 opacity-50"; // Others
              }
            }

            return (
              <button
                key={idx}
                // Updated disabled logic: Allow clicking as long as phase is answering
                disabled={phase !== 'answering'}
                onClick={() => onSelect(idx)}
                className={`
                  p-4 rounded-2xl text-lg font-bold transition-all duration-300 min-h-[80px] flex items-center justify-center shadow-sm
                  ${btnClass}
                `}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Feedback Status */}
      {phase === 'revealed' && selectedOption !== null && (
        <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
            {selectedOption === question.correctIndex ? (
                <div className="text-4xl font-black text-green-500 drop-shadow-lg animate-bounce">ĐÚNG RỒI! 🎉</div>
            ) : (
                <div className="text-4xl font-black text-red-500 drop-shadow-lg animate-shake">SAI RỒI! 😢</div>
            )}
        </div>
      )}
    </div>
  );
};

export default GameScreen;