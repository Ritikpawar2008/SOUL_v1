import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  Flame, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  Tv, 
  Gamepad2, 
  Headphones, 
  Check, 
  Smile,
  ShieldCheck
} from 'lucide-react';
import { AcademicTask, EntertainmentOption, PostGymSlot, Subject, UserPreferences } from '../types';
import { PostGymRoutineSection } from './PostGymRoutineSection';

interface LifeViewProps {
  preferences: UserPreferences;
  currentTime: Date;
  subjects: Subject[];
  tasks: AcademicTask[];
  postGymRoutine: PostGymSlot[];
  onUpdatePostGymRoutine: (routine: PostGymSlot[]) => void;
  onStartStudySession?: (item: any) => void;
}

const ENTERTAINMENT_OPTIONS: EntertainmentOption[] = [
  {
    id: 'ent-1',
    title: 'Computer Architecture / Tech Deep Dive',
    category: 'video',
    durationMinutes: 15,
    source: 'YouTube',
    recommendedWhenFreeMinutes: 15,
    description: 'Bite-sized exploration of CPU cache hierarchies, branch predictors, or Linux kernel.',
  },
  {
    id: 'ent-2',
    title: 'Rapid Chess Tactics & Puzzle Rush',
    category: 'gaming',
    durationMinutes: 15,
    source: 'Lichess / Chess.com',
    recommendedWhenFreeMinutes: 15,
    description: 'Sharpen cognitive pattern recognition with 5 rapid tactics puzzles.',
  },
  {
    id: 'ent-3',
    title: 'Tech & Engineering Podcast',
    category: 'podcast',
    durationMinutes: 30,
    source: 'Spotify / YouTube',
    recommendedWhenFreeMinutes: 30,
    description: 'Listen to insightful engineering architecture breakdowns while taking a brisk walk.',
  },
  {
    id: 'ent-4',
    title: 'Lo-Fi Chill & Digital Scratchpad',
    category: 'music',
    durationMinutes: 45,
    source: 'Ambient Radio',
    recommendedWhenFreeMinutes: 45,
    description: 'Unwind completely with relaxing beats, hydration, and creative sketching.',
  },
  {
    id: 'ent-5',
    title: 'Full TV Episode / Extended Gaming Session',
    category: 'gaming',
    durationMinutes: 60,
    source: 'Guilt-Free Leisure',
    recommendedWhenFreeMinutes: 60,
    description: 'Unapologetic weekend or evening leisure when all daily primary tasks are satisfied.',
  },
];

export const LifeView: React.FC<LifeViewProps> = ({ 
  preferences, 
  currentTime,
  subjects,
  tasks,
  postGymRoutine,
  onUpdatePostGymRoutine,
  onStartStudySession,
}) => {
  // Leisure timer state
  const [activeLeisureTimer, setActiveLeisureTimer] = useState<{
    title: string;
    totalSeconds: number;
    secondsRemaining: number;
    isRunning: boolean;
  } | null>(null);

  // Gym checklist
  const [gymRoutine, setGymRoutine] = useState([
    { id: 'g1', exercise: 'Compound Movement (Squat / Bench / Deadlift)', sets: '4 Sets x 6-8 Reps', done: false },
    { id: 'g2', exercise: 'Accessory Hypertrophy Movement', sets: '3 Sets x 10-12 Reps', done: false },
    { id: 'g3', exercise: 'Isolation & Mobility Work', sets: '3 Sets x 15 Reps', done: false },
    { id: 'g4', exercise: 'Post-Workout Hydration & 30g Whey Protein', sets: 'Immediately after', done: false },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeLeisureTimer && activeLeisureTimer.isRunning) {
      interval = setInterval(() => {
        setActiveLeisureTimer(prev => {
          if (!prev) return null;
          if (prev.secondsRemaining <= 1) {
            clearInterval(interval);
            return { ...prev, secondsRemaining: 0, isRunning: false };
          }
          return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeLeisureTimer]);

  const startLeisureCountdown = (option: EntertainmentOption) => {
    setActiveLeisureTimer({
      title: option.title,
      totalSeconds: option.durationMinutes * 60,
      secondsRemaining: option.durationMinutes * 60,
      isRunning: true,
    });
  };

  const toggleGymItem = (id: string) => {
    setGymRoutine(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner */}
      <section className="relative overflow-hidden p-6 md:p-8 bg-[#0C1214] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute right-0 bottom-0 text-8xl md:text-9xl font-black tracking-tighter leading-none text-white/[0.02] select-none pointer-events-none uppercase font-display">
          RECHARGE
        </div>

        <div className="relative z-10">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
            <span>06 / LIFE, GYM & GUILT-FREE RECHARGE</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tight mt-1">
            RECOVERY PROTOCOLS
          </h2>
          <p className="text-xs font-mono text-white/50 mt-1 uppercase tracking-wider">
            STUDENT HIGH PERFORMANCE DEMANDS DELIBERATE PHYSICAL TRAINING & STRUCTURED REST.
          </p>
        </div>

        <div className="relative z-10 p-4 bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
          <Flame className="w-6 h-6 text-orange-400" />
          <div className="text-xs font-mono">
            <div className="text-white font-black uppercase">GYM 04:00 PM – 07:00 PM</div>
            <div className="text-orange-400 text-[10px] uppercase font-bold tracking-wider">STRICT FIXED CONSTRAINT</div>
          </div>
        </div>
      </section>

      {/* 1. GUILT-FREE ENTERTAINMENT SUITE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Coffee className="w-4 h-4 text-cyan-400" />
            <span>GUILT-FREE MICRO-ENTERTAINMENT OPTIONS</span>
          </h3>
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TIME-BOUNDED RECREATION</span>
          </div>
        </div>

        {/* Leisure Running Timer Display if active */}
        {activeLeisureTimer && (
          <div className="p-6 md:p-8 border border-cyan-400/40 bg-[#0C1214] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">ACTIVE LEISURE BREAK</div>
              <h4 className="text-2xl font-display font-black text-white uppercase mt-1">{activeLeisureTimer.title}</h4>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-5xl font-mono font-black text-cyan-400">
                {Math.floor(activeLeisureTimer.secondsRemaining / 60).toString().padStart(2, '0')}:
                {(activeLeisureTimer.secondsRemaining % 60).toString().padStart(2, '0')}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveLeisureTimer(prev => prev ? { ...prev, isRunning: !prev.isRunning } : null)}
                  className="p-3 bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                >
                  {activeLeisureTimer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActiveLeisureTimer(null)}
                  className="px-4 py-3 bg-rose-500 text-white font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer"
                >
                  END BREAK
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENTERTAINMENT_OPTIONS.map(opt => (
            <div
              key={opt.id}
              className="p-6 bg-[#0C1214] border border-white/10 hover:border-cyan-400/40 transition flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 bg-white/10 text-cyan-300 uppercase font-black text-[9px] tracking-wider">
                    {opt.category}
                  </span>
                  <span className="text-white/40">⏱️ {opt.durationMinutes} MINS</span>
                </div>

                <h4 className="text-base font-display font-black text-white uppercase tracking-tight">{opt.title}</h4>
                <p className="text-xs font-mono text-white/50">{opt.description}</p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/40 uppercase">{opt.source}</span>
                <button
                  onClick={() => startLeisureCountdown(opt)}
                  className="px-4 py-2 bg-white text-black hover:bg-cyan-400 text-xs font-mono font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>ENJOY ({opt.durationMinutes}M)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. GYM ROUTINE & PHYSICAL CONDITIONING PROTOCOL */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>DAILY GYM ROUTINE (04:00 PM – 07:00 PM)</span>
          </h3>
          <span className="text-[10px] font-mono text-orange-400 uppercase font-bold">PHYSICAL CONDITIONING CHECK</span>
        </div>

        <div className="p-6 md:p-8 bg-[#0C1214] border border-orange-500/30 space-y-4">
          <div className="space-y-3">
            {gymRoutine.map(item => (
              <div
                key={item.id}
                onClick={() => toggleGymItem(item.id)}
                className={`p-4 border transition cursor-pointer flex items-center justify-between gap-4 ${
                  item.done
                    ? 'bg-orange-500/10 border-orange-500/40 text-orange-200'
                    : 'bg-white/[0.02] border-white/5 text-white/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 border flex items-center justify-center ${
                    item.done ? 'bg-orange-400 text-black border-orange-300' : 'border-white/20'
                  }`}>
                    {item.done && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div>
                    <h5 className={`text-sm font-display font-bold uppercase ${item.done ? 'text-orange-200 line-through' : 'text-white'}`}>
                      {item.exercise}
                    </h5>
                    <p className="text-xs font-mono text-white/40">{item.sets}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-orange-400">
                  {item.done ? 'COMPLETED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>

          {/* Evening Recovery Timeline Tip */}
          <div className="p-4 bg-white/5 border border-white/10 text-xs font-mono text-white/70 space-y-1">
            <div className="font-black text-white uppercase tracking-wider">🥗 EVENING TRANSITION PROTOCOL:</div>
            <p className="uppercase">
              • 07:00 PM – 07:45 PM: POST-WORKOUT MEAL, HYDRATION & MENTAL RESET.
              <br />
              • 07:45 PM ONWARDS: CUSTOMIZABLE EVENING HIGH-FOCUS & RECOVERY WINDOW.
            </p>
          </div>
        </div>
      </section>

      {/* 3. POST-GYM EVENING ROUTINE (AFTER 07:00 PM) */}
      <PostGymRoutineSection
        postGymRoutine={postGymRoutine}
        preferences={preferences}
        subjects={subjects}
        tasks={tasks}
        onUpdateRoutine={onUpdatePostGymRoutine}
        onStartStudySession={onStartStudySession}
      />

    </div>
  );
};
