import React, { useState, useEffect } from 'react';
import { SoulSymbol } from './SoulSymbol';
import { SignatureImage } from './SignatureImage';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  isReplay?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, isReplay = false }) => {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Stage 1: Symbol Pulse (0ms)
    // Stage 2: SOUL + "YOUR TIME. YOUR LIFE." (600ms)
    // Stage 3: "Created & Managed by Ritik Pawar" + Signature (1400ms)
    // Stage 4: Fade out to Main App (2800ms)

    const t1 = setTimeout(() => setStage(2), 650);
    const t2 = setTimeout(() => setStage(3), 1450);
    const t3 = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(onFinish, 450);
    }, isReplay ? 3600 : 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish, isReplay]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onFinish, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between p-8 bg-[#06090A] text-white transition-opacity duration-500 select-none cursor-pointer overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient lighting effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] bg-orange-500/5 rounded-full blur-[90px]" />
      </div>

      {/* Top micro brand tag */}
      <div className="relative z-10 w-full flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.3em] text-white/30">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SOUL OS v1.0</span>
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="text-white/40 hover:text-white transition flex items-center gap-1 cursor-pointer tracking-widest text-[10px]"
        >
          <span>TAP TO SKIP</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Center Cinematic Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 max-w-md w-full my-auto">
        
        {/* Abstract Symbol */}
        <div className="transform transition-all duration-700 ease-out scale-100">
          <div className="relative p-3">
            <SoulSymbol size={76} className="w-20 h-20 drop-shadow-[0_0_24px_rgba(34,211,238,0.5)]" />
          </div>
        </div>

        {/* Brand Name & Motto (Stage 2) */}
        <div
          className={`space-y-2 transition-all duration-700 transform ${
            stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-white">
            SOUL
          </h1>
          <p className="text-xs md:text-sm font-mono uppercase tracking-[0.35em] text-cyan-400 font-semibold">
            YOUR TIME. YOUR LIFE.
          </p>
        </div>

        {/* Divider */}
        <div
          className={`w-16 h-px bg-white/20 transition-all duration-500 ${
            stage >= 3 ? 'opacity-100 w-24' : 'opacity-0 w-0'
          }`}
        />

        {/* Creator Credit & Handwritten Signature (Stage 3) */}
        <div
          className={`space-y-3 transition-all duration-700 transform ${
            stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="space-y-0.5">
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/50">
              Created & Managed by
            </p>
            <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">
              Ritik Pawar
            </h2>
          </div>

          {/* Official Handwritten Signature Image / Vector */}
          <div className="pt-1 flex items-center justify-center">
            <SignatureImage
              className="w-56 md:w-64 h-24 text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.4)]"
              color="#22d3ee"
              glow={true}
            />
          </div>
        </div>

      </div>

      {/* Bottom loading indicator */}
      <div className="relative z-10 text-center space-y-2">
        <div className="w-40 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-cyan-400 animate-[pulse_1.5s_ease-in-out_infinite] w-full" />
        </div>
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
          INITIALIZING STUDENT OPERATING SYSTEM...
        </p>
      </div>

    </div>
  );
};
