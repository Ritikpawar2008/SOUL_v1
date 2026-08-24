import { AcademicTask, PostGymSlot, Subject, UserPreferences } from '../types';
import { parseTimeToMinutes, minutesToTimeString } from './schedulingEngine';

export interface EveningOptimizationOptions {
  gymEndTime?: string; // "19:00"
  bedtime?: string;    // "23:30"
  strategy?: 'balanced' | 'urgent_deadlines' | 'deep_study' | 'spaced_revision' | 'light_recovery';
  customPrompt?: string;
  subjects: Subject[];
  tasks: AcademicTask[];
  preferences: UserPreferences;
}

export interface EveningOptimizationResult {
  slots: PostGymSlot[];
  summary: string;
  source: 'gemini' | 'heuristic';
}

export async function generateEveningRoutineWithAi(
  options: EveningOptimizationOptions
): Promise<EveningOptimizationResult> {
  const {
    gymEndTime = options.preferences.gymEndTime || '19:00',
    bedtime = '23:30',
    strategy = 'balanced',
    customPrompt = '',
    subjects,
    tasks,
  } = options;

  try {
    const response = await fetch('/api/soul-ai/suggest-evening', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gymEndTime,
        bedtime,
        strategy,
        customInstruction: customPrompt,
        tasks,
        subjects,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.slots && data.slots.length > 0) {
        return {
          slots: data.slots,
          summary: data.summary || 'AI optimized your post-gym evening routine based on pending deadlines.',
          source: 'gemini',
        };
      }
    }
  } catch (e) {
    console.warn('API call failed, falling back to smart client-side heuristics', e);
  }

  // Fallback intelligent heuristics generator
  return generateClientHeuristicEvening(options);
}

export function generateClientHeuristicEvening(
  options: EveningOptimizationOptions
): EveningOptimizationResult {
  const {
    gymEndTime = options.preferences.gymEndTime || '19:00',
    strategy = 'balanced',
    tasks,
    subjects,
  } = options;

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const urgentManual = pendingTasks.find(t => t.type === 'manual');
  const urgentAssignment = pendingTasks.find(t => t.type === 'assignment');

  let slots: PostGymSlot[] = [];
  let summary = '';

  const gymEndMin = parseTimeToMinutes(gymEndTime);
  const dinnerEndMin = gymEndMin + 45;

  // 1. Dinner slot
  slots.push({
    id: `slot-dinner-${Date.now()}`,
    startTime: minutesToTimeString(gymEndMin),
    endTime: minutesToTimeString(dinnerEndMin),
    title: 'Dinner & Post-Workout Nutrition',
    subtitle: '30g Protein, hydration & cognitive reset after intense gym session',
    type: 'meal',
    completed: false,
  });

  if (strategy === 'urgent_deadlines') {
    const s1End = dinnerEndMin + 60;
    const breakEnd = s1End + 15;
    const s2End = breakEnd + 60;
    const windDownEnd = s2End + 45;

    slots.push({
      id: `slot-work-1-${Date.now()}`,
      startTime: minutesToTimeString(dinnerEndMin),
      endTime: minutesToTimeString(s1End),
      title: urgentManual ? `${urgentManual.subjectCode} Manual` : 'OSY Manual',
      subtitle: urgentManual ? (urgentManual.description || 'Highest urgency practical manual writeup') : 'CPU scheduling algorithm implementation',
      type: 'manual',
      subjectCode: urgentManual?.subjectCode || 'OSY',
      taskId: urgentManual?.id,
      completed: false,
    });

    slots.push({
      id: `slot-break-${Date.now()}`,
      startTime: minutesToTimeString(s1End),
      endTime: minutesToTimeString(breakEnd),
      title: 'Micro-Break & Hydration',
      subtitle: 'Brisk walk, hydration & mental reset',
      type: 'leisure',
      completed: false,
    });

    slots.push({
      id: `slot-work-2-${Date.now()}`,
      startTime: minutesToTimeString(breakEnd),
      endTime: minutesToTimeString(s2End),
      title: 'Assignment',
      subtitle: urgentAssignment ? (urgentAssignment.description || 'Upcoming subject assignment submission') : 'Cloud service models comparative writeup',
      type: 'assignment',
      subjectCode: urgentAssignment?.subjectCode || 'CLC',
      taskId: urgentAssignment?.id,
      completed: false,
    });

    slots.push({
      id: `slot-winddown-${Date.now()}`,
      startTime: minutesToTimeString(s2End),
      endTime: minutesToTimeString(windDownEnd),
      title: 'Guilt-Free Leisure & Night Wind-Down',
      subtitle: 'Lo-Fi music, tomorrow prep & restful wind-down',
      type: 'wind_down',
      completed: false,
    });

    summary = 'Prioritized urgent manual & assignment deadlines immediately following your post-workout dinner.';
  } else if (strategy === 'light_recovery') {
    const s1End = dinnerEndMin + 45;
    const breakEnd = s1End + 20;
    const s2End = breakEnd + 40;
    const windDownEnd = s2End + 60;

    slots.push({
      id: `slot-rec-1-${Date.now()}`,
      startTime: minutesToTimeString(dinnerEndMin),
      endTime: minutesToTimeString(s1End),
      title: 'STE Spaced Revision (Stage 1)',
      subtitle: 'Low-friction active recall & flash concepts',
      type: 'revision',
      subjectCode: 'STE',
      completed: false,
    });

    slots.push({
      id: `slot-rec-2-${Date.now()}`,
      startTime: minutesToTimeString(s1End),
      endTime: minutesToTimeString(breakEnd),
      title: 'Guilt-Free Micro Leisure (Tech Video / Tea)',
      subtitle: 'Relaxing tech breakdown or podcast',
      type: 'leisure',
      completed: false,
    });

    slots.push({
      id: `slot-rec-3-${Date.now()}`,
      startTime: minutesToTimeString(breakEnd),
      endTime: minutesToTimeString(s2End),
      title: urgentManual ? `${urgentManual.subjectCode} Manual` : 'OSY Manual',
      subtitle: 'Light progress on practical questions',
      type: 'manual',
      subjectCode: urgentManual?.subjectCode || 'OSY',
      completed: false,
    });

    slots.push({
      id: `slot-rec-4-${Date.now()}`,
      startTime: minutesToTimeString(s2End),
      endTime: minutesToTimeString(windDownEnd),
      title: 'Deep Rest, Stretching & Early Sleep',
      subtitle: 'Full physical recovery after intense gym session',
      type: 'wind_down',
      completed: false,
    });

    summary = 'Light cognitive load configured with extended leisure buffers for post-heavy-training recovery.';
  } else {
    // Balanced Default
    const s1End = dinnerEndMin + 60;
    const breakEnd = s1End + 15;
    const s2End = breakEnd + 60;
    const revEnd = s2End + 45;
    const windDownEnd = revEnd + 45;

    slots.push({
      id: `slot-bal-1-${Date.now()}`,
      startTime: minutesToTimeString(dinnerEndMin),
      endTime: minutesToTimeString(s1End),
      title: urgentManual ? `${urgentManual.subjectCode} Manual` : 'OSY Manual',
      subtitle: 'Operating Systems practical experiments and algorithm implementation',
      type: 'manual',
      subjectCode: urgentManual?.subjectCode || 'OSY',
      taskId: urgentManual?.id,
      completed: false,
    });

    slots.push({
      id: `slot-bal-2-${Date.now()}`,
      startTime: minutesToTimeString(s1End),
      endTime: minutesToTimeString(breakEnd),
      title: 'Micro-Break & Hydration',
      subtitle: 'Brisk walk, eye reset and water',
      type: 'leisure',
      completed: false,
    });

    slots.push({
      id: `slot-bal-3-${Date.now()}`,
      startTime: minutesToTimeString(breakEnd),
      endTime: minutesToTimeString(s2End),
      title: 'Assignment',
      subtitle: 'Cloud Computing architecture homework and case studies',
      type: 'assignment',
      subjectCode: urgentAssignment?.subjectCode || 'CLC',
      taskId: urgentAssignment?.id,
      completed: false,
    });

    slots.push({
      id: `slot-bal-4-${Date.now()}`,
      startTime: minutesToTimeString(s2End),
      endTime: minutesToTimeString(revEnd),
      title: 'STE Spaced Revision',
      subtitle: 'Stage 1 active recall & key definitions revision',
      type: 'revision',
      subjectCode: 'STE',
      completed: false,
    });

    slots.push({
      id: `slot-bal-5-${Date.now()}`,
      startTime: minutesToTimeString(revEnd),
      endTime: minutesToTimeString(windDownEnd),
      title: 'Guilt-Free Leisure & Night Wind-Down',
      subtitle: 'Lo-Fi music, digital scratchpad & preparation for sleep',
      type: 'wind_down',
      completed: false,
    });

    summary = 'High-yield balanced evening: OSY Manual focus, CLC Assignment sprint, STE active recall, and 45m bedtime leisure.';
  }

  return {
    slots,
    summary,
    source: 'heuristic',
  };
}
