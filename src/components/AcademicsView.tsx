import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Plus, 
  AlertCircle, 
  Flame, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  Layers, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { 
  AcademicTask, 
  PriorityLevel, 
  Subject, 
  SyllabusUnit, 
  TaskStatus, 
  UnitStatus,
  MSBTECalendarEvent,
  AcademicPerformanceData,
  SubjectMarksEntry
} from '../types';
import { getDaysDifference } from '../lib/schedulingEngine';
import { Target98Section } from './Target98Section';
import { MsbteCalendarSection } from './MsbteCalendarSection';

interface AcademicsViewProps {
  subjects: Subject[];
  tasks: AcademicTask[];
  msbteCalendar?: MSBTECalendarEvent[];
  performance?: AcademicPerformanceData;
  currentTime?: Date;
  onUpdateSubjects: (subjects: Subject[]) => void;
  onUpdateTasks: (tasks: AcademicTask[]) => void;
  onStartStudySession: (item: { subjectCode: string; unitNumber?: number; title: string; taskId?: string }) => void;
  onSaveMarks?: (subjectCode: string, marks: SubjectMarksEntry) => void;
  onToggleMsbteReminder?: (eventId: string) => void;
}

export const AcademicsView: React.FC<AcademicsViewProps> = ({
  subjects,
  tasks,
  msbteCalendar = [],
  performance = { targetPercentage: 98, scores: {} },
  currentTime = new Date(),
  onUpdateSubjects,
  onUpdateTasks,
  onStartStudySession,
  onSaveMarks = () => {},
  onToggleMsbteReminder = () => {},
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'syllabus' | 'target98' | 'msbte' | 'work_tracker' | 'revision_engine'>('syllabus');
  
  // Work tracker filter
  const [taskFilter, setTaskFilter] = useState<'all' | 'manual' | 'assignment' | 'project'>('all');
  
  // Expanded subject cards in syllabus
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<string[]>(['subj-clc', 'subj-osy', 'subj-ste']);

  // New Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskFormType, setTaskFormType] = useState<AcademicTask['type']>('assignment');
  const [taskFormSubject, setTaskFormSubject] = useState('OSY');
  const [taskFormTitle, setTaskFormTitle] = useState('Assignment');
  const [taskFormExpNo, setTaskFormExpNo] = useState('');
  const [taskFormDeadline, setTaskFormDeadline] = useState('');
  const [taskFormPriority, setTaskFormPriority] = useState<PriorityLevel>('high');
  const [taskFormEstMinutes, setTaskFormEstMinutes] = useState(45);
  const [taskFormProgress, setTaskFormProgress] = useState(0);
  const [taskFormDescription, setTaskFormDescription] = useState('');

  const openCreateAssignmentModal = (subjectCode?: string) => {
    const subj = subjectCode || 'OSY';
    setTaskFormType('assignment');
    setTaskFormSubject(subj);
    setTaskFormTitle('Assignment');
    setTaskFormExpNo('');
    const d = new Date();
    d.setDate(d.getDate() + 5);
    setTaskFormDeadline(d.toISOString().split('T')[0]);
    setTaskFormPriority('high');
    setTaskFormEstMinutes(60);
    setTaskFormProgress(0);
    setTaskFormDescription('');
    setIsTaskModalOpen(true);
  };

  const openCreateManualModal = (subjectCode?: string) => {
    const subj = subjectCode || 'OSY';
    setTaskFormType('manual');
    setTaskFormSubject(subj);
    setTaskFormTitle(`${subj} Manual`);
    setTaskFormExpNo('');
    const d = new Date();
    d.setDate(d.getDate() + 4);
    setTaskFormDeadline(d.toISOString().split('T')[0]);
    setTaskFormPriority('high');
    setTaskFormEstMinutes(45);
    setTaskFormProgress(0);
    setTaskFormDescription('');
    setIsTaskModalOpen(true);
  };

  const openGenericTaskModal = () => {
    setTaskFormType('assignment');
    setTaskFormSubject('OSY');
    setTaskFormTitle('Assignment');
    setTaskFormExpNo('');
    const d = new Date();
    d.setDate(d.getDate() + 4);
    setTaskFormDeadline(d.toISOString().split('T')[0]);
    setTaskFormPriority('high');
    setTaskFormEstMinutes(45);
    setTaskFormProgress(0);
    setTaskFormDescription('');
    setIsTaskModalOpen(true);
  };

  const handleSubjectChangeInForm = (code: string) => {
    setTaskFormSubject(code);
    if (taskFormType === 'manual') {
      setTaskFormTitle(`${code} Manual`);
    } else if (taskFormType === 'assignment') {
      setTaskFormTitle('Assignment');
    }
  };

  const handleTypeChangeInForm = (type: AcademicTask['type']) => {
    setTaskFormType(type);
    if (type === 'manual') {
      setTaskFormTitle(`${taskFormSubject} Manual`);
    } else if (type === 'assignment') {
      setTaskFormTitle('Assignment');
    }
  };

  // Add Subject Modal State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjFaculty, setNewSubjFaculty] = useState('');
  const [newSubjUnitsCount, setNewSubjUnitsCount] = useState(5);

  const toggleSubjectExpand = (id: string) => {
    setExpandedSubjectIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = taskFormType === 'manual' 
      ? `${taskFormSubject} Manual`
      : taskFormType === 'assignment'
      ? 'Assignment'
      : (taskFormTitle.trim() || 'Academic Task');

    const newTask: AcademicTask = {
      id: `task-${Date.now()}`,
      type: taskFormType,
      subjectCode: taskFormSubject,
      title: finalTitle,
      experimentNumber: taskFormExpNo || undefined,
      deadline: taskFormDeadline || new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      priority: taskFormPriority,
      status: taskFormProgress >= 100 ? 'completed' : taskFormProgress > 0 ? 'in_progress' : 'not_started',
      progress: taskFormProgress,
      estimatedMinutes: taskFormEstMinutes,
      actualMinutesSpent: 0,
      description: taskFormDescription,
      createdAt: new Date().toISOString().split('T')[0],
      completedAt: taskFormProgress >= 100 ? new Date().toISOString().split('T')[0] : undefined,
    };
    onUpdateTasks([newTask, ...tasks]);
    setIsTaskModalOpen(false);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjCode.trim()) return;

    const units: SyllabusUnit[] = Array.from({ length: newSubjUnitsCount }, (_, i) => ({
      id: `${newSubjCode.toLowerCase()}-u${i + 1}`,
      unitNumber: i + 1,
      title: `Unit ${i + 1} Module`,
      subjectCode: newSubjCode.toUpperCase(),
      status: 'not_started' as UnitStatus,
      progress: 0,
      totalMinutesStudied: 0,
      estimatedMinutes: 120,
      revisions: [
        { stage: 1, status: 'pending', intervalDays: 1 },
        { stage: 2, status: 'pending', intervalDays: 7 },
        { stage: 3, status: 'pending', intervalDays: 21 },
      ],
    }));

    const newSubj: Subject = {
      id: `subj-${Date.now()}`,
      code: newSubjCode.toUpperCase(),
      name: newSubjName || newSubjCode.toUpperCase(),
      faculty: newSubjFaculty,
      color: '#0ea5e9',
      units,
    };

    onUpdateSubjects([...subjects, newSubj]);
    setIsSubjectModalOpen(false);
    setNewSubjCode('');
    setNewSubjName('');
    setNewSubjFaculty('');
  };

  const handleUpdateUnitStatus = (subjectId: string, unitNumber: number, newStatus: UnitStatus) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = subjects.map(s => {
      if (s.id === subjectId) {
        const units = s.units.map(u => {
          if (u.unitNumber === unitNumber) {
            let progress = u.progress;
            let compDate = u.completedDate;
            let revisions = [...u.revisions];

            if (newStatus === 'completed') {
              progress = 100;
              compDate = todayStr;
              // Schedule spaced repetitions
              const r1 = new Date();
              r1.setDate(r1.getDate() + 1);
              const r2 = new Date();
              r2.setDate(r2.getDate() + 7);
              const r3 = new Date();
              r3.setDate(r3.getDate() + 21);

              revisions = [
                { stage: 1, status: 'recommended', suggestedDate: r1.toISOString().split('T')[0], intervalDays: 1 },
                { stage: 2, status: 'pending', suggestedDate: r2.toISOString().split('T')[0], intervalDays: 7 },
                { stage: 3, status: 'pending', suggestedDate: r3.toISOString().split('T')[0], intervalDays: 21 },
              ];
            } else if (newStatus === 'studying') {
              progress = progress === 100 ? 50 : Math.max(25, progress);
            } else {
              progress = 0;
              compDate = undefined;
            }

            return {
              ...u,
              status: newStatus,
              progress,
              completedDate: compDate,
              revisions,
            };
          }
          return u;
        });
        return { ...s, units };
      }
      return s;
    });
    onUpdateSubjects(updated);
  };

  const handleUpdateTaskProgress = (taskId: string, newProgress: number) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const status: TaskStatus = newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started';
        return {
          ...t,
          progress: Math.min(100, Math.max(0, newProgress)),
          status,
          completedAt: newProgress >= 100 ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== taskId));
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'all') return true;
    return t.type === taskFilter;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner & Sub-Tab Switcher */}
      <section className="relative overflow-hidden p-6 md:p-8 bg-[#0C1214] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute right-0 bottom-0 text-8xl md:text-9xl font-black tracking-tighter leading-none text-white/[0.02] select-none pointer-events-none uppercase font-display">
          STUDY
        </div>

        <div className="relative z-10">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
            <span>03 / ACADEMIC REPOSITORY & MASTERY</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tight mt-1">
            SYLLABUS & MANUALS
          </h2>
          <p className="text-xs font-mono text-white/50 mt-1 uppercase tracking-wider">
            ACTUAL COMPLETION FEEDS REAL-TIME SPACED REPETITION ENGINE.
          </p>
        </div>

        {/* Sub-Tab Navigation Buttons */}
        <div className="flex items-center p-1 bg-white/5 border border-white/10 font-mono text-xs relative z-10 flex-wrap gap-1">
          <button
            onClick={() => setActiveSubTab('syllabus')}
            className={`px-3.5 py-2 uppercase font-black tracking-wider transition cursor-pointer text-xs ${
              activeSubTab === 'syllabus' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            SYLLABUS & UNITS
          </button>
          <button
            onClick={() => setActiveSubTab('target98')}
            className={`px-3.5 py-2 uppercase font-black tracking-wider transition cursor-pointer text-xs ${
              activeSubTab === 'target98' ? 'bg-amber-400 text-black font-black' : 'text-amber-300/70 hover:text-amber-300'
            }`}
          >
            🎯 98% TARGET
          </button>
          <button
            onClick={() => setActiveSubTab('msbte')}
            className={`px-3.5 py-2 uppercase font-black tracking-wider transition cursor-pointer text-xs ${
              activeSubTab === 'msbte' ? 'bg-cyan-400 text-black font-black' : 'text-cyan-300/70 hover:text-cyan-300'
            }`}
          >
            📅 MSBTE CALENDAR
          </button>
          <button
            onClick={() => setActiveSubTab('work_tracker')}
            className={`px-3.5 py-2 uppercase font-black tracking-wider transition cursor-pointer text-xs ${
              activeSubTab === 'work_tracker' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            MANUALS & TASKS
          </button>
          <button
            onClick={() => setActiveSubTab('revision_engine')}
            className={`px-3.5 py-2 uppercase font-black tracking-wider transition cursor-pointer text-xs ${
              activeSubTab === 'revision_engine' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            SPACED REVISIONS
          </button>
        </div>
      </section>

      {/* 1. SYLLABUS & UNITS SUB-TAB */}
      {activeSubTab === 'syllabus' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>CORE SUBJECT MODULES</span>
            </h3>
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-black hover:bg-cyan-400 text-xs font-mono font-black uppercase tracking-widest transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>ADD SUBJECT</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {subjects.map((subj) => {
              const totalUnits = subj.units.length;
              const completedCount = subj.units.filter(u => u.status === 'completed').length;
              const overallPercent = Math.round((completedCount / Math.max(1, totalUnits)) * 100);
              const isExpanded = expandedSubjectIds.includes(subj.id);

              return (
                <div key={subj.id} className="border border-white/10 bg-[#0C1214] overflow-hidden transition-all">
                  
                  {/* Subject Header Card */}
                  <div 
                    onClick={() => toggleSubjectExpand(subj.id)}
                    className="p-5 md:p-6 bg-white/[0.02] hover:bg-white/[0.05] transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-lg text-cyan-400 uppercase">
                        {subj.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg md:text-xl font-display font-black text-white uppercase tracking-tight">{subj.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-white/70 uppercase">
                            {subj.faculty || 'FACULTY'}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-white/50 mt-1 uppercase">
                          {completedCount} OF {totalUnits} UNITS COMPLETED ({totalUnits - completedCount} REMAINING)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-3xl font-display font-black text-cyan-400">
                          {overallPercent}%
                        </div>
                        <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">
                          MASTERY
                        </div>
                      </div>
                      <div className="p-2 border border-white/10 bg-white/5 text-white/60">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-white/5 h-1">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-500"
                      style={{ width: `${overallPercent}%` }}
                    />
                  </div>

                  {/* Units List */}
                  {isExpanded && (
                    <div className="p-5 md:p-6 space-y-3 bg-[#080C0D]">
                      {subj.units.map((unit) => {
                        const isComp = unit.status === 'completed';
                        const isStudying = unit.status === 'studying';

                        return (
                          <div
                            key={unit.id}
                            className={`p-4 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              isComp
                                ? 'bg-emerald-500/[0.04] border-emerald-500/20'
                                : isStudying
                                ? 'bg-cyan-500/[0.05] border-cyan-400/40 shadow-sm'
                                : 'bg-white/[0.02] border-white/5'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-cyan-400 uppercase">
                                  UNIT {unit.unitNumber}
                                </span>
                                <span className={`px-2 py-0.5 text-[9px] font-mono uppercase font-black tracking-wider ${
                                  isComp 
                                    ? 'bg-emerald-500/20 text-emerald-300' 
                                    : isStudying 
                                    ? 'bg-cyan-400 text-black animate-pulse' 
                                    : 'bg-white/10 text-white/40'
                                }`}>
                                  {unit.status.replace('_', ' ')}
                                </span>
                                {unit.totalMinutesStudied > 0 && (
                                  <span className="text-[10px] font-mono text-white/40 uppercase">
                                    ⏱️ {unit.totalMinutesStudied}M STUDIED
                                  </span>
                                )}
                              </div>
                              <h5 className="text-sm font-display font-bold text-white uppercase">
                                {unit.title}
                              </h5>
                              {unit.notes && (
                                <p className="text-xs font-mono text-white/50">
                                  {unit.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              {/* Status Buttons */}
                              <div className="flex items-center p-1 bg-white/5 border border-white/10 text-[11px] font-mono">
                                <button
                                  onClick={() => handleUpdateUnitStatus(subj.id, unit.unitNumber, 'not_started')}
                                  className={`px-2.5 py-1 uppercase font-bold transition cursor-pointer ${
                                    unit.status === 'not_started' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
                                  }`}
                                >
                                  RESET
                                </button>
                                <button
                                  onClick={() => handleUpdateUnitStatus(subj.id, unit.unitNumber, 'studying')}
                                  className={`px-2.5 py-1 uppercase font-bold transition cursor-pointer ${
                                    unit.status === 'studying' ? 'bg-cyan-400 text-black' : 'text-white/40 hover:text-white'
                                  }`}
                                >
                                  STUDYING
                                </button>
                                <button
                                  onClick={() => handleUpdateUnitStatus(subj.id, unit.unitNumber, 'completed')}
                                  className={`px-2.5 py-1 uppercase font-bold transition cursor-pointer ${
                                    unit.status === 'completed' ? 'bg-emerald-400 text-black' : 'text-white/40 hover:text-white'
                                  }`}
                                >
                                  COMPLETED
                                </button>
                              </div>

                              <button
                                onClick={() => onStartStudySession({
                                  subjectCode: subj.code,
                                  unitNumber: unit.unitNumber,
                                  title: `${subj.code} Unit ${unit.unitNumber}: ${unit.title}`,
                                })}
                                className="px-4 py-2 bg-white text-black hover:bg-cyan-400 font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer"
                              >
                                ⚡ STUDY NOW
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WORK TRACKER (MANUALS, ASSIGNMENTS, PROJECTS) SUB-TAB */}
      {activeSubTab === 'work_tracker' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(['all', 'manual', 'assignment', 'project'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setTaskFilter(filter)}
                  className={`px-4 py-2.5 text-xs font-mono font-black uppercase tracking-widest transition cursor-pointer border shrink-0 ${
                    taskFilter === filter
                      ? 'bg-cyan-400 text-black border-cyan-400'
                      : 'bg-white/5 text-white/50 hover:text-white border-white/10'
                  }`}
                >
                  {filter === 'all' ? 'ALL ACADEMIC WORK' : `${filter}S`}
                </button>
              ))}
            </div>

            {/* Creation Buttons with Create Assignment primary button */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => openCreateAssignmentModal()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-400 text-black hover:bg-cyan-300 font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg shadow-cyan-950/40 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ CREATE ASSIGNMENT</span>
              </button>

              <button
                onClick={() => openCreateManualModal()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-black hover:bg-white/90 font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ CREATE MANUAL</span>
              </button>

              <button
                onClick={openGenericTaskModal}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ TASK</span>
              </button>
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map(task => {
              const daysLeft = getDaysDifference(task.deadline);
              const isOverdue = daysLeft < 0;
              const isDueSoon = daysLeft <= 2 && daysLeft >= 0;

              // Enforce clean naming requested by user:
              // Manuals: "[Subject Name] Manual"
              // Assignments: "Assignment"
              const displayTitle = task.type === 'manual'
                ? `${task.subjectCode} Manual`
                : task.type === 'assignment'
                ? 'Assignment'
                : task.title;

              return (
                <div 
                  key={task.id} 
                  className="p-6 bg-[#0C1214] border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between gap-4 relative overflow-hidden"
                >
                  {/* Subtle watermarked type in background */}
                  <div className="absolute right-3 top-3 text-5xl font-display font-black text-white/[0.02] select-none pointer-events-none uppercase">
                    {task.type}
                  </div>

                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-cyan-400/20 text-cyan-300 font-mono text-[10px] font-black uppercase tracking-wider border border-cyan-400/30">
                          {task.subjectCode}
                        </span>
                        <span className="px-2 py-0.5 bg-white/10 text-white/70 font-mono text-[10px] uppercase font-bold">
                          {task.type}
                        </span>
                      </div>

                      {/* Deadline Pressure Badge */}
                      <span className={`px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider ${
                        isOverdue 
                          ? 'bg-rose-500 text-white' 
                          : isDueSoon 
                          ? 'bg-orange-500 text-black' 
                          : 'bg-white/10 text-white/50'
                      }`}>
                        {isOverdue 
                          ? `OVERDUE (${Math.abs(daysLeft)}D)` 
                          : daysLeft === 0 
                          ? 'DUE TODAY' 
                          : `${daysLeft} DAYS LEFT`}
                      </span>
                    </div>

                    <h4 className="text-xl font-display font-black text-white uppercase tracking-tight">
                      {displayTitle}
                    </h4>

                    {task.description && (
                      <p className="text-xs font-mono text-white/60 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar & Slider */}
                  <div className="space-y-2.5 pt-3 border-t border-white/10 relative z-10">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white/80">
                        PROGRESS: <strong className="text-cyan-400 font-black">{task.progress}%</strong>
                      </span>
                      <span className="text-white/40">EST: {task.estimatedMinutes}M</span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          task.progress === 100 
                            ? 'bg-emerald-400' 
                            : task.progress > 50 
                            ? 'bg-cyan-400' 
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>

                    {/* Interactive Slider */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={task.progress}
                      onChange={(e) => handleUpdateTaskProgress(task.id, parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-white/10 appearance-none cursor-pointer accent-cyan-400"
                    />

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateTaskProgress(task.id, Math.min(100, task.progress + 25))}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/80 text-[10px] font-mono font-bold uppercase transition cursor-pointer"
                          title="Add 25% progress"
                        >
                          +25%
                        </button>
                        <button
                          onClick={() => handleUpdateTaskProgress(task.id, 100)}
                          className={`px-3 py-1 text-[10px] font-mono font-black uppercase tracking-wider transition cursor-pointer ${
                            task.progress === 100 
                              ? 'bg-emerald-500 text-black font-black' 
                              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          ✓ {task.progress === 100 ? 'COMPLETED' : 'COMPLETE'}
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-white/30 hover:text-rose-400 transition cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onStartStudySession({
                          subjectCode: task.subjectCode,
                          title: displayTitle,
                          taskId: task.id,
                        })}
                        className="px-4 py-2 bg-white text-black hover:bg-cyan-400 text-xs font-mono font-black uppercase tracking-wider transition cursor-pointer"
                      >
                        ⚡ WORK ON THIS
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SPACED REVISION ENGINE SUB-TAB */}
      {activeSubTab === 'revision_engine' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 border border-cyan-400/30 bg-[#0C1214] space-y-2 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 text-8xl md:text-9xl font-black tracking-tighter leading-none text-cyan-400/[0.03] select-none pointer-events-none uppercase font-display">
              REVISE
            </div>

            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] font-bold flex items-center gap-2 relative z-10">
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>SPACED REPETITION PROTOCOL (EBBINGHAUS FORGETTING CURVE)</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight relative z-10">
              DYNAMIC RECALL SCHEDULING ENGINE
            </h3>
            <p className="text-xs font-mono text-white/60 relative z-10 uppercase">
              WHEN YOU COMPLETE A UNIT, SOUL AUTOMATICALLY SCHEDULES 3 REVISIONS: STAGE 1 (+1 DAY), STAGE 2 (+7 DAYS), STAGE 3 (+21 DAYS).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Stage 1 Column */}
            <div className="p-6 border border-white/10 bg-[#0C1214] space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs font-black text-cyan-400 uppercase tracking-wider">REVISION 1 (DAY +1)</span>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-cyan-400/20 text-cyan-300 uppercase font-bold">IMMEDIATE</span>
              </div>
              <div className="space-y-3">
                {subjects.flatMap(s => s.units.filter(u => u.status === 'completed' && u.revisions[0])).map(unit => {
                  const rev = unit.revisions[0];
                  return (
                    <div key={`r1-${unit.id}`} className="p-4 bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-cyan-400 font-black uppercase">{unit.subjectCode} UNIT {unit.unitNumber}</span>
                        <span className="text-white/40">{rev.suggestedDate || 'SCHEDULED'}</span>
                      </div>
                      <div className="text-xs text-white font-bold uppercase truncate">{unit.title}</div>
                      <button
                        onClick={() => onStartStudySession({ subjectCode: unit.subjectCode, unitNumber: unit.unitNumber, title: `${unit.subjectCode} Unit ${unit.unitNumber} Rev 1` })}
                        className="mt-2 w-full py-2 bg-white text-black hover:bg-cyan-400 text-xs font-mono font-black uppercase tracking-wider transition cursor-pointer"
                      >
                        START REV 1
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage 2 Column */}
            <div className="p-6 border border-white/10 bg-[#0C1214] space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs font-black text-teal-300 uppercase tracking-wider">REVISION 2 (DAY +7)</span>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-teal-500/20 text-teal-400 uppercase font-bold">CONSOLIDATE</span>
              </div>
              <div className="space-y-3">
                {subjects.flatMap(s => s.units.filter(u => u.status === 'completed' && u.revisions[1])).map(unit => {
                  const rev = unit.revisions[1];
                  return (
                    <div key={`r2-${unit.id}`} className="p-4 bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-teal-400 font-black uppercase">{unit.subjectCode} UNIT {unit.unitNumber}</span>
                        <span className="text-white/40">{rev.suggestedDate || 'UPCOMING'}</span>
                      </div>
                      <div className="text-xs text-white font-bold uppercase truncate">{unit.title}</div>
                      <button
                        onClick={() => onStartStudySession({ subjectCode: unit.subjectCode, unitNumber: unit.unitNumber, title: `${unit.subjectCode} Unit ${unit.unitNumber} Rev 2` })}
                        className="mt-2 w-full py-2 bg-white text-black hover:bg-teal-400 text-xs font-mono font-black uppercase tracking-wider transition cursor-pointer"
                      >
                        START REV 2
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage 3 Column */}
            <div className="p-6 border border-white/10 bg-[#0C1214] space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs font-black text-purple-300 uppercase tracking-wider">REVISION 3 (DAY +21)</span>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-purple-500/20 text-purple-400 uppercase font-bold">PERMANENT</span>
              </div>
              <div className="space-y-3">
                {subjects.flatMap(s => s.units.filter(u => u.status === 'completed' && u.revisions[2])).map(unit => {
                  const rev = unit.revisions[2];
                  return (
                    <div key={`r3-${unit.id}`} className="p-4 bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-purple-400 font-black uppercase">{unit.subjectCode} UNIT {unit.unitNumber}</span>
                        <span className="text-white/40">{rev.suggestedDate || 'UPCOMING'}</span>
                      </div>
                      <div className="text-xs text-white font-bold uppercase truncate">{unit.title}</div>
                      <button
                        onClick={() => onStartStudySession({ subjectCode: unit.subjectCode, unitNumber: unit.unitNumber, title: `${unit.subjectCode} Unit ${unit.unitNumber} Rev 3` })}
                        className="mt-2 w-full py-2 bg-white text-black hover:bg-purple-400 text-xs font-mono font-black uppercase tracking-wider transition cursor-pointer"
                      >
                        START REV 3
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. 98% TARGET SYSTEM SUB-TAB */}
      {activeSubTab === 'target98' && (
        <Target98Section
          performance={performance}
          subjects={subjects}
          onSaveMarks={onSaveMarks}
        />
      )}

      {/* 3. MSBTE EXAM CALENDAR SUB-TAB */}
      {activeSubTab === 'msbte' && (
        <MsbteCalendarSection
          events={msbteCalendar}
          currentTime={currentTime}
          onToggleReminder={onToggleMsbteReminder}
        />
      )}

      {/* NEW ACADEMIC TASK / ASSIGNMENT / MANUAL MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0C1214] p-6 sm:p-7 border border-white/20 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400"></span>
                <h3 className="text-lg font-display font-black text-white uppercase tracking-tight">
                  {taskFormType === 'assignment' 
                    ? 'Create Assignment' 
                    : taskFormType === 'manual' 
                    ? 'Create Manual' 
                    : 'Create Academic Task'}
                </h3>
              </div>
              <button 
                onClick={() => setIsTaskModalOpen(false)} 
                className="p-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-mono">
              {/* Type Switcher */}
              <div>
                <label className="text-white/60 block mb-1 uppercase text-[10px] font-bold tracking-wider">Type</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['assignment', 'manual', 'project', 'study_session'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChangeInForm(t)}
                      className={`py-2 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                        taskFormType === t
                          ? 'bg-cyan-400 text-black border-cyan-400'
                          : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                      }`}
                    >
                      {t === 'assignment' ? 'Assignment' : t === 'manual' ? 'Manual' : t === 'project' ? 'Project' : 'Session'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Quick Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-white/60 uppercase text-[10px] font-bold tracking-wider">Subject</label>
                  <span className="text-[10px] text-cyan-400 font-bold">{taskFormSubject}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {['OSY', 'CLC', 'STE'].map(code => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleSubjectChangeInForm(code)}
                      className={`py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer border ${
                        taskFormSubject === code
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title info */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-white/60 uppercase text-[10px] font-bold tracking-wider">Title</label>
                  <span className="text-[10px] text-white/40">
                    {taskFormType === 'assignment' ? 'Always labeled "Assignment"' : taskFormType === 'manual' ? `Auto: ${taskFormSubject} Manual` : 'Custom title'}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={
                    taskFormType === 'assignment' 
                      ? 'Assignment' 
                      : taskFormType === 'manual' 
                      ? `${taskFormSubject} Manual` 
                      : taskFormTitle
                  }
                  onChange={(e) => setTaskFormTitle(e.target.value)}
                  disabled={taskFormType === 'assignment' || taskFormType === 'manual'}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white font-bold tracking-wider uppercase disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Deadline & Quick Shortcuts */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-white/60 uppercase text-[10px] font-bold tracking-wider">Deadline</label>
                  <div className="flex items-center gap-1 text-[9px]">
                    {[
                      { label: '+3D', days: 3 },
                      { label: '+5D', days: 5 },
                      { label: '+7D', days: 7 },
                      { label: '+14D', days: 14 }
                    ].map(btn => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + btn.days);
                          setTaskFormDeadline(d.toISOString().split('T')[0]);
                        }}
                        className="px-1.5 py-0.5 bg-white/10 hover:bg-cyan-400 hover:text-black text-white/70 font-bold transition cursor-pointer"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="date"
                  required
                  value={taskFormDeadline}
                  onChange={(e) => setTaskFormDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Priority & Estimated Minutes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 uppercase text-[10px] font-bold tracking-wider">Priority</label>
                  <select
                    value={taskFormPriority}
                    onChange={(e) => setTaskFormPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 uppercase font-bold"
                  >
                    <option value="critical" className="bg-[#0C1214] text-rose-400">CRITICAL (Top Priority)</option>
                    <option value="high" className="bg-[#0C1214] text-amber-400">HIGH PRIORITY</option>
                    <option value="medium" className="bg-[#0C1214] text-white">MEDIUM PRIORITY</option>
                    <option value="low" className="bg-[#0C1214] text-white/60">LOW PRIORITY</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/60 block mb-1 uppercase text-[10px] font-bold tracking-wider">Est. Duration (Mins)</label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    step="15"
                    value={taskFormEstMinutes}
                    onChange={(e) => setTaskFormEstMinutes(parseInt(e.target.value, 10) || 45)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-bold"
                  />
                </div>
              </div>

              {/* Initial Progress Slider */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <label className="text-white/60 uppercase text-[10px] font-bold tracking-wider">Initial Progress</label>
                  <span className="text-cyan-400 font-black">{taskFormProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={taskFormProgress}
                  onChange={(e) => setTaskFormProgress(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-white/10 appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-white/60 block mb-1 uppercase text-[10px] font-bold tracking-wider">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Questions, submission instructions, experiment notes..."
                  value={taskFormDescription}
                  onChange={(e) => setTaskFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setIsTaskModalOpen(false)} 
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white uppercase font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black font-mono text-xs uppercase tracking-wider transition cursor-pointer active:scale-95"
                >
                  {taskFormType === 'assignment' ? '+ CREATE ASSIGNMENT' : taskFormType === 'manual' ? '+ CREATE MANUAL' : '+ CREATE TASK'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SUBJECT MODAL */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-display font-bold text-white">Add New Subject</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-white bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-gray-400 block mb-1">Subject Code (e.g. DCN, MAD)</label>
                <input
                  type="text"
                  required
                  placeholder="DCN"
                  value={newSubjCode}
                  onChange={(e) => setNewSubjCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Subject Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Data Communication & Networking"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Faculty Incharge</label>
                  <input
                    type="text"
                    placeholder="Prof. Name"
                    value={newSubjFaculty}
                    onChange={(e) => setNewSubjFaculty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Number of Units</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newSubjUnitsCount}
                    onChange={(e) => setNewSubjUnitsCount(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/5 text-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-cyan-500 text-black font-bold font-mono">
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
