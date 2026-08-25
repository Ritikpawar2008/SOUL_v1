import React, { useState } from 'react';
import {
  Compass,
  Gamepad2,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Trophy,
  Flame,
  Plus,
  Minus,
  Film,
  Tv,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { SkillOfTheWeek, LearningGame } from '../../types';

interface SkillOfTheWeekSectionProps {
  skill: SkillOfTheWeek;
  games: LearningGame[];
  onSaveSkill: (skill: SkillOfTheWeek) => void;
  onSaveGames: (games: LearningGame[]) => void;
}

export const SkillOfTheWeekSection: React.FC<SkillOfTheWeekSectionProps> = ({
  skill,
  games,
  onSaveSkill,
  onSaveGames,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'skill' | 'games'>('skill');
  const [isTestPassed, setIsTestPassed] = useState<boolean>(skill.completed);
  const [userNotes, setUserNotes] = useState<string>(skill.userNotes || '');

  const handleToggleSkillCompleted = () => {
    const nextCompleted = !skill.completed;
    setIsTestPassed(nextCompleted);
    onSaveSkill({
      ...skill,
      completed: nextCompleted,
      userNotes,
    });
  };

  const handleUpdateGameProgress = (gameId: string, delta: number) => {
    const updated = games.map(g => {
      if (g.id === gameId) {
        const nextCount = Math.max(0, g.completedSessionsThisWeek + delta);
        return { ...g, completedSessionsThisWeek: nextCount };
      }
      return g;
    });
    onSaveGames(updated);
  };

  return (
    <div className="space-y-6 font-mono text-xs">

      {/* 1. Toggle Tabs between Skill of the Week & Learning Games */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveSubTab('skill')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer border ${
            activeSubTab === 'skill'
              ? 'bg-cyan-400 text-black border-cyan-400'
              : 'bg-[#0C1214] text-white/60 border-white/10 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>SKILL OF THE WEEK</span>
        </button>

        <button
          onClick={() => setActiveSubTab('games')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer border ${
            activeSubTab === 'games'
              ? 'bg-cyan-400 text-black border-cyan-400'
              : 'bg-[#0C1214] text-white/60 border-white/10 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>LEARNING GAMES & ENTERTAINMENT</span>
        </button>
      </div>

      {/* 2. SUBTAB A: SKILL OF THE WEEK */}
      {activeSubTab === 'skill' && (
        <div className="space-y-5">
          {/* Main Card */}
          <div className="p-6 bg-[#0C1214] border border-cyan-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FEATURED SKILL &middot; {skill.weekIdentifier}</span>
              </span>
              <span className="px-2 py-0.5 text-[9px] bg-white/5 text-white/60 uppercase border border-white/10">
                {skill.category}
              </span>
            </div>

            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">
              {skill.title}
            </h3>

            {/* What it is & Why it matters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">
                  WHAT IT IS
                </span>
                <p className="text-white/80 leading-relaxed text-[11px]">
                  {skill.whatItIs}
                </p>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  WHY IT MATTERS TO AN ENGINEER
                </span>
                <p className="text-white/80 leading-relaxed text-[11px]">
                  {skill.whyItMatters}
                </p>
              </div>
            </div>

            {/* Curated Resources */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] text-white/40 uppercase tracking-widest block">
                LEARNING RESOURCES
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {skill.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-black/50 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-[9px] text-cyan-400 uppercase tracking-wider block">{res.type}</span>
                      <span className="text-xs font-bold text-white line-clamp-1">{res.title}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Practice Task & Mini Challenge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  SMALL PRACTICE TASK
                </span>
                <p className="text-white/80 text-[11px]">
                  {skill.practiceTask}
                </p>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                  MINI CHALLENGE
                </span>
                <p className="text-white/80 text-[11px]">
                  {skill.miniChallenge}
                </p>
              </div>
            </div>

            {/* Completion Test & Checkoff */}
            <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>COMPLETION TEST</span>
                </span>
                {skill.completed && (
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SKILL MASTERED</span>
                  </span>
                )}
              </div>

              <p className="text-white/90 text-xs">
                &ldquo;{skill.completionTest}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-white/40">
                  Prove competence by completing the mini challenge.
                </span>

                <button
                  onClick={handleToggleSkillCompleted}
                  className={`px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer flex items-center gap-1.5 transition ${
                    skill.completed
                      ? 'bg-emerald-400 text-black hover:bg-emerald-300'
                      : 'bg-cyan-400 text-black hover:bg-cyan-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{skill.completed ? 'COMPLETED ✓' : 'MARK COMPLETED'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBTAB B: LEARNING GAMES & PROTECTED ENTERTAINMENT */}
      {activeSubTab === 'games' && (
        <div className="space-y-5">
          {/* Concept Header */}
          <div className="p-4 bg-[#0C1214] border border-white/10 space-y-1">
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
              LEARNING GAMES VS. PURE ENTERTAINMENT
            </span>
            <p className="text-white/70 text-xs">
              SOUL distinguishes between pure relaxation (movies, music) and high-leverage games that sharpen strategy, typing speed, and systems thinking (Chess, Speed Typing, Coding Games). Both are protected in your weekly balance.
            </p>
          </div>

          {/* Learning Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {games.map((game) => {
              const isTargetMet = game.completedSessionsThisWeek >= game.targetSessionsPerWeek;
              return (
                <div
                  key={game.id}
                  className={`p-4 bg-[#0C1214] border transition flex flex-col justify-between space-y-3 ${
                    isTargetMet ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-white/10'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 border border-white/10 text-cyan-300">
                        {game.gameType.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] text-white/40 uppercase">
                        {game.targetSessionsPerWeek} SESSIONS / WK
                      </span>
                    </div>

                    <h4 className="text-sm font-display font-black text-white uppercase tracking-tight">
                      {game.title}
                    </h4>

                    <p className="text-[11px] text-white/60">
                      <strong>Skill Developed:</strong> {game.skillDeveloped}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="text-sm font-black text-white">
                      {game.completedSessionsThisWeek} / {game.targetSessionsPerWeek} <span className="text-xs text-white/40 font-normal">sessions</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateGameProgress(game.id, -1)}
                        disabled={game.completedSessionsThisWeek <= 0}
                        className="w-7 h-7 bg-white/5 hover:bg-white/15 disabled:opacity-30 border border-white/10 text-white flex items-center justify-center cursor-pointer transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleUpdateGameProgress(game.id, 1)}
                        className="w-7 h-7 bg-cyan-400/20 hover:bg-cyan-400 text-cyan-400 hover:text-black border border-cyan-400/40 flex items-center justify-center cursor-pointer transition font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
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
