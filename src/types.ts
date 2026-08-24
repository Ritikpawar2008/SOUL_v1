export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export type UnitStatus = 'not_started' | 'studying' | 'completed';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export type RevisionStatus = 'pending' | 'recommended' | 'completed' | 'skipped';

export interface BatchPracticalInfo {
  batchA?: { subject: string; lab: string; faculty: string };
  batchB?: { subject: string; lab: string; faculty: string };
  batchC?: { subject: string; lab: string; faculty: string };
  batchD?: { subject: string; lab: string; faculty: string };
}

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "11:00"
  title: string;     // e.g. "OSY (TH)"
  subjectCode?: string; // e.g. "OSY", "CLC", "STE", "ENDS", "SPI"
  type: 'lecture' | 'practical' | 'mentor_meeting' | 'recess' | 'free' | 'gym' | 'study' | 'custom';
  room?: string;
  instructor?: string;
  notes?: string;
  batchInfo?: BatchPracticalInfo;
}

export interface UnitRevision {
  stage: 1 | 2 | 3;
  status: RevisionStatus;
  suggestedDate?: string; // ISO string YYYY-MM-DD
  completedDate?: string;
  intervalDays: number; // e.g. 1 for R1, 7 for R2, 21 for R3
  notes?: string;
}

export interface SyllabusUnit {
  id: string;
  unitNumber: number;
  title: string;
  subjectCode: string;
  status: UnitStatus;
  progress: number; // 0 to 100
  completedDate?: string;
  totalMinutesStudied: number;
  estimatedMinutes: number;
  revisions: UnitRevision[];
  notes?: string;
}

export interface Subject {
  id: string;
  code: string;       // "CLC", "OSY", "STE"
  name: string;       // "Cloud Computing", "Operating Systems", "Software Testing"
  faculty?: string;   // "NKD", "MRV", "SSK"
  color: string;      // Accent color hex or css var
  units: SyllabusUnit[];
}

export interface AcademicTask {
  id: string;
  type: 'manual' | 'assignment' | 'project' | 'study_session';
  subjectCode: string;
  title: string;
  experimentNumber?: string | number; // for manuals (e.g. "Exp 3")
  description?: string;
  deadline: string; // YYYY-MM-DD
  priority: PriorityLevel;
  status: TaskStatus;
  progress: number; // 0 - 100
  estimatedMinutes: number;
  actualMinutesSpent: number;
  scheduledTime?: {
    date: string; // YYYY-MM-DD
    startTime: string; // "19:45"
    endTime: string;   // "20:45"
  };
  createdAt: string;
  completedAt?: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  subjectCode?: string;
  type: 'study' | 'revision' | 'manual' | 'assignment' | 'free_focus';
  durationMinutes: number;
  completedAt: string;
  rating: number; // 1 to 5
  reflection?: string;
  mode: 'pomodoro' | 'custom' | 'stopwatch';
}

export interface ActivityHistoryItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  subjectCode?: string;
  title: string;
  type: 'study' | 'revision' | 'manual' | 'assignment' | 'gym' | 'break' | 'task';
  durationMinutes: number;
  status: 'completed' | 'partial' | 'skipped';
  progressMade?: number;
  notes?: string;
}

export interface HabitGoal {
  id: string;
  title: string;
  category: 'fitness' | 'academic' | 'health' | 'productivity';
  targetFrequency: string; // e.g. "Daily 4-7 PM"
  currentStreak: number;
  longestStreak: number;
  targetDaysPerWeek: number;
  completedDates: string[]; // List of YYYY-MM-DD
  lastCompletedDate?: string;
  description?: string;
  notes?: string;
}

export interface AvailableTimeSlot {
  startTime: string; // "10:00"
  endTime: string;   // "11:00"
  durationMinutes: number;
  context: 'college_gap' | 'after_college' | 'evening_post_gym' | 'weekend';
}

export interface AIRecommendation {
  id: string;
  type: 'study' | 'revision' | 'manual' | 'assignment' | 'break' | 'entertainment';
  title: string;
  subjectCode?: string;
  unitNumber?: number;
  estimatedMinutes: number;
  reason: string;
  priorityScore: number;
  deadlineWarning?: string;
  taskId?: string;
  unitId?: string;
}

export interface ScheduleConflict {
  id: string;
  timeRange: string;
  conflictingItem: string;
  blockedReason: string;
  suggestion: string;
  suggestedSlot?: {
    startTime: string;
    endTime: string;
  };
}

export interface PostGymSlot {
  id: string;
  startTime: string; // "19:00"
  endTime: string;   // "19:45"
  title: string;     // e.g. "Dinner & Post-Workout Nutrition"
  subtitle?: string; // "High-protein meal, hydration & mental reset"
  type: 'meal' | 'study' | 'manual' | 'assignment' | 'revision' | 'leisure' | 'wind_down' | 'custom';
  subjectCode?: string; // "OSY", "CLC", "STE", "ENDS"
  unitNumber?: number;
  taskId?: string;
  notes?: string;
  completed?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'soul';
  text: string;
  timestamp: string;
  quickActions?: {
    label: string;
    actionType: 'start_task' | 'add_task' | 'reschedule' | 'navigate';
    payload?: any;
  }[];
}

export interface UserPreferences {
  name: string;
  collegeName: string;
  semester: string;
  gymStartTime: string; // "16:00"
  gymEndTime: string;   // "19:00"
  enableNotifications: boolean;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  defaultRevisionIntervals: [number, number, number]; // [1, 7, 21]
}

export interface EntertainmentOption {
  id: string;
  category: 'youtube' | 'music' | 'podcast' | 'short_break' | 'educational' | 'gaming' | 'video';
  title: string;
  durationMinutes: number;
  channelOrArtist?: string;
  source?: string;
  description?: string;
  link?: string;
  tags?: string[];
  recommendedWhenFreeMinutes?: number;
}
