import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  FileText, 
  HeartHandshake, 
  ExternalLink,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { SoulSymbol } from './SoulSymbol';
import { SignatureImage } from './SignatureImage';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplaySplash: () => void;
  canInstall?: boolean;
  onTriggerInstall?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onReplaySplash,
  canInstall = false,
  onTriggerInstall,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'about' | 'terms' | 'privacy' | 'credits'>('about');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#0C1214] border border-white/20 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto p-6 md:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <SoulSymbol size={32} className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-display font-black text-white uppercase tracking-tight">
                ABOUT SOUL
              </h3>
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                SYSTEM INFORMATION & CREDITS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 border-b border-white/10 pb-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('about')}
            className={`px-3 py-1.5 uppercase font-bold tracking-wider transition cursor-pointer ${
              activeSubTab === 'about' ? 'bg-cyan-400 text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSubTab('credits')}
            className={`px-3 py-1.5 uppercase font-bold tracking-wider transition cursor-pointer ${
              activeSubTab === 'credits' ? 'bg-cyan-400 text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            Credits
          </button>
          <button
            onClick={() => setActiveSubTab('privacy')}
            className={`px-3 py-1.5 uppercase font-bold tracking-wider transition cursor-pointer ${
              activeSubTab === 'privacy' ? 'bg-cyan-400 text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            Privacy
          </button>
          <button
            onClick={() => setActiveSubTab('terms')}
            className={`px-3 py-1.5 uppercase font-bold tracking-wider transition cursor-pointer ${
              activeSubTab === 'terms' ? 'bg-cyan-400 text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            Terms
          </button>
        </div>

        {/* 1. OVERVIEW & CREATOR SECTION */}
        {activeSubTab === 'about' && (
          <div className="space-y-6 text-center">
            
            <div className="space-y-1">
              <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase">
                SOUL
              </h2>
              <p className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-cyan-400">
                Smart Organized Universal Life
              </p>
              <div className="inline-block px-2.5 py-0.5 mt-1 bg-white/5 border border-white/10 text-[10px] font-mono text-white/50 uppercase tracking-widest">
                Version 1.0 (Production Build)
              </div>
            </div>

            {/* Creator & Handwritten Signature */}
            <div className="p-5 bg-white/[0.03] border border-white/10 space-y-3">
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/50">
                Created & Managed by
              </p>
              <h3 className="text-xl font-display font-bold text-white tracking-normal">
                Ritik Pawar
              </h3>

              <div className="flex items-center justify-center py-1">
                <SignatureImage
                  className="w-52 h-20 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                  color="#22d3ee"
                  glow={true}
                />
              </div>
            </div>

            {/* Core Mission Description */}
            <p className="text-xs text-white/80 leading-relaxed font-sans text-left bg-white/5 p-4 border border-white/10">
              "SOUL is a personal AI-powered student life management system designed to help students organize their time, academics, productivity, fitness, focus and personal life."
            </p>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={onReplaySplash}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Replay Launch Intro</span>
              </button>

              {canInstall && onTriggerInstall ? (
                <button
                  onClick={onTriggerInstall}
                  className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-xs font-mono font-black uppercase tracking-wider text-black flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Install App on Phone</span>
                </button>
              ) : (
                <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PWA Ready & Offline</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. CREDITS */}
        {activeSubTab === 'credits' && (
          <div className="space-y-4 text-xs font-mono">
            <h4 className="text-xs font-mono font-black text-cyan-400 uppercase tracking-[0.2em]">
              PROJECT ARCHITECTURE & CREDITS
            </h4>
            <div className="space-y-3 bg-white/5 p-4 border border-white/10 text-white/80">
              <div>
                <span className="text-white/40 block text-[10px] uppercase">Creator, Developer & Designer</span>
                <strong className="text-white font-bold text-sm">Ritik Pawar</strong>
              </div>
              <div>
                <span className="text-white/40 block text-[10px] uppercase">Institution Target</span>
                <span>Vidyavardhini's Bhausaheb Vartak Polytechnic — Vasai Road (W)</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px] uppercase">Course Curriculum</span>
                <span>Third Year Diploma in Computer Engineering (TYCO-2)</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px] uppercase">AI Framework</span>
                <span>Google Gemini AI Multimodal Engine & Smart Scheduling Heuristics</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. PRIVACY */}
        {activeSubTab === 'privacy' && (
          <div className="space-y-3 text-xs font-sans text-white/80">
            <h4 className="text-xs font-mono font-black text-cyan-400 uppercase tracking-[0.2em]">
              DATA & PRIVACY POLICY
            </h4>
            <div className="p-4 bg-white/5 border border-white/10 space-y-2.5 text-xs leading-relaxed">
              <p>
                <strong>100% Local & Encrypted Storage:</strong> All your college timetable entries, subject syllabus completions, manual tracking, study history, and preferences are stored securely on your device.
              </p>
              <p>
                <strong>Zero Tracking:</strong> SOUL does not sell or share student data with third-party advertisers. All intelligence is processed directly to optimize your personal productivity.
              </p>
              <p>
                <strong>Offline Accessibility:</strong> Through the Service Worker caching layer, your schedule, timetable, and study manuals remain fully accessible even when you are on airplane mode or in low-connectivity classrooms.
              </p>
            </div>
          </div>
        )}

        {/* 4. TERMS */}
        {activeSubTab === 'terms' && (
          <div className="space-y-3 text-xs font-sans text-white/80">
            <h4 className="text-xs font-mono font-black text-cyan-400 uppercase tracking-[0.2em]">
              TERMS OF SERVICE
            </h4>
            <div className="p-4 bg-white/5 border border-white/10 space-y-2 text-xs leading-relaxed">
              <p>
                <strong>Personal Student Operating System:</strong> SOUL is provided as an adaptive student management system for academic scheduling, study assistance, and habit formation.
              </p>
              <p>
                <strong>Intellectual Property:</strong> Created & Managed by <strong>Ritik Pawar</strong>. All branding, SOUL abstract symbols, and interface layouts are protected.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
