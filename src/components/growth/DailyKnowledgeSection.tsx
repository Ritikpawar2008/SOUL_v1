import React, { useState } from 'react';
import {
  Sparkles,
  Rocket,
  Cpu,
  Terminal,
  Heart,
  ChevronRight,
  BookOpen,
  HelpCircle,
  ExternalLink,
  Lightbulb,
} from 'lucide-react';
import { DailyKnowledgeItem } from '../../types';
import { GrowthEngine } from '../../lib/growthEngine';

export const DailyKnowledgeSection: React.FC = () => {
  const [knowledge, setKnowledge] = useState<DailyKnowledgeItem>(GrowthEngine.getTodayKnowledge());
  const [isSpaceDeepDiveOpen, setIsSpaceDeepDiveOpen] = useState<boolean>(false);

  return (
    <div className="space-y-6 font-mono text-xs">

      {/* 1. Header Banner */}
      <div className="p-5 md:p-6 bg-[#0C1214] border border-blue-500/40 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 text-7xl md:text-9xl font-black tracking-tighter leading-none text-blue-500/5 select-none pointer-events-none uppercase font-display">
          BYTE
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-[0.3em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DAILY KNOWLEDGE ENGINE &middot; ONE DEEP CONCEPT PER DAY</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight">
            SPACE BYTE &amp; TECH OF THE DAY
          </h3>

          <p className="text-xs text-white/60">
            Learn something fascinating every day without feeling like another assignment.
          </p>
        </div>
      </div>

      {/* 2. SPACE BYTE CARD */}
      <div className="p-5 md:p-6 bg-gradient-to-br from-[#060D1A] to-[#0A1628] border border-blue-500/50 relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-[10px] tracking-widest">
            <Rocket className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>SPACE BYTE &middot; DAILY COSMIC FACT</span>
          </div>
          <span className="text-[10px] text-white/40">{knowledge.date}</span>
        </div>

        <div className="space-y-2">
          <h4 className="text-base md:text-lg font-display font-bold text-white leading-snug">
            &ldquo;{knowledge.spaceByte.fact}&rdquo;
          </h4>

          <div className="pt-2">
            <button
              onClick={() => setIsSpaceDeepDiveOpen(!isSpaceDeepDiveOpen)}
              className="px-3.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition"
            >
              <span>{isSpaceDeepDiveOpen ? 'HIDE DEEP DIVE' : 'EXPLORE DEEP DIVE &rarr;'}</span>
            </button>
          </div>

          {isSpaceDeepDiveOpen && (
            <div className="p-4 bg-black/60 border border-blue-500/30 text-white/90 leading-relaxed text-xs animate-in slide-in-from-top-2 duration-200 mt-3">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block mb-1">
                SCIENTIFIC EXPLANATION
              </span>
              <p>{knowledge.spaceByte.deepDive}</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. TECH OF THE DAY CARD */}
      <div className="p-5 md:p-6 bg-[#0C1214] border border-cyan-500/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>TECH OF THE DAY &middot; DEEP ENGINEERING REASONING</span>
          </span>
          <span className="text-[10px] text-white/40">CONCEPTUAL MASTERY</span>
        </div>

        <h4 className="text-base md:text-lg font-display font-black text-white uppercase tracking-tight">
          {knowledge.techByte.question}
        </h4>

        <div className="p-4 bg-black/70 border border-white/10 text-white/80 space-y-2 leading-relaxed">
          <p className="whitespace-pre-line text-xs font-mono">
            {knowledge.techByte.explanation}
          </p>

          <div className="pt-2 border-t border-white/10 text-cyan-300 font-bold text-[11px]">
            💡 Core Takeaway: {knowledge.techByte.takeaway}
          </div>
        </div>
      </div>

      {/* 4. COMPUTER BYTE & LIFE BYTE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Computer Byte */}
        <div className="p-5 bg-[#0C1214] border border-white/10 space-y-2 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>COMPUTER BYTE</span>
            </span>
            <h5 className="text-sm font-display font-black text-white uppercase">
              {knowledge.computerByte.title}
            </h5>
            <p className="text-white/70 leading-relaxed text-[11px]">
              {knowledge.computerByte.concept}
            </p>
          </div>
        </div>

        {/* Life Byte */}
        <div className="p-5 bg-[#0C1214] border border-white/10 space-y-2 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              <span>LIFE BYTE &middot; FIRST PRINCIPLES</span>
            </span>
            <h5 className="text-sm font-display font-black text-white uppercase">
              {knowledge.lifeByte.principle}
            </h5>
            <p className="text-white/70 leading-relaxed text-[11px]">
              {knowledge.lifeByte.application}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
