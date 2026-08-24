import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  Check, 
  Play, 
  RotateCcw, 
  Utensils, 
  BookOpen, 
  FileText, 
  RefreshCw, 
  Coffee, 
  Moon, 
  Zap,
  X,
  Flame,
  ArrowRight,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { AcademicTask, PostGymSlot, Subject, UserPreferences } from '../types';
import { formatTime12h, parseTimeToMinutes, minutesToTimeString } from '../lib/schedulingEngine';
import { generateEveningRoutineWithAi } from '../lib/eveningAiGenerator';

interface PostGymRoutineSectionProps {
  postGymRoutine: PostGymSlot[];
  preferences: UserPreferences;
  subjects: Subject[];
  tasks: AcademicTask[];
  onUpdateRoutine: (routine: PostGymSlot[]) => void;
  onStartStudySession?: (item: { subjectCode: string; unitNumber?: number; title: string; taskId?: string }) => void;
}

export const PostGymRoutineSection: React.FC<PostGymRoutineSectionProps> = ({
  postGymRoutine,
  preferences,
  subjects,
  tasks,
  onUpdateRoutine,
  onStartStudySession,
}) => {
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<PostGymSlot | null>(null);

  // Edit/Add Form state
  const [formStartTime, setFormStartTime] = useState('19:45');
  const [formEndTime, setFormEndTime] = useState('20:45');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formType, setFormType] = useState<PostGymSlot['type']>('manual');
  const [formSubjectCode, setFormSubjectCode] = useState('OSY');

  // AI Modal state
  const [aiStrategy, setAiStrategy] = useState<'balanced' | 'urgent_deadlines' | 'deep_study' | 'spaced_revision' | 'light_recovery'>('balanced');
  const [aiBedtime, setAiBedtime] = useState('23:30');
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // Open Edit Modal
  const handleOpenEdit = (slot: PostGymSlot) => {
    setEditingSlot(slot);
    setFormStartTime(slot.startTime);
    setFormEndTime(slot.endTime);
    setFormTitle(slot.title);
    setFormSubtitle(slot.subtitle || '');
    setFormType(slot.type);
    setFormSubjectCode(slot.subjectCode || 'OSY');
    setIsEditModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingSlot(null);
    // Find latest end time or default to 19:45
    const latestSlot = postGymRoutine[postGymRoutine.length - 1];
    const newStart = latestSlot ? latestSlot.endTime : '19:45';
    const newStartMins = parseTimeToMinutes(newStart);
    const newEnd = minutesToTimeString(newStartMins + 45);

    setFormStartTime(newStart);
    setFormEndTime(newEnd);
    setFormType('manual');
    setFormSubjectCode('OSY');
    setFormTitle('OSY Manual');
    setFormSubtitle('Operating Systems experiments and code');
    setIsEditModalOpen(true);
  };

  const handleTypeChange = (type: PostGymSlot['type']) => {
    setFormType(type);
    if (type === 'manual') {
      setFormTitle(`${formSubjectCode} Manual`);
    } else if (type === 'assignment') {
      setFormTitle('Assignment');
    } else if (type === 'meal') {
      setFormTitle('Dinner & Nutrition');
      setFormSubtitle('Post-workout protein meal and hydration');
    } else if (type === 'leisure') {
      setFormTitle('Micro-Break / Leisure');
      setFormSubtitle('Hydration and mental recharge');
    } else if (type === 'wind_down') {
      setFormTitle('Guilt-Free Leisure & Night Wind-Down');
      setFormSubtitle('Relaxing music and preparation for restful sleep');
    } else if (type === 'revision') {
      setFormTitle(`${formSubjectCode} Spaced Revision`);
    }
  };

  const handleSubjectChange = (code: string) => {
    setFormSubjectCode(code);
    if (formType === 'manual') {
      setFormTitle(`${code} Manual`);
    } else if (formType === 'revision') {
      setFormTitle(`${code} Spaced Revision`);
    }
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: PostGymSlot[];

    const newSlotData: PostGymSlot = {
      id: editingSlot ? editingSlot.id : `pg-slot-${Date.now()}`,
      startTime: formStartTime,
      endTime: formEndTime,
      title: formType === 'assignment' ? 'Assignment' : formType === 'manual' ? `${formSubjectCode} Manual` : formTitle,
      subtitle: formSubtitle,
      type: formType,
      subjectCode: formType === 'manual' || formType === 'assignment' || formType === 'study' || formType === 'revision' ? formSubjectCode : undefined,
      completed: editingSlot ? editingSlot.completed : false,
    };

    if (editingSlot) {
      updated = postGymRoutine.map(s => s.id === editingSlot.id ? newSlotData : s);
    } else {
      updated = [...postGymRoutine, newSlotData];
    }

    // Sort chronologically
    updated.sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
    onUpdateRoutine(updated);
    setIsEditModalOpen(false);
  };

  const handleDeleteSlot = (id: string) => {
    const updated = postGymRoutine.filter(s => s.id !== id);
    onUpdateRoutine(updated);
    setIsEditModalOpen(false);
  };

  const handleToggleCompleted = (id: string) => {
    const updated = postGymRoutine.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
    onUpdateRoutine(updated);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset post-gym evening routine back to default structure?')) {
      const defaultRoutine: PostGymSlot[] = [
        {
          id: 'pg-1',
          startTime: '19:00',
          endTime: '19:45',
          title: 'Dinner & Post-Workout Nutrition',
          subtitle: '30g Protein, hydration & mental reset after gym',
          type: 'meal',
          completed: false,
        },
        {
          id: 'pg-2',
          startTime: '19:45',
          endTime: '20:45',
          title: 'OSY Manual',
          subtitle: 'Operating Systems practicals & CPU scheduling implementation',
          type: 'manual',
          subjectCode: 'OSY',
          completed: false,
        },
        {
          id: 'pg-3',
          startTime: '20:45',
          endTime: '21:00',
          title: 'Micro-Break & Hydration',
          subtitle: 'Brisk walk, hydration & mental recharge',
          type: 'leisure',
          completed: false,
        },
        {
          id: 'pg-4',
          startTime: '21:00',
          endTime: '22:00',
          title: 'Assignment',
          subtitle: 'Cloud service models comparative study & numerical problems',
          type: 'assignment',
          subjectCode: 'CLC',
          completed: false,
        },
        {
          id: 'pg-5',
          startTime: '22:00',
          endTime: '22:45',
          title: 'STE / ENDS Spaced Revision',
          subtitle: 'Stage 1 active recall & key definitions revision',
          type: 'revision',
          subjectCode: 'STE',
          completed: false,
        },
        {
          id: 'pg-6',
          startTime: '22:45',
          endTime: '23:30',
          title: 'Guilt-Free Leisure & Night Wind-Down',
          subtitle: 'Lo-Fi music, digital scratchpad & preparation for sleep',
          type: 'wind_down',
          completed: false,
        },
      ];
      onUpdateRoutine(defaultRoutine);
    }
  };

  // Run AI Optimization
  const handleGenerateAiEvening = async () => {
    setIsAiGenerating(true);
    setAiFeedback(null);

    try {
      const result = await generateEveningRoutineWithAi({
        gymEndTime: preferences.gymEndTime || '19:00',
        bedtime: aiBedtime,
        strategy: aiStrategy,
        customPrompt: aiCustomPrompt,
        subjects,
        tasks,
        preferences,
      });

      if (result.slots && result.slots.length > 0) {
        onUpdateRoutine(result.slots);
        setAiFeedback(result.summary);
        setTimeout(() => {
          setIsAiModalOpen(false);
          setAiFeedback(null);
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const getTypeIcon = (type: PostGymSlot['type']) => {
    switch (type) {
      case 'meal': return <Utensils className="w-3.5 h-3.5 text-emerald-400" />;
      case 'manual': return <FileText className="w-3.5 h-3.5 text-cyan-400" />;
      case 'assignment': return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
      case 'revision': return <RefreshCw className="w-3.5 h-3.5 text-purple-400" />;
      case 'leisure': return <Coffee className="w-3.5 h-3.5 text-amber-400" />;
      case 'wind_down': return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      default: return <Clock className="w-3.5 h-3.5 text-white/60" />;
    }
  };

  const getTypeBadgeColor = (type: PostGymSlot['type']) => {
    switch (type) {
      case 'meal': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'manual': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'assignment': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'revision': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'leisure': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'wind_down': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default: return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  return (
    <section className="space-y-4">
      {/* Header with AI & Manual Edit Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
            <span className="w-2 h-2 bg-cyan-400"></span>
            <span>07:00 PM – 11:30 PM ROUTINE</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight mt-0.5 flex items-center gap-2.5">
            <span>POST-GYM EVENING PROTOCOL</span>
          </h3>
          <p className="text-xs font-mono text-white/50 mt-0.5">
            Fully customizable high-leverage study, nutrition, spaced recall & wind-down routine after gym.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-black font-mono text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>AI SUGGEST / OPTIMIZE</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold font-mono text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD SLOT</span>
          </button>

          <button
            onClick={handleResetToDefault}
            title="Reset to default routine"
            className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Routine Slots List */}
      <div className="space-y-2.5">
        {postGymRoutine.map((slot, index) => {
          const duration = parseTimeToMinutes(slot.endTime) - parseTimeToMinutes(slot.startTime);

          return (
            <div
              key={slot.id}
              className={`p-4 bg-[#0C1214] border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                slot.completed 
                  ? 'border-white/5 opacity-60 bg-white/[0.01]' 
                  : 'border-white/10 hover:border-cyan-400/40'
              }`}
            >
              {/* Left Info */}
              <div className="flex items-start sm:items-center gap-3.5">
                {/* Complete Toggle Checkbox */}
                <button
                  onClick={() => handleToggleCompleted(slot.id)}
                  className={`w-6 h-6 shrink-0 border flex items-center justify-center transition cursor-pointer mt-0.5 sm:mt-0 ${
                    slot.completed 
                      ? 'bg-cyan-400 border-cyan-400 text-black' 
                      : 'border-white/20 hover:border-cyan-400 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Time Window */}
                    <span className="text-xs font-mono font-bold text-white/90">
                      {formatTime12h(slot.startTime)} – {formatTime12h(slot.endTime)}
                    </span>

                    <span className="text-[10px] font-mono text-white/40">
                      ({duration > 0 ? duration : 45}m)
                    </span>

                    {/* Category Badge */}
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider border flex items-center gap-1 ${getTypeBadgeColor(slot.type)}`}>
                      {getTypeIcon(slot.type)}
                      <span>{slot.type}</span>
                    </span>

                    {/* Subject Chip */}
                    {slot.subjectCode && (
                      <span className="px-1.5 py-0.5 bg-white text-black font-black font-mono text-[9px] uppercase tracking-wider">
                        {slot.subjectCode}
                      </span>
                    )}
                  </div>

                  <h4 className={`text-sm sm:text-base font-display font-black uppercase tracking-tight ${
                    slot.completed ? 'text-white/40 line-through' : 'text-white'
                  }`}>
                    {slot.title}
                  </h4>

                  {slot.subtitle && (
                    <p className="text-xs font-mono text-white/50">
                      {slot.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Interactive Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {/* Start Focus Session if Study/Manual/Assignment */}
                {(slot.type === 'study' || slot.type === 'manual' || slot.type === 'assignment' || slot.type === 'revision') && onStartStudySession && !slot.completed && (
                  <button
                    onClick={() => onStartStudySession({
                      subjectCode: slot.subjectCode || 'OSY',
                      title: slot.title,
                      taskId: slot.taskId,
                    })}
                    className="px-3 py-1.5 bg-white text-black hover:bg-cyan-400 font-mono text-[11px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>FOCUS</span>
                  </button>
                )}

                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEdit(slot)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
                  title="Edit slot details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="p-2 bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition cursor-pointer"
                  title="Delete slot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Evening Suggestion / Optimization Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0C1214] p-6 sm:p-7 border border-white/20 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-lg font-display font-black text-white uppercase tracking-tight">
                  SOUL AI Evening Optimizer
                </h3>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 text-white/50 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <p className="text-white/70">
                SOUL AI will analyze your pending academic manuals (OSY, CLC, STE, ENDS), upcoming assignment deadlines, and spaced revisions to generate a perfectly sequenced post-gym schedule starting at <strong className="text-orange-400">{preferences.gymEndTime || '07:00 PM'}</strong>.
              </p>

              {/* Strategy Selector */}
              <div>
                <label className="text-white/60 block mb-1.5 uppercase font-bold text-[10px] tracking-wider">
                  Target Optimization Focus
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'balanced', label: '⚖️ Balanced Mastery', desc: 'Manuals + Assignments + Recall' },
                    { id: 'urgent_deadlines', label: '⚡ Urgent Deadlines', desc: 'Prioritize upcoming submissions' },
                    { id: 'deep_study', label: '🧠 Deep Subject Focus', desc: 'Intensive single topic mastery' },
                    { id: 'light_recovery', label: '🌱 Post-Gym Recovery', desc: 'Light recall + more rest buffer' },
                  ].map(strat => (
                    <button
                      key={strat.id}
                      type="button"
                      onClick={() => setAiStrategy(strat.id as any)}
                      className={`p-3 text-left border transition cursor-pointer ${
                        aiStrategy === strat.id
                          ? 'bg-cyan-400/10 border-cyan-400 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <div className="font-black uppercase text-[11px] text-cyan-300">{strat.label}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{strat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedtime Target */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-white/60 uppercase font-bold text-[10px] tracking-wider">
                    Target Wind-Down / Sleep Time
                  </label>
                  <span className="text-cyan-400 font-bold">{formatTime12h(aiBedtime)}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {['22:30', '23:00', '23:30', '00:00'].map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setAiBedtime(time)}
                      className={`py-2 text-[11px] font-black uppercase transition cursor-pointer border ${
                        aiBedtime === time
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                      }`}
                    >
                      {formatTime12h(time)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt / Special Request */}
              <div>
                <label className="text-white/60 block mb-1 uppercase font-bold text-[10px] tracking-wider">
                  Optional Prompt / Special Guidance
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on OSY CPU scheduling manual, or Keep study light after leg day"
                  value={aiCustomPrompt}
                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Feedback banner if available */}
              {aiFeedback && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs font-mono animate-fadeIn">
                  ✓ {aiFeedback}
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  disabled={isAiGenerating}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white uppercase font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAiEvening}
                  disabled={isAiGenerating}
                  className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black font-mono text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isAiGenerating ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>OPTIMIZING...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 fill-black" />
                      <span>GENERATE EVENING SCHEDULE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Slot Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0C1214] p-6 sm:p-7 border border-white/20 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400"></span>
                <h3 className="text-lg font-display font-black text-white uppercase tracking-tight">
                  {editingSlot ? 'Edit Evening Slot' : 'Add Evening Slot'}
                </h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-white/50 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs font-mono">
              {/* Type Switcher */}
              <div>
                <label className="text-white/60 block mb-1 uppercase font-bold text-[10px] tracking-wider">
                  Slot Category
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {(['meal', 'manual', 'assignment', 'revision', 'leisure', 'wind_down'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={`py-2 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                        formType === t
                          ? 'bg-cyan-400 text-black border-cyan-400'
                          : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                      }`}
                    >
                      {t === 'wind_down' ? 'Wind Down' : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Quick Selector if applicable */}
              {(formType === 'manual' || formType === 'assignment' || formType === 'study' || formType === 'revision') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-white/60 uppercase text-[10px] font-bold tracking-wider">Subject</label>
                    <span className="text-[10px] text-cyan-400 font-bold">{formSubjectCode}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['OSY', 'CLC', 'STE', 'ENDS'].map(code => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleSubjectChange(code)}
                        className={`py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer border ${
                          formSubjectCode === code
                            ? 'bg-white text-black border-white'
                            : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 uppercase font-bold text-[10px] tracking-wider">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-white/60 block mb-1 uppercase font-bold text-[10px] tracking-wider">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-white/60 uppercase text-[10px] font-bold tracking-wider">Title</label>
                  <span className="text-[10px] text-white/40">
                    {formType === 'assignment' ? 'Always labeled "Assignment"' : formType === 'manual' ? `Auto: ${formSubjectCode} Manual` : 'Custom title'}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={
                    formType === 'assignment' 
                      ? 'Assignment' 
                      : formType === 'manual' 
                      ? `${formSubjectCode} Manual` 
                      : formTitle
                  }
                  onChange={(e) => setFormTitle(e.target.value)}
                  disabled={formType === 'assignment' || formType === 'manual'}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white font-bold tracking-wider uppercase disabled:opacity-75 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Subtitle / Description */}
              <div>
                <label className="text-white/60 block mb-1 uppercase text-[10px] font-bold tracking-wider">
                  Description / Study Plan
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. CPU scheduling algorithms, 30g protein dinner, or active recall notes"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                {editingSlot ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(editingSlot.id)}
                    className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-xs uppercase transition cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : <div></div>}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white uppercase font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black font-mono text-xs uppercase tracking-wider transition cursor-pointer active:scale-95"
                  >
                    {editingSlot ? 'SAVE CHANGES' : '+ ADD TO EVENING'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
