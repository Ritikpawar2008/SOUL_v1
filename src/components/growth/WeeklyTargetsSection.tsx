import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  TrendingUp,
  Sliders,
  ShieldCheck,
  BookOpen,
  Terminal,
  MessageSquare,
  Palette,
  Compass,
  Film,
  ArrowRight,
  Info,
} from 'lucide-react';
import { WeeklyTarget, WeeklyTargetCategory } from '../../types';
import { GrowthEngine } from '../../lib/growthEngine';

interface WeeklyTargetsSectionProps {
  targets: WeeklyTarget[];
  onSaveTargets: (targets: WeeklyTarget[]) => void;
  onUpdateTargetProgress: (id: string, delta: number) => void;
}

export const WeeklyTargetsSection: React.FC<WeeklyTargetsSectionProps> = ({
  targets,
  onSaveTargets,
  onUpdateTargetProgress,
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState<WeeklyTargetCategory | 'all'>('all');
  const [nlPlannerInput, setNlPlannerInput] = useState<string>('');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Target Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<WeeklyTargetCategory>('academic');
  const [newCount, setNewCount] = useState<number>(2);
  const [newUnit, setNewUnit] = useState<string>('Units');

  const categories: { id: WeeklyTargetCategory | 'all'; label: string; icon: any; color: string }[] = [
    { id: 'all', label: 'ALL TARGETS', icon: Sliders, color: 'text-cyan-400' },
    { id: 'academic', label: 'ACADEMIC', icon: BookOpen, color: 'text-cyan-400' },
    { id: 'technical', label: 'TECHNICAL', icon: Terminal, color: 'text-emerald-400' },
    { id: 'personal', label: 'COMMUNICATION', icon: MessageSquare, color: 'text-amber-400' },
    { id: 'creative', label: 'PROJECTS & BUILD', icon: Palette, color: 'text-purple-400' },
    { id: 'exploration', label: 'NEW SKILLS', icon: Compass, color: 'text-blue-400' },
    { id: 'entertainment', label: 'PROTECTED LEISURE', icon: Film, color: 'text-rose-400' },
  ];

  const filteredTargets = activeCategoryTab === 'all' 
    ? targets 
    : targets.filter(t => t.category === activeCategoryTab);

  const totalTargetCount = targets.reduce((acc, t) => acc + t.targetCount, 0);
  const totalCurrentCount = targets.reduce((acc, t) => acc + Math.min(t.currentCount, t.targetCount), 0);
  const weeklyCompletionRate = totalTargetCount > 0 ? Math.round((totalCurrentCount / totalTargetCount) * 100) : 0;

  const handleSynthesizeWeek = () => {
    if (!nlPlannerInput.trim()) return;
    setIsSynthesizing(true);
    setTimeout(() => {
      const updated = GrowthEngine.parseNaturalLanguageWeeklyPlan(nlPlannerInput, targets);
      onSaveTargets(updated);
      setNlPlannerInput('');
      setIsSynthesizing(false);
    }, 400);
  };

  const handleAddNewTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newTarget: WeeklyTarget = {
      id: `wt-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      targetCount: Math.max(1, newCount),
      currentCount: 0,
      unit: newUnit.trim() || 'Sessions',
      weekIdentifier: 'current',
    };
    onSaveTargets([...targets, newTarget]);
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* 1. Flexible Logic Notice Card */}
      <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-white/80 space-y-1">
          <span className="font-bold text-cyan-300 uppercase tracking-wider block">
            FLEXIBLE WEEKLY TARGET PROTOCOL (NO RIGID DAYS)
          </span>
          <p className="text-white/60">
            Weekly targets (e.g. <em>&ldquo;CLC &rarr; 2 Units this week&rdquo;</em>, <em>&ldquo;Linux &rarr; 3 sessions&rdquo;</em>) are flexible milestones. SOUL does <strong>not</strong> force rigid daily appointments—instead, it dynamically recommends these targets whenever free time slots open up around your college and gym routine.
          </p>
        </div>
      </div>

      {/* 2. Top Weekly Scoreboard Banner */}
      <div className="p-5 md:p-6 bg-[#0C1214] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI WEEKLY PLANNER &middot; YOUR WEEK</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight">
            THIS WEEK&apos;S PROGRESSION
          </h3>
          <p className="text-xs font-mono text-white/50">
            Target vs. Actual completion based on actual logged activities.
          </p>
        </div>

        {/* Progress Metric Wheel */}
        <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 shrink-0">
          <TrendingUp className="w-8 h-8 text-cyan-400" />
          <div>
            <div className="text-2xl font-mono font-black text-white">
              {totalCurrentCount} / {totalTargetCount} <span className="text-xs text-white/40">ITEMS</span>
            </div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              {weeklyCompletionRate}% WEEKLY TARGET ACHIEVED
            </div>
          </div>
        </div>
      </div>

      {/* 3. Natural Language Weekly Planner ("YOUR WEEK") */}
      <div className="p-5 bg-[#0C1214] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>NATURAL LANGUAGE WEEKLY TARGET PLANNER</span>
          </span>
          <span className="text-[10px] font-mono text-white/40">
            AUTO-ADJUSTS TARGET METRICS
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={nlPlannerInput}
            onChange={(e) => setNlPlannerInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSynthesizeWeek()}
            placeholder="e.g. 'This week I want to complete 2 CLC units, learn Linux 3 times, build a website, practice communication 4 times and learn one skill'..."
            className="flex-1 bg-black/60 border border-white/20 p-3 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 transition"
          />
          <button
            onClick={handleSynthesizeWeek}
            disabled={isSynthesizing || !nlPlannerInput.trim()}
            className="px-5 py-3 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-black font-black text-xs font-mono uppercase tracking-wider transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
          >
            {isSynthesizing ? 'PLANNING...' : 'APPLY TO YOUR WEEK'}
          </button>
        </div>
      </div>

      {/* 4. Category Filter Tabs & Add Custom Target Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategoryTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryTab(cat.id)}
                className={`px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-cyan-400 text-black border-cyan-400'
                    : 'bg-[#0C1214] text-white/60 border-white/10 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/20 transition cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>ADD TARGET</span>
        </button>
      </div>

      {/* 5. Weekly Targets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTargets.map((target) => {
          const isComplete = target.currentCount >= target.targetCount;
          const pct = Math.min(100, Math.round((target.currentCount / (target.targetCount || 1)) * 100));

          return (
            <div
              key={target.id}
              className={`p-4 bg-[#0C1214] border transition flex flex-col justify-between ${
                isComplete ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 border border-white/10 text-cyan-400">
                    {target.category}
                  </span>
                  {isComplete ? (
                    <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>COMPLETED</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-white/40">
                      {target.targetCount - target.currentCount} {target.unit} REMAINING
                    </span>
                  )}
                </div>

                <h5 className="text-sm font-display font-black text-white uppercase tracking-tight">
                  {target.title}
                </h5>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                    <span>PROGRESS</span>
                    <span className="font-bold text-white">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isComplete ? 'bg-emerald-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Counter Controls */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="text-base font-mono font-black text-white">
                  {target.currentCount} <span className="text-xs text-white/40 font-normal">/ {target.targetCount} {target.unit}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateTargetProgress(target.id, -1)}
                    disabled={target.currentCount <= 0}
                    className="w-7 h-7 bg-white/5 hover:bg-white/15 disabled:opacity-30 border border-white/10 text-white flex items-center justify-center cursor-pointer transition"
                    title="Decrease count"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onUpdateTargetProgress(target.id, 1)}
                    className="w-7 h-7 bg-cyan-400/20 hover:bg-cyan-400 text-cyan-400 hover:text-black border border-cyan-400/40 flex items-center justify-center cursor-pointer transition font-bold"
                    title="Log 1 completed session"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. Add Custom Target Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C1214] border border-cyan-400 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 font-mono">
            <h4 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>ADD NEW WEEKLY TARGET</span>
            </h4>

            <form onSubmit={handleAddNewTarget} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-white/60 uppercase text-[10px] tracking-wider block">Target Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Linux Kernel Concepts, Figma Basics, Chess..."
                  className="w-full bg-black/60 border border-white/20 p-2.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-[10px] tracking-wider block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as WeeklyTargetCategory)}
                    className="w-full bg-black/60 border border-white/20 p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="academic">Academic</option>
                    <option value="technical">Technical</option>
                    <option value="personal">Communication</option>
                    <option value="creative">Projects / Build</option>
                    <option value="exploration">New Skills</option>
                    <option value="entertainment">Entertainment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-[10px] tracking-wider block">Target Count</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={newCount}
                    onChange={(e) => setNewCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-black/60 border border-white/20 p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  >
                  </input>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-white/60 uppercase text-[10px] tracking-wider block">Unit Label</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="e.g. Units, Sessions, Websites, Skills..."
                  className="w-full bg-black/60 border border-white/20 p-2.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white uppercase tracking-wider text-[11px] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase tracking-wider text-[11px] cursor-pointer"
                >
                  SAVE TARGET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
