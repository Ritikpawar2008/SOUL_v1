import React from 'react';
import { 
  Plus, 
  Sparkles, 
  Settings, 
  Clock, 
  Flame,
  Download,
  Info
} from 'lucide-react';
import { UserPreferences } from '../types';
import { SoulSymbol } from './SoulSymbol';

interface HeaderProps {
  preferences: UserPreferences;
  currentTime: Date;
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  completedTasksCount: number;
  totalTasksCount: number;
  todayProgressPercent: number;
  activeTab: string;
  onSimulateTimeChange?: (timeStr: string) => void;
  isInstallable?: boolean;
  onInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  preferences,
  currentTime,
  onOpenQuickAdd,
  onOpenSettings,
  onOpenAbout,
  completedTasksCount,
  totalTasksCount,
  todayProgressPercent,
  activeTab,
  onSimulateTimeChange,
  isInstallable = false,
  onInstall,
}) => {
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#080C0D]/90 backdrop-blur-xl px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenAbout}
            title="About SOUL — Created & Managed by Ritik Pawar"
            className="flex items-center gap-2.5 group cursor-pointer text-left"
          >
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border border-cyan-400/30 bg-cyan-400/5 group-hover:border-cyan-400 transition-colors shadow-sm">
              <SoulSymbol size={28} className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg sm:text-xl tracking-tighter text-white uppercase group-hover:text-cyan-400 transition-colors">
                  SOUL
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase font-mono tracking-[0.2em] font-bold px-1.5 py-0.2 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                  ACTIVE
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] tracking-wider font-mono uppercase text-white/40 truncate max-w-[160px] sm:max-w-[240px]">
                {preferences.collegeName.split(' ')[0]} · {preferences.semester}
              </p>
            </div>
          </button>
        </div>

        {/* Center: Live Time & Metric Pills (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Time Card */}
          <div className="flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-white/5 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-white font-bold">{formattedTime}</span>
            <span className="text-white/30">|</span>
            <span className="text-white/60 uppercase text-[11px] tracking-wider">{formattedDate}</span>
          </div>

          {/* Gym Status Reminder */}
          <div className="flex items-center gap-2 px-3 py-1.5 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-bold tracking-wider text-[11px] uppercase">GYM: 04:00 PM – 07:00 PM</span>
          </div>

          {/* Progress Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-xs font-mono">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">EFFICIENCY:</span>
            <span className="font-bold text-cyan-400 tabular-nums">{todayProgressPercent}%</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 justify-end">
          
          {/* PWA Install button in header if installable */}
          {isInstallable && onInstall && (
            <button
              onClick={onInstall}
              title="Install SOUL as a native mobile app"
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase text-[10px] sm:text-xs tracking-wider transition-colors cursor-pointer active:scale-95 animate-pulse"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">INSTALL APP</span>
              <span className="sm:hidden">INSTALL</span>
            </button>
          )}

          {/* Quick Time Simulator trigger */}
          {onSimulateTimeChange && (
            <div className="relative group hidden sm:block">
              <select
                aria-label="Simulate Time of Day"
                className="text-xs font-mono bg-white/5 text-white/80 border border-white/15 px-2.5 py-1.5 sm:py-2 cursor-pointer hover:bg-white/10 transition focus:outline-none focus:border-cyan-400 tracking-wider uppercase text-[10px] sm:text-[11px]"
                onChange={(e) => onSimulateTimeChange(e.target.value)}
                defaultValue=""
              >
                <option value="" className="bg-[#080C0D] text-white">⏱️ SYSTEM CLOCK</option>
                <option value="10:15" className="bg-[#080C0D] text-white">10:15 AM (FREE GAP)</option>
                <option value="12:15" className="bg-[#080C0D] text-white">12:15 PM (FREE GAP)</option>
                <option value="15:00" className="bg-[#080C0D] text-white">03:00 PM (AVAILABLE)</option>
                <option value="16:30" className="bg-[#080C0D] text-white">04:30 PM (GYM TIME)</option>
                <option value="19:45" className="bg-[#080C0D] text-white">07:45 PM (DEEP STUDY)</option>
                <option value="21:30" className="bg-[#080C0D] text-white">09:30 PM (EVENING REVIEW)</option>
              </select>
            </div>
          )}

          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black font-black uppercase text-[11px] sm:text-xs tracking-wider sm:tracking-widest hover:bg-cyan-400 transition-colors cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>ADD</span>
          </button>

          {/* About Modal Button */}
          <button
            onClick={onOpenAbout}
            title="About SOUL & Creator"
            className="p-1.5 sm:p-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            title="System Preferences & Backup"
            className="p-1.5 sm:p-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
