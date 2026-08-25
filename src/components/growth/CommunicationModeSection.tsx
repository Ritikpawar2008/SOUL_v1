import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Mic,
  Volume2,
  Trophy,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  Send,
  HelpCircle,
  Shield,
  Award,
} from 'lucide-react';
import { CommunicationActivity, ConfidenceChallenge } from '../../types';

interface CommunicationModeSectionProps {
  activities: CommunicationActivity[];
  challenges: ConfidenceChallenge[];
  onLogActivity: (activityId: string) => void;
  onToggleChallenge: (challengeId: string) => void;
}

export const CommunicationModeSection: React.FC<CommunicationModeSectionProps> = ({
  activities,
  challenges,
  onLogActivity,
  onToggleChallenge,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'speaking' | 'confidence'>('speaking');
  
  // 5-Minute Built-In Speech Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(300); // 5 min
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 font-mono text-xs">

      {/* 1. Subtab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveSubTab('speaking')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer border ${
            activeSubTab === 'speaking'
              ? 'bg-amber-400 text-black border-amber-400'
              : 'bg-[#0C1214] text-white/60 border-white/10 hover:text-white'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>COMMUNICATION MODE & VOCABULARY</span>
        </button>

        <button
          onClick={() => setActiveSubTab('confidence')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer border ${
            activeSubTab === 'confidence'
              ? 'bg-amber-400 text-black border-amber-400'
              : 'bg-[#0C1214] text-white/60 border-white/10 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>CONFIDENCE BUILDER CHALLENGES</span>
        </button>
      </div>

      {/* 2. SUBTAB A: COMMUNICATION MODE */}
      {activeSubTab === 'speaking' && (
        <div className="space-y-5">
          {/* Top Banner with 5-Minute Speech Timer */}
          <div className="p-5 md:p-6 bg-[#0C1214] border border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="text-[10px] text-amber-400 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>UNSTOPPABLE ENGLISH ARTICULATION</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight">
                5-MINUTE SPONTANEOUS SPEAKING
              </h3>
              <p className="text-xs text-white/60">
                Speak out loud continuously in English. Explain what you studied or built today without pausing.
              </p>
            </div>

            {/* Speech Timer Widget */}
            <div className="p-4 bg-black/60 border border-amber-500/30 flex items-center gap-4 shrink-0">
              <div className="text-3xl font-mono font-black text-amber-400">
                {formatTimer(timerSeconds)}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs cursor-pointer flex items-center gap-1"
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isTimerRunning ? 'PAUSE' : 'START'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(300);
                  }}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 cursor-pointer"
                  title="Reset timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Daily 3 High-Impact Words Card */}
          {activities.find(a => a.type === 'vocabulary_3words')?.vocabularyWords && (
            <div className="p-5 bg-[#0C1214] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>DAILY 3 HIGH-IMPACT VOCABULARY WORDS</span>
                </span>
                <span className="text-[10px] text-white/40">SAY EACH WORD OUT LOUD TWICE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activities.find(a => a.type === 'vocabulary_3words')?.vocabularyWords?.map((item, i) => (
                  <div key={i} className="p-3.5 bg-white/5 border border-white/10 space-y-1.5">
                    <div className="text-base font-display font-black text-amber-300 uppercase">
                      {item.word}
                    </div>
                    <p className="text-[11px] text-white/80">
                      {item.meaning}
                    </p>
                    <div className="text-[10px] text-white/50 italic pt-1 border-t border-white/5">
                      &ldquo;{item.example}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities List */}
          <div className="space-y-3">
            <span className="text-xs text-white font-bold uppercase tracking-wider block">
              DAILY COMMUNICATION DRILLS
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activities.map((activity) => {
                const isCompletedToday = activity.completedDates.includes(todayStr);

                return (
                  <div
                    key={activity.id}
                    className={`p-4 bg-[#0C1214] border transition flex flex-col justify-between space-y-3 ${
                      isCompletedToday ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-white/10'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 text-amber-400 border border-white/10">
                          {activity.type.replace('_', ' ')}
                        </span>
                        {isCompletedToday ? (
                          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>DONE TODAY</span>
                          </span>
                        ) : (
                          <span className="text-[9px] text-white/40 uppercase">
                            {activity.completedDates.length} Total Sessions
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-display font-black text-white uppercase tracking-tight">
                        {activity.title}
                      </h4>

                      <p className="text-[11px] text-white/80">
                        {activity.prompt}
                      </p>

                      <div className="text-[10px] text-white/50 italic bg-black/40 p-2 border border-white/5">
                        Tip: {activity.guide}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onLogActivity(activity.id)}
                        className={`px-4 py-2 font-bold uppercase tracking-wider text-xs cursor-pointer flex items-center gap-1.5 transition ${
                          isCompletedToday
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-400 hover:bg-amber-300 text-black'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isCompletedToday ? 'PRACTICED TODAY' : 'LOG 1 PRACTICE SESSION'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBTAB B: CONFIDENCE BUILDER CHALLENGES */}
      {activeSubTab === 'confidence' && (
        <div className="space-y-5">
          <div className="p-4 bg-[#0C1214] border border-white/10 space-y-1">
            <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">
              PROGRESSIVE REAL-WORLD CONFIDENCE CHALLENGES
            </span>
            <p className="text-white/70 text-xs">
              Confidence is a muscle built through small real-world actions. Start with Level 1 and gradually level up without anxiety or rush.
            </p>
          </div>

          <div className="space-y-3">
            {challenges.map((chal) => {
              const isDone = chal.completedDates.includes(todayStr);

              return (
                <div
                  key={chal.id}
                  onClick={() => onToggleChallenge(chal.id)}
                  className={`p-4 border transition cursor-pointer flex items-start gap-3.5 select-none ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                      : 'bg-[#0C1214] border-white/10 hover:border-white/25 text-white/80'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-white/30" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          LEVEL {chal.level} CHALLENGE
                        </span>
                        <h4 className={`text-sm font-display font-bold uppercase ${isDone ? 'line-through text-white/50' : 'text-white'}`}>
                          {chal.title}
                        </h4>
                      </div>

                      <span className="text-[10px] text-white/40">
                        {chal.completedDates.length} Times Completed
                      </span>
                    </div>

                    <p className="text-[11px] text-white/70">
                      {chal.description}
                    </p>

                    <div className="text-[10px] text-amber-400/80 pt-0.5">
                      💡 {chal.tips}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
