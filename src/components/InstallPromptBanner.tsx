import React from 'react';
import { Smartphone, Download, CheckCircle, X, Sparkles } from 'lucide-react';
import { SoulSymbol } from './SoulSymbol';

interface InstallPromptBannerProps {
  isInstallable: boolean;
  onInstall: () => void;
  onDismiss: () => void;
  isInstalled: boolean;
}

export const InstallPromptBanner: React.FC<InstallPromptBannerProps> = ({
  isInstallable,
  onInstall,
  onDismiss,
  isInstalled,
}) => {
  if (isInstalled) {
    return null;
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#0C1A1D] via-[#0C1518] to-[#080C0D] border border-cyan-400/40 p-4 md:p-5 shadow-lg animate-in fade-in slide-in-from-top-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 shrink-0">
            <SoulSymbol size={28} className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest">
                OFFICIAL MOBILE APP
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono bg-cyan-400 text-black font-black uppercase">
                PWA READY
              </span>
            </div>
            <h4 className="text-sm md:text-base font-display font-black text-white uppercase tracking-tight">
              Install SOUL on your phone
            </h4>
            <p className="text-xs text-white/60 font-sans">
              Instant offline access, native standalone launch, and real-time student notifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={onDismiss}
            className="px-3 py-2 text-xs font-mono text-white/50 hover:text-white uppercase transition cursor-pointer"
          >
            Later
          </button>
          <button
            onClick={onInstall}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-black text-xs uppercase tracking-widest transition shadow-[0_0_15px_rgba(34,211,238,0.35)] cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>INSTALL APP</span>
          </button>
        </div>

      </div>
    </div>
  );
};
