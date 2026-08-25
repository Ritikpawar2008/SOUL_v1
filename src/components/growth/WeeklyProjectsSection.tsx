import React, { useState } from 'react';
import {
  Palette,
  Github,
  Globe,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Code2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { WeeklyProject, ProjectTaskStep } from '../../types';

interface WeeklyProjectsSectionProps {
  projects: WeeklyProject[];
  onSaveProjects: (projects: WeeklyProject[]) => void;
  onToggleProjectStep: (projectId: string, stepId: string) => void;
}

export const WeeklyProjectsSection: React.FC<WeeklyProjectsSectionProps> = ({
  projects,
  onSaveProjects,
  onToggleProjectStep,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Project Form State
  const [cadence, setCadence] = useState<'weekly' | 'biweekly'>('weekly');
  const [title, setTitle] = useState<string>('');
  const [idea, setIdea] = useState<string>('');
  const [problem, setProblem] = useState<string>('');
  const [techStackInput, setTechStackInput] = useState<string>('React, TypeScript, Tailwind CSS, Vite');
  const [deadline, setDeadline] = useState<string>('');

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0] || null;

  const defaultPhases: ProjectTaskStep['phase'][] = [
    'idea', 'planning', 'ui_ux', 'frontend', 'backend', 'database', 'ai_api', 'testing', 'deployment', 'docs'
  ];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !idea.trim()) return;

    const projectId = `proj-${Date.now()}`;
    const generatedSteps: ProjectTaskStep[] = defaultPhases.map((phase, idx) => ({
      id: `${projectId}-s${idx + 1}`,
      stepNumber: idx + 1,
      title: `${phase.toUpperCase().replace('_', ' ')}: Implement and verify milestone`,
      phase,
      completed: idx === 0, // mark idea complete
    }));

    const newProj: WeeklyProject = {
      id: projectId,
      cadence,
      title: title.trim(),
      idea: idea.trim(),
      problem: problem.trim() || 'Solved a manual friction point in daily development.',
      features: ['Core interactive interface', 'Responsive layout', 'State persistence'],
      techStack: techStackInput.split(',').map(s => s.trim()).filter(Boolean),
      steps: generatedSteps,
      progress: 10,
      deadline: deadline || new Date(Date.now() + (cadence === 'weekly' ? 7 : 14) * 86400000).toISOString().split('T')[0],
      status: 'in_progress',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSaveProjects([newProj, ...projects]);
    setSelectedProjectId(newProj.id);
    setTitle('');
    setIdea('');
    setProblem('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* 1. Header Banner */}
      <div className="p-5 md:p-6 bg-[#0C1214] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[10px] font-mono text-purple-400 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
            <Palette className="w-3.5 h-3.5" />
            <span>BUILD EVERY WEEK &middot; SHIP REAL SOFTWARE</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight">
            1 PRODUCT / WEBSITE EVERY 1&ndash;2 WEEKS
          </h3>
          <p className="text-xs font-mono text-white/50">
            Build real software with live URLs and public GitHub code repositories.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>NEW PROJECT SPRINT</span>
        </button>
      </div>

      {/* 2. Projects Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects.map((proj) => {
          const isSelected = selectedProject?.id === proj.id;
          const isDeployed = proj.status === 'deployed';
          const isPaused = proj.status === 'paused_for_exams';

          return (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`p-4 bg-[#0C1214] border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-purple-400 ring-1 ring-purple-400/50'
                  : 'border-white/10 hover:border-white/25'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 border border-white/10 text-purple-300">
                    {proj.cadence}
                  </span>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border ${
                    isDeployed
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : isPaused
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}>
                    {isPaused ? 'EXAM PAUSED' : proj.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-sm font-display font-black text-white uppercase tracking-tight line-clamp-1">
                  {proj.title}
                </h4>

                <p className="text-[11px] font-mono text-white/60 line-clamp-2">
                  {proj.idea}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-white/40">LIFECYCLE</span>
                  <span className="text-purple-400 font-bold">{proj.progress}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Deep-Dive Selected Project Detail Card */}
      {selectedProject && (
        <div className="p-5 md:p-6 bg-[#080C0D] border border-purple-500/30 space-y-6 font-mono">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-400 text-[10px] font-bold uppercase tracking-widest">
                <span>PROJECT SPRINT BLUEPRINT</span>
                <span>&middot;</span>
                <span className="text-white/40">{selectedProject.cadence} cadence</span>
              </div>
              <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                {selectedProject.title}
              </h3>
              <p className="text-xs text-white/70">
                {selectedProject.idea}
              </p>
            </div>

            {/* GitHub & Live Links */}
            <div className="flex items-center gap-2 shrink-0">
              {selectedProject.githubUrl && (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 flex items-center gap-1.5 transition"
                >
                  <Github className="w-3.5 h-3.5 text-purple-400" />
                  <span>GITHUB</span>
                </a>
              )}
              {selectedProject.liveUrl && (
                <a
                  href={selectedProject.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs border border-purple-500/30 flex items-center gap-1.5 transition"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>LIVE DEMO</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-white/40 uppercase tracking-widest block">TECH STACK</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedProject.techStack.map((tech, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 bg-white/5 text-purple-300 border border-white/10 font-bold">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* 10-Step AI Lifecycle Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span>10-STEP LIFECYCLE ROADMAP (TAP TO COMPLETE STEP)</span>
              </span>
              <span className="text-[10px] text-purple-400 font-bold">
                {selectedProject.steps.filter(s => s.completed).length} / {selectedProject.steps.length} PHASES DONE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedProject.steps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => onToggleProjectStep(selectedProject.id, step.id)}
                  className={`p-3 border transition cursor-pointer flex items-center gap-3 text-xs ${
                    step.completed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-white'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-white/60'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-white/30 shrink-0" />
                  )}

                  <div className="flex-1">
                    <span className="text-[9px] text-purple-400 uppercase tracking-widest font-bold block">
                      Phase {step.stepNumber}: {step.phase.toUpperCase()}
                    </span>
                    <span className={step.completed ? 'line-through text-white/50' : 'text-white'}>
                      {step.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learnings summary */}
          {selectedProject.learnings && (
            <div className="p-3.5 bg-white/5 border border-white/10 text-xs text-white/80 space-y-1">
              <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold block">
                WHAT I LEARNED FROM BUILDING THIS:
              </span>
              <p className="text-white/70 leading-relaxed">
                {selectedProject.learnings}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. Add New Project Sprint Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C1214] border border-purple-400 max-w-lg w-full p-6 space-y-4 font-mono">
            <h4 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>START NEW PROJECT SPRINT</span>
            </h4>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-[10px]">Cadence</label>
                  <select
                    value={cadence}
                    onChange={(e) => setCadence(e.target.value as 'weekly' | 'biweekly')}
                    className="w-full bg-black border border-white/20 p-2 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="weekly">1 Week Sprint</option>
                    <option value="biweekly">2 Week Sprint</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-[10px]">Target Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-black border border-white/20 p-2 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-white/60 uppercase text-[10px]">Project Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Prompt Tool, Linux Log Viewer, Student Task Extension..."
                  className="w-full bg-black border border-white/20 p-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 uppercase text-[10px]">Project Idea / Solution</label>
                <textarea
                  rows={2}
                  required
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="What does this product do and who is it for?..."
                  className="w-full bg-black border border-white/20 p-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 uppercase text-[10px]">Tech Stack (Comma-Separated)</label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="e.g. React, TypeScript, Tailwind, Node.js, Vercel"
                  className="w-full bg-black border border-white/20 p-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 uppercase text-[11px] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold uppercase text-[11px] cursor-pointer"
                >
                  INITIALIZE SPRINT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
