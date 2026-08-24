import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Code
} from 'lucide-react';
import { UserPreferences } from '../types';
import { StorageService } from '../lib/storage';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  testSupabaseConnection, 
  isSupabaseConfigured 
} from '../lib/supabase';
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

  // Supabase state
  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseKey, setSupabaseKey] = useState(creds.key);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);

  const [importJsonText, setImportJsonText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const c = getSupabaseCredentials();
      setSupabaseUrl(c.url);
      setSupabaseKey(c.key);
    }
  }, [isOpen]);

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

  const handleSaveSupabaseConfig = () => {
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    setStatusMessage('Supabase credentials saved!');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleTestSupabase = async () => {
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    setIsTestingDb(true);
    setDbTestResult(null);
    const res = await testSupabaseConnection();
    setIsTestingDb(false);
    setDbTestResult(res);
  };

  const handleManualSyncNow = () => {
    StorageService.pushCurrentStateToCloud();
    setStatusMessage('Synced full state to Supabase cloud!');
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

  const SQL_SCHEMA_TEXT = `-- Copy & run in Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.soul_state (
    id TEXT PRIMARY KEY DEFAULT 'default',
    preferences JSONB DEFAULT '{}'::jsonb,
    timetable JSONB DEFAULT '[]'::jsonb,
    subjects JSONB DEFAULT '[]'::jsonb,
    tasks JSONB DEFAULT '[]'::jsonb,
    habits JSONB DEFAULT '[]'::jsonb,
    history JSONB DEFAULT '[]'::jsonb,
    focus_sessions JSONB DEFAULT '[]'::jsonb,
    post_gym_routine JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.soul_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access to soul_state" ON public.soul_state;
CREATE POLICY "Public access to soul_state" ON public.soul_state FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.soul_state (id, preferences, timetable, subjects, tasks, habits, history, post_gym_routine)
VALUES ('default', '{}'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;`;

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
              <p className="text-xs font-mono text-white/50 uppercase">PARAMETERS, CLOUD SYNC & BACKUP</p>
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

        {/* 2. SUPABASE REAL-TIME CLOUD PERSISTENCE */}
        <div className="space-y-4 p-5 bg-[#081014] border border-cyan-500/30 text-xs font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-black tracking-wider uppercase">
              <Database className="w-4 h-4" />
              <span>01 / SUPABASE CLOUD PERSISTENCE</span>
            </div>
            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${
              isSupabaseConfigured() ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-white/50'
            }`}>
              {isSupabaseConfigured() ? 'CONFIGURED' : 'LOCAL ONLY'}
            </span>
          </div>

          <p className="text-white/60 text-[11px] leading-relaxed">
            Connect your Supabase project to automatically save every progress update, task, habit, and schedule changes in the cloud across all your devices.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-white/50 block mb-1 uppercase font-bold">Supabase Project URL</label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 text-white focus:outline-none focus:border-cyan-400 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-white/50 block mb-1 uppercase font-bold">Supabase Anon Key or Service Role Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 text-white focus:outline-none focus:border-cyan-400 font-mono text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={isTestingDb || !supabaseUrl || !supabaseKey}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
                <span>{isTestingDb ? 'TESTING...' : 'TEST CONNECTION'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveSupabaseConfig}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase tracking-wider text-xs cursor-pointer"
              >
                SAVE CREDENTIALS
              </button>

              {isSupabaseConfigured() && (
                <button
                  type="button"
                  onClick={handleManualSyncNow}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>SYNC NOW</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowSqlModal(!showSqlModal)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 font-bold uppercase tracking-wider text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Code className="w-3.5 h-3.5" />
                <span>SQL QUERIES</span>
              </button>
            </div>

            {dbTestResult && (
              <div className={`p-3 border text-xs font-mono flex items-start gap-2 ${
                dbTestResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                {dbTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                <div>{dbTestResult.message}</div>
              </div>
            )}

            {showSqlModal && (
              <div className="p-4 bg-black/70 border border-white/20 space-y-2 mt-2">
                <div className="flex items-center justify-between text-white/70 text-xs">
                  <span>Supabase SQL Table Query:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SQL_SCHEMA_TEXT);
                      setStatusMessage('SQL Query copied to clipboard!');
                      setTimeout(() => setStatusMessage(null), 2500);
                    }}
                    className="px-2 py-1 bg-cyan-400 text-black font-black text-[10px] uppercase cursor-pointer"
                  >
                    Copy SQL
                  </button>
                </div>
                <pre className="p-3 bg-[#0C1214] text-cyan-300 font-mono text-[10px] overflow-x-auto border border-white/10 max-h-40">
                  {SQL_SCHEMA_TEXT}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* 3. Core Profile, Batch & Constraints */}
        <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
          <h4 className="text-xs font-mono font-black text-cyan-400 uppercase tracking-[0.2em]">
            02 / COLLEGE, BATCH & FIXED CONSTRAINTS
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="text-white/50 block mb-1 uppercase font-bold">Student Practical Batch</label>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2.5 bg-cyan-400 text-black font-black text-xs uppercase tracking-wider">
                  BATCH C ONLY
                </span>
                <span className="text-[10px] text-white/50 font-mono">
                  (Batches A, B & D excluded from timetable recommendations)
                </span>
              </div>
            </div>
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

          {/* SOUL ROAST & NOTIFICATION TOGGLES */}
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-black tracking-wider uppercase">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>SOUL ROAST & ACCOUNTABILITY ENGINE</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const updated = {
                    ...preferences,
                    roastSettings: {
                      ...preferences.roastSettings,
                      enabled: !preferences.roastSettings?.enabled,
                    },
                  };
                  onSavePreferences(updated);
                }}
                className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                  preferences.roastSettings?.enabled ? 'bg-rose-500 text-black' : 'bg-white/10 text-white/50'
                }`}
              >
                {preferences.roastSettings?.enabled ? 'ROAST ON' : 'ROAST OFF'}
              </button>
            </div>

            {/* Intensity Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] text-white/50 uppercase font-bold">Roast Intensity:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['friendly', 'savage', 'maximum'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...preferences,
                        roastSettings: {
                          ...preferences.roastSettings,
                          intensity: lvl,
                        },
                      };
                      onSavePreferences(updated);
                    }}
                    className={`py-1.5 text-[10px] font-mono font-black uppercase tracking-wider border ${
                      preferences.roastSettings?.intensity === lvl
                        ? 'bg-orange-500 text-black border-orange-500'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Granular Notification Toggles */}
            <div className="pt-2 border-t border-rose-500/20 space-y-1.5">
              <div className="text-[10px] text-white/50 uppercase font-bold">Notification Triggers:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-white/80">
                {[
                  { key: 'upcomingExam', label: 'Upcoming Exam Alert' },
                  { key: 'ct1Reminder', label: 'CT-1 Reminder' },
                  { key: 'ct2Reminder', label: 'CT-2 Reminder' },
                  { key: 'practicalExamReminder', label: 'Practical Exam Reminder' },
                  { key: 'theoryExamReminder', label: 'Theory Exam Reminder' },
                  { key: 'assignmentDeadline', label: 'Assignment Deadline' },
                  { key: 'manualDeadline', label: 'Manual Submission Deadline' },
                  { key: 'revisionReminder', label: 'Spaced Revision Reminder' },
                  { key: 'missedTaskRoast', label: 'Missed Task Roast' },
                  { key: 'postponedTaskRoast', label: 'Postponed Task Roast' },
                  { key: 'completedEncouragement', label: 'Completed Encouragement' },
                ].map(item => {
                  const currentVal = preferences.roastSettings?.notifications?.[item.key as keyof typeof preferences.roastSettings.notifications] ?? true;
                  return (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer p-1 bg-white/5 hover:bg-white/10">
                      <input
                        type="checkbox"
                        checked={currentVal}
                        onChange={() => {
                          const updated = {
                            ...preferences,
                            roastSettings: {
                              ...preferences.roastSettings,
                              notifications: {
                                ...preferences.roastSettings.notifications,
                                [item.key]: !currentVal,
                              },
                            },
                          };
                          onSavePreferences(updated);
                        }}
                        className="w-3.5 h-3.5 accent-rose-500 rounded"
                      />
                      <span className="truncate">{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-black font-mono text-xs uppercase tracking-wider transition cursor-pointer"
          >
            SAVE PREFERENCES
          </button>
        </form>

        {/* 4. Backup & Export */}
        <div className="space-y-4 pt-4 border-t border-white/10 text-xs font-mono">
          <h4 className="text-xs font-mono font-black text-cyan-400 uppercase tracking-[0.2em]">
            03 / DATA EXPORT & RESTORE
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

        {/* 5. Factory Reset */}
        <div className="space-y-3 pt-4 border-t border-white/10 text-xs font-mono">
          <h4 className="text-xs font-mono font-black text-rose-400 uppercase tracking-[0.2em]">
            04 / FACTORY RESET
          </h4>
          <p className="text-white/40 text-[10px] uppercase">
            RESTORES ALL COLLEGE TIMETABLE ENTRIES, SYLLABUS UNITS, MANUALS, AND HABIT STREAKS TO INITIAL DEFAULT STATE (0% PROGRESS).
          </p>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all SOUL data back to 0% initial state?')) {
                onResetAllData();
                onClose();
              }
            }}
            className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET EVERYTHING TO INITIAL STATE (0% PROGRESS)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
