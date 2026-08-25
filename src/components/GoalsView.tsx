import React, { useState } from 'react';
import {
  Target,
  Flame,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  Award,
  Terminal,
  Palette,
  Compass,
  MessageSquare,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import {
  ActivityHistoryItem,
  HabitGoal,
  Subject,
  AcademicTask,
  MasterGoal,
  WeeklyTarget,
  DailyRoutineConfig,
  TechnicalTopic,
  WeeklyProject,
  SkillOfTheWeek,
  LearningGame,
  CommunicationActivity,
  ConfidenceChallenge,
  DailyReviewEntry,
  SoulRoastSettings,
} from '../types';
import { MasterGoalsSection } from './growth/MasterGoalsSection';
import { WeeklyTargetsSection } from './growth/WeeklyTargetsSection';
import { TechnicalBeastSection } from './growth/TechnicalBeastSection';
import { WeeklyProjectsSection } from './growth/WeeklyProjectsSection';
import { SkillOfTheWeekSection } from './growth/SkillOfTheWeekSection';
import { CommunicationModeSection } from './growth/CommunicationModeSection';
import { DailyKnowledgeSection } from './growth/DailyKnowledgeSection';
import { RoutineAndReviewsSection } from './growth/RoutineAndReviewsSection';

export type GrowthSubTab =
  | 'targets'
  | 'weekly_planner'
  | 'technical_beast'
  | 'projects'
  | 'skill_of_week'
  | 'communication'
  | 'knowledge'
  | 'routine_reviews';

interface GoalsViewProps {
  habits: HabitGoal[];
  history: ActivityHistoryItem[];
  subjects: Subject[];
  tasks: AcademicTask[];
  masterGoals: MasterGoal[];
  weeklyTargets: WeeklyTarget[];
  dailyRoutine: DailyRoutineConfig;
  technicalTopics: TechnicalTopic[];
  weeklyProjects: WeeklyProject[];
  skillOfTheWeek: SkillOfTheWeek;
  learningGames: LearningGame[];
  communicationActivities: CommunicationActivity[];
  confidenceChallenges: ConfidenceChallenge[];
  dailyReviews: DailyReviewEntry[];
  roastSettings: SoulRoastSettings;
  onUpdateHabits: (habits: HabitGoal[]) => void;
  onSaveMasterGoal: (goal: MasterGoal) => void;
  onDeleteMasterGoal: (goalId: string) => void;
  onSaveWeeklyTargets: (targets: WeeklyTarget[]) => void;
  onUpdateWeeklyTargetProgress: (id: string, delta: number) => void;
  onSaveDailyRoutine: (routine: DailyRoutineConfig) => void;
  onUpdateTechnicalTopicStatus: (id: string, status: TechnicalTopic['status'], userExplanation?: string) => void;
  onSaveWeeklyProjects: (projects: WeeklyProject[]) => void;
  onToggleProjectStep: (projectId: string, stepId: string) => void;
  onSaveSkillOfTheWeek: (skill: SkillOfTheWeek) => void;
  onSaveLearningGames: (games: LearningGame[]) => void;
  onLogCommunicationActivity: (activityId: string) => void;
  onToggleConfidenceChallenge: (challengeId: string) => void;
  onSaveDailyReview: (entry: DailyReviewEntry) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  habits,
  history,
  subjects,
  tasks,
  masterGoals,
  weeklyTargets,
  dailyRoutine,
  technicalTopics,
  weeklyProjects,
  skillOfTheWeek,
  learningGames,
  communicationActivities,
  confidenceChallenges,
  dailyReviews,
  roastSettings,
  onUpdateHabits,
  onSaveMasterGoal,
  onDeleteMasterGoal,
  onSaveWeeklyTargets,
  onUpdateWeeklyTargetProgress,
  onSaveDailyRoutine,
  onUpdateTechnicalTopicStatus,
  onSaveWeeklyProjects,
  onToggleProjectStep,
  onSaveSkillOfTheWeek,
  onSaveLearningGames,
  onLogCommunicationActivity,
  onToggleConfidenceChallenge,
  onSaveDailyReview,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<GrowthSubTab>('targets');

  // Subtabs configuration
  const subtabs: { id: GrowthSubTab; label: string; icon: any; badge?: string }[] = [
    { id: 'targets', label: '01 / MY TARGETS', icon: Target },
    { id: 'weekly_planner', label: '02 / YOUR WEEK', icon: Calendar },
    { id: 'technical_beast', label: '03 / TECHNICAL BEAST', icon: Terminal, badge: 'LINUX' },
    { id: 'projects', label: '04 / BUILD EVERY WEEK', icon: Palette, badge: 'SHIP' },
    { id: 'skill_of_week', label: '05 / SKILL OF WEEK', icon: Compass },
    { id: 'communication', label: '06 / COMMUNICATION', icon: MessageSquare },
    { id: 'knowledge', label: '07 / DAILY BYTES', icon: Rocket, badge: 'SPACE' },
    { id: 'routine_reviews', label: '08 / ROUTINE & REVIEWS', icon: Clock },
  ];

  return (
    <div className="space-y-6 pb-16">

      {/* Top Growth Command Banner */}
      <section className="relative overflow-hidden p-6 md:p-8 bg-[#0C1214] border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 bottom-0 text-8xl md:text-9xl font-black tracking-tighter leading-none text-cyan-400/[0.03] select-none pointer-events-none uppercase font-display">
          GROWTH
        </div>

        <div className="relative z-10 space-y-2">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>05 / PERSONAL GROWTH &middot; SKILLS &middot; GOALS</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tight">
            BECOME UNSTOPPABLE
          </h2>
          <p className="text-xs font-mono text-white/60 uppercase tracking-wider max-w-xl">
            TECHNICALLY STRONG &middot; DISCIPLINED &middot; CONFIDENT &middot; WELL-ROUNDED.
          </p>
        </div>

        {/* Total Target Dashboard Metrics */}
        <div className="relative z-10 flex items-center gap-4 p-4 bg-white/5 border border-white/10 shrink-0 font-mono">
          <TrendingUp className="w-8 h-8 text-cyan-400" />
          <div>
            <div className="text-2xl font-black text-white">
              {masterGoals.length} TARGETS
            </div>
            <div className="text-[9px] text-cyan-400 uppercase tracking-widest font-bold">
              {weeklyTargets.length} ACTIVE WEEKLY FOCUSES
            </div>
          </div>
        </div>
      </section>

      {/* Growth Subtabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/10 max-w-full">
        {subtabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-cyan-400 text-black border-cyan-400 font-black shadow-lg shadow-cyan-500/20'
                  : 'bg-[#0C1214] text-white/70 border-white/10 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[8px] font-bold px-1.5 py-0.2 uppercase border ${
                  isSelected ? 'bg-black text-cyan-400 border-black' : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Render Active Growth Section */}
      {activeSubTab === 'targets' && (
        <MasterGoalsSection
          goals={masterGoals}
          onSaveGoal={onSaveMasterGoal}
          onDeleteGoal={onDeleteMasterGoal}
        />
      )}

      {activeSubTab === 'weekly_planner' && (
        <WeeklyTargetsSection
          targets={weeklyTargets}
          onSaveTargets={onSaveWeeklyTargets}
          onUpdateTargetProgress={onUpdateWeeklyTargetProgress}
        />
      )}

      {activeSubTab === 'technical_beast' && (
        <TechnicalBeastSection
          topics={technicalTopics}
          onUpdateTopicStatus={onUpdateTechnicalTopicStatus}
        />
      )}

      {activeSubTab === 'projects' && (
        <WeeklyProjectsSection
          projects={weeklyProjects}
          onSaveProjects={onSaveWeeklyProjects}
          onToggleProjectStep={onToggleProjectStep}
        />
      )}

      {activeSubTab === 'skill_of_week' && (
        <SkillOfTheWeekSection
          skill={skillOfTheWeek}
          games={learningGames}
          onSaveSkill={onSaveSkillOfTheWeek}
          onSaveGames={onSaveLearningGames}
        />
      )}

      {activeSubTab === 'communication' && (
        <CommunicationModeSection
          activities={communicationActivities}
          challenges={confidenceChallenges}
          onLogActivity={onLogCommunicationActivity}
          onToggleChallenge={onToggleConfidenceChallenge}
        />
      )}

      {activeSubTab === 'knowledge' && (
        <DailyKnowledgeSection />
      )}

      {activeSubTab === 'routine_reviews' && (
        <RoutineAndReviewsSection
          routine={dailyRoutine}
          dailyReviews={dailyReviews}
          weeklyTargets={weeklyTargets}
          roastSettings={roastSettings}
          onSaveRoutine={onSaveDailyRoutine}
          onSaveDailyReview={onSaveDailyReview}
        />
      )}

    </div>
  );
};
