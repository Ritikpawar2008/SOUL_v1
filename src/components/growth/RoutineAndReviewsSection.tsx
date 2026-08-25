import React, { useState } from 'react';
import {
  Clock,
  Moon,
  Sun,
  Shield,
  Dumbbell,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Flame,
  Award,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  DailyRoutineConfig,
  DailyReviewEntry,
  WeeklyReviewData,
  WeeklyTarget,
  SoulRoastSettings,
} from '../../types';
import { GrowthEngine } from '../../lib/growthEngine';

interface RoutineAndReviewsSectionProps {
  routine: DailyRoutineConfig;
  dailyReviews: DailyReviewEntry[];
  weeklyTargets: WeeklyTarget[];
  roastSettings: SoulRoastSettings;
  onSaveRoutine: (routine: DailyRoutineConfig) => void;
  onSaveDailyReview: (entry: DailyReviewEntry) => void;
}

export const RoutineAndReviewsSection: React.FC<RoutineAndReviewsSectionProps> = ({
  routine,
  dailyReviews,
  weeklyTargets,
  roastSettings,
  onSaveRoutine,
  onSaveDailyReview,
}) => {
  const [activeTab, setActiveTab] = useState<'routine' | 'daily_review' | 'weekly_review'>('routine');

  // Routine Form State
  const [wakeUp, setWakeUp] = useState<string>(routine.wakeUpTime || '06:30');
  const [sleep, setSleep] = useState<string>(routine.sleepTime || '23:00');
  const [breakfast, setBreakfast] = useState<string>(routine.breakfastTime || '08:00');
  const [lunch, setLunch] = useState<string>(routine.lunchTime || '13:00');
  const [dinner, setDinner] = useState<string>(routine.dinnerTime || '19:00');

  // Daily Evening Review Form State
  const [acadAnswer, setAcadAnswer] = useState<string>('');
  const [techAnswer, setTechAnswer] = useState<string>('');
  const [projAnswer, setProjAnswer] = useState<string>('');
  const [commDone, setCommDone] = useState<boolean>(true);
  const [routMaintained, setRoutMaintained] = useState<boolean>(true);
  const [knowlLearned, setKnowlLearned] = useState<boolean>(true);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);
  const [tomorrowAdvice, setTomorrowAdvice] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayReview = dailyReviews.find(r => r.date === todayStr);

  const handleSaveRoutineForm = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DailyRoutineConfig = {
      ...routine,
      wakeUpTime: wakeUp,
      sleepTime: sleep,
      breakfastTime: breakfast,
      lunchTime: lunch,
      dinnerTime: dinner,
    };
    onSaveRoutine(updated);
  };

  const handleSubmitDailyReview = (e: React.FormEvent) => {
    e.preventDefault();
    const { score, tomorrowRecommendation } = GrowthEngine.calculateDailyScore({
      academicAnswer: acadAnswer,
      technicalAnswer: techAnswer,
      projectAnswer: projAnswer,
      communicationDone: commDone,
      routineMaintained: routMaintained,
      knowledgeLearned: knowlLearned,
    });

    const entry: DailyReviewEntry = {
      date: todayStr,
      academicAnswer: acadAnswer,
      technicalAnswer: techAnswer,
      projectAnswer: projAnswer,
      communicationDone: commDone,
      routineMaintained: routMaintained,
      knowledgeLearned: knowlLearned,
      dailyScore: score,
      tomorrowRecommendation,
      timestamp: new Date().toISOString(),
    };

    onSaveDailyReview(entry);
    setCalculatedScore(score);
    setTomorrowAdvice(tomorrowRecommendation);
  };

  const weeklyReviewData: WeeklyReviewData = GrowthEngine.generateWeeklyReview(weeklyTargets);

  return (
    <div className="space-y-6 font-mono text-xs">

      {/* 1. Subtab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('routine')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer border ${
            activeTab === 'routine'
              ? 'bg-cyan-400 text-black border-cyan-400'
              : 'bg-[#0C1214] text-white/60 border-white/10 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>MY ROUTINE BOUNDARIES</span>
        </button>

        <button
          onClick={() => setActiveTab('daily_review')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer border ${
            activeTab === 'daily_review'
              ? 'bg-cyan-400 text-black border-cyan-400'
              : 'bg-[#0C1214] text-white/60 border-white/10 hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>NIGHTLY DAILY REVIEW</span>
        </button>

        <button
          onClick={() => setActiveTab('weekly_review')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer border ${
            activeTab === 'weekly_review'
              ? 'bg-cyan-400 text-black border-cyan-400'
              : 'bg-[#0C1214] text-white/60 border-white/10 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>SOUL WEEKLY RETROSPECTIVE</span>
        </button>
      </div>

      {/* 2. SUBTAB A: MY ROUTINE BOUNDARIES */}
      {activeTab === 'routine' && (
        <div className="space-y-5">
          <div className="p-5 bg-[#0C1214] border border-cyan-500/40 space-y-2">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>ROUTINE BOUNDARY PROTECTION (NON-NEGOTIABLES)</span>
            </span>
            <h4 className="text-xl font-display font-black text-white uppercase tracking-tight">
              Wake-Up, Sleep &amp; Meal Constraints
            </h4>
            <p className="text-white/60 text-xs">
              SOUL uses these as strict hard boundaries. The scheduler will <strong>never</strong> schedule tasks during your sleep or gym time. Changing these times immediately updates future AI recommendations.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveRoutineForm} className="p-6 bg-[#0C1214] border border-white/10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 p-3.5 bg-white/5 border border-white/10">
                <label className="text-cyan-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Wake-Up Time</span>
                </label>
                <input
                  type="time"
                  value={wakeUp}
                  onChange={(e) => setWakeUp(e.target.value)}
                  className="w-full bg-black border border-white/20 p-2.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5 p-3.5 bg-white/5 border border-white/10">
                <label className="text-cyan-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sleep Time (Hard Stop)</span>
                </label>
                <input
                  type="time"
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  className="w-full bg-black border border-white/20 p-2.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Meals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-white/60 uppercase text-[10px]">Breakfast</label>
                <input
                  type="time"
                  value={breakfast}
                  onChange={(e) => setBreakfast(e.target.value)}
                  className="w-full bg-black border border-white/20 p-2 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 uppercase text-[10px]">Lunch (College Gap)</label>
                <input
                  type="time"
                  value={lunch}
                  onChange={(e) => setLunch(e.target.value)}
                  className="w-full bg-black border border-white/20 p-2 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 uppercase text-[10px]">Dinner (Post-Gym)</label>
                <input
                  type="time"
                  value={dinner}
                  onChange={(e) => setDinner(e.target.value)}
                  className="w-full bg-black border border-white/20 p-2 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase tracking-wider text-xs cursor-pointer"
              >
                APPLY ROUTINE BOUNDARIES
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. SUBTAB B: NIGHTLY DAILY REVIEW */}
      {activeTab === 'daily_review' && (
        <div className="space-y-5">
          <div className="p-5 bg-[#0C1214] border border-white/10 space-y-2">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5" />
              <span>NIGHTLY CHECK-IN &middot; SOUL DAILY REVIEW</span>
            </span>
            <h4 className="text-xl font-display font-black text-white uppercase tracking-tight">
              Audit Today&apos;s High-Performance Execution
            </h4>
            <p className="text-white/60 text-xs">
              Answer 4 quick reflections to compute today&apos;s performance score and generate tomorrow&apos;s tailored recommendation.
            </p>
          </div>

          <form onSubmit={handleSubmitDailyReview} className="p-6 bg-[#0C1214] border border-white/10 space-y-4">
            <div className="space-y-1.5">
              <label className="text-cyan-300 uppercase text-[10px] font-bold block">
                1. Academic: What units, manuals, or revisions did you complete today?
              </label>
              <textarea
                rows={2}
                value={acadAnswer}
                onChange={(e) => setAcadAnswer(e.target.value)}
                placeholder="e.g. Completed CLC Unit 2 notes and revised STE Stage 1..."
                className="w-full bg-black border border-white/20 p-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-emerald-400 uppercase text-[10px] font-bold block">
                2. Technical: What programming concept, Linux command, or CS principle did you learn?
              </label>
              <textarea
                rows={2}
                value={techAnswer}
                onChange={(e) => setTechAnswer(e.target.value)}
                placeholder="e.g. Mastered Linux process management (ps, kill -15) and practiced Hash Map O(1) lookups..."
                className="w-full bg-black border border-white/20 p-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-purple-400 uppercase text-[10px] font-bold block">
                3. Project / Build: What did you build or ship today?
              </label>
              <textarea
                rows={2}
                value={projAnswer}
                onChange={(e) => setProjAnswer(e.target.value)}
                placeholder="e.g. Built the frontend UI and wired up API endpoints..."
                className="w-full bg-black border border-white/20 p-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <label className="p-3 bg-white/5 border border-white/10 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={commDone}
                  onChange={(e) => setCommDone(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span className="text-[11px] text-white">Practiced Communication</span>
              </label>

              <label className="p-3 bg-white/5 border border-white/10 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={routMaintained}
                  onChange={(e) => setRoutMaintained(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span className="text-[11px] text-white">Maintained Gym &amp; Sleep</span>
              </label>

              <label className="p-3 bg-white/5 border border-white/10 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={knowlLearned}
                  onChange={(e) => setKnowlLearned(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span className="text-[11px] text-white">Read Today&apos;s Space/Tech Byte</span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase tracking-wider text-xs cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>CALCULATE TODAY&apos;S SCORE &amp; PLAN TOMORROW</span>
              </button>
            </div>
          </form>

          {/* Results Score Box */}
          {(calculatedScore !== null || todayReview) && (
            <div className="p-5 bg-gradient-to-r from-[#0C1214] to-[#121B1E] border-2 border-cyan-400 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                  TODAY&apos;S AUDIT SCORE
                </span>
                <span className="text-2xl font-mono font-black text-white">
                  {calculatedScore !== null ? calculatedScore : todayReview?.dailyScore} / 100
                </span>
              </div>

              <div className="p-3 bg-black/60 border border-white/10 text-white/90 leading-relaxed text-xs">
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest block mb-1">
                  AI RECOMMENDATION FOR TOMORROW
                </span>
                <p>{tomorrowAdvice || todayReview?.tomorrowRecommendation}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SUBTAB C: SOUL WEEKLY RETROSPECTIVE */}
      {activeTab === 'weekly_review' && (
        <div className="space-y-5">
          <div className="p-5 bg-[#0C1214] border border-white/10 space-y-2">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>END OF WEEK AUDIT &middot; SOUL WEEKLY REVIEW</span>
            </span>
            <h4 className="text-xl font-display font-black text-white uppercase tracking-tight">
              Weekly Target vs. Actual Retrospective
            </h4>
            <p className="text-white/60 text-xs">
              Comprehensive audit across Academics (98% Target), Technical Beast, Linux, Projects, Communication, and Gym discipline.
            </p>
          </div>

          {/* Scoreboard Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-white/5 border border-white/10 space-y-1">
              <span className="text-[9px] text-white/40 uppercase tracking-widest block">OVERALL CONSISTENCY</span>
              <span className="text-2xl font-black text-cyan-400">{weeklyReviewData.overallScore}%</span>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 space-y-1">
              <span className="text-[9px] text-white/40 uppercase tracking-widest block">ACADEMIC UNITS DONE</span>
              <span className="text-2xl font-black text-white">{weeklyReviewData.academicUnitsCompleted} Units</span>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 space-y-1">
              <span className="text-[9px] text-white/40 uppercase tracking-widest block">TECHNICAL DEEP WORK</span>
              <span className="text-2xl font-black text-emerald-400">{weeklyReviewData.technicalHours} Hours</span>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 space-y-1">
              <span className="text-[9px] text-white/40 uppercase tracking-widest block">GYM CONSISTENCY</span>
              <span className="text-2xl font-black text-orange-400">{weeklyReviewData.gymConsistencyPercent}% (100% Locked)</span>
            </div>
          </div>

          {/* What went well & What was ignored */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>WHAT WENT WELL THIS WEEK</span>
              </span>
              <ul className="space-y-1.5 text-xs text-white/80">
                {weeklyReviewData.whatWentWell.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">&check;</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-rose-950/20 border border-rose-500/30 space-y-2">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>WHAT WAS MISSED / IGNORED</span>
              </span>
              <ul className="space-y-1.5 text-xs text-white/80">
                {weeklyReviewData.whatWasIgnored.map((ig, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">&times;</span>
                    <span>{ig}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Week Roadmap */}
          <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 space-y-2">
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WHAT SHOULD CHANGE NEXT WEEK</span>
            </span>
            <ul className="space-y-1.5 text-xs text-white/90">
              {weeklyReviewData.nextWeekPlan.map((p, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">&rarr;</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};
