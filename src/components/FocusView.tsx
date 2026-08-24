import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  Headphones, 
  Sparkles, 
  Star, 
  Maximize2, 
  Minimize2,
  Sliders,
  Check,
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Subject, AcademicTask } from '../types';

interface FocusViewProps {
  subjects: Subject[];
  tasks: AcademicTask[];
  onLogStudySession: (subjectCode: string, unitNumber: number, minutes: number, completed: boolean) => void;
  onCompleteTask: (taskId: string) => void;
  activeSession: any;
  setActiveSession: React.Dispatch<React.SetStateAction<any>>;
}

export const FocusView: React.FC<FocusViewProps> = ({
  subjects,
  tasks,
  onLogStudySession,
  onCompleteTask,
  activeSession,
  setActiveSession,
}) => {
  // Timer Mode: pomodoro (25/5), custom, stopwatch
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'custom' | 'stopwatch'>('pomodoro');
  const [targetMinutes, setTargetMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);

  // Selected Target Subject & Unit
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('CLC');
  const [selectedUnitNumber, setSelectedUnitNumber] = useState<number>(2);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  // Audio Ambient Synthesizer state
  const [ambientSound, setAmbientSound] = useState<'none' | 'alpha' | 'rain' | 'whitenoise'>('none');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Reflection / End of Session Modal
  const [showReflectionModal, setShowReflectionModal] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [reflectionNotes, setReflectionNotes] = useState<string>('');
  const [markUnitFinished, setMarkUnitFinished] = useState<boolean>(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Handle ambient Web Audio synthesis
  useEffect(() => {
    if (ambientSound === 'none') {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (ambientSound === 'whitenoise') {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.04;
        whiteNoise.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start(0);
        noiseNodeRef.current = whiteNoise;
      } else if (ambientSound === 'rain') {
        // Brown noise filtered for rain
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }
        const brownNoise = ctx.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.06;

        brownNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        brownNoise.start(0);
        noiseNodeRef.current = brownNoise;
      } else if (ambientSound === 'alpha') {
        // Binaural 10Hz Alpha tone carrier
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        oscL.type = 'sine';
        oscR.type = 'sine';
        oscL.frequency.value = 200; // Left ear
        oscR.frequency.value = 210; // Right ear (10Hz alpha difference)

        const gain = ctx.createGain();
        gain.gain.value = 0.05;

        oscL.connect(gain);
        oscR.connect(gain);
        gain.connect(ctx.destination);
        oscL.start();
        oscR.start();
        noiseNodeRef.current = oscL;
      }
    } catch (e) {
      console.warn('Audio Synthesis not supported in this environment', e);
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [ambientSound]);

  // Main Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        if (timerMode === 'stopwatch') {
          setSecondsElapsed(prev => prev + 1);
        } else {
          setSecondsRemaining(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsRunning(false);
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
          setSecondsElapsed(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerMode]);

  const handleTimerComplete = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {}
    setShowReflectionModal(true);
  };

  const togglePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    if (timerMode === 'pomodoro') {
      setSecondsRemaining(25 * 60);
    } else if (timerMode === 'custom') {
      setSecondsRemaining(targetMinutes * 60);
    } else {
      setSecondsElapsed(0);
    }
  };

  const selectCustomMinutes = (mins: number) => {
    setTimerMode('custom');
    setTargetMinutes(mins);
    setSecondsRemaining(mins * 60);
    setIsRunning(false);
  };

  const handleFinishAndSave = () => {
    const minutesStudied = Math.max(1, Math.round(secondsElapsed / 60));
    
    if (selectedSubjectCode && selectedUnitNumber) {
      onLogStudySession(selectedSubjectCode, selectedUnitNumber, minutesStudied, markUnitFinished);
    }
    if (selectedTaskId && markUnitFinished) {
      onCompleteTask(selectedTaskId);
    }

    setShowReflectionModal(false);
    handleResetTimer();
  };

  const formatTimerDisplay = () => {
    if (timerMode === 'stopwatch') {
      const mins = Math.floor(secondsElapsed / 60);
      const secs = secondsElapsed % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-8 pb-16 transition-all ${isFullscreen ? 'fixed inset-0 z-50 bg-[#080C0D] p-8 overflow-y-auto' : ''}`}>
      
      {/* Top Header */}
      <section className="relative overflow-hidden p-6 md:p-8 bg-[#0C1214] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute right-0 bottom-0 text-8xl md:text-9xl font-black tracking-tighter leading-none text-white/[0.02] select-none pointer-events-none uppercase font-display">
          FOCUS
        </div>

        <div className="relative z-10">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>04 / NEURAL STUDY PROTOCOL & TIMER</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tight mt-1">
            DEEP FOCUS ENGINE
          </h2>
          <p className="text-xs font-mono text-white/50 mt-1 uppercase tracking-wider">
            POMODORO CYCLES, CUSTOM SPRINTS, SYNTHESIZED ALPHA FREQUENCIES.
          </p>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="relative z-10 flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-black uppercase tracking-widest text-white/70 hover:text-white transition cursor-pointer self-start md:self-auto"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span>{isFullscreen ? 'EXIT FULLSCREEN' : 'IMMERSIVE FULLSCREEN'}</span>
        </button>
      </section>

      {/* MAIN FOCUS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left / Center: Timer & Huge Display */}
        <div className="lg:col-span-2 p-8 md:p-12 border border-white/10 bg-[#0C1214] flex flex-col items-center justify-between min-h-[480px] text-center relative overflow-hidden">
          <div className="absolute right-4 bottom-4 text-9xl font-black tracking-tighter leading-none text-white/[0.02] select-none pointer-events-none uppercase font-display">
            SPRINT
          </div>

          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono relative z-10">
            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-white/5 border border-white/10">
              <button
                onClick={() => {
                  setTimerMode('pomodoro');
                  setSecondsRemaining(25 * 60);
                  setIsRunning(false);
                }}
                className={`px-3 py-1.5 uppercase font-black tracking-wider transition cursor-pointer text-xs ${
                  timerMode === 'pomodoro' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
                }`}
              >
                POMODORO (25M)
              </button>
              <button
                onClick={() => {
                  setTimerMode('custom');
                  setSecondsRemaining(targetMinutes * 60);
                  setIsRunning(false);
                }}
                className={`px-3 py-1.5 uppercase font-black tracking-wider transition cursor-pointer text-xs ${
                  timerMode === 'custom' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
                }`}
              >
                SPRINT ({targetMinutes}M)
              </button>
              <button
                onClick={() => {
                  setTimerMode('stopwatch');
                  setSecondsElapsed(0);
                  setIsRunning(false);
                }}
                className={`px-3 py-1.5 uppercase font-black tracking-wider transition cursor-pointer text-xs ${
                  timerMode === 'stopwatch' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
                }`}
              >
                STOPWATCH
              </button>
            </div>

            {/* Ambient Sound Selector */}
            <div className="flex items-center gap-2 text-white/50">
              <Headphones className="w-4 h-4 text-cyan-400" />
              <select
                aria-label="Ambient Sound"
                value={ambientSound}
                onChange={(e) => setAmbientSound(e.target.value as any)}
                className="bg-white/5 border border-white/10 text-white text-xs font-mono px-3 py-1.5 focus:outline-none focus:border-cyan-400 uppercase font-bold"
              >
                <option value="none" className="bg-[#080C0D]">OFF</option>
                <option value="alpha" className="bg-[#080C0D]">10HZ ALPHA WAVES</option>
                <option value="rain" className="bg-[#080C0D]">SYNTHETIC RAIN</option>
                <option value="whitenoise" className="bg-[#080C0D]">WHITE NOISE</option>
              </select>
            </div>
          </div>

          {/* Huge Dynamic Timer Display */}
          <div className="my-8 space-y-4 relative z-10">
            <div className="inline-block px-4 py-1 bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-mono font-black uppercase tracking-widest">
              TARGET: {selectedSubjectCode} UNIT {selectedUnitNumber}
            </div>

            <div className="text-8xl md:text-9xl font-mono font-black tracking-tight text-white select-none">
              {formatTimerDisplay()}
            </div>

            <div className="text-xs font-mono uppercase tracking-[0.3em] font-bold text-white/40">
              {isRunning ? '⚡ ACTIVE NEURAL SPRINT RUNNING' : '⏸️ READY TO ENGAGE'}
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-4 relative z-10">
            <button
              onClick={handleResetTimer}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayPause}
              className={`flex items-center gap-3 px-10 py-5 font-mono font-black text-sm tracking-widest uppercase transition-all transform active:scale-95 cursor-pointer ${
                isRunning
                  ? 'bg-orange-500 hover:bg-orange-400 text-black'
                  : 'bg-white hover:bg-cyan-400 text-black'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>PAUSE SPRINT</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>START FOCUS</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowReflectionModal(true)}
              className="p-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 transition cursor-pointer"
              title="Finish & Log Study Time"
            >
              <Check className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

        </div>

        {/* Right Column: Custom Sprint Presets & Subject Binding */}
        <div className="space-y-4">
          
          {/* Target Binding Card */}
          <div className="p-6 bg-[#0C1214] border border-white/10 space-y-4">
            <h4 className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>BIND FOCUS TO SYLLABUS</span>
            </h4>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-white/40 block mb-1 uppercase font-bold text-[10px] tracking-wider">Subject</label>
                <select
                  value={selectedSubjectCode}
                  onChange={(e) => setSelectedSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono text-xs uppercase"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.code} className="bg-[#080C0D]">{s.code} — {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white/40 block mb-1 uppercase font-bold text-[10px] tracking-wider">Unit Number</label>
                <select
                  value={selectedUnitNumber}
                  onChange={(e) => setSelectedUnitNumber(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono text-xs uppercase"
                >
                  {[1, 2, 3, 4, 5, 6].map(u => (
                    <option key={u} value={u} className="bg-[#080C0D]">UNIT {u}</option>
                  ))}
                </select>
              </div>

              {tasks.length > 0 && (
                <div>
                  <label className="text-white/40 block mb-1 uppercase font-bold text-[10px] tracking-wider">Or Specific Task / Manual</label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 truncate font-mono text-xs uppercase"
                  >
                    <option value="" className="bg-[#080C0D]">-- NONE (GENERAL STUDY) --</option>
                    {tasks.filter(t => t.status !== 'completed').map(t => (
                      <option key={t.id} value={t.id} className="bg-[#080C0D] truncate">
                        {t.subjectCode}: {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Quick Sprint Presets */}
          <div className="p-6 bg-[#0C1214] border border-white/10 space-y-3">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] font-black text-white/50">
              SPRINT DURATION PRESETS
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[15, 25, 45, 60, 90, 120].map(mins => (
                <button
                  key={mins}
                  onClick={() => selectCustomMinutes(mins)}
                  className={`p-3 border font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                    timerMode === 'custom' && targetMinutes === mins
                      ? 'bg-cyan-400 text-black border-cyan-400'
                      : 'bg-white/5 text-white/60 hover:text-white border-white/10'
                  }`}
                >
                  {mins} MINS
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* SESSION COMPLETE / REFLECTION MODAL */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0C1214] p-6 md:p-8 border border-white/20 shadow-2xl space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 bg-white/5 border border-white/10 text-cyan-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">FOCUS SESSION COMPLETE</h3>
              <p className="text-xs font-mono text-white/50 uppercase">
                LOGGED ~{Math.max(1, Math.round(secondsElapsed / 60))} MINUTES OF DEEP WORK.
              </p>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-white/40 block mb-1 text-center uppercase font-bold text-[10px]">Session Rating</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1.5 transition cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'text-amber-400 fill-current' : 'text-white/20'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/40 block mb-1 uppercase font-bold text-[10px]">Key Topics Covered / Reflection</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Mastered process synchronization semaphores and mutex locks..."
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono text-xs"
                />
              </div>

              <div className="p-3 bg-white/5 border border-white/10 flex items-center gap-3 cursor-pointer"
                onClick={() => setMarkUnitFinished(!markUnitFinished)}
              >
                <input
                  type="checkbox"
                  checked={markUnitFinished}
                  onChange={() => {}}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
                <span className="text-white/80 font-mono text-xs uppercase">
                  Mark {selectedSubjectCode} Unit {selectedUnitNumber} as 100% Completed & schedule spaced repetitions
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowReflectionModal(false)}
                  className="px-4 py-2.5 bg-white/5 text-white/50 hover:text-white font-mono text-xs uppercase font-bold"
                >
                  Discard
                </button>
                <button
                  onClick={handleFinishAndSave}
                  className="px-6 py-2.5 bg-white text-black hover:bg-cyan-400 font-bold font-mono text-xs uppercase tracking-wider"
                >
                  Save to Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
