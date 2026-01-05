import React, { useEffect } from 'react';
import { soundManager } from '../utils/sound';
import { Trophy, RefreshCcw, Cat, Dog, Rabbit, Star, Heart, Gift, PartyPopper } from 'lucide-react';

declare global {
  interface Window {
    confetti: any;
  }
}

interface VictoryScreenProps {
  winnerName: string;
  onRestart: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ winnerName, onRestart }) => {
  useEffect(() => {
    soundManager.play('clap');
    
    // Trigger confetti
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      if (window.confetti) {
        window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Decorative Cute Background Elements (Absolute Positioning) */}
      <div className="absolute top-10 left-10 text-pink-300 animate-float" style={{ animationDelay: '0s' }}>
        <Heart size={64} fill="currentColor" />
      </div>
      <div className="absolute top-20 right-20 text-yellow-300 animate-float" style={{ animationDelay: '1s' }}>
        <Star size={80} fill="currentColor" />
      </div>
      <div className="absolute bottom-20 left-20 text-blue-300 animate-float" style={{ animationDelay: '2s' }}>
        <Gift size={70} />
      </div>
      <div className="absolute bottom-10 right-10 text-purple-300 animate-float" style={{ animationDelay: '1.5s' }}>
        <PartyPopper size={64} />
      </div>

      <div className="absolute top-1/2 left-10 transform -translate-y-1/2 text-orange-400 opacity-20 hidden md:block">
        <Cat size={120} />
      </div>
       <div className="absolute top-1/2 right-10 transform -translate-y-1/2 text-indigo-400 opacity-20 hidden md:block">
        <Dog size={120} />
      </div>

      <div className="bg-white border-4 border-yellow-200 p-12 rounded-[3rem] text-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-w-2xl w-full relative z-10">
        
        <div className="relative z-10 flex flex-col items-center">
            <div className="bg-gradient-to-tr from-yellow-300 to-yellow-500 p-6 rounded-full shadow-lg mb-6 animate-bounce-slow border-4 border-white ring-4 ring-yellow-100">
                <Trophy size={80} className="text-white" />
            </div>
            
            <h2 className="text-2xl md:text-3xl text-gray-500 font-bold mb-2 uppercase tracking-widest">
                {winnerName === "Hòa nhau" ? "Kết Quả Trận Đấu" : "Đội Chiến Thắng Là"}
            </h2>
            
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-10 drop-shadow-sm p-2">
                {winnerName}
            </h1>

            <div className="flex gap-4 justify-center items-center mb-8">
               <Rabbit size={48} className="text-pink-400 animate-bounce" />
               <div className="flex gap-1">
                 <Star size={32} className="text-yellow-400 animate-spin-slow" fill="currentColor" />
                 <Star size={24} className="text-yellow-300 animate-pulse" fill="currentColor" />
               </div>
               <Cat size={48} className="text-orange-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>

            <button 
                onClick={onRestart}
                className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
                <RefreshCcw className="group-hover:rotate-180 transition-transform duration-500" />
                Chơi Lại
            </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;