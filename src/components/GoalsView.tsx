import React, { useState } from 'react';
import { 
  Flame, 
  Target, 
  CheckCircle2, 
  Award, 
  Calendar, 
  Clock, 
  Plus, 
  Activity, 
  Sparkles,
  TrendingUp,
  Check
} from 'lucide-react';
import { ActivityHistoryItem, HabitGoal, Subject, AcademicTask } from '../types';

interface GoalsViewProps {
  habits: HabitGoal[];
  history: ActivityHistoryItem[];
  subjects: Subject[];
  tasks: AcademicTask[];
  onUpdateHabits: (habits: HabitGoal[]) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  habits,
  history,
  subjects,
  tasks,
  onUpdateHabits,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const toggleHabitCheckToday = (habitId: string) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const isDoneToday = h.lastCompletedDate === todayStr;
        const newStreak = isDoneToday ? Math.max(0, h.currentStreak - 1) : h.currentStreak + 1;
        const newLongest = Math.max(h.longestStreak, newStreak);
        
        return {
          ...h,
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastCompletedDate: isDoneToday ? undefined : todayStr,
        };
      }
      return h;
    });
    onUpdateHabits(updated);
  };

  // Academic completion statistics
  const totalUnits = subjects.reduce((acc, s) => acc + s.units.length, 0);
  const completedUnits = subjects.reduce((acc, s) => acc + s.units.filter(u => u.status === 'completed').length, 0);
  const totalMinutesStudied = subjects.reduce(
    (acc, s) => acc + s.units.reduce((uAcc, u) => uAcc + (u.totalMinutesStudied || 0), 0), 
    0
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner */}
      <section className="relative overflow-hidden p-6 md:p-8 bg-[#0C1214] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute right-0 bottom-0 text-8xl md:text-9xl font-black tracking-tighter leading-none text-white/[0.02] select-none pointer-events-none uppercase font-display">
          GOALS
        </div>

        <div className="relative z-10">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
            <span>05 / GOALS & HABIT REINFORCEMENT</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tight mt-1">
            STREAKS & REPUTATION
          </h2>
          <p className="text-xs font-mono text-white/50 mt-1 uppercase tracking-wider">
            PHYSICAL DISCIPLINE, SPACED MEMORY PROTOCOLS, AUDIT TRAILS.
          </p>
        </div>

        {/* Global Total Hours Studied Badge */}
        <div className="relative z-10 flex items-center gap-4 p-4 bg-white/5 border border-white/10">
          <Clock className="w-6 h-6 text-cyan-400" />
          <div>
            <div className="text-2xl font-mono font-black text-white">
              {Math.round((totalMinutesStudied / 60) * 10) / 10} HOURS
            </div>
            <div className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
              LIFETIME DEEP WORK LOGGED
            </div>
          </div>
        </div>
      </section>

      {/* 1. DAILY HABITS & DISCIPLINE MATRIX */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>DAILY NON-NEGOTIABLES & HABIT STREAKS</span>
          </h3>
          <span className="text-[10px] font-mono text-white/40 uppercase">CLICK BOX TO CHECK IN</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map(habit => {
            const isCompletedToday = habit.lastCompletedDate === todayStr;

            return (
              <div
                key={habit.id}
                className={`p-6 border transition-all flex items-center justify-between gap-4 ${
                  isCompletedToday
                    ? 'border-cyan-400/40 bg-[#0C1214]'
                    : 'border-white/10 bg-[#0C1214] hover:border-white/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/10 text-white/70 font-mono text-[9px] uppercase font-bold">
                      {habit.category}
                    </span>
                    <span className="text-xs font-mono text-orange-400 font-black flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{habit.currentStreak} DAYS STREAK</span>
                    </span>
                  </div>

                  <h4 className="text-base font-display font-black text-white uppercase tracking-tight">
                    {habit.title}
                  </h4>
                  <p className="text-xs font-mono text-white/50">
                    {habit.description}
                  </p>

                  <div className="text-[10px] font-mono text-white/30 pt-1 uppercase">
                    BEST: {habit.longestStreak} DAYS • TARGET: {habit.targetDaysPerWeek}D/WEEK
                  </div>
                </div>

                {/* Check In Action Button */}
                <button
                  onClick={() => toggleHabitCheckToday(habit.id)}
                  className={`w-12 h-12 border flex items-center justify-center transition-all cursor-pointer transform active:scale-90 ${
                    isCompletedToday
                      ? 'bg-cyan-400 text-black border-cyan-400'
                      : 'bg-white/5 text-white/30 hover:text-white border-white/10 hover:border-cyan-400'
                  }`}
                  title={isCompletedToday ? 'Completed today! Click to undo' : 'Mark completed today'}
                >
                  <Check className={`w-6 h-6 stroke-[3] ${isCompletedToday ? 'scale-100' : 'opacity-30'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. ACADEMIC REPOSITORY COMPLETION METRICS */}
      <section className="p-6 md:p-8 bg-[#0C1214] border border-white/10 space-y-6">
        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] font-bold">
          <Target className="w-4 h-4 text-cyan-400" />
          <span>SEMESTER ACADEMIC HEALTH SCORECARD</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white/5 border border-white/10">
            <div className="text-[10px] font-mono text-white/50 uppercase tracking-wider font-bold">SYLLABUS UNITS MASTERED</div>
            <div className="text-3xl font-display font-black text-cyan-400 mt-2">
              {completedUnits} / {totalUnits}
            </div>
            <div className="text-[10px] font-mono text-white/40 mt-1 uppercase">
              {Math.round((completedUnits / Math.max(1, totalUnits)) * 100)}% CURRICULUM COVERED
            </div>
          </div>

          <div className="p-5 bg-white/5 border border-white/10">
            <div className="text-[10px] font-mono text-white/50 uppercase tracking-wider font-bold">PENDING ASSIGNMENTS & MANUALS</div>
            <div className="text-3xl font-display font-black text-orange-400 mt-2">
              {tasks.filter(t => t.status !== 'completed').length} TASKS
            </div>
            <div className="text-[10px] font-mono text-white/40 mt-1 uppercase">
              {tasks.filter(t => t.status === 'completed').length} SUBMITTED
            </div>
          </div>

          <div className="p-5 bg-white/5 border border-white/10">
            <div className="text-[10px] font-mono text-white/50 uppercase tracking-wider font-bold">PREDICTED AGGREGATE POOL</div>
            <div className="text-3xl font-display font-black text-emerald-400 mt-2">
              92.4%
            </div>
            <div className="text-[10px] font-mono text-white/40 mt-1 uppercase">
              TARGET: 90%+ COMPUTER ENG
            </div>
          </div>
        </div>
      </section>

      {/* 3. HISTORICAL ACTIVITY LOG */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>ACTIVITY & STUDY SESSION AUDIT LOG</span>
          </h3>
          <span className="text-[10px] font-mono text-white/40 uppercase">{history.length} LOGGED RECORDS</span>
        </div>

        <div className="bg-[#0C1214] p-6 border border-white/10 divide-y divide-white/5">
          {history.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-xs font-mono uppercase tracking-wider">
              NO SESSIONS LOGGED YET. START A STUDY SESSION IN FOCUS MODE.
            </div>
          ) : (
            history.map(item => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1 bg-white/5 border border-white/10 text-cyan-400 font-mono text-xs font-black uppercase">
                    {item.subjectCode || 'GEN'}
                  </div>
                  <div>
                    <h5 className="text-sm font-display font-bold text-white uppercase">{item.title}</h5>
                    {item.notes && <p className="text-xs font-mono text-white/40">{item.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-white/50">
                  <span>⏱️ {item.durationMinutes} MINS</span>
                  <span>📅 {item.date} {item.time}</span>
                  <span className={`px-2 py-0.5 text-[9px] uppercase font-black tracking-wider ${
                    item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
};
