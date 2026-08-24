import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  X, 
  Sparkles, 
  ShieldAlert, 
  Skull, 
  Zap, 
  AlertTriangle,
  HeartPulse,
  Briefcase,
  Plane,
  Bed,
  HelpCircle
} from 'lucide-react';
import { RoastItem, SoulRoastSettings, TaskSkipReason } from '../types';
import { RoastEngine } from '../lib/roastEngine';

interface SoulRoastBannerProps {
  roastSettings: SoulRoastSettings;
}

export const SoulRoastBanner: React.FC<SoulRoastBannerProps> = ({ roastSettings }) => {
  const [activeRoast, setActiveRoast] = useState<RoastItem | null>(null);

  useEffect(() => {
    const handleRoastEvent = (e: any) => {
      if (e.detail) {
        setActiveRoast(e.detail);
      }
    };
    window.addEventListener('soul_roast_triggered', handleRoastEvent);
    return () => window.removeEventListener('soul_roast_triggered', handleRoastEvent);
  }, []);

  if (!activeRoast || !roastSettings.enabled) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 md:p-5 bg-[#0C1214] border-2 border-rose-500 shadow-2xl shadow-rose-950/50 flex items-start gap-3">
        
        <div className="p-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
          <Flame className="w-5 h-5 animate-bounce text-orange-400" />
        </div>

        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-rose-500 text-black text-[9px] font-mono font-black uppercase tracking-widest">
                SOUL ROAST · {activeRoast.intensity.toUpperCase()}
              </span>
              {activeRoast.taskTitle && (
                <span className="text-[10px] font-mono text-white/50 truncate max-w-[130px]">
                  {activeRoast.taskTitle}
                </span>
              )}
            </div>

            <button
              onClick={() => setActiveRoast(null)}
              className="text-white/40 hover:text-white transition cursor-pointer p-1"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs sm:text-sm font-sans font-bold text-white leading-relaxed">
            {activeRoast.message}
          </p>

          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-white/40">
            <span>{activeRoast.timestamp}</span>
            <button
              onClick={() => setActiveRoast(null)}
              className="text-cyan-400 hover:text-cyan-300 uppercase font-black tracking-wider cursor-pointer"
            >
              LOCK IN NOW →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

interface SkipReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  onConfirmSkip: (reason: TaskSkipReason) => void;
}

export const SkipReasonModal: React.FC<SkipReasonModalProps> = ({
  isOpen,
  onClose,
  taskTitle,
  onConfirmSkip,
}) => {
  if (!isOpen) return null;

  const reasons: { id: TaskSkipReason; label: string; icon: any; exempt: boolean }[] = [
    { id: 'health', label: 'Health / Sick / Headache', icon: HeartPulse, exempt: true },
    { id: 'college_work', label: 'Urgent College / Submission Work', icon: Briefcase, exempt: true },
    { id: 'emergency', label: 'Family / Personal Emergency', icon: AlertTriangle, exempt: true },
    { id: 'travel', label: 'Travel / Commute Delay', icon: Plane, exempt: true },
    { id: 'rest', label: 'Physical Rest & Recovery After Gym', icon: Bed, exempt: true },
    { id: 'no_reason', label: 'No Specific Reason (Procrastination)', icon: Skull, exempt: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0C1214] p-6 border border-white/20 shadow-2xl space-y-4 animate-in fade-in">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h4 className="font-display font-black text-base uppercase">REASON FOR SKIPPING TASK</h4>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs font-mono text-white/60">
          Target: <span className="text-white font-bold">{taskTitle}</span>
        </p>

        <p className="text-[11px] font-mono text-cyan-300 bg-cyan-400/10 p-2.5 border border-cyan-400/20">
          ℹ️ Valid exemptions (Health, Emergency, College work, Rest) are protected from SOUL Roast accountability notifications.
        </p>

        <div className="space-y-2">
          {reasons.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                onClick={() => {
                  onConfirmSkip(r.id);
                  onClose();
                }}
                className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs font-mono text-white hover:border-cyan-400/40 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold">{r.label}</span>
                </div>
                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 ${
                  r.exempt ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                }`}>
                  {r.exempt ? 'EXEMPT' : 'ROAST TRIGGER'}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
