import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  X, 
  Check, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Zap, 
  Layers 
} from 'lucide-react';
import { AcademicTask, PriorityLevel, Subject } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onAddTasks: (tasks: AcademicTask[]) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onAddTasks,
}) => {
  const [tabMode, setTabMode] = useState<'natural' | 'manual'>('natural');
  const [naturalText, setNaturalText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<AcademicTask[] | null>(null);

  // Manual Form State
  const [subjectCode, setSubjectCode] = useState('OSY');
  const [taskType, setTaskType] = useState<AcademicTask['type']>('assignment');
  const [title, setTitle] = useState('Assignment');
  const [expNumber, setExpNumber] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [estMinutes, setEstMinutes] = useState(45);
  const [description, setDescription] = useState('');

  const handleTypeChange = (type: AcademicTask['type']) => {
    setTaskType(type);
    if (type === 'manual') {
      setTitle(`${subjectCode} Manual`);
    } else if (type === 'assignment') {
      setTitle('Assignment');
    }
  };

  const handleSubjectChange = (code: string) => {
    setSubjectCode(code);
    if (taskType === 'manual') {
      setTitle(`${code} Manual`);
    } else if (taskType === 'assignment') {
      setTitle('Assignment');
    }
  };

  if (!isOpen) return null;

  const handleParseNaturalLanguage = async () => {
    if (!naturalText.trim()) return;
    setIsParsing(true);

    try {
      const res = await fetch('/api/soul-ai/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textPrompt: naturalText }),
      });

      const data = await res.json();
      if (data.tasks && data.tasks.length > 0) {
        const fullTasks: AcademicTask[] = data.tasks.map((t: any, idx: number) => ({
          id: `task-nl-${Date.now()}-${idx}`,
          title: t.title || naturalText,
          subjectCode: t.subjectCode || 'CLC',
          type: t.type || 'study_session',
          unitNumber: t.unitNumber,
          experimentNumber: t.experimentNumber,
          deadline: t.deadline || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          priority: t.priority || 'high',
          status: 'not_started',
          progress: 0,
          estimatedMinutes: t.estimatedMinutes || 45,
          actualMinutesSpent: 0,
          description: t.description || `Parsed from: "${naturalText}"`,
          createdAt: new Date().toISOString().split('T')[0],
        }));
        setParsedPreview(fullTasks);
      }
    } catch (err) {
      console.error('Failed to parse:', err);
      // Fallback
      setParsedPreview([
        {
          id: `task-nl-${Date.now()}`,
          title: naturalText,
          subjectCode: 'CLC',
          type: 'study_session',
          deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          priority: 'high',
          status: 'not_started',
          progress: 0,
          estimatedMinutes: 45,
          actualMinutesSpent: 0,
          description: naturalText,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmParsed = () => {
    if (parsedPreview && parsedPreview.length > 0) {
      onAddTasks(parsedPreview);
      setParsedPreview(null);
      setNaturalText('');
      onClose();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: AcademicTask = {
      id: `task-m-${Date.now()}`,
      title: title.trim(),
      subjectCode,
      type: taskType,
      experimentNumber: expNumber.trim() || undefined,
      deadline: deadline || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      priority,
      status: 'not_started',
      progress: 0,
      estimatedMinutes: estMinutes,
      actualMinutesSpent: 0,
      description: description.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    onAddTasks([newTask]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#0C1214] p-6 md:p-8 border border-white/20 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/5 border border-cyan-400/30 text-cyan-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">QUICK ADD WORK</h3>
              <p className="text-xs font-mono text-white/50 uppercase">NATURAL LANGUAGE OR MANUAL ENTRY</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-white/5 border border-white/10 text-xs font-mono">
          <button
            onClick={() => setTabMode('natural')}
            className={`flex-1 py-2.5 transition cursor-pointer flex items-center justify-center gap-2 uppercase font-black tracking-wider ${
              tabMode === 'natural' ? 'bg-cyan-400 text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI NATURAL LANGUAGE</span>
          </button>
          <button
            onClick={() => setTabMode('manual')}
            className={`flex-1 py-2.5 transition cursor-pointer flex items-center justify-center gap-2 uppercase font-black tracking-wider ${
              tabMode === 'manual' ? 'bg-cyan-400 text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>MANUAL FORM</span>
          </button>
        </div>

        {/* 1. NATURAL LANGUAGE MODE */}
        {tabMode === 'natural' && (
          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-white/70 block mb-1.5 font-bold uppercase tracking-wider">
                TYPE WHAT YOU NEED TO COMPLETE IN PLAIN ENGLISH:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 'Complete CLC unit 3 before Friday' or 'I need to complete STE unit 3, CLC unit 2 and my OSY manual this week'"
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 text-sm font-sans"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/40 uppercase">
                SOUL AI WILL PARSE SUBJECT, DEADLINE & UNIT
              </span>
              <button
                onClick={handleParseNaturalLanguage}
                disabled={!naturalText.trim() || isParsing}
                className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase tracking-wider transition disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>{isParsing ? 'PARSING...' : 'ANALYZE & PARSE'}</span>
              </button>
            </div>

            {/* Parsed Preview Card */}
            {parsedPreview && (
              <div className="p-5 bg-white/5 border border-cyan-400/40 space-y-4">
                <div className="font-black text-cyan-400 flex items-center gap-2 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>PARSED {parsedPreview.length} TASK(S) READY:</span>
                </div>
                <div className="space-y-2">
                  {parsedPreview.map((pt, i) => (
                    <div key={i} className="p-4 bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-cyan-400 font-black">
                        <span>{pt.subjectCode} • {pt.type.toUpperCase()}</span>
                        <span>⏱️ {pt.estimatedMinutes}M</span>
                      </div>
                      <div className="text-white font-bold text-sm uppercase font-display">{pt.title}</div>
                      <div className="text-white/40 text-[10px] uppercase">
                        DEADLINE: {pt.deadline} • PRIORITY: {pt.priority}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleConfirmParsed}
                  className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  ✓ CONFIRM & ADD TO SYSTEM
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. MANUAL FORM MODE */}
        {tabMode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 block mb-1 uppercase font-bold">Subject</label>
                <select
                  value={subjectCode}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 uppercase font-mono"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.code} className="bg-[#0C1214]">{s.code} ({s.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white/50 block mb-1 uppercase font-bold">Work Type</label>
                <select
                  value={taskType}
                  onChange={(e) => handleTypeChange(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 uppercase font-mono"
                >
                  <option value="manual" className="bg-[#0C1214]">Practical Manual</option>
                  <option value="assignment" className="bg-[#0C1214]">Assignment / Homework</option>
                  <option value="project" className="bg-[#0C1214]">Project</option>
                  <option value="study_session" className="bg-[#0C1214]">Study Session</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-white/50 block mb-1 uppercase font-bold">Task Title</label>
              <input
                type="text"
                required
                placeholder="e.g. OSY Manual Experiment 4: Round Robin Scheduling"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-white/50 block mb-1 uppercase font-bold">Exp No.</label>
                <input
                  type="text"
                  placeholder="Exp 4"
                  value={expNumber}
                  onChange={(e) => setExpNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1 uppercase font-bold">Deadline Date</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1 uppercase font-bold">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono uppercase"
                >
                  <option value="critical" className="bg-[#0C1214] text-rose-400">Critical</option>
                  <option value="high" className="bg-[#0C1214] text-orange-400">High</option>
                  <option value="medium" className="bg-[#0C1214]">Medium</option>
                  <option value="low" className="bg-[#0C1214]">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-white/50 block mb-1 uppercase font-bold">Description</label>
              <textarea
                rows={2}
                placeholder="Optional notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 font-mono uppercase tracking-wider"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black font-mono uppercase tracking-wider cursor-pointer"
              >
                ADD TASK
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
