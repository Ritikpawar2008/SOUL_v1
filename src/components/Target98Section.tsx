import React, { useState } from 'react';
import { 
  Target, 
  Award, 
  TrendingUp, 
  Edit3, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronRight,
  Zap,
  Flame,
  FileText,
  BarChart3
} from 'lucide-react';
import { AcademicPerformanceData, Subject, SubjectMarksEntry } from '../types';
import { Target98Engine, PerformanceSummary } from '../lib/target98Engine';

interface Target98SectionProps {
  performance: AcademicPerformanceData;
  subjects: Subject[];
  onSaveMarks: (subjectCode: string, marks: SubjectMarksEntry) => void;
}

export const Target98Section: React.FC<Target98SectionProps> = ({
  performance,
  subjects,
  onSaveMarks,
}) => {
  const [isMarksModalOpen, setIsMarksModalOpen] = useState<boolean>(false);
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>('CLC');

  // Form State for editing marks for a selected subject
  const currentSubjectMarks = performance?.scores?.[activeSubjectTab] || {};
  const [ct1Obt, setCt1Obt] = useState<string>(currentSubjectMarks.ct1?.obtained?.toString() || '');
  const [ct1Max, setCt1Max] = useState<string>(currentSubjectMarks.ct1?.max?.toString() || '25');

  const [ct2Obt, setCt2Obt] = useState<string>(currentSubjectMarks.ct2?.obtained?.toString() || '');
  const [ct2Max, setCt2Max] = useState<string>(currentSubjectMarks.ct2?.max?.toString() || '25');

  const [asgObt, setAsgObt] = useState<string>(currentSubjectMarks.assignments?.obtained?.toString() || '');
  const [asgMax, setAsgMax] = useState<string>(currentSubjectMarks.assignments?.max?.toString() || '25');

  const [pracObt, setPracObt] = useState<string>(currentSubjectMarks.practicals?.obtained?.toString() || '');
  const [pracMax, setPracMax] = useState<string>(currentSubjectMarks.practicals?.max?.toString() || '50');

  const [thObt, setThObt] = useState<string>(currentSubjectMarks.theory?.obtained?.toString() || '');
  const [thMax, setThMax] = useState<string>(currentSubjectMarks.theory?.max?.toString() || '70');

  // Sync form when switching subject tab
  const handleSelectSubjectTab = (code: string) => {
    setActiveSubjectTab(code);
    const marks = performance?.scores?.[code] || {};
    setCt1Obt(marks.ct1?.obtained?.toString() || '');
    setCt1Max(marks.ct1?.max?.toString() || '25');
    setCt2Obt(marks.ct2?.obtained?.toString() || '');
    setCt2Max(marks.ct2?.max?.toString() || '25');
    setAsgObt(marks.assignments?.obtained?.toString() || '');
    setAsgMax(marks.assignments?.max?.toString() || '25');
    setPracObt(marks.practicals?.obtained?.toString() || '');
    setPracMax(marks.practicals?.max?.toString() || '50');
    setThObt(marks.theory?.obtained?.toString() || '');
    setThMax(marks.theory?.max?.toString() || '70');
  };

  const handleSaveSubjectMarks = (e: React.FormEvent) => {
    e.preventDefault();

    const marks: SubjectMarksEntry = {};

    if (ct1Obt && ct1Max) {
      marks.ct1 = { obtained: parseFloat(ct1Obt), max: parseFloat(ct1Max) };
    }
    if (ct2Obt && ct2Max) {
      marks.ct2 = { obtained: parseFloat(ct2Obt), max: parseFloat(ct2Max) };
    }
    if (asgObt && asgMax) {
      marks.assignments = { obtained: parseFloat(asgObt), max: parseFloat(asgMax) };
    }
    if (pracObt && pracMax) {
      marks.practicals = { obtained: parseFloat(pracObt), max: parseFloat(pracMax) };
    }
    if (thObt && thMax) {
      marks.theory = { obtained: parseFloat(thObt), max: parseFloat(thMax) };
    }

    onSaveMarks(activeSubjectTab, marks);
    setIsMarksModalOpen(false);
  };

  const summary: PerformanceSummary = Target98Engine.calculatePerformance(performance);

  return (
    <div className="space-y-6">
      
      {/* 1. TOP TARGET 98% HERO CARD */}
      <div className="relative overflow-hidden p-6 md:p-8 bg-[#0C1214] border border-cyan-500/30 shadow-2xl">
        <div className="absolute right-0 bottom-0 text-9xl font-black tracking-tighter leading-none text-white/[0.02] select-none pointer-events-none uppercase font-display">
          98%
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-400 text-black text-[9px] font-mono font-black uppercase tracking-widest flex items-center gap-1">
                <Target className="w-3 h-3 stroke-[3]" />
                <span>OFFICIAL GOAL</span>
              </span>
              <span className="px-2.5 py-0.5 bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-[9px] font-mono font-bold uppercase tracking-wider">
                COMPUTER ENGINEERING · TYCO-2
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight flex items-baseline gap-3">
              <span>ACADEMIC TARGET: 98%</span>
            </h3>

            <p className="text-xs font-mono text-white/50 max-w-xl leading-relaxed">
              Performance metrics across Class Tests, Assignments, Practicals, and Theory exams. All evaluations are derived strictly from your entered results.
            </p>
          </div>

          {/* Target vs Actual Gauge */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            {/* Target Display */}
            <div className="p-5 bg-black/60 border border-amber-400/40 text-center min-w-[140px] space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] font-black text-amber-400">
                TARGET
              </div>
              <div className="text-4xl font-mono font-black text-white tabular-nums">
                98.0%
              </div>
              <div className="text-[9px] font-mono text-white/40 uppercase">
                EXCELLENCE BENCHMARK
              </div>
            </div>

            {/* Current Performance Card */}
            <div className="p-5 bg-black/60 border border-cyan-400/40 text-center min-w-[200px] space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] font-black text-cyan-400">
                CURRENT STANDING
              </div>
              {summary.hasEnoughData && summary.currentPercentage !== null ? (
                <>
                  <div className="text-4xl font-mono font-black text-cyan-300 tabular-nums">
                    {summary.currentPercentage}%
                  </div>
                  <div className={`text-[10px] font-mono font-bold uppercase ${
                    (summary.gap || 0) <= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {(summary.gap || 0) <= 0
                      ? '✓ TARGET ACHIEVED / ON TRACK'
                      : `GAP: -${summary.gap}% TO TARGET`}
                  </div>
                </>
              ) : (
                <div className="py-2 text-[11px] font-mono text-white/60 leading-tight">
                  Not enough data to calculate current percentage.
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMarksModalOpen(true)}
              className="px-5 py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>ENTER MARKS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. COMPONENT BREAKDOWN TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Class Tests */}
        <div className="p-5 bg-[#0C1214] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/50 uppercase font-bold text-[10px]">CLASS TESTS (CT)</span>
            <span className="text-amber-400 font-bold">25M</span>
          </div>
          <div className="text-2xl font-mono font-black text-white tabular-nums">
            {summary.ctPercentage !== null ? `${summary.ctPercentage}%` : '—'}
          </div>
          <div className="text-[10px] font-mono text-white/40 uppercase">
            CT-1 (SEP) & CT-2 (OCT)
          </div>
        </div>

        {/* Assignments */}
        <div className="p-5 bg-[#0C1214] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/50 uppercase font-bold text-[10px]">ASSIGNMENTS</span>
            <span className="text-cyan-400 font-bold">25M</span>
          </div>
          <div className="text-2xl font-mono font-black text-white tabular-nums">
            {summary.assignmentPercentage !== null ? `${summary.assignmentPercentage}%` : '—'}
          </div>
          <div className="text-[10px] font-mono text-white/40 uppercase">
            HOMEWORK & COMPARISONS
          </div>
        </div>

        {/* Practicals */}
        <div className="p-5 bg-[#0C1214] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/50 uppercase font-bold text-[10px]">PRACTICAL LABS</span>
            <span className="text-rose-400 font-bold">50M</span>
          </div>
          <div className="text-2xl font-mono font-black text-white tabular-nums">
            {summary.practicalPercentage !== null ? `${summary.practicalPercentage}%` : '—'}
          </div>
          <div className="text-[10px] font-mono text-white/40 uppercase">
            MANUALS & ORAL VIVAS
          </div>
        </div>

        {/* Theory / Prelims */}
        <div className="p-5 bg-[#0C1214] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/50 uppercase font-bold text-[10px]">THEORY EXAMS</span>
            <span className="text-emerald-400 font-bold">70M</span>
          </div>
          <div className="text-2xl font-mono font-black text-white tabular-nums">
            {summary.theoryPercentage !== null ? `${summary.theoryPercentage}%` : '—'}
          </div>
          <div className="text-[10px] font-mono text-white/40 uppercase">
            MSBTE BOARD WRITTEN
          </div>
        </div>
      </div>

      {/* 3. AI STRATEGIC TARGET ROADMAP */}
      <div className="p-6 bg-[#081014] border border-cyan-500/30 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 font-black font-mono text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>SOUL STRATEGIC ADVISORY · 98% TRAJECTORY</span>
        </div>
        <p className="text-sm font-sans text-white/90 leading-relaxed">
          {summary.aiStrategicAdvice}
        </p>
      </div>

      {/* 4. MARKS ENTRY MODAL */}
      {isMarksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#0C1214] p-6 md:p-8 border border-white/20 shadow-2xl space-y-5 animate-in fade-in">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/5 border border-cyan-400/30 text-cyan-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">
                    ENTER ACTUAL MARKS & SCORES
                  </h3>
                  <p className="text-xs font-mono text-white/50 uppercase">
                    INPUT ACTUAL CLASS TEST, MANUAL & PRELIM RESULTS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMarksModalOpen(false)}
                className="p-2 bg-white/5 text-white/40 hover:text-white border border-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subject Switcher Tabs */}
            <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10">
              {['CLC', 'OSY', 'STE'].map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelectSubjectTab(code)}
                  className={`flex-1 py-2 font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                    activeSubjectTab === code
                      ? 'bg-cyan-400 text-black'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Marks Form */}
            <form onSubmit={handleSaveSubjectMarks} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                {/* CT-1 */}
                <div className="p-3 bg-white/5 border border-white/10 space-y-1.5">
                  <label className="text-white/70 block uppercase font-bold text-[10px]">
                    Class Test 1 (CT-1)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={ct1Max}
                      placeholder="Obt"
                      value={ct1Obt}
                      onChange={(e) => setCt1Obt(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <span className="text-white/40">/</span>
                    <input
                      type="number"
                      value={ct1Max}
                      onChange={(e) => setCt1Max(e.target.value)}
                      className="w-16 px-2.5 py-1.5 bg-black/40 border border-white/10 text-white/60 text-xs font-mono text-center"
                    />
                  </div>
                </div>

                {/* CT-2 */}
                <div className="p-3 bg-white/5 border border-white/10 space-y-1.5">
                  <label className="text-white/70 block uppercase font-bold text-[10px]">
                    Class Test 2 (CT-2)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={ct2Max}
                      placeholder="Obt"
                      value={ct2Obt}
                      onChange={(e) => setCt2Obt(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <span className="text-white/40">/</span>
                    <input
                      type="number"
                      value={ct2Max}
                      onChange={(e) => setCt2Max(e.target.value)}
                      className="w-16 px-2.5 py-1.5 bg-black/40 border border-white/10 text-white/60 text-xs font-mono text-center"
                    />
                  </div>
                </div>

                {/* Assignments */}
                <div className="p-3 bg-white/5 border border-white/10 space-y-1.5">
                  <label className="text-white/70 block uppercase font-bold text-[10px]">
                    Assignments / Homework
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={asgMax}
                      placeholder="Obt"
                      value={asgObt}
                      onChange={(e) => setAsgObt(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <span className="text-white/40">/</span>
                    <input
                      type="number"
                      value={asgMax}
                      onChange={(e) => setAsgMax(e.target.value)}
                      className="w-16 px-2.5 py-1.5 bg-black/40 border border-white/10 text-white/60 text-xs font-mono text-center"
                    />
                  </div>
                </div>

                {/* Practicals */}
                <div className="p-3 bg-white/5 border border-white/10 space-y-1.5">
                  <label className="text-white/70 block uppercase font-bold text-[10px]">
                    Lab Manual & Viva
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={pracMax}
                      placeholder="Obt"
                      value={pracObt}
                      onChange={(e) => setPracObt(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <span className="text-white/40">/</span>
                    <input
                      type="number"
                      value={pracMax}
                      onChange={(e) => setPracMax(e.target.value)}
                      className="w-16 px-2.5 py-1.5 bg-black/40 border border-white/10 text-white/60 text-xs font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Theory / Prelim */}
              <div className="p-3 bg-white/5 border border-white/10 space-y-1.5">
                <label className="text-white/70 block uppercase font-bold text-[10px]">
                  Theory Prelim / Board Written Exam
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={thMax}
                    placeholder="Obtained Marks e.g. 68"
                    value={thObt}
                    onChange={(e) => setThObt(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <span className="text-white/40">/</span>
                  <input
                    type="number"
                    value={thMax}
                    onChange={(e) => setThMax(e.target.value)}
                    className="w-20 px-2.5 py-1.5 bg-black/40 border border-white/10 text-white/60 text-xs font-mono text-center"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMarksModalOpen(false)}
                  className="px-4 py-2 bg-white/5 text-white/50 hover:text-white font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase tracking-wider text-xs cursor-pointer"
                >
                  SAVE MARKS FOR {activeSubjectTab}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
