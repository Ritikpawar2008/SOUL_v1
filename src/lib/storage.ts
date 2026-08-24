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
} from '../types';
import {
  INITIAL_ACADEMIC_TASKS,
  INITIAL_ACTIVITY_HISTORY,
  INITIAL_HABITS,
  INITIAL_PREFERENCES,
  INITIAL_SUBJECTS,
  INITIAL_TIMETABLE,
  INITIAL_POST_GYM_ROUTINE,
} from '../data/initialData';

const STORAGE_KEYS = {
  PREFERENCES: 'soul_preferences_v4',
  TIMETABLE: 'soul_timetable_v4',
  SUBJECTS: 'soul_subjects_v4',
  TASKS: 'soul_tasks_v4',
  HABITS: 'soul_habits_v4',
  FOCUS_SESSIONS: 'soul_focus_sessions_v4',
  HISTORY: 'soul_history_v4',
  POST_GYM_ROUTINE: 'soul_post_gym_routine_v4',
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
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  static logActivity(item: ActivityHistoryItem): void {
    const existing = this.getActivityHistory();
    this.saveActivityHistory([item, ...existing]);
  }

  /**
   * Updates unit progress based on actual study duration.
   * If unit completes (100%), dynamically generates future spaced revision dates based on TODAY's completion date.
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
              // Calculate Spaced Repetition dates from TODAY
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
    window.dispatchEvent(new Event('soul_data_changed'));
  }

  static resetPostGymRoutine(): PostGymSlot[] {
    localStorage.removeItem(STORAGE_KEYS.POST_GYM_ROUTINE);
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
   * Reset all data back to clean factory initial state
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
      if (parsed.timetable) this.saveTimetable(parsed.timetable);
      if (parsed.subjects) this.saveSubjects(parsed.subjects);
      if (parsed.tasks) this.saveTasks(parsed.tasks);
      if (parsed.habits) this.saveHabits(parsed.habits);
      if (parsed.preferences) this.savePreferences(parsed.preferences);
      if (parsed.history) this.saveActivityHistory(parsed.history);
      if (parsed.postGymRoutine) this.savePostGymRoutine(parsed.postGymRoutine);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
}
