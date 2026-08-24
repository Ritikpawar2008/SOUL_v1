import {
  AcademicTask,
  ActivityHistoryItem,
  AIRecommendation,
  AvailableTimeSlot,
  DayOfWeek,
  FocusSession,
  HabitGoal,
  ScheduleConflict,
  Subject,
  SyllabusUnit,
  TimetableSlot,
  UserPreferences
} from '../types';

export function getDayOfWeekFromDate(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
}

export function getDaysDifference(targetDateStr: string, fromDate: Date = new Date()): number {
  const target = new Date(targetDateStr);
  const now = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates real available time slots for a given day, factoring in college timetable and fixed gym block (4-7 PM).
 */
export function calculateAvailableSlots(
  day: DayOfWeek,
  timetable: TimetableSlot[],
  preferences: UserPreferences,
  currentTimeStr?: string
): AvailableTimeSlot[] {
  // Day start: 08:00 (480 mins) to 23:30 (1410 mins)
  const dayStart = 8 * 60; // 08:00
  const dayEnd = 23 * 60 + 30; // 23:30

  // Busy intervals: [startMin, endMin]
  const busyIntervals: { start: number; end: number; label: string }[] = [];

  // 1. College slots for the day
  const todaySlots = timetable.filter(s => s.day === day && s.type !== 'free');
  for (const slot of todaySlots) {
    const s = parseTimeToMinutes(slot.startTime);
    const e = parseTimeToMinutes(slot.endTime);
    if (e > s) {
      busyIntervals.push({ start: s, end: e, label: slot.title });
    }
  }

  // 2. Fixed Gym block (e.g. 16:00 - 19:00 = 960 to 1140 mins)
  const gymStart = parseTimeToMinutes(preferences.gymStartTime || '16:00');
  const gymEnd = parseTimeToMinutes(preferences.gymEndTime || '19:00');
  busyIntervals.push({ start: gymStart, end: gymEnd, label: 'Fixed Gym Session' });

  // 3. Post-gym dinner & recovery buffer (19:00 - 19:45)
  busyIntervals.push({ start: gymEnd, end: gymEnd + 45, label: 'Dinner & Recovery' });

  // Sort intervals by start time
  busyIntervals.sort((a, b) => a.start - b.start);

  // Merge overlapping busy intervals
  const mergedBusy: { start: number; end: number }[] = [];
  for (const interval of busyIntervals) {
    if (mergedBusy.length === 0) {
      mergedBusy.push({ ...interval });
    } else {
      const last = mergedBusy[mergedBusy.length - 1];
      if (interval.start <= last.end) {
        last.end = Math.max(last.end, interval.end);
      } else {
        mergedBusy.push({ ...interval });
      }
    }
  }

  // Find free intervals between dayStart and dayEnd
  const availableSlots: AvailableTimeSlot[] = [];
  let pointer = dayStart;

  // If current time is provided, we can filter or adjust pointer for "now"
  if (currentTimeStr) {
    const currMin = parseTimeToMinutes(currentTimeStr);
    if (currMin > pointer) {
      pointer = currMin;
    }
  }

  for (const busy of mergedBusy) {
    if (busy.start > pointer) {
      const freeDuration = busy.start - pointer;
      if (freeDuration >= 20) { // at least 20 min slot
        let context: AvailableTimeSlot['context'] = 'after_college';
        if (pointer < 14 * 60 && busy.start <= 15 * 60) {
          context = 'college_gap';
        } else if (pointer >= 19 * 60) {
          context = 'evening_post_gym';
        } else if (day === 'Saturday' || day === 'Sunday') {
          context = 'weekend';
        }

        availableSlots.push({
          startTime: minutesToTimeString(pointer),
          endTime: minutesToTimeString(busy.start),
          durationMinutes: freeDuration,
          context,
        });
      }
    }
    pointer = Math.max(pointer, busy.end);
  }

  // Check remaining time until dayEnd
  if (pointer < dayEnd) {
    const freeDuration = dayEnd - pointer;
    if (freeDuration >= 20) {
      availableSlots.push({
        startTime: minutesToTimeString(pointer),
        endTime: minutesToTimeString(dayEnd),
        durationMinutes: freeDuration,
        context: pointer >= 19 * 60 ? 'evening_post_gym' : 'after_college',
      });
    }
  }

  return availableSlots;
}

/**
 * Checks for schedule conflicts when placing a task.
 */
export function checkScheduleConflict(
  day: DayOfWeek,
  startTimeStr: string,
  endTimeStr: string,
  timetable: TimetableSlot[],
  preferences: UserPreferences
): ScheduleConflict | null {
  const reqStart = parseTimeToMinutes(startTimeStr);
  const reqEnd = parseTimeToMinutes(endTimeStr);

  const gymStart = parseTimeToMinutes(preferences.gymStartTime || '16:00');
  const gymEnd = parseTimeToMinutes(preferences.gymEndTime || '19:00');

  // Check Gym Conflict
  if (Math.max(reqStart, gymStart) < Math.min(reqEnd, gymEnd)) {
    return {
      id: 'conflict-gym',
      timeRange: `${formatTime12h(startTimeStr)} – ${formatTime12h(endTimeStr)}`,
      conflictingItem: 'Fixed Gym Commitment (4:00 PM – 7:00 PM)',
      blockedReason: 'Gym time is a non-negotiable physical health block.',
      suggestion: 'Move study session to 7:45 PM (post-dinner recovery slot).',
      suggestedSlot: {
        startTime: '19:45',
        endTime: minutesToTimeString(19 * 60 + 45 + (reqEnd - reqStart)),
      },
    };
  }

  // Check College Lectures / Practicals Conflict
  const dayClasses = timetable.filter(s => s.day === day && s.type !== 'free');
  for (const cls of dayClasses) {
    const cStart = parseTimeToMinutes(cls.startTime);
    const cEnd = parseTimeToMinutes(cls.endTime);
    if (Math.max(reqStart, cStart) < Math.min(reqEnd, cEnd)) {
      return {
        id: `conflict-college-${cls.id}`,
        timeRange: `${formatTime12h(startTimeStr)} – ${formatTime12h(endTimeStr)}`,
        conflictingItem: `College ${cls.title} (${cls.room || 'Classroom'})`,
        blockedReason: 'Class attendance & mentor sessions take precedence during college hours.',
        suggestion: `Schedule during free period at ${cls.endTime} or after college at 02:30 PM.`,
        suggestedSlot: {
          startTime: cls.endTime,
          endTime: minutesToTimeString(cEnd + (reqEnd - reqStart)),
        },
      };
    }
  }

  return null;
}

/**
 * Dynamic Scoring Engine: generates prioritized academic recommendations without forcing a rigid subject order.
 */
export function generateSmartRecommendations(
  subjects: Subject[],
  tasks: AcademicTask[],
  history: ActivityHistoryItem[],
  availableMinutes: number = 60,
  referenceDate: Date = new Date()
): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  // 1. Check Urgent Deadlines (Manuals & Assignments)
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  for (const task of pendingTasks) {
    const daysLeft = getDaysDifference(task.deadline, referenceDate);
    let priorityMultiplier = 1;
    if (task.priority === 'critical') priorityMultiplier = 2.5;
    else if (task.priority === 'high') priorityMultiplier = 1.8;
    else if (task.priority === 'medium') priorityMultiplier = 1.2;

    let score = 50 * priorityMultiplier;
    let deadlineWarning = `${daysLeft} days left`;

    if (daysLeft < 0) {
      score += 100;
      deadlineWarning = `OVERDUE by ${Math.abs(daysLeft)} days`;
    } else if (daysLeft <= 2) {
      score += 80;
      deadlineWarning = `DUE SOON (${daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : '2 days'})`;
    } else if (daysLeft <= 4) {
      score += 40;
    }

    // Incomplete bonus
    score += (100 - task.progress) * 0.4;

    recommendations.push({
      id: `rec-task-${task.id}`,
      type: task.type === 'manual' ? 'manual' : 'assignment',
      title: task.title,
      subjectCode: task.subjectCode,
      estimatedMinutes: Math.min(task.estimatedMinutes || 45, availableMinutes > 0 ? availableMinutes : 45),
      reason: daysLeft <= 2
        ? `Approaching deadline in ${daysLeft <= 0 ? 'few hours' : `${daysLeft}d`}, currently ${task.progress}% complete.`
        : `${task.subjectCode} ${task.type} (${task.priority} priority) with ${100 - task.progress}% work remaining.`,
      priorityScore: score,
      deadlineWarning,
      taskId: task.id,
    });
  }

  // 2. Check Spaced Revisions Due
  for (const subject of subjects) {
    for (const unit of subject.units) {
      if (unit.status === 'completed' && unit.completedDate) {
        for (const rev of unit.revisions) {
          if (rev.status === 'recommended' || (rev.status === 'pending' && rev.suggestedDate)) {
            const daysLeft = rev.suggestedDate ? getDaysDifference(rev.suggestedDate, referenceDate) : 0;
            if (daysLeft <= 1) {
              const score = 75 + (rev.stage === 1 ? 25 : rev.stage === 2 ? 15 : 10);
              recommendations.push({
                id: `rec-rev-${unit.id}-s${rev.stage}`,
                type: 'revision',
                title: `${subject.code} Unit ${unit.unitNumber} — Revision Stage ${rev.stage}`,
                subjectCode: subject.code,
                unitNumber: unit.unitNumber,
                estimatedMinutes: 30,
                reason: `Spaced repetition interval due for ${subject.code} Unit ${unit.unitNumber} (${unit.title}). Solidifies active recall.`,
                priorityScore: score,
                deadlineWarning: daysLeft <= 0 ? 'Revision Due Today' : 'Revision Due Tomorrow',
                unitId: unit.id,
              });
            }
          }
        }
      }
    }
  }

  // 3. Check In-Progress & Pending Syllabus Units
  for (const subject of subjects) {
    for (const unit of subject.units) {
      if (unit.status === 'studying' && unit.progress < 100) {
        // Studying unit
        const lastStudied = history.find(h => h.subjectCode === subject.code && h.title.includes(`Unit ${unit.unitNumber}`));
        let recencyScore = 40;
        if (!lastStudied) recencyScore += 30;

        recommendations.push({
          id: `rec-unit-study-${unit.id}`,
          type: 'study',
          title: `${subject.code} Unit ${unit.unitNumber}: ${unit.title}`,
          subjectCode: subject.code,
          unitNumber: unit.unitNumber,
          estimatedMinutes: Math.min(60, availableMinutes > 0 ? availableMinutes : 60),
          reason: `Currently in progress (${unit.progress}%). Continuing this momentum will complete the unit.`,
          priorityScore: 60 + recencyScore,
          unitId: unit.id,
        });
      } else if (unit.status === 'not_started') {
        // Next unit to start if previous unit completed
        const prevUnit = subject.units.find(u => u.unitNumber === unit.unitNumber - 1);
        if (!prevUnit || prevUnit.status === 'completed') {
          recommendations.push({
            id: `rec-unit-start-${unit.id}`,
            type: 'study',
            title: `${subject.code} Unit ${unit.unitNumber}: ${unit.title}`,
            subjectCode: subject.code,
            unitNumber: unit.unitNumber,
            estimatedMinutes: 45,
            reason: `Ready to start next module in ${subject.code} (${subject.name}).`,
            priorityScore: 45,
            unitId: unit.id,
          });
        }
      }
    }
  }

  // Sort descending by priority score
  recommendations.sort((a, b) => b.priorityScore - a.priorityScore);

  return recommendations;
}
