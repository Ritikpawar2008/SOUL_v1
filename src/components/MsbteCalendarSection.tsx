import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Bell, 
  BellOff, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Award, 
  ShieldCheck,
  ChevronRight,
  Flame,
  Zap
} from 'lucide-react';
import { MSBTECalendarEvent } from '../types';

interface MsbteCalendarSectionProps {
  events: MSBTECalendarEvent[];
  currentTime: Date;
  onToggleReminder: (eventId: string) => void;
}

export const MsbteCalendarSection: React.FC<MsbteCalendarSectionProps> = ({
  events,
  currentTime,
  onToggleReminder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<boolean>(true);

  // Helper to calculate days remaining
  const getDaysRemaining = (dateStr: string): number => {
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const today = new Date(currentTime);
    today.setHours(0, 0, 0, 0);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Find the next upcoming high-stakes event (e.g. CT-1, CT-2, Practical, Theory)
  const upcomingEvents = events
    .map(e => ({ ...e, daysRemaining: getDaysRemaining(e.startDate) }))
    .filter(e => e.daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const nextBigEvent = upcomingEvents[0] || events[0];

  const getCategoryBadge = (cat: MSBTECalendarEvent['category']) => {
    switch (cat) {
      case 'class_test':
        return { label: 'CLASS TEST', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'practical_exam':
        return { label: 'PRACTICAL EXAM', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
      case 'theory_exam':
        return { label: 'THEORY EXAM', bg: 'bg-red-600/20 text-red-300 border-red-500/40' };
      case 'exam_form':
        return { label: 'EXAM FORM', bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
      case 'result':
        return { label: 'RESULT', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'ACADEMIC TERM', bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
    }
  };

  const filteredEvents = events.filter(e => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HERO: OFFICIAL COUNTDOWN BANNER */}
      <div className="relative overflow-hidden p-6 md:p-8 bg-[#0C1214] border border-cyan-500/30 shadow-2xl">
        <div className="absolute right-0 bottom-0 text-8xl md:text-9xl font-black tracking-tighter leading-none text-white/[0.02] select-none pointer-events-none uppercase font-display">
          MSBTE
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 bg-cyan-400 text-black text-[9px] font-mono font-black uppercase tracking-widest">
                OFFICIAL A.Y. 2026–27
              </span>
              <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-white/60 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>FIXED DATES · ODD SEMESTER</span>
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight">
              MSBTE ACADEMIC EXAM CALENDAR
            </h3>
            <p className="text-xs font-mono text-white/50 max-w-xl leading-relaxed">
              Official board milestones for Class Tests (CT-1 & CT-2), Practical Lab Vivas, Winter 2026 Theory Examinations, and Exam Form deadlines.
            </p>
          </div>

          {/* Real-time Target Countdown Card */}
          {nextBigEvent && (
            <div className="p-5 bg-black/60 border border-cyan-400/40 shrink-0 text-center min-w-[240px] space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] font-black text-cyan-400 flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>NEXT MSBTE EVENT</span>
              </div>
              <div className="text-sm font-display font-black text-white uppercase truncate max-w-[220px] mx-auto">
                {nextBigEvent.title}
              </div>
              <div className="flex items-baseline justify-center gap-1.5 pt-1">
                <span className="text-4xl md:text-5xl font-mono font-black text-white tabular-nums">
                  {Math.max(0, getDaysRemaining(nextBigEvent.startDate))}
                </span>
                <span className="text-xs font-mono uppercase font-bold text-cyan-300">DAYS REMAINING</span>
              </div>
              <div className="text-[10px] font-mono text-white/40 uppercase">
                STARTS: {nextBigEvent.startDate}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. CATEGORY PILLS FILTER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'ALL EVENTS' },
          { id: 'class_test', label: 'CLASS TESTS (CT-1 / CT-2)' },
          { id: 'practical_exam', label: 'PRACTICAL VIVAS' },
          { id: 'theory_exam', label: 'THEORY EXAMS' },
          { id: 'exam_form', label: 'EXAM FORMS' },
          { id: 'term', label: 'ACADEMIC TERM' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition cursor-pointer whitespace-nowrap font-bold border ${
              selectedCategory === cat.id
                ? 'bg-cyan-400 text-black border-cyan-400 font-black'
                : 'bg-[#0C1214] text-white/60 hover:text-white border-white/10 hover:border-white/20'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. EVENT CARDS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map(event => {
          const daysLeft = getDaysRemaining(event.startDate);
          const badge = getCategoryBadge(event.category);
          const isOngoing = daysLeft <= 0 && event.endDate && getDaysRemaining(event.endDate) >= 0;
          const isPassed = event.endDate ? getDaysRemaining(event.endDate) < 0 : daysLeft < 0;

          return (
            <div
              key={event.id}
              className={`p-5 bg-[#0C1214] border transition-all flex flex-col justify-between space-y-4 ${
                isOngoing
                  ? 'border-cyan-400 bg-cyan-400/[0.03] ring-1 ring-cyan-400/30'
                  : isPassed
                  ? 'border-white/10 opacity-60'
                  : 'border-white/15 hover:border-cyan-400/40'
              }`}
            >
              <div className="space-y-3">
                {/* Header line: Category & Days remaining */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider border ${badge.bg}`}>
                    {badge.label}
                  </span>

                  <div className="text-right">
                    {isOngoing ? (
                      <span className="px-2 py-0.5 bg-cyan-400 text-black text-[9px] font-mono font-black uppercase tracking-wider animate-pulse">
                        ● IN PROGRESS
                      </span>
                    ) : isPassed ? (
                      <span className="text-[10px] font-mono text-white/40 uppercase font-bold">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-black text-cyan-400 tabular-nums">
                        ⏳ {daysLeft} DAYS LEFT
                      </span>
                    )}
                  </div>
                </div>

                {/* Event Title */}
                <div>
                  <h4 className="text-base font-display font-black text-white uppercase tracking-tight leading-snug">
                    {event.title}
                  </h4>
                  {event.isTentative && (
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                      (Tentative Schedule)
                    </span>
                  )}
                  {event.description && (
                    <p className="text-xs font-mono text-white/50 mt-1 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer: Date Range & Reminder Toggle */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-white/40 uppercase font-bold">SCHEDULE DATES</div>
                  <div className="text-white font-bold text-[11px]">
                    {event.startDate} {event.endDate ? `→ ${event.endDate}` : ''}
                  </div>
                </div>

                <button
                  onClick={() => onToggleReminder(event.id)}
                  className={`p-2 border transition cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase ${
                    event.reminderEnabled
                      ? 'bg-cyan-400/20 border-cyan-400/40 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                  }`}
                  title={event.reminderEnabled ? 'Reminder Active' : 'Enable Reminder'}
                >
                  {event.reminderEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                  <span>{event.reminderEnabled ? 'ALERT ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
