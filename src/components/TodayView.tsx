import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  RotateCcw, 
  SkipForward, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Flame, 
  BookOpen, 
  Check, 
  ChevronRight, 
  Layers, 
  ArrowRight,
  RefreshCw,
  Award,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  AcademicTask, 
  ActivityHistoryItem, 
  AIRecommendation, 
  AvailableTimeSlot, 
  DayOfWeek, 
  HabitGoal, 
  ScheduleConflict, 
  Subject, 
  TimetableSlot, 
  UserPreferences,
  PostGymSlot
} from '../types';
import { 
  calculateAvailableSlots, 
  checkScheduleConflict, 
  formatTime12h, 
  generateSmartRecommendations, 
  getDayOfWeekFromDate, 
  minutesToTimeString, 
  parseTimeToMinutes 
} from '../lib/schedulingEngine';

interface TodayViewProps {
  preferences: UserPreferences;
  currentTime: Date;
  timetable: TimetableSlot[];
  subjects: Subject[];
  tasks: AcademicTask[];
  habits: HabitGoal[];
  history: ActivityHistoryItem[];
  postGymRoutine?: PostGymSlot[];
  onUpdatePostGymRoutine?: (routine: PostGymSlot[]) => void;
  onStartStudySession: (item: { subjectCode: string; unitNumber?: number; title: string; taskId?: string }) => void;
  onCompleteTask: (taskId: string) => void;
  onLogUnitStudy: (subjectCode: string, unitNumber: number, minutes: number, completed: boolean) => void;
  onNavigateTab: (tab: any) => void;
  activeSession: {
    active: boolean;
    title: string;
    subjectCode: string;
    unitNumber?: number;
    taskId?: string;
    startTime: number;
    durationMinutes: number;
    paused: boolean;
    pausedAt?: number;
    totalPausedTime: number;
  } | null;
  setActiveSession: React.Dispatch<React.SetStateAction<any>>;
}

export const TodayView: React.FC<TodayViewProps> = ({
  preferences,
  currentTime,
  timetable,
  subjects,
  tasks,
  habits,
  history,
  postGymRoutine = [],
  onUpdatePostGymRoutine,
  onStartStudySession,
  onCompleteTask,
  onLogUnitStudy,
  onNavigateTab,
  activeSession,
  setActiveSession,
}) => {
  const currentDay = getDayOfWeekFromDate(currentTime);
  const currentTimeStr = currentTime.toTimeString().slice(0, 5); // "HH:MM"
  const currentHour = currentTime.getHours();

  // Dynamic greeting based on time of day
  const greeting = currentHour < 12 
    ? 'GOOD MORNING.' 
    : currentHour < 17 
    ? 'GOOD AFTERNOON.' 
    : 'GOOD EVENING.';

  // Calculate available slots today
  const availableSlots = calculateAvailableSlots(currentDay, timetable, preferences, currentTimeStr);
  const currentAvailableMinutes = availableSlots.length > 0 ? availableSlots[0].durationMinutes : 60;

  // Generate dynamic recommendations
  const allRecommendations = generateSmartRecommendations(subjects, tasks, history, currentAvailableMinutes, currentTime);
  
  // Selected alternative recommendation or top recommendation
  const [selectedRecIndex, setSelectedRecIndex] = useState<number>(0);
  const [showAlternatives, setShowAlternatives] = useState<boolean>(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState<boolean>(false);

  const topRec = allRecommendations[selectedRecIndex] || allRecommendations[0] || {
    id: 'rec-fallback',
    type: 'study',
    title: 'CLC Unit 2 — Cloud Architecture',
    subjectCode: 'CLC',
    unitNumber: 2,
    estimatedMinutes: 45,
    reason: 'Continue progress on incomplete unit.',
    priorityScore: 70,
  };

  const nextRec = allRecommendations[selectedRecIndex + 1] || allRecommendations[1] || null;
  const laterRec = allRecommendations[selectedRecIndex + 2] || allRecommendations[2] || null;

  // Active Session Timer Calculations
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeSession && activeSession.active && !activeSession.paused) {
      timer = setInterval(() => {
        const now = Date.now();
        const totalElapsed = Math.floor((now - activeSession.startTime - activeSession.totalPausedTime) / 1000);
        setElapsedSeconds(Math.max(0, totalElapsed));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSession]);

  const togglePauseActiveSession = () => {
    if (!activeSession) return;
    if (activeSession.paused) {
      const pauseDuration = Date.now() - (activeSession.pausedAt || Date.now());
      setActiveSession({
        ...activeSession,
        paused: false,
        pausedAt: undefined,
        totalPausedTime: activeSession.totalPausedTime + pauseDuration,
      });
    } else {
      setActiveSession({
        ...activeSession,
        paused: true,
        pausedAt: Date.now(),
      });
    }
  };

  const finishActiveSession = (markCompleted: boolean = false) => {
    if (!activeSession) return;
    const studiedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    if (activeSession.subjectCode && activeSession.unitNumber) {
      onLogUnitStudy(activeSession.subjectCode, activeSession.unitNumber, studiedMinutes, markCompleted);
    } else if (activeSession.taskId) {
      if (markCompleted) {
        onCompleteTask(activeSession.taskId);
      }
    }

    // Celebration fireworks
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#14b8a6', '#f97316', '#38bdf8']
      });
    } catch {}

    setActiveSession(null);
    setElapsedSeconds(0);
  };

  // Progress stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalUnits = subjects.reduce((acc, s) => acc + s.units.length, 0);
  const completedUnits = subjects.reduce((acc, s) => acc + s.units.filter(u => u.status === 'completed').length, 0);
  const progressPercent = Math.round(((completedTasks + completedUnits) / Math.max(1, totalTasks + totalUnits)) * 100);
  const remainingCount = tasks.filter(t => t.status !== 'completed').length + subjects.reduce((acc, s) => acc + s.units.filter(u => u.status !== 'completed').length, 0);

  // Today's schedule slots for vertical timeline
  const todayClasses = timetable.filter(s => s.day === currentDay).sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  // Construct complete daily editorial timeline
  const dailyTimelineItems: {
    time: string;
    endTime: string;
    title: string;
    subtitle?: string;
    type: 'college' | 'free' | 'gym' | 'recess' | 'study' | 'dinner';
    subjectCode?: string;
    room?: string;
    activeNow?: boolean;
    suggestion?: string;
  }[] = [];

  for (const slot of todayClasses) {
    dailyTimelineItems.push({
      time: slot.startTime,
      endTime: slot.endTime,
      title: slot.type === 'free' ? 'FREE PERIOD' : slot.title,
      subtitle: slot.instructor || slot.room,
      type: slot.type === 'free' ? 'free' : slot.type === 'recess' ? 'recess' : 'college',
      subjectCode: slot.subjectCode,
      room: slot.room,
      suggestion: slot.type === 'free' ? 'SOUL suggests: Quick 45m Spaced Revision or Lab Prep' : undefined,
    });
  }

  // Insert Gym block (4:00 PM - 7:00 PM)
  dailyTimelineItems.push({
    time: preferences.gymStartTime || '16:00',
    endTime: preferences.gymEndTime || '19:00',
    title: 'FIXED GYM COMMITMENT',
    subtitle: 'Strength, Hypertrophy & Cardiovascular Reset (Non-negotiable)',
    type: 'gym',
  });

  // Insert Dynamic Post-Gym Evening Routine (7:00 PM Onwards)
  if (postGymRoutine && postGymRoutine.length > 0) {
    postGymRoutine.forEach(slot => {
      dailyTimelineItems.push({
        time: slot.startTime,
        endTime: slot.endTime,
        title: slot.title,
        subtitle: slot.subtitle,
        type: slot.type === 'meal' ? 'dinner' : slot.type === 'wind_down' || slot.type === 'leisure' ? 'free' : 'study',
        subjectCode: slot.subjectCode,
        suggestion: slot.type === 'manual' ? `MSBTE Practical Manual (${slot.subjectCode})` : slot.type === 'assignment' ? `Assignment Writeup & Numerical Solutions (${slot.subjectCode || 'CLC'})` : undefined,
      });
    });
  } else {
    // Default fallback if routine is empty
    dailyTimelineItems.push({
      time: '19:00',
      endTime: '19:45',
      title: 'DINNER / RECOVERY BUFFER',
      subtitle: 'Nutrition, hydration & cognitive wind-down before deep study',
      type: 'dinner',
    });
    dailyTimelineItems.push({
      time: '19:45',
      endTime: '20:45',
      title: 'OSY MANUAL',
      subtitle: 'Operating Systems practicals & CPU scheduling algorithms',
      type: 'study',
      subjectCode: 'OSY',
    });
    dailyTimelineItems.push({
      time: '21:00',
      endTime: '22:00',
      title: 'ASSIGNMENT',
      subtitle: 'Cloud service models & virtualization assignment',
      type: 'study',
      subjectCode: 'CLC',
    });
    dailyTimelineItems.push({
      time: '22:00',
      endTime: '22:45',
      title: 'STE SPACED REVISION',
      subtitle: 'Stage 1 active recall & key definitions',
      type: 'study',
      subjectCode: 'STE',
    });
    dailyTimelineItems.push({
      time: '22:45',
      endTime: '23:30',
      title: 'GUILT-FREE LEISURE & NIGHT WIND-DOWN',
      subtitle: 'Relaxation music & preparation for sleep',
      type: 'free',
    });
  }

  // Sort timeline chronologically
  dailyTimelineItems.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

  // Determine current active timeline item
  const currentMins = parseTimeToMinutes(currentTimeStr);
  dailyTimelineItems.forEach(item => {
    const s = parseTimeToMinutes(item.time);
    const e = parseTimeToMinutes(item.endTime);
    if (currentMins >= s && currentMins < e) {
      item.activeNow = true;
    }
  });

  // Check if current time is inside gym
  const isGymTimeNow = currentMins >= parseTimeToMinutes(preferences.gymStartTime || '16:00') && currentMins < parseTimeToMinutes(preferences.gymEndTime || '19:00');

  // Determine current and next activity
  const activeItem = dailyTimelineItems.find(item => item.activeNow);
  const currentActivityName = activeItem ? activeItem.title : 'Free Window / Study Gap';
  const nextItem = dailyTimelineItems.find(item => parseTimeToMinutes(item.time) > currentMins);
  const nextActivityName = nextItem ? `${formatTime12h(nextItem.time)} · ${nextItem.title}` : 'No further scheduled commitments today';

  return (
    <div className="space-y-6 md:space-y-8 pb-16">
      
      {/* 01. EDITORIAL HERO BANNER */}
      <section className="relative overflow-hidden border border-white/10 bg-[#0C1214] p-5 sm:p-6 md:p-10">
        {/* Massive Background Watermark */}
        <div className="absolute right-0 bottom-0 text-[100px] sm:text-[110px] md:text-[160px] font-black tracking-tighter leading-none text-white/[0.03] select-none pointer-events-none uppercase font-display">
          TODAY
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-mono tracking-[0.35em] uppercase font-bold">
              <span className="w-1.5 h-1.5 bg-cyan-400" />
              <span>01 / REAL-TIME OPERATING SYSTEM</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase leading-none">
              {greeting}
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white/70 uppercase">
              YOUR DAY, <span className="text-cyan-400 font-black">ORGANIZED WITH PRECISION.</span>
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-[11px] font-mono font-bold tracking-wider text-white/60 uppercase">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentDay.toUpperCase()} · 24 AUGUST 2026</span>
            </div>
          </div>

          {/* Large Stat Numbers */}
          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 font-bold">DAY EFFICIENCY</div>
              <div className="text-3xl sm:text-4xl md:text-6xl font-display font-black text-white tracking-tighter">
                {progressPercent}<span className="text-cyan-400 text-2xl md:text-3xl">%</span>
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-white/50 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyan-400" />
                <span>{completedTasks} completed</span>
              </div>
            </div>

            <div className="text-left border-l border-white/10 pl-6">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 font-bold">PENDING POOL</div>
              <div className="text-3xl sm:text-4xl md:text-6xl font-display font-black text-white tracking-tighter">
                {remainingCount}
              </div>
              <div className="text-[11px] text-orange-400 font-mono font-bold uppercase tracking-wider mt-1">
                ACTIVE QUEUE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gym Alert Banner if currently in gym time */}
      {isGymTimeNow && (
        <div className="p-4 sm:p-5 border border-orange-500/40 bg-orange-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 text-black font-black shrink-0">
              <Flame className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-black text-orange-400 text-xs uppercase tracking-widest font-mono">NON-NEGOTIABLE COMMITMENT: FIXED GYM BLOCK</div>
              <div className="text-xs text-white/70 font-mono mt-0.5">04:00 PM – 07:00 PM. SOUL has locked academic scheduling during this period for physical recovery.</div>
            </div>
          </div>
          <button 
            onClick={() => onNavigateTab('life')}
            className="w-full sm:w-auto text-center px-4 py-2 bg-orange-500 text-black text-xs font-mono font-black uppercase tracking-widest hover:bg-orange-400 transition cursor-pointer"
          >
            VIEW LIFE →
          </button>
        </div>
      )}

      {/* 02. "WHAT SHOULD I DO NOW?" HERO SECTION */}
      <section className="space-y-4">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono tracking-[0.25em] font-black text-cyan-400 uppercase">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>02 / WHAT SHOULD I DO NOW?</span>
          </div>
          <div className="text-xs font-mono text-white/60 flex items-center gap-2">
            <span className="uppercase text-[10px] tracking-widest text-white/40">AVAILABLE WINDOW:</span>
            <span className="text-cyan-400 font-mono font-black text-xs px-2.5 py-0.5 bg-cyan-400/10 border border-cyan-400/30 uppercase">
              YOU HAVE {currentAvailableMinutes} MINUTES
            </span>
          </div>
        </div>

        {/* 4-Metric Real-time Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-xs font-mono">
          <div className="p-3.5 bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>CURRENT TIME</span>
            </span>
            <div className="text-sm md:text-base font-bold text-white tracking-wide">
              {formatTime12h(currentTimeStr)}
            </div>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>CURRENT ACTIVITY</span>
            </span>
            <div className="text-xs md:text-sm font-bold text-white truncate" title={currentActivityName}>
              {currentActivityName}
            </div>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>NEXT ACTIVITY</span>
            </span>
            <div className="text-xs md:text-sm font-bold text-white truncate" title={nextActivityName}>
              {nextActivityName}
            </div>
          </div>

          <div className="p-3.5 bg-cyan-400/10 border border-cyan-400/30 space-y-1">
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>AVAILABLE TIME</span>
            </span>
            <div className="text-sm md:text-base font-black text-cyan-300">
              {currentAvailableMinutes} MINS
            </div>
          </div>
        </div>

        {/* ACTIVE STUDY SESSION RUNNING */}
        {activeSession && activeSession.active ? (
          <div className="relative border border-cyan-400/40 bg-[#0C1518] p-5 sm:p-6 md:p-8 overflow-hidden shadow-xl">
            <div className="absolute right-0 bottom-0 text-[90px] sm:text-[100px] md:text-[140px] font-black tracking-tighter leading-none text-cyan-400/[0.03] select-none pointer-events-none uppercase font-display">
              ACTIVE
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
                  <span className="w-1.5 h-1.5 bg-cyan-400 animate-ping" />
                  <span>SESSION RUNNING NOW</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
                  {activeSession.title}
                </h2>
                <p className="text-xs font-mono text-white/70 uppercase tracking-wider flex flex-wrap items-center gap-3">
                  <span>SUBJECT: <strong className="text-cyan-400 font-bold">{activeSession.subjectCode}</strong></span>
                  {activeSession.unitNumber && <span>• UNIT {activeSession.unitNumber}</span>}
                  <span>• TARGET: {activeSession.durationMinutes} MINS</span>
                </p>
              </div>

              {/* Huge Live Timer */}
              <div className="flex flex-col items-start md:items-end">
                <div className="text-5xl md:text-7xl font-mono font-black text-cyan-400 tracking-tight">
                  {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:
                  {(elapsedSeconds % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-[10px] font-mono font-bold text-white/40 mt-1 uppercase tracking-[0.25em]">
                  {activeSession.paused ? '⏸️ PAUSED' : '⚡ ELAPSED TIME TRACKED'}
                </div>
              </div>

            </div>

            {/* Session Action Controls */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={togglePauseActiveSession}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  {activeSession.paused ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                      <span>RESUME</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-orange-400 fill-current" />
                      <span>PAUSE</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onNavigateTab('focus')}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  <span>FOCUS MODE →</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => finishActiveSession(false)}
                  className="px-3.5 sm:px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-mono uppercase tracking-wider transition cursor-pointer"
                >
                  LOG & STOP
                </button>

                <button
                  onClick={() => finishActiveSession(true)}
                  className="flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-white hover:bg-cyan-400 text-black font-mono font-black text-xs uppercase tracking-widest transition cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>COMPLETED</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* PRIMARY RECOMMENDATION CARD */
          <div className="relative border border-white/15 bg-[#0C1214] p-5 sm:p-6 md:p-8 hover:border-cyan-400/50 transition-all shadow-xl">
            {/* Watermark */}
            <div className="absolute right-0 bottom-0 text-[90px] sm:text-[100px] md:text-[140px] font-black tracking-tighter leading-none text-white/[0.02] select-none pointer-events-none uppercase font-display">
              ACTION
            </div>

            {/* Top Tag & Time estimate */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-cyan-400 text-black text-[10px] font-mono font-black tracking-[0.2em] uppercase">
                  SOUL SUGGESTS
                </span>
                <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-white/60 text-[10px] font-mono font-bold uppercase">
                  {topRec.type.toUpperCase()}
                </span>
                {topRec.deadlineWarning && (
                  <span className="px-2.5 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold uppercase">
                    ⚠️ {topRec.deadlineWarning}
                  </span>
                )}
              </div>

              <div className="text-xs font-mono text-cyan-400 flex items-center gap-1.5 uppercase font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{topRec.estimatedMinutes} MIN</span>
              </div>
            </div>

            {/* Title & Subject */}
            <div className="space-y-3 mb-6 relative z-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-white/10 font-mono font-black text-cyan-400 text-xs uppercase tracking-wider">
                  {topRec.subjectCode || 'ACADEMIC'} {topRec.unitNumber ? `— UNIT ${topRec.unitNumber}` : ''}
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
                  {topRec.title}
                </h3>
              </div>

              {/* Rationale / Reason */}
              <div className="p-3.5 bg-white/5 border border-white/5 text-xs font-mono text-white/80 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white uppercase tracking-wider">RATIONALE: </strong>
                  {topRec.reason}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 relative z-10">
              
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    onStartStudySession({
                      subjectCode: topRec.subjectCode || 'CLC',
                      unitNumber: topRec.unitNumber,
                      title: topRec.title,
                      taskId: topRec.taskId,
                    });
                  }}
                  className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-white text-black font-mono font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-colors cursor-pointer active:scale-95 shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current stroke-none" />
                  <span>START</span>
                </button>

                <button
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-mono font-bold tracking-wider uppercase transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${showAlternatives ? 'rotate-180 text-cyan-400' : ''} transition-transform`} />
                  <span>{showAlternatives ? 'HIDE ALTERNATIVES' : 'CHOOSE SOMETHING ELSE'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRecIndex((prev) => (prev + 1) % Math.max(1, allRecommendations.length));
                  }}
                  title="Skip to next candidate in pending pool"
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-mono font-bold tracking-wider uppercase transition cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>SKIP</span>
                </button>

                <button
                  onClick={() => onNavigateTab('planner')}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-mono font-bold tracking-wider uppercase transition cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>SCHEDULE</span>
                </button>
              </div>

            </div>

            {/* ALTERNATIVES CAROUSEL / EXPANDED LIST */}
            {showAlternatives && (
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3 relative z-10">
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 font-bold">
                  ALTERNATIVE OPTIONS FROM PENDING POOL:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {allRecommendations.slice(1, 4).map((alt, idx) => (
                    <div
                      key={alt.id}
                      onClick={() => {
                        setSelectedRecIndex(idx + 1);
                        setShowAlternatives(false);
                      }}
                      className="p-4 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/40 transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-1 font-bold uppercase">
                        <span>{alt.subjectCode || 'STUDY'} • {alt.type.toUpperCase()}</span>
                        <span>{alt.estimatedMinutes}M</span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 uppercase line-clamp-1">
                        {alt.title}
                      </h4>
                      <p className="text-[11px] text-white/50 font-mono line-clamp-2 mt-1">
                        {alt.reason}
                      </p>
                      <div className="mt-3 text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1 uppercase tracking-wider group-hover:underline">
                        <span>Select option</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </section>

      {/* 03. NEXT & LATER QUEUE CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* NEXT CARD */}
        <div className="p-6 border border-white/10 bg-[#0C1214] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 text-7xl font-black tracking-tighter leading-none text-white/[0.02] select-none pointer-events-none uppercase font-display">
            NEXT
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-2">
              <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-cyan-400 uppercase font-bold text-[10px] tracking-widest">
                03 / UP NEXT IN QUEUE
              </span>
              <span className="font-bold">{nextRec ? `${nextRec.estimatedMinutes} MINS` : 'FLEXIBLE'}</span>
            </div>
            <h4 className="text-lg font-display font-black text-white uppercase tracking-tight mb-1">
              {nextRec ? nextRec.title : 'OSY Manual'}
            </h4>
            <p className="text-xs font-mono text-white/60 mt-1">
              {nextRec ? nextRec.reason : 'Complete code implementation and average waiting time calculations.'}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
            <span className="text-[11px] font-mono text-white/40 uppercase">
              SUBJECT: <strong className="text-cyan-400 font-bold">{nextRec?.subjectCode || 'OSY'}</strong>
            </span>
            <button
              onClick={() => {
                if (nextRec) {
                  onStartStudySession({
                    subjectCode: nextRec.subjectCode || 'OSY',
                    unitNumber: nextRec.unitNumber,
                    title: nextRec.title,
                    taskId: nextRec.taskId,
                  });
                }
              }}
              className="text-xs font-mono text-cyan-400 hover:text-white flex items-center gap-1.5 cursor-pointer font-black uppercase tracking-wider"
            >
              <span>START NOW</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* LATER CARD */}
        <div className="p-6 border border-white/10 bg-[#0C1214] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 text-7xl font-black tracking-tighter leading-none text-white/[0.02] select-none pointer-events-none uppercase font-display">
            LATER
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-2">
              <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-orange-400 uppercase font-bold text-[10px] tracking-widest">
                04 / LATER TODAY
              </span>
              <span className="font-bold">{laterRec ? `${laterRec.estimatedMinutes} MINS` : 'FLEXIBLE'}</span>
            </div>
            <h4 className="text-lg font-display font-black text-white uppercase tracking-tight mb-1">
              {laterRec ? laterRec.title : 'STE Unit 2 — Stage 1 Spaced Repetition'}
            </h4>
            <p className="text-xs font-mono text-white/60 mt-1">
              {laterRec ? laterRec.reason : 'Control flow graphs, Cyclomatic complexity active recall quiz.'}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
            <span className="text-[11px] font-mono text-white/40 uppercase">
              SUBJECT: <strong className="text-orange-400 font-bold">{laterRec?.subjectCode || 'STE'}</strong>
            </span>
            <button
              onClick={() => onNavigateTab('academics')}
              className="text-xs font-mono text-orange-400 hover:text-white flex items-center gap-1.5 cursor-pointer font-black uppercase tracking-wider"
            >
              <span>VIEW SYLLABUS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </section>

      {/* 04. DAILY VERTICAL TIMELINE */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] font-bold text-cyan-400 uppercase">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>05 / DAILY TIMELINE • {currentDay.toUpperCase()} STRUCTURE</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigateTab('life')}
              className="text-xs font-mono text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer uppercase tracking-wider font-bold"
            >
              <Sparkles className="w-3 h-3" />
              <span>EDIT POST-GYM / AI SUGGEST →</span>
            </button>
            <span className="text-white/20">|</span>
            <button 
              onClick={() => onNavigateTab('planner')}
              className="text-xs font-mono text-white/50 hover:text-cyan-400 flex items-center gap-1 cursor-pointer uppercase tracking-wider font-bold"
            >
              <span>FULL PLANNER →</span>
            </button>
          </div>
        </div>

        <div className="border border-white/10 bg-[#0C1214] p-6 md:p-8">
          <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-3 md:before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
            
            {dailyTimelineItems.map((item, idx) => {
              const isGym = item.type === 'gym';
              const isCollege = item.type === 'college';
              const isFree = item.type === 'free';
              const isRecess = item.type === 'recess';
              const isDinner = item.type === 'dinner';
              const isStudy = item.type === 'study';

              return (
                <div key={idx} className={`relative group ${item.activeNow ? 'scale-[1.01]' : ''} transition-all`}>
                  {/* Timeline Dot Indicator */}
                  <div className={`absolute -left-[31px] md:-left-[35px] top-1.5 w-4 h-4 border-2 flex items-center justify-center transition-all ${
                    item.activeNow
                      ? 'bg-cyan-400 border-white'
                      : isGym
                      ? 'bg-orange-500 border-orange-300'
                      : isCollege
                      ? 'bg-cyan-400/80 border-cyan-300'
                      : isFree
                      ? 'bg-emerald-500 border-emerald-300'
                      : 'bg-white/20 border-white/40'
                  }`}>
                    {item.activeNow && <div className="w-1.5 h-1.5 bg-black" />}
                  </div>

                  {/* Card Block */}
                  <div className={`p-4 md:p-5 border transition-all ${
                    item.activeNow
                      ? 'bg-cyan-400/10 border-cyan-400/50'
                      : isGym
                      ? 'bg-orange-500/[0.08] border-orange-500/30'
                      : isFree
                      ? 'bg-emerald-500/[0.06] border-emerald-500/20 border-dashed'
                      : isCollege
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white/[0.02] border-white/5'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-white">
                          {formatTime12h(item.time)} – {formatTime12h(item.endTime)}
                        </span>
                        
                        <span className={`px-2 py-0.5 text-[9px] font-mono uppercase font-black tracking-wider ${
                          isGym
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : isCollege
                            ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                            : isFree
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isRecess
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-white/10 text-white/70'
                        }`}>
                          {item.type.toUpperCase()}
                        </span>

                        {item.activeNow && (
                          <span className="px-2 py-0.5 bg-cyan-400 text-black text-[9px] font-mono font-black uppercase tracking-widest animate-pulse">
                            ACTIVE NOW
                          </span>
                        )}
                      </div>

                      {item.room && (
                        <span className="text-xs font-mono font-bold text-white/50">
                          📍 {item.room}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-display font-black text-white uppercase tracking-tight">
                      {item.title}
                    </h4>
                    
                    {item.subtitle && (
                      <p className="text-xs font-mono text-white/60 mt-0.5">
                        {item.subtitle}
                      </p>
                    )}

                    {item.suggestion && (
                      <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center justify-between">
                        <span>💡 {item.suggestion}</span>
                        <button
                          onClick={() => onStartStudySession({ subjectCode: 'CLC', unitNumber: 2, title: 'CLC Unit 2 Study' })}
                          className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-mono text-[10px] font-black uppercase tracking-wider cursor-pointer transition"
                        >
                          USE GAP →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>

    </div>
  );
};
