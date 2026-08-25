import {
  MasterGoal,
  WeeklyTarget,
  DailyRoutineConfig,
  TechnicalTopic,
  WeeklyProject,
  SkillOfTheWeek,
  DailyKnowledgeItem,
  DailyReviewEntry,
  WeeklyReviewData,
  MSBTECalendarEvent,
  ActivityHistoryItem,
  GoalMilestone,
} from '../types';
import {
  INITIAL_MASTER_GOALS,
  INITIAL_WEEKLY_TARGETS,
  INITIAL_DAILY_ROUTINE,
  INITIAL_TECHNICAL_TOPICS,
  INITIAL_WEEKLY_PROJECTS,
  INITIAL_SKILL_OF_THE_WEEK,
  INITIAL_DAILY_KNOWLEDGE_POOL,
} from '../data/growthInitialData';

export class GrowthEngine {
  /**
   * Converts a user's natural language goal into a structured MasterGoal with milestones and daily actions.
   */
  static parseNaturalLanguageGoal(rawPrompt: string): MasterGoal {
    const text = rawPrompt.toLowerCase().trim();
    const id = `mg-${Date.now()}`;
    const today = new Date();
    const deadlineDate = new Date();
    deadlineDate.setDate(today.getDate() + 90); // default 90 days
    const deadlineStr = deadlineDate.toISOString().split('T')[0];

    // 1. Linux & System Mastery
    if (text.includes('linux') || text.includes('terminal') || text.includes('bash') || text.includes('shell')) {
      return {
        id,
        rawPrompt,
        title: 'Linux & Terminal Systems Mastery',
        category: 'technical',
        reason: 'Master command-line productivity, Unix pipelines, permissions, and server automation to operate as a senior software engineer.',
        deadline: deadlineStr,
        estimatedHoursTotal: 60,
        priority: 'high',
        progress: 0,
        weeklyTargetsSummary: [
          '3x Linux hands-on command & pipeline sessions',
          '1x Shell script automation project',
        ],
        dailyActions: [
          'Execute 15 minutes of terminal command exploration',
          'Read or review 1 Unix system principle',
        ],
        milestones: [
          { id: `m-${id}-1`, title: 'Terminal Navigation & File Permissions (rwx, chmod, chown)', description: 'Understand standard streams, relative/absolute paths, and POSIX permissions.', completed: false, targetWeek: 1 },
          { id: `m-${id}-2`, title: 'Pipes, Redirection & Text Processing (grep, sed, awk)', description: 'Chain unix tools to manipulate text files, logs, and process outputs.', completed: false, targetWeek: 3 },
          { id: `m-${id}-3`, title: 'Processes, Signals & Systemd Services', description: 'Master PID/PPID, job control, signals (SIGTERM/SIGKILL), and daemon configs.', completed: false, targetWeek: 6 },
          { id: `m-${id}-4`, title: 'Bash Automation & Production Shell Scripting', description: 'Write safe, error-trapped shell scripts and crontab background schedules.', completed: false, targetWeek: 10 },
        ],
        createdAt: today.toISOString().split('T')[0],
      };
    }

    // 2. Technical Strong / Programming / Computer Science
    if (text.includes('technically') || text.includes('technical') || text.includes('programming') || text.includes('coder') || text.includes('developer') || text.includes('computer science') || text.includes('dsa')) {
      return {
        id,
        rawPrompt,
        title: 'Technical Beast Mode: Engineering & Problem Solving',
        category: 'technical',
        reason: 'Develop rock-solid computer science fundamentals, data structures intuition, and full-stack software development mastery.',
        deadline: deadlineStr,
        estimatedHoursTotal: 180,
        priority: 'critical',
        progress: 0,
        weeklyTargetsSummary: [
          '4x Data structures & algorithmic problem solving sessions',
          '3x Core CS systems study (OS, Architecture, Memory)',
          '2x Hands-on code refactoring & clean code drills',
        ],
        dailyActions: [
          'Master 1 daily Tech of the Day concept deeply',
          'Solve or code 1 algorithmic challenge or system module',
        ],
        milestones: [
          { id: `m-${id}-1`, title: 'Computer Architecture & Memory Hierarchy', description: 'Understand CPU execution cycles, cache tiers (L1/L2/L3), and RAM paging.', completed: false, targetWeek: 2 },
          { id: `m-${id}-2`, title: 'Core Data Structures (Arrays, Linked Lists, Trees, Hash Maps)', description: 'Implement fundamental structures with Big-O time and space analysis.', completed: false, targetWeek: 5 },
          { id: `m-${id}-3`, title: 'Full-Stack Architecture & Production APIs', description: 'Build authenticated backend services with database indexing and cloud deployment.', completed: false, targetWeek: 9 },
          { id: `m-${id}-4`, title: 'Applied AI & Intelligent Software Systems', description: 'Build AI-orchestrated tools with structured output and function calling.', completed: false, targetWeek: 12 },
        ],
        createdAt: today.toISOString().split('T')[0],
      };
    }

    // 3. Build Websites / Shipping Products
    if (text.includes('build') || text.includes('website') || text.includes('product') || text.includes('project') || text.includes('app') || text.includes('saas')) {
      return {
        id,
        rawPrompt,
        title: 'Ship Every Week: Real-World Software Builder',
        category: 'project',
        reason: 'Turn theoretical knowledge into real, deployed, user-facing digital products and build an undeniable portfolio.',
        deadline: deadlineStr,
        estimatedHoursTotal: 100,
        priority: 'high',
        progress: 0,
        weeklyTargetsSummary: [
          '1x High-quality digital product / tool shipped every 1-2 weeks',
          'Public GitHub repository with full architectural readme and live URL',
        ],
        dailyActions: [
          'Spend 45 minutes of uninterrupted build time post-gym',
        ],
        milestones: [
          { id: `m-${id}-1`, title: 'Portfolio & Live Showcase Platform', description: 'Ship clean responsive personal showcase with dark aesthetic.', completed: false, targetWeek: 1 },
          { id: `m-${id}-2`, title: 'Developer Utility / Productivity Tool', description: 'Build functional tool solving a real developer or student workflow.', completed: false, targetWeek: 3 },
          { id: `m-${id}-3`, title: 'AI-Powered Micro SaaS / Chrome Extension', description: 'Integrate LLM API to deliver intelligent automation.', completed: false, targetWeek: 6 },
          { id: `m-${id}-4`, title: 'Full-Stack Distributed Application', description: 'Deploy authenticated web application with database and live analytics.', completed: false, targetWeek: 10 },
        ],
        createdAt: today.toISOString().split('T')[0],
      };
    }

    // 4. Communication & Confidence
    if (text.includes('communication') || text.includes('speaking') || text.includes('english') || text.includes('confidence') || text.includes('public speaking') || text.includes('explain')) {
      return {
        id,
        rawPrompt,
        title: 'Unstoppable English Communication & Charisma',
        category: 'communication',
        reason: 'Eliminate hesitation, explain intricate technical concepts with simplicity, and command authority in presentations.',
        deadline: deadlineStr,
        estimatedHoursTotal: 50,
        priority: 'high',
        progress: 0,
        weeklyTargetsSummary: [
          '4x 5-Minute Spontaneous English Speaking summaries',
          '3x Technical Concept Explanation without notes',
          'Daily 3 high-impact vocabulary words',
        ],
        dailyActions: [
          'Vocalize today’s learnings out loud for 5 minutes',
          'Say 3 new vocabulary words in complete sentences',
        ],
        milestones: [
          { id: `m-${id}-1`, title: 'Daily Speaking Consistency (14-Day Streak)', description: 'Build automatic vocalization habit without worrying about perfection.', completed: false, targetWeek: 2 },
          { id: `m-${id}-2`, title: 'Feynman Technique: Explain Without Notes', description: 'Explain 10 complex engineering topics using simple real-world analogies.', completed: false, targetWeek: 5 },
          { id: `m-${id}-3`, title: 'Real-World Classroom & Group Speaking', description: 'Ask questions proactively and present project demos with confidence.', completed: false, targetWeek: 8 },
        ],
        createdAt: today.toISOString().split('T')[0],
      };
    }

    // 5. Skill of the week / Exploration
    if (text.includes('skill') || text.includes('learn') || text.includes('explore')) {
      return {
        id,
        rawPrompt,
        title: 'Weekly Skill Acquisition Protocol',
        category: 'creative',
        reason: 'Rapidly expand creative, technical, and practical toolkit by conquering one mini-skill each week.',
        deadline: deadlineStr,
        estimatedHoursTotal: 40,
        priority: 'medium',
        progress: 0,
        weeklyTargetsSummary: [
          '1x New practical/technical skill learned & tested weekly',
          'Hands-on mini challenge completed every weekend',
        ],
        dailyActions: [
          'Spend 20 minutes exploring current Skill of the Week resources',
        ],
        milestones: [
          { id: `m-${id}-1`, title: '4 Technical Skills Conquered (Bash, Docker, Git, Networking)', description: 'Complete practical challenges for 4 technical skills.', completed: false, targetWeek: 4 },
          { id: `m-${id}-2`, title: '4 Creative/Productivity Skills Conquered (Figma, Markdown, Speed Typing, Pitching)', description: 'Complete practical challenges for 4 creative skills.', completed: false, targetWeek: 8 },
        ],
        createdAt: today.toISOString().split('T')[0],
      };
    }

    // 6. Generic Fallback Goal
    return {
      id,
      rawPrompt,
      title: rawPrompt.length > 40 ? `${rawPrompt.substring(0, 40)}...` : rawPrompt,
      category: 'general',
      reason: 'Dedicated intentional progress towards personal mastery and high-performance engineering standards.',
      deadline: deadlineStr,
      estimatedHoursTotal: 50,
      priority: 'high',
      progress: 0,
      weeklyTargetsSummary: [
        '3x Focused execution sessions per week',
        'Weekly audit & milestone review',
      ],
      dailyActions: [
        'Take 1 tangible daily action towards this goal',
      ],
      milestones: [
        { id: `m-${id}-1`, title: 'Foundation & Initial Practice', description: 'Establish basic mechanics and initial consistency.', completed: false, targetWeek: 2 },
        { id: `m-${id}-2`, title: 'Intermediate Execution & Real-World Application', description: 'Apply concepts to solve real-world problems.', completed: false, targetWeek: 6 },
        { id: `m-${id}-3`, title: 'Mastery & Independent Execution', description: 'Demonstrate complete confidence without needing guides.', completed: false, targetWeek: 10 },
      ],
      createdAt: today.toISOString().split('T')[0],
    };
  }

  /**
   * Parses natural language weekly planning prompts into weekly target updates.
   * e.g. "This week I want to complete 2 CLC units, learn Linux three times, build a website, practice communication four times and learn one new skill."
   */
  static parseNaturalLanguageWeeklyPlan(prompt: string, currentTargets: WeeklyTarget[]): WeeklyTarget[] {
    const text = prompt.toLowerCase();
    const updated = [...currentTargets];

    const updateTarget = (category: string, matchSubstr: string, count: number) => {
      const idx = updated.findIndex(t => t.category === category && t.title.toLowerCase().includes(matchSubstr));
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], targetCount: count };
      }
    };

    // CLC units
    const clcMatch = text.match(/(\d+)\s*(?:clc|cloud)/i) || text.match(/(?:clc|cloud)\s*(\d+)/i);
    if (clcMatch) updateTarget('academic', 'cloud', parseInt(clcMatch[1], 10));

    // OSY units
    const osyMatch = text.match(/(\d+)\s*(?:osy|operating)/i) || text.match(/(?:osy|operating)\s*(\d+)/i);
    if (osyMatch) updateTarget('academic', 'operating', parseInt(osyMatch[1], 10));

    // STE units
    const steMatch = text.match(/(\d+)\s*(?:ste|software testing)/i) || text.match(/(?:ste|software testing)\s*(\d+)/i);
    if (steMatch) updateTarget('academic', 'software testing', parseInt(steMatch[1], 10));

    // Linux
    const linuxMatch = text.match(/(\d+)\s*(?:times|sessions)?\s*(?:linux)/i) || text.match(/linux\s*(?:three|3|(\d+))/i);
    if (linuxMatch) {
      const count = linuxMatch[1] ? parseInt(linuxMatch[1], 10) : text.includes('three') ? 3 : 2;
      updateTarget('technical', 'linux', count);
    }

    // Communication
    const commMatch = text.match(/(\d+)\s*(?:times|sessions)?\s*(?:communication|speaking)/i) || text.match(/communication\s*(?:four|4|(\d+))/i);
    if (commMatch) {
      const count = commMatch[1] ? parseInt(commMatch[1], 10) : text.includes('four') ? 4 : 3;
      updateTarget('personal', 'communication', count);
    }

    // Projects / Websites
    if (text.includes('build a website') || text.includes('1 website') || text.includes('project')) {
      updateTarget('creative', 'website', 1);
    }

    // Skills
    if (text.includes('skill') || text.includes('new skill')) {
      updateTarget('exploration', 'skill', 1);
    }

    return updated;
  }

  /**
   * Generates comprehensive weekly review with target vs actual analysis,
   * consistency scores, praise, and constructive accountability feedback.
   */
  static generateWeeklyReview(targets: WeeklyTarget[]): WeeklyReviewData {
    const academicTargets = targets.filter(t => t.category === 'academic');
    const academicUnitsCompleted = academicTargets.reduce((acc, t) => acc + t.currentCount, 0);
    const academicUnitsTarget = academicTargets.reduce((acc, t) => acc + t.targetCount, 0);

    const technicalTargets = targets.filter(t => t.category === 'technical');
    const technicalCompleted = technicalTargets.reduce((acc, t) => acc + t.currentCount, 0);
    const technicalTotal = technicalTargets.reduce((acc, t) => acc + t.targetCount, 0);

    const commTargets = targets.filter(t => t.category === 'personal');
    const commCompleted = commTargets.reduce((acc, t) => acc + t.currentCount, 0);
    const commTotal = commTargets.reduce((acc, t) => acc + t.targetCount, 0);

    const totalTargetCount = targets.reduce((acc, t) => acc + t.targetCount, 0);
    const totalCurrentCount = targets.reduce((acc, t) => acc + Math.min(t.currentCount, t.targetCount), 0);
    const overallScore = totalTargetCount > 0 ? Math.round((totalCurrentCount / totalTargetCount) * 100) : 85;

    const whatWentWell: string[] = [];
    const whatWasIgnored: string[] = [];
    const nextWeekPlan: string[] = [];

    // Analyze performance
    targets.forEach(t => {
      if (t.currentCount >= t.targetCount) {
        whatWentWell.push(`Crushed ${t.title}: Completed ${t.currentCount}/${t.targetCount} ${t.unit} (100%).`);
      } else if (t.currentCount === 0) {
        whatWasIgnored.push(`Completely missed ${t.title}: 0/${t.targetCount} ${t.unit} completed.`);
        nextWeekPlan.push(`Prioritize early scheduling for ${t.title} during Monday/Tuesday free slots.`);
      } else {
        const pct = Math.round((t.currentCount / t.targetCount) * 100);
        whatWasIgnored.push(`Partial progress on ${t.title}: ${t.currentCount}/${t.targetCount} ${t.unit} (${pct}%).`);
        nextWeekPlan.push(`Increase focus blocks for ${t.title} to bridge the remaining gap.`);
      }
    });

    if (whatWentWell.length === 0) {
      whatWentWell.push('Maintained non-negotiable gym and routine discipline.');
    }
    if (nextWeekPlan.length === 0) {
      nextWeekPlan.push('Maintain high momentum and raise target thresholds for advanced technical modules.');
    }

    const currentWeekNum = Math.ceil((new Date().getDate()) / 7);
    const weekId = `2026-W${currentWeekNum}`;

    return {
      weekIdentifier: weekId,
      academicUnitsCompleted,
      revisionsCompleted: 4,
      technicalHours: technicalCompleted * 1.5,
      linuxSessions: targets.find(t => t.title.toLowerCase().includes('linux'))?.currentCount || 2,
      projectProgress: 85,
      communicationSessions: commCompleted,
      skillLearned: targets.find(t => t.category === 'exploration')?.currentCount ? true : false,
      entertainmentSessions: targets.find(t => t.category === 'entertainment')?.currentCount || 2,
      gymConsistencyPercent: 100, // Gym is non-negotiable
      overallScore,
      whatWentWell,
      whatWasIgnored,
      nextWeekPlan,
    };
  }

  /**
   * Calculates daily score (0-100) and actionable tomorrow roadmap from evening check-in answers.
   */
  static calculateDailyScore(entry: {
    academicAnswer: string;
    technicalAnswer: string;
    projectAnswer: string;
    communicationDone: boolean;
    routineMaintained: boolean;
    knowledgeLearned: boolean;
  }): { score: number; tomorrowRecommendation: string } {
    let score = 40; // baseline for showing up

    if (entry.academicAnswer && entry.academicAnswer.trim().length > 5) score += 15;
    if (entry.technicalAnswer && entry.technicalAnswer.trim().length > 5) score += 15;
    if (entry.projectAnswer && entry.projectAnswer.trim().length > 5) score += 10;
    if (entry.communicationDone) score += 10;
    if (entry.routineMaintained) score += 5;
    if (entry.knowledgeLearned) score += 5;

    score = Math.min(100, score);

    let tomorrowRecommendation = '';
    if (score >= 90) {
      tomorrowRecommendation = 'Outstanding performance! Keep this high-energy momentum going tomorrow: execute your core CLC/OSY unit revision and tackle the next project milestone.';
    } else if (score >= 70) {
      tomorrowRecommendation = 'Strong progress today. Tomorrow, protect your post-gym 07:45 PM slot for focused Technical Beast practice to hit all weekly targets.';
    } else {
      tomorrowRecommendation = 'A slower day is completely normal. Tomorrow is a fresh start: lock in your morning college lectures, crush your gym session, and complete 45 minutes of focused study.';
    }

    return { score, tomorrowRecommendation };
  }

  /**
   * Fetches daily knowledge (Space Byte, Tech Byte, Computer Byte, Life Byte) for a given date.
   */
  static getTodayKnowledge(dateStr?: string): DailyKnowledgeItem {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const match = INITIAL_DAILY_KNOWLEDGE_POOL.find(k => k.date === targetDate);
    if (match) return match;

    // Fallback: rotate based on day of month
    const day = new Date(targetDate).getDate();
    const index = day % INITIAL_DAILY_KNOWLEDGE_POOL.length;
    return {
      ...INITIAL_DAILY_KNOWLEDGE_POOL[index],
      date: targetDate,
    };
  }

  /**
   * Decreases project and exploration intensity when official MSBTE exams are approaching.
   */
  static adjustProjectIntensityForExams(projects: WeeklyProject[], msbteEvents: MSBTECalendarEvent[]): WeeklyProject[] {
    const today = new Date();
    const isExamClose = msbteEvents.some(event => {
      if (event.category === 'class_test' || event.category === 'practical_exam' || event.category === 'theory_exam') {
        const eventDate = new Date(event.startDate);
        const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 10;
      }
      return false;
    });

    if (!isExamClose) return projects;

    return projects.map(p => {
      if (p.status === 'in_progress') {
        return {
          ...p,
          status: 'paused_for_exams',
          learnings: `${p.learnings || ''} (Intensity automatically throttled for upcoming MSBTE examinations to protect 98% academic target).`.trim(),
        };
      }
      return p;
    });
  }
}
