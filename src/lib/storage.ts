import {
  AcademicTask,
  ActivityHistoryItem,
  DayOfWeek,
  FocusSession,
  HabitGoal,
  Subject,
  TimetableSlot,
  UserPreferences,
  PostGymSlot,
  MSBTECalendarEvent,
  AcademicPerformanceData,
  SoulRoastSettings,
  RoastItem,
  SubjectMarksEntry,
} from '../types';
import {
  INITIAL_ACADEMIC_TASKS,
  INITIAL_ACTIVITY_HISTORY,
  INITIAL_HABITS,
  INITIAL_PREFERENCES,
  INITIAL_SUBJECTS,
  INITIAL_TIMETABLE,
  INITIAL_POST_GYM_ROUTINE,
  INITIAL_MSBTE_CALENDAR,
  INITIAL_ACADEMIC_PERFORMANCE,
  INITIAL_ROAST_SETTINGS,
} from '../data/initialData';
import { triggerSupabaseSync, fetchStateFromSupabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PREFERENCES: 'soul_preferences_v5',
  TIMETABLE: 'soul_timetable_v5',
  SUBJECTS: 'soul_subjects_v5',
  TASKS: 'soul_tasks_v5',
  HABITS: 'soul_habits_v5',
  FOCUS_SESSIONS: 'soul_focus_sessions_v5',
  HISTORY: 'soul_history_v5',
  POST_GYM_ROUTINE: 'soul_post_gym_routine_v5',
  MSBTE_CALENDAR: 'soul_msbte_calendar_v5',
  PERFORMANCE: 'soul_performance_v5',
  ROAST_SETTINGS: 'soul_roast_settings_v5',
  ROAST_LOG: 'soul_roast_log_v5',
};

export class StorageService {
  static getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? JSON.parse(data) : INITIAL_PREFERENCES;
    } catch {
      return INITIAL_PREFERENCES;
    }
  }

  static savePreferences(prefs: UserPreferences): void {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    this.pushCurrentStateToCloud();
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  static getTimetable(): TimetableSlot[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
      return data ? JSON.parse(data) : INITIAL_TIMETABLE;
    } catch {
      return INITIAL_TIMETABLE;
    }
  }

  static saveTimetable(slots: TimetableSlot[]): void {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(slots));
    this.pushCurrentStateToCloud();
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  static getSubjects(): Subject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return data ? JSON.parse(data) : INITIAL_SUBJECTS;
    } catch {
      return INITIAL_SUBJECTS;
    }
  }

  static saveSubjects(subjects: Subject[]): void {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    this.pushCurrentStateToCloud();
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  static getTasks(): AcademicTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : INITIAL_ACADEMIC_TASKS;
    } catch {
      return INITIAL_ACADEMIC_TASKS;
    }
  }

  static saveTasks(tasks: AcademicTask[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.pushCurrentStateToCloud();
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  static getHabits(): HabitGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      return data ? JSON.parse(data) : INITIAL_HABITS;
    } catch {
      return INITIAL_HABITS;
    }
  }

  static saveHabits(habits: HabitGoal[]): void {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    this.pushCurrentStateToCloud();
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  static getFocusSessions(): FocusSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveFocusSession(session: FocusSession): void {
    const existing = this.getFocusSessions();
    localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify([session, ...existing]));
    this.pushCurrentStateToCloud();
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  static getActivityHistory(): ActivityHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : INITIAL_ACTIVITY_HISTORY;
    } catch {
      return INITIAL_ACTIVITY_HISTORY;
    }
  }

  static saveActivityHistory(items: ActivityHistoryItem[]): void {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(items));
    this.pushCurrentStateToCloud();
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  static logActivity(item: ActivityHistoryItem): void {
    const existing = this.getActivityHistory();
    this.saveActivityHistory([item, ...existing]);
  }

  // -------------------------------------------------------------
  // MSBTE CALENDAR METHODS
  // -------------------------------------------------------------
  static getMsbteCalendar(): MSBTECalendarEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MSBTE_CALENDAR);
      return data ? JSON.parse(data) : INITIAL_MSBTE_CALENDAR;
    } catch {
      return INITIAL_MSBTE_CALENDAR;
    }
  }

  static saveMsbteCalendar(events: MSBTECalendarEvent[]): void {
    localStorage.setItem(STORAGE_KEYS.MSBTE_CALENDAR, JSON.stringify(events));
    this.pushCurrentStateToCloud();
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  static toggleMsbteReminder(eventId: string): MSBTECalendarEvent[] {
    const calendar = this.getMsbteCalendar();
    const updated = calendar.map(e =>
      e.id === eventId ? { ...e, reminderEnabled: !e.reminderEnabled } : e
    );
    this.saveMsbteCalendar(updated);
    return updated;
  }

  // -------------------------------------------------------------
  // 98% TARGET & ACADEMIC PERFORMANCE METHODS
  // -------------------------------------------------------------
  static getAcademicPerformance(): AcademicPerformanceData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERFORMANCE);
      return data ? JSON.parse(data) : INITIAL_ACADEMIC_PERFORMANCE;
    } catch {
      return INITIAL_ACADEMIC_PERFORMANCE;
    }
  }

  static saveAcademicPerformance(data: AcademicPerformanceData): void {
    localStorage.setItem(STORAGE_KEYS.PERFORMANCE, JSON.stringify(data));
    this.pushCurrentStateToCloud();
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  static saveSubjectMarks(subjectCode: string, marks: SubjectMarksEntry): void {
    const current = this.getAcademicPerformance();
    const updated: AcademicPerformanceData = {
      ...current,
      scores: {
        ...current.scores,
        [subjectCode]: marks,
      },
      lastUpdated: new Date().toISOString(),
    };
    this.saveAcademicPerformance(updated);
  }

  // -------------------------------------------------------------
  // SOUL ROAST METHODS
  // -------------------------------------------------------------
  static getRoastSettings(): SoulRoastSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROAST_SETTINGS);
      return data ? JSON.parse(data) : INITIAL_ROAST_SETTINGS;
    } catch {
      return INITIAL_ROAST_SETTINGS;
    }
  }

  static saveRoastSettings(settings: SoulRoastSettings): void {
    localStorage.setItem(STORAGE_KEYS.ROAST_SETTINGS, JSON.stringify(settings));
    this.pushCurrentStateToCloud();
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  static getRoastLog(): RoastItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROAST_LOG);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static logRoast(roast: RoastItem): void {
    const existing = this.getRoastLog();
    localStorage.setItem(STORAGE_KEYS.ROAST_LOG, JSON.stringify([roast, ...existing.slice(0, 49)]));
    window.dispatchEvent(new CustomEvent('soul_roast_triggered', { detail: roast }));
  }

  /**
   * Updates unit progress based on actual study duration.
   */
  static logUnitStudySession(
    subjectCode: string,
    unitNumber: number,
    studiedMinutes: number,
    completedFlag: boolean = false
  ): { unitCompleted: boolean } {
    const subjects = this.getSubjects();
    let unitCompleted = false;
    const todayStr = new Date().toISOString().split('T')[0];

    const updatedSubjects = subjects.map(subj => {
      if (subj.code === subjectCode) {
        const updatedUnits = subj.units.map(unit => {
          if (unit.unitNumber === unitNumber) {
            const newTotalStudied = (unit.totalMinutesStudied || 0) + studiedMinutes;
            let newProgress = Math.min(100, Math.round((newTotalStudied / (unit.estimatedMinutes || 120)) * 100));
            let newStatus = unit.status;

            if (completedFlag || newProgress >= 100) {
              newProgress = 100;
              newStatus = 'completed' as const;
              unitCompleted = true;
            } else if (newProgress > 0) {
              newStatus = 'studying' as const;
            }

            // If freshly completed, schedule spaced repetition
            let updatedRevisions = [...unit.revisions];
            if (newStatus === 'completed' && (!unit.completedDate || unit.status !== 'completed')) {
              const r1Date = new Date();
              r1Date.setDate(r1Date.getDate() + 1); // +1 day

              const r2Date = new Date();
              r2Date.setDate(r2Date.getDate() + 7); // +7 days

              const r3Date = new Date();
              r3Date.setDate(r3Date.getDate() + 21); // +21 days

              updatedRevisions = [
                { stage: 1, status: 'recommended', suggestedDate: r1Date.toISOString().split('T')[0], intervalDays: 1 },
                { stage: 2, status: 'pending', suggestedDate: r2Date.toISOString().split('T')[0], intervalDays: 7 },
                { stage: 3, status: 'pending', suggestedDate: r3Date.toISOString().split('T')[0], intervalDays: 21 },
              ];
            }

            return {
              ...unit,
              status: newStatus,
              progress: newProgress,
              totalMinutesStudied: newTotalStudied,
              completedDate: newStatus === 'completed' ? (unit.completedDate || todayStr) : undefined,
              revisions: updatedRevisions,
            };
          }
          return unit;
        });
        return { ...subj, units: updatedUnits };
      }
      return subj;
    });

    this.saveSubjects(updatedSubjects);

    // Log history
    this.logActivity({
      id: `act-${Date.now()}`,
      date: todayStr,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      subjectCode,
      title: `${subjectCode} Unit ${unitNumber} Study Session`,
      type: 'study',
      durationMinutes: studiedMinutes,
      status: unitCompleted ? 'completed' : 'partial',
      progressMade: studiedMinutes,
      notes: `Studied for ${studiedMinutes} minutes.`,
    });

    return { unitCompleted };
  }

  static getPostGymRoutine(): PostGymSlot[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POST_GYM_ROUTINE);
      return data ? JSON.parse(data) : INITIAL_POST_GYM_ROUTINE;
    } catch {
      return INITIAL_POST_GYM_ROUTINE;
    }
  }

  static savePostGymRoutine(routine: PostGymSlot[]): void {
    localStorage.setItem(STORAGE_KEYS.POST_GYM_ROUTINE, JSON.stringify(routine));
    this.pushCurrentStateToCloud();
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  static resetPostGymRoutine(): PostGymSlot[] {
    localStorage.removeItem(STORAGE_KEYS.POST_GYM_ROUTINE);
    this.pushCurrentStateToCloud();
    window.dispatchEvent(new Event('soul_data_changed'));
    return INITIAL_POST_GYM_ROUTINE;
  }

  static togglePostGymSlotCompleted(id: string): PostGymSlot[] {
    const routine = this.getPostGymRoutine();
    const updated = routine.map(slot => 
      slot.id === id ? { ...slot, completed: !slot.completed } : slot
    );
    this.savePostGymRoutine(updated);
    return updated;
  }

  /**
   * Helper to push all local state to Supabase in the background
   */
  static pushCurrentStateToCloud(): void {
    if (!isSupabaseConfigured()) return;
    try {
      triggerSupabaseSync({
        preferences: this.getPreferences(),
        timetable: this.getTimetable(),
        subjects: this.getSubjects(),
        tasks: this.getTasks(),
        habits: this.getHabits(),
        history: this.getActivityHistory(),
        postGymRoutine: this.getPostGymRoutine(),
        msbteCalendar: this.getMsbteCalendar(),
        performance: this.getAcademicPerformance(),
        roastSettings: this.getRoastSettings(),
      });
    } catch (e) {
      console.warn('Could not sync to Supabase:', e);
    }
  }

  /**
   * Fetch from Supabase and sync down to localStorage
   */
  static async hydrateFromSupabase(): Promise<boolean> {
    try {
      const cloudData = await fetchStateFromSupabase();
      if (!cloudData) return false;

      if (cloudData.preferences && Object.keys(cloudData.preferences).length > 0) {
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(cloudData.preferences));
      }
      if (Array.isArray(cloudData.timetable) && cloudData.timetable.length > 0) {
        localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(cloudData.timetable));
      }
      if (Array.isArray(cloudData.subjects) && cloudData.subjects.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(cloudData.subjects));
      }
      if (Array.isArray(cloudData.tasks)) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(cloudData.tasks));
      }
      if (Array.isArray(cloudData.habits)) {
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(cloudData.habits));
      }
      if (Array.isArray(cloudData.history)) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(cloudData.history));
      }
      if (Array.isArray(cloudData.postGymRoutine)) {
        localStorage.setItem(STORAGE_KEYS.POST_GYM_ROUTINE, JSON.stringify(cloudData.postGymRoutine));
      }
      if (Array.isArray((cloudData as any).msbteCalendar)) {
        localStorage.setItem(STORAGE_KEYS.MSBTE_CALENDAR, JSON.stringify((cloudData as any).msbteCalendar));
      }
      if ((cloudData as any).performance) {
        localStorage.setItem(STORAGE_KEYS.PERFORMANCE, JSON.stringify((cloudData as any).performance));
      }
      if ((cloudData as any).roastSettings) {
        localStorage.setItem(STORAGE_KEYS.ROAST_SETTINGS, JSON.stringify((cloudData as any).roastSettings));
      }

      window.dispatchEvent(new Event('soul_data_changed'));
      return true;
    } catch (e) {
      console.error('Hydration from Supabase failed:', e);
      return false;
    }
  }

  /**
   * Reset all data back to clean factory initial state (0% progress)
   */
  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.TIMETABLE);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.FOCUS_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.POST_GYM_ROUTINE);
    localStorage.removeItem(STORAGE_KEYS.MSBTE_CALENDAR);
    localStorage.removeItem(STORAGE_KEYS.PERFORMANCE);
    localStorage.removeItem(STORAGE_KEYS.ROAST_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ROAST_LOG);
    this.pushCurrentStateToCloud();
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  /**
   * Export JSON Backup
   */
  static exportFullBackup(): string {
    const data = {
      preferences: this.getPreferences(),
      timetable: this.getTimetable(),
      subjects: this.getSubjects(),
      tasks: this.getTasks(),
      habits: this.getHabits(),
      focusSessions: this.getFocusSessions(),
      history: this.getActivityHistory(),
      postGymRoutine: this.getPostGymRoutine(),
      msbteCalendar: this.getMsbteCalendar(),
      performance: this.getAcademicPerformance(),
      roastSettings: this.getRoastSettings(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import JSON Backup
   */
  static importFullBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.timetable) localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(parsed.timetable));
      if (parsed.subjects) localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(parsed.subjects));
      if (parsed.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(parsed.tasks));
      if (parsed.habits) localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(parsed.habits));
      if (parsed.preferences) localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(parsed.preferences));
      if (parsed.history) localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(parsed.history));
      if (parsed.postGymRoutine) localStorage.setItem(STORAGE_KEYS.POST_GYM_ROUTINE, JSON.stringify(parsed.postGymRoutine));
      if (parsed.msbteCalendar) localStorage.setItem(STORAGE_KEYS.MSBTE_CALENDAR, JSON.stringify(parsed.msbteCalendar));
      if (parsed.performance) localStorage.setItem(STORAGE_KEYS.PERFORMANCE, JSON.stringify(parsed.performance));
      if (parsed.roastSettings) localStorage.setItem(STORAGE_KEYS.ROAST_SETTINGS, JSON.stringify(parsed.roastSettings));
      this.pushCurrentStateToCloud();
      window.dispatchEvent(new Event('soul_data_changed'));
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
}
