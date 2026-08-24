import React, { useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  X, 
  Check, 
  Flame, 
  Clock, 
  ShieldAlert, 
  Copy,
  FileJson,
  Smartphone,
  Info,
  Sparkles
} from 'lucide-react';
import { UserPreferences } from '../types';
import { StorageService } from '../lib/storage';
import { SignatureImage } from './SignatureImage';
import { SoulSymbol } from './SoulSymbol';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
  onResetAllData: () => void;
  onReplaySplash?: () => void;
  onOpenAbout?: () => void;
  isInstallable?: boolean;
  onTriggerInstall?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  onResetAllData,
  onReplaySplash,
  onOpenAbout,
  isInstallable = false,
  onTriggerInstall,
}) => {
  const [collegeName, setCollegeName] = useState(preferences.collegeName);
  const [semester, setSemester] = useState(preferences.semester);
  const [gymStartTime, setGymStartTime] = useState(preferences.gymStartTime || '16:00');
  const [gymEndTime, setGymEndTime] = useState(preferences.gymEndTime || '19:00');

  const [importJsonText, setImportJsonText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences({
      ...preferences,
      collegeName,
      semester,
      gymStartTime,
      gymEndTime,
    });
    setStatusMessage('Preferences saved successfully!');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportFullBackup();
    navigator.clipboard.writeText(jsonStr);
    setStatusMessage('Full backup JSON copied to clipboard!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImportBackup = () => {
    if (!importJsonText.trim()) return;
    const success = StorageService.importFullBackup(importJsonText);
    if (success) {
      setStatusMessage('Data successfully imported and synchronized!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setStatusMessage('Error: Invalid JSON backup format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#0C1214] p-6 md:p-8 border border-white/20 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/5 border border-cyan-400/30 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">SYSTEM SETTINGS</h3>
              <p className="text-xs font-mono text-white/50 uppercase">PARAMETERS, APP & BACKUP</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 text-white/40 hover:text-white border border-white/10 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMessage && (
          <div className="p-3.5 bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider text-center animate-in fade-in">
            {statusMessage}
          </div>
        )}

        {/* 1. CREATOR & ABOUT BRANDING SECTION */}
        <div className="p-5 bg-white/[0.02] border border-cyan-400/25 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SoulSymbol size={26} className="w-6 h-6" />
              <div>
                <h4 className="text-base font-display font-black text-white uppercase tracking-tight">
                  SOUL <span className="text-xs font-mono text-cyan-400 font-bold ml-1">v1.0</span>
                </h4>
                <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                  Smart Organized Universal Life
                </p>
              </div>
            </div>

            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider cursor-pointer"
              >
                Full Details →
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">
                Created & Managed by
              </p>
              <h5 className="text-base font-display font-bold text-white tracking-normal">
                Ritik Pawar
              </h5>
            </div>

            <div className="flex items-center">
              <SignatureImage
                className="w-40 h-14 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                color="#22d3ee"
                glow={true}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10 text-xs font-mono">
            {onReplaySplash && (
              <button
                onClick={onReplaySplash}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-cyan-400" />
                <span>Replay Launch Intro</span>
              </button>
            )}

            {isInstallable && onTriggerInstall && (
              <button
                onClick={onTriggerInstall}
                className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase tracking-wider text-[10px] flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3 h-3" />
                <span>Install Mobile App</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Core Profile & Constraints */}
        <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
          <h4 className="text-xs font-mono font-black text-cyan-400 uppercase tracking-[0.2em]">
            01 / COLLEGE & FIXED CONSTRAINTS
          </h4>

          <div>
            <label className="text-white/50 block mb-1 uppercase font-bold">College / Polytechnic Name</label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans"
            />
          </div>

          <div>
            <label className="text-white/50 block mb-1 uppercase font-bold">Current Semester & Department</label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 bg-orange-500/10 border border-orange-500/30">
            <div>
              <label className="text-orange-300 block mb-1 font-black uppercase text-[10px] tracking-wider">Gym Start Time (24h)</label>
              <input
                type="time"
                value={gymStartTime}
                onChange={(e) => setGymStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-400 font-mono"
              />
            </div>

            <div>
              <label className="text-orange-300 block mb-1 font-black uppercase text-[10px] tracking-wider">Gym End Time (24h)</label>
              <input
                type="time"
                value={gymEndTime}
                onChange={(e) => setGymEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-400 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-black font-mono text-xs uppercase tracking-wider transition cursor-pointer"
          >
            SAVE PREFERENCES
          </button>
        </form>

        {/* 3. Backup & Export */}
        <div className="space-y-4 pt-4 border-t border-white/10 text-xs font-mono">
          <h4 className="text-xs font-mono font-black text-cyan-400 uppercase tracking-[0.2em]">
            02 / DATA EXPORT & SYNCHRONIZATION
          </h4>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportBackup}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Copy className="w-4 h-4 text-cyan-400" />
              <span>COPY FULL JSON BACKUP</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-white/40 block uppercase">Restore from JSON string:</label>
            <textarea
              rows={2}
              placeholder="Paste exported backup JSON here..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleImportBackup}
              disabled={!importJsonText.trim()}
              className="w-full py-2.5 bg-white text-black hover:bg-cyan-400 font-black uppercase tracking-wider disabled:opacity-30 cursor-pointer"
            >
              IMPORT BACKUP
            </button>
          </div>
        </div>

        {/* 4. Factory Reset */}
        <div className="space-y-3 pt-4 border-t border-white/10 text-xs font-mono">
          <h4 className="text-xs font-mono font-black text-rose-400 uppercase tracking-[0.2em]">
            03 / FACTORY RESET
          </h4>
          <p className="text-white/40 text-[10px] uppercase">
            RESTORES ALL COLLEGE TIMETABLE ENTRIES, SYLLABUS UNITS, MANUALS, AND HABIT STREAKS TO INITIAL DEFAULT STATE.
          </p>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all SOUL data back to default?')) {
                onResetAllData();
                onClose();
              }
            }}
            className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET EVERYTHING TO DEFAULT INITIAL STATE</span>
          </button>
        </div>

      </div>
    </div>
  );
};
