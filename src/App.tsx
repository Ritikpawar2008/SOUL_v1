import React, { useState, useEffect } from 'react';
import { 
  AcademicTask, 
  ActivityHistoryItem, 
  HabitGoal, 
  Subject, 
  TimetableSlot, 
  UserPreferences,
  PostGymSlot
} from './types';
import { StorageService } from './lib/storage';
import { Header } from './components/Header';
import { Navigation, NavTabId } from './components/Navigation';
import { TodayView } from './components/TodayView';
import { PlannerView } from './components/PlannerView';
import { AcademicsView } from './components/AcademicsView';
import { FocusView } from './components/FocusView';
import { GoalsView } from './components/GoalsView';
import { LifeView } from './components/LifeView';
import { SoulAiView } from './components/SoulAiView';
import { QuickAddModal } from './components/QuickAddModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { SplashScreen } from './components/SplashScreen';
import { MobileBottomNav } from './components/MobileBottomNav';
import { InstallPromptBanner } from './components/InstallPromptBanner';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTabId>('today');

  // Application Data States (Hydrated from StorageService)
  const [preferences, setPreferences] = useState<UserPreferences>(StorageService.getPreferences());
  const [timetable, setTimetable] = useState<TimetableSlot[]>(StorageService.getTimetable());
  const [subjects, setSubjects] = useState<Subject[]>(StorageService.getSubjects());
  const [tasks, setTasks] = useState<AcademicTask[]>(StorageService.getTasks());
  const [habits, setHabits] = useState<HabitGoal[]>(StorageService.getHabits());
  const [history, setHistory] = useState<ActivityHistoryItem[]>(StorageService.getActivityHistory());
  const [postGymRoutine, setPostGymRoutine] = useState<PostGymSlot[]>(StorageService.getPostGymRoutine());

  // Clock & Time Simulation State
  const [systemTime, setSystemTime] = useState<Date>(new Date());
  const [simulatedTimeOffset, setSimulatedTimeOffset] = useState<number | null>(null);

  // Active Session State (shared between Today, Focus, etc.)
  const [activeSession, setActiveSession] = useState<{
    active: boolean;
    title: string;
    subjectCode: string;
    unitNumber?: number;
    taskId?: string;
    startTime: number;
    durationMinutes: number;
    paused: boolean;
    pausedAt?: number;
    totalPausedTime: number;
  } | null>(null);

  // Modals & Overlays
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    // Show splash once per browser session
    return !sessionStorage.getItem('soul_splash_shown');
  });

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissInstallBanner, setDismissInstallBanner] = useState(false);

  // Check URL params for PWA shortcuts (e.g. ?tab=focus)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab') as NavTabId;
    if (tabParam && ['today', 'planner', 'academics', 'focus', 'goals', 'life', 'soul_ai'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  // Listen for PWA beforeinstallprompt
  useEffect(() => {
    // Check if in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      alert('To install SOUL:\n• On Android/Chrome: Tap Chrome menu (⋮) -> "Install App" or "Add to Home screen"\n• On iOS/Safari: Tap Share -> "Add to Home Screen"');
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem('soul_splash_shown', 'true');
  };

  const handleReplaySplash = () => {
    setIsSettingsOpen(false);
    setShowSplash(true);
  };

  // Real-time Clock Tick
  useEffect(() => {
    const timer = setInterval(() => {
      if (simulatedTimeOffset === null) {
        setSystemTime(new Date());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [simulatedTimeOffset]);

  // Hydrate from Supabase Cloud on mount if connected
  useEffect(() => {
    StorageService.hydrateFromSupabase().then(synced => {
      if (synced) {
        setPreferences(StorageService.getPreferences());
        setTimetable(StorageService.getTimetable());
        setSubjects(StorageService.getSubjects());
        setTasks(StorageService.getTasks());
        setHabits(StorageService.getHabits());
        setHistory(StorageService.getActivityHistory());
        setPostGymRoutine(StorageService.getPostGymRoutine());
      }
    });
  }, []);

  // Listen to Storage Sync Events
  useEffect(() => {
    const handleStorageChange = () => {
      setPreferences(StorageService.getPreferences());
      setTimetable(StorageService.getTimetable());
      setSubjects(StorageService.getSubjects());
      setTasks(StorageService.getTasks());
      setHabits(StorageService.getHabits());
      setHistory(StorageService.getActivityHistory());
      setPostGymRoutine(StorageService.getPostGymRoutine());
    };
    window.addEventListener('soul_data_changed', handleStorageChange);
    window.addEventListener('soul_supabase_config_changed', handleStorageChange);
    return () => {
      window.removeEventListener('soul_data_changed', handleStorageChange);
      window.removeEventListener('soul_supabase_config_changed', handleStorageChange);
    };
  }, []);

  // Time simulation handler
  const handleSimulateTimeChange = (timeStr: string) => {
    if (!timeStr) {
      setSimulatedTimeOffset(null);
      setSystemTime(new Date());
      return;
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    setSimulatedTimeOffset(hours * 60 + minutes);
    setSystemTime(d);
  };

  // State Update Handlers
  const handleUpdateTimetable = (newSlots: TimetableSlot[]) => {
    setTimetable(newSlots);
    StorageService.saveTimetable(newSlots);
  };

  const handleUpdateSubjects = (newSubjects: Subject[]) => {
    setSubjects(newSubjects);
    StorageService.saveSubjects(newSubjects);
  };

  const handleUpdateTasks = (newTasks: AcademicTask[]) => {
    setTasks(newTasks);
    StorageService.saveTasks(newTasks);
  };

  const handleUpdateHabits = (newHabits: HabitGoal[]) => {
    setHabits(newHabits);
    StorageService.saveHabits(newHabits);
  };

  const handleSavePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    StorageService.savePreferences(newPrefs);
  };

  const handleResetAllData = () => {
    StorageService.resetToDefault();
    setPreferences(StorageService.getPreferences());
    setTimetable(StorageService.getTimetable());
    setSubjects(StorageService.getSubjects());
    setTasks(StorageService.getTasks());
    setHabits(StorageService.getHabits());
    setHistory(StorageService.getActivityHistory());
  };

  // Study Session Handlers
  const handleStartStudySession = (item: {
    subjectCode: string;
    unitNumber?: number;
    title: string;
    taskId?: string;
  }) => {
    setActiveSession({
      active: true,
      title: item.title,
      subjectCode: item.subjectCode,
      unitNumber: item.unitNumber,
      taskId: item.taskId,
      startTime: Date.now(),
      durationMinutes: 45,
      paused: false,
      totalPausedTime: 0,
    });
  };

  const handleLogUnitStudy = (
    subjectCode: string,
    unitNumber: number,
    minutes: number,
    completed: boolean = false
  ) => {
    StorageService.logUnitStudySession(subjectCode, unitNumber, minutes, completed);
    setSubjects(StorageService.getSubjects());
    setHistory(StorageService.getActivityHistory());
  };

  const handleCompleteTask = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'completed' as const,
          progress: 100,
          completedAt: new Date().toISOString().split('T')[0],
        };
      }
      return t;
    });
    handleUpdateTasks(updated);

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      StorageService.logActivity({
        id: `act-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        subjectCode: task.subjectCode,
        title: `Completed: ${task.title}`,
        type: 'task',
        durationMinutes: task.estimatedMinutes,
        status: 'completed',
        progressMade: 100,
        notes: `Submitted ${task.type}`,
      });
      setHistory(StorageService.getActivityHistory());
    }
  };

  const handleAddQuickTasks = (newTasks: AcademicTask[]) => {
    const updated = [...newTasks, ...tasks];
    handleUpdateTasks(updated);
  };

  const handleUpdatePostGymRoutine = (newRoutine: PostGymSlot[]) => {
    setPostGymRoutine(newRoutine);
    StorageService.savePostGymRoutine(newRoutine);
  };

  // Progress metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalUnits = subjects.reduce((acc, s) => acc + s.units.length, 0);
  const completedUnits = subjects.reduce((acc, s) => acc + s.units.filter(u => u.status === 'completed').length, 0);
  const todayProgressPercent = Math.round(
    ((completedTasks + completedUnits) / Math.max(1, totalTasks + totalUnits)) * 100
  );

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const dueRevisionsCount = subjects.flatMap(s =>
    s.units.flatMap(u => u.revisions.filter(r => r.status === 'recommended'))
  ).length;

  return (
    <div className="min-h-screen bg-[#080C0D] text-white flex flex-col selection:bg-cyan-400 selection:text-black">
      
      {/* 0. INTRO SPLASH ANIMATION */}
      {showSplash && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}

      {/* 1. TOP HEADER */}
      <Header
        preferences={preferences}
        currentTime={systemTime}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        completedTasksCount={completedTasks}
        totalTasksCount={totalTasks}
        todayProgressPercent={todayProgressPercent}
        activeTab={activeTab}
        onSimulateTimeChange={handleSimulateTimeChange}
        isInstallable={isInstallable}
        onInstall={handleTriggerInstall}
      />

      {/* 2. NUMBERED 7-TAB NAVIGATION (Desktop) */}
      <div className="hidden md:block">
        <Navigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingTasksCount={pendingTasksCount}
          dueRevisionsCount={dueRevisionsCount}
        />
      </div>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
        
        {/* PWA Install Banner */}
        {isInstallable && !dismissInstallBanner && (
          <div className="mb-5">
            <InstallPromptBanner
              isInstallable={isInstallable}
              isInstalled={isInstalled}
              onInstall={handleTriggerInstall}
              onDismiss={() => setDismissInstallBanner(true)}
            />
          </div>
        )}

        {activeTab === 'today' && (
          <TodayView
            preferences={preferences}
            currentTime={systemTime}
            timetable={timetable}
            subjects={subjects}
            tasks={tasks}
            habits={habits}
            history={history}
            postGymRoutine={postGymRoutine}
            onUpdatePostGymRoutine={handleUpdatePostGymRoutine}
            onStartStudySession={handleStartStudySession}
            onCompleteTask={handleCompleteTask}
            onLogUnitStudy={handleLogUnitStudy}
            onNavigateTab={setActiveTab}
            activeSession={activeSession}
            setActiveSession={setActiveSession}
          />
        )}

        {activeTab === 'planner' && (
          <PlannerView
            timetable={timetable}
            preferences={preferences}
            onUpdateTimetable={handleUpdateTimetable}
            onStartStudySession={handleStartStudySession}
          />
        )}

        {activeTab === 'academics' && (
          <AcademicsView
            subjects={subjects}
            tasks={tasks}
            onUpdateSubjects={handleUpdateSubjects}
            onUpdateTasks={handleUpdateTasks}
            onStartStudySession={handleStartStudySession}
          />
        )}

        {activeTab === 'focus' && (
          <FocusView
            subjects={subjects}
            tasks={tasks}
            onLogStudySession={handleLogUnitStudy}
            onCompleteTask={handleCompleteTask}
            activeSession={activeSession}
            setActiveSession={setActiveSession}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            habits={habits}
            history={history}
            subjects={subjects}
            tasks={tasks}
            onUpdateHabits={handleUpdateHabits}
          />
        )}

        {activeTab === 'life' && (
          <LifeView
            preferences={preferences}
            currentTime={systemTime}
            subjects={subjects}
            tasks={tasks}
            postGymRoutine={postGymRoutine}
            onUpdatePostGymRoutine={handleUpdatePostGymRoutine}
            onStartStudySession={handleStartStudySession}
          />
        )}

        {activeTab === 'soul_ai' && (
          <SoulAiView
            preferences={preferences}
            currentTime={systemTime}
            timetable={timetable}
            subjects={subjects}
            tasks={tasks}
            history={history}
            onStartStudySession={handleStartStudySession}
            onNavigateTab={setActiveTab}
            onLogUnitStudy={handleLogUnitStudy}
          />
        )}
      </main>

      {/* 4. MOBILE BOTTOM NAVIGATION (Mobile devices) */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingCount={pendingTasksCount}
        activeSessionActive={!!activeSession?.active}
      />

      {/* 5. GLOBAL MODALS */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        subjects={subjects}
        onAddTasks={handleAddQuickTasks}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
        onResetAllData={handleResetAllData}
        onReplaySplash={handleReplaySplash}
        onOpenAbout={() => {
          setIsSettingsOpen(false);
          setIsAboutOpen(true);
        }}
        isInstallable={isInstallable}
        onTriggerInstall={handleTriggerInstall}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onTriggerInstall={handleTriggerInstall}
        isInstallable={isInstallable}
      />

    </div>
  );
}
