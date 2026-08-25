import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  TrendingUp,
  AlertCircle,
  Trash2,
  Edit3,
  ChevronRight,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { MasterGoal, GoalMilestone, PriorityLevel } from '../../types';
import { GrowthEngine } from '../../lib/growthEngine';

interface MasterGoalsSectionProps {
  goals: MasterGoal[];
  onSaveGoal: (goal: MasterGoal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const MasterGoalsSection: React.FC<MasterGoalsSectionProps> = ({
  goals,
  onSaveGoal,
  onDeleteGoal,
}) => {
  const [nlInput, setNlInput] = useState<string>('');
  const [isProcessingNl, setIsProcessingNl] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<MasterGoal | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Suggested prompt pills
  const samplePrompts = [
    'I want to become very strong technically.',
    'I want to learn Linux properly.',
    'I want to improve my communication.',
    'I want to build one website every week.',
    'I want to learn a new skill every week.',
  ];

  const handleCreateFromPrompt = (promptText: string) => {
    if (!promptText.trim()) return;
    setIsProcessingNl(true);
    setTimeout(() => {
      const newGoal = GrowthEngine.parseNaturalLanguageGoal(promptText);
      onSaveGoal(newGoal);
      setNlInput('');
      setIsProcessingNl(false);
      setSelectedGoal(newGoal);
    }, 400);
  };

  const handleToggleMilestone = (goal: MasterGoal, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map(m => {
      if (m.id === milestoneId) {
        const isDone = !m.completed;
        return {
          ...m,
          completed: isDone,
          completedDate: isDone ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return m;
    });

    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const progress = Math.round((completedCount / (updatedMilestones.length || 1)) * 100);

    const updatedGoal: MasterGoal = {
      ...goal,
      milestones: updatedMilestones,
      progress,
      lastUpdated: new Date().toISOString(),
    };

    onSaveGoal(updatedGoal);
    if (selectedGoal?.id === goal.id) {
      setSelectedGoal(updatedGoal);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Natural Language Goal Creator */}
      <div className="p-5 md:p-6 bg-[#0C1214] border border-cyan-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-cyan-400" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>SOUL AI NATURAL LANGUAGE GOAL ENGINE</span>
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
              AUTO-MILESTONE ORCHESTRATION
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight">
            Tell SOUL your ambitious goal in natural language
          </h3>

          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFromPrompt(nlInput)}
              placeholder="e.g. 'I want to become very strong technically' or 'I want to master Linux'..."
              className="flex-1 bg-black/60 border border-white/20 p-3.5 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 transition"
            />
            <button
              onClick={() => handleCreateFromPrompt(nlInput)}
              disabled={isProcessingNl || !nlInput.trim()}
              className="px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-black font-black text-xs font-mono uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isProcessingNl ? (
                <span>SYNTHESIZING...</span>
              ) : (
                <>
                  <span>CREATE TARGET</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Prompts */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
              OR CHOOSE A POPULAR TARGET PROMPT:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCreateFromPrompt(prompt)}
                  className="text-[11px] font-mono px-3 py-1.5 bg-white/5 hover:bg-cyan-950/40 hover:text-cyan-400 hover:border-cyan-400/40 text-white/70 border border-white/10 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>&ldquo;{prompt}&rdquo;</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Master Goals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>MY ACTIVE MASTER TARGETS ({goals.length})</span>
          </h4>
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
            AUTOMATICALLY FITTED INTO AVAILABLE TIME
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const isSelected = selectedGoal?.id === goal.id;
            return (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(isSelected ? null : goal)}
                className={`p-5 bg-[#0C1214] border transition cursor-pointer relative group ${
                  isSelected ? 'border-cyan-400 ring-1 ring-cyan-400/50' : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Category & Priority Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-white/10 text-cyan-300 border border-white/10">
                      {goal.category}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest ${
                      goal.priority === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteGoal(goal.id);
                    }}
                    className="text-white/20 hover:text-rose-400 transition p-1"
                    title="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title & Raw Prompt */}
                <h5 className="text-base font-display font-black text-white uppercase tracking-tight group-hover:text-cyan-300 transition">
                  {goal.title}
                </h5>
                <p className="text-xs font-mono text-white/60 line-clamp-2 mt-1">
                  &ldquo;{goal.reason}&rdquo;
                </p>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white/40 uppercase tracking-widest">ROADMAP PROGRESS</span>
                    <span className="text-cyan-400 font-bold">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Meta details footer */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>~{goal.estimatedHoursTotal}h Total</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-orange-400" />
                    <span>Target: {goal.deadline}</span>
                  </span>
                  <span className="text-cyan-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                    <span>DETAILS</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Deep-Dive Milestone Breakdown Modal / View for Selected Goal */}
      {selectedGoal && (
        <div className="p-5 md:p-6 bg-[#080C0D] border-2 border-cyan-400/60 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-mono uppercase font-bold tracking-widest">
                <Target className="w-3.5 h-3.5" />
                <span>ACTIVE TARGET ROADMAP BREAKDOWN</span>
              </div>
              <h4 className="text-xl font-display font-black text-white uppercase mt-0.5">
                {selectedGoal.title}
              </h4>
              <p className="text-xs font-mono text-white/70 mt-1">
                {selectedGoal.reason}
              </p>
            </div>

            <button
              onClick={() => setSelectedGoal(null)}
              className="text-xs font-mono text-white/40 hover:text-white px-3 py-1 bg-white/5 border border-white/10 uppercase cursor-pointer"
            >
              CLOSE
            </button>
          </div>

          {/* Weekly Targets & Daily Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">
                ⚡ WEEKLY TARGETS
              </span>
              <ul className="space-y-1.5 text-xs font-mono text-white/80">
                {selectedGoal.weeklyTargetsSummary.map((wt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{wt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold block">
                🔄 DAILY ACTIONS (AUTOMATICALLY SCHEDULED)
              </span>
              <ul className="space-y-1.5 text-xs font-mono text-white/80">
                {selectedGoal.dailyActions.map((da, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{da}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Milestones Checklist */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>PROGRESSIVE MILESTONES (TAP TO MARK COMPLETED)</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                {selectedGoal.milestones.filter(m => m.completed).length} / {selectedGoal.milestones.length} COMPLETED
              </span>
            </div>

            <div className="space-y-2">
              {selectedGoal.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  onClick={() => handleToggleMilestone(selectedGoal, milestone.id)}
                  className={`p-3.5 border transition cursor-pointer flex items-start gap-3 select-none ${
                    milestone.completed
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                      : 'bg-white/5 border-white/10 hover:border-white/30 text-white/70'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {milestone.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-white/30" />
                    )}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold ${milestone.completed ? 'line-through text-white/50' : 'text-white'}`}>
                        {milestone.title}
                      </span>
                      <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider bg-cyan-950/40 px-1.5 py-0.5 border border-cyan-500/20">
                        Week {milestone.targetWeek} Target
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-white/50">
                      {milestone.description}
                    </p>
                    {milestone.completedDate && (
                      <div className="text-[9px] font-mono text-emerald-400 pt-1">
                        ✓ Completed on {milestone.completedDate}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
