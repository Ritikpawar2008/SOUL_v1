import React, { useState } from 'react';
import {
  Terminal,
  Cpu,
  Code2,
  Layers,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Wrench,
  HelpCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Flame,
  Award,
  ArrowRight,
} from 'lucide-react';
import { TechnicalTopic, TechnicalTrackId } from '../../types';

interface TechnicalBeastSectionProps {
  topics: TechnicalTopic[];
  onUpdateTopicStatus: (id: string, status: TechnicalTopic['status'], userExplanation?: string) => void;
}

export const TechnicalBeastSection: React.FC<TechnicalBeastSectionProps> = ({
  topics,
  onUpdateTopicStatus,
}) => {
  const [activeTrack, setActiveTrack] = useState<TechnicalTrackId>('linux');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [activeStepTab, setActiveStepTab] = useState<'learn' | 'practice' | 'build' | 'explain'>('learn');
  const [explanationInput, setExplanationInput] = useState<string>('');

  const tracks: { id: TechnicalTrackId; label: string; icon: any; desc: string }[] = [
    { id: 'linux', label: 'LINUX & SYSADMIN', icon: Terminal, desc: 'Master the terminal as your daily technical working environment.' },
    { id: 'programming', label: 'PROGRAMMING & DSA', icon: Code2, desc: 'Problem solving, clean code, data structures & algorithms.' },
    { id: 'computer_science', label: 'CORE SYSTEMS (CS)', icon: Cpu, desc: 'CPU, RAM, cache lines, OS concurrency, threads & file systems.' },
    { id: 'development', label: 'FULL-STACK DEV', icon: Layers, desc: 'React, REST APIs, database indexing, and cloud deployments.' },
    { id: 'ai', label: 'AI & LLM ENGINEERING', icon: Sparkles, desc: 'Prompt engineering, structured schemas, embeddings & agent tools.' },
  ];

  const currentTrackTopics = topics.filter(t => t.trackId === activeTrack);
  const completedCount = currentTrackTopics.filter(t => t.status === 'completed').length;
  const trackProgress = currentTrackTopics.length > 0 ? Math.round((completedCount / currentTrackTopics.length) * 100) : 0;

  const handleToggleExpand = (topic: TechnicalTopic) => {
    if (expandedTopicId === topic.id) {
      setExpandedTopicId(null);
    } else {
      setExpandedTopicId(topic.id);
      setActiveStepTab(topic.status === 'not_started' ? 'learn' : topic.status === 'practicing' ? 'practice' : topic.status === 'building' ? 'build' : 'explain');
      setExplanationInput(topic.userExplanation || '');
    }
  };

  const handleAdvanceStep = (topic: TechnicalTopic, nextStatus: TechnicalTopic['status']) => {
    onUpdateTopicStatus(topic.id, nextStatus, explanationInput);
    if (nextStatus === 'completed') {
      setExpandedTopicId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* 1. Header Beast Banner */}
      <div className="p-6 md:p-8 bg-[#0C1214] border border-cyan-500/40 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 text-7xl md:text-9xl font-black tracking-tighter leading-none text-cyan-500/5 select-none pointer-events-none uppercase font-display">
          BEAST
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-[0.3em]">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>TECHNICAL BEAST MODE &middot; HIGH-LEVERAGE ENGINEERING</span>
          </div>

          <h3 className="text-2xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
            LEARN &rarr; PRACTICE &rarr; BUILD &rarr; EXPLAIN
          </h3>

          <p className="text-xs font-mono text-white/60 max-w-2xl">
            Never learn passively. For every technical concept: understand it deeply (&ldquo;Learn&rdquo;), test it in the terminal or IDE (&ldquo;Practice&rdquo;), construct a real utility (&ldquo;Build&rdquo;), and teach it in your own words (&ldquo;Explain&rdquo;).
          </p>
        </div>
      </div>

      {/* 2. Track Navigation Pills */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {tracks.map((track) => {
          const Icon = track.icon;
          const isSelected = activeTrack === track.id;
          const trackTopics = topics.filter(t => t.trackId === track.id);
          const done = trackTopics.filter(t => t.status === 'completed').length;

          return (
            <button
              key={track.id}
              onClick={() => {
                setActiveTrack(track.id);
                setExpandedTopicId(null);
              }}
              className={`p-3 text-left border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/50 text-white'
                  : 'bg-[#0C1214] border-white/10 hover:border-white/20 text-white/60 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-white/40'}`} />
                <span className="text-[9px] font-mono text-cyan-400 font-bold">
                  {done}/{trackTopics.length}
                </span>
              </div>
              <div>
                <span className="text-xs font-display font-bold uppercase tracking-tight block">
                  {track.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Track Header & Progress */}
      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 font-mono text-xs">
        <div>
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest block font-bold">
            CURRENT TRACK: {tracks.find(t => t.id === activeTrack)?.label}
          </span>
          <p className="text-white/60 text-[11px] mt-0.5">
            {tracks.find(t => t.id === activeTrack)?.desc}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-sm font-black text-white">{trackProgress}%</span>
          <span className="text-[9px] text-white/40 block uppercase tracking-wider">TRACK MASTERY</span>
        </div>
      </div>

      {/* 4. Progressive Topics Roadmap List */}
      <div className="space-y-3">
        {currentTrackTopics.map((topic, index) => {
          const isExpanded = expandedTopicId === topic.id;
          const isCompleted = topic.status === 'completed';

          return (
            <div
              key={topic.id}
              className={`border bg-[#0C1214] transition overflow-hidden ${
                isCompleted
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : isExpanded
                  ? 'border-cyan-400 ring-1 ring-cyan-400/30'
                  : 'border-white/10 hover:border-white/25'
              }`}
            >
              {/* Topic Header Row */}
              <div
                onClick={() => handleToggleExpand(topic)}
                className="p-4 md:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-cyan-400 font-bold shrink-0">
                    {index + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.2 bg-white/5 text-white/50 border border-white/10">
                        {topic.level}
                      </span>
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.2 border ${
                        topic.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : topic.status === 'explaining'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : topic.status === 'building'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : topic.status === 'practicing'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : 'bg-white/5 text-white/40 border-white/10'
                      }`}>
                        {topic.status === 'not_started' ? 'NOT STARTED' : topic.status}
                      </span>
                    </div>

                    <h4 className="text-sm md:text-base font-display font-black text-white uppercase tracking-tight mt-1">
                      {topic.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/40">
                  {isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* 5. Deep-Dive LEARN -> PRACTICE -> BUILD -> EXPLAIN Interactive Accordion */}
              {isExpanded && (
                <div className="p-5 border-t border-white/10 bg-[#080C0D] space-y-4 animate-in slide-in-from-top-2 duration-200 font-mono text-xs">
                  
                  {/* Step Selector Tabs */}
                  <div className="grid grid-cols-4 gap-1 border-b border-white/10 pb-2">
                    {[
                      { id: 'learn', label: '1. LEARN', icon: BookOpen },
                      { id: 'practice', label: '2. PRACTICE', icon: Terminal },
                      { id: 'build', label: '3. BUILD', icon: Wrench },
                      { id: 'explain', label: '4. EXPLAIN', icon: HelpCircle },
                    ].map((step) => {
                      const StepIcon = step.icon;
                      const isCurrentStep = activeStepTab === step.id;
                      return (
                        <button
                          key={step.id}
                          onClick={() => setActiveStepTab(step.id as any)}
                          className={`py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                            isCurrentStep
                              ? 'bg-cyan-400 text-black border-cyan-400'
                              : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                          }`}
                        >
                          <StepIcon className="w-3 h-3" />
                          <span>{step.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Step 1: LEARN */}
                  {activeStepTab === 'learn' && (
                    <div className="space-y-3 p-4 bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between text-cyan-400 font-bold uppercase text-[10px] tracking-widest">
                        <span>STEP 1: UNDERSTAND THE CORE CONCEPT</span>
                      </div>
                      <p className="text-white/80 leading-relaxed text-xs">
                        {topic.learnConcept}
                      </p>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setActiveStepTab('practice');
                            if (topic.status === 'not_started') {
                              onUpdateTopicStatus(topic.id, 'practicing');
                            }
                          }}
                          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase tracking-wider text-[11px] cursor-pointer flex items-center gap-1.5"
                        >
                          <span>PROCEED TO PRACTICE &rarr;</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: PRACTICE */}
                  {activeStepTab === 'practice' && (
                    <div className="space-y-3 p-4 bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between text-cyan-400 font-bold uppercase text-[10px] tracking-widest">
                        <span>STEP 2: RUN COMMANDS OR DRILLS</span>
                      </div>
                      <div className="p-3 bg-black border border-white/20 text-emerald-400 font-mono text-xs">
                        {topic.practicePrompt}
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setActiveStepTab('build');
                            onUpdateTopicStatus(topic.id, 'building');
                          }}
                          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase tracking-wider text-[11px] cursor-pointer flex items-center gap-1.5"
                        >
                          <span>PROCEED TO BUILD &rarr;</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: BUILD */}
                  {activeStepTab === 'build' && (
                    <div className="space-y-3 p-4 bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between text-amber-400 font-bold uppercase text-[10px] tracking-widest">
                        <span>STEP 3: CONSTRUCT A REAL MINI-TOOL / PROJECT</span>
                      </div>
                      <p className="text-white/80 text-xs">
                        {topic.buildPrompt}
                      </p>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setActiveStepTab('explain');
                            onUpdateTopicStatus(topic.id, 'explaining');
                          }}
                          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-[11px] cursor-pointer flex items-center gap-1.5"
                        >
                          <span>PROCEED TO EXPLAIN &rarr;</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: EXPLAIN (Feynman Comprehension Test) */}
                  {activeStepTab === 'explain' && (
                    <div className="space-y-3 p-4 bg-purple-950/20 border border-purple-500/30">
                      <div className="flex items-center justify-between text-purple-300 font-bold uppercase text-[10px] tracking-widest">
                        <span>STEP 4: PROVE COMPREHENSION (EXPLAIN IN YOUR OWN WORDS)</span>
                      </div>

                      <div className="p-3 bg-black/60 border border-purple-500/20 text-white/90 text-xs font-semibold">
                        &ldquo;{topic.explainQuestion}&rdquo;
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-white/50 uppercase tracking-widest block">
                          Your Explanation / Verification Summary:
                        </label>
                        <textarea
                          rows={3}
                          value={explanationInput}
                          onChange={(e) => setExplanationInput(e.target.value)}
                          placeholder="Explain clearly in your own words to prove deep understanding..."
                          className="w-full bg-black border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-purple-400"
                        />
                      </div>

                      <div className="pt-2 flex justify-between items-center">
                        <span className="text-[10px] text-white/40">
                          Marks this topic as 100% Mastered in your Beast Roadmap.
                        </span>
                        <button
                          onClick={() => handleAdvanceStep(topic, 'completed')}
                          disabled={!explanationInput.trim()}
                          className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-black font-bold uppercase tracking-wider text-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>COMPLETE & MASTER TOPIC</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
