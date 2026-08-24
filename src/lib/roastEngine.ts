import { RoastItem, SoulRoastSettings, TaskSkipReason } from '../types';

const ROAST_TEMPLATES = {
  friendly: {
    missed_task: [
      "Hey! Looks like this task got left behind. Let's get back on track! ✨",
      "Procrastination happens, but your 98% goal won't hit itself. Let's conquer it! 🚀",
      "That task is still waiting for you. Take a breath and let's start fresh! 💡",
    ],
    postponed: [
      "Pushed it back again? Remember small steps lead to big victories! 🎯",
      "Postponing is okay once, but consistency is key for MSBTE mastery. Let's lock in! 💪",
      "Don't let pending tasks pile up. You've got this! 🌟",
    ],
    missed_assignment: [
      "Heads up! That assignment deadline passed. Let's finish it before submission! 📝",
      "Submitting early beats rushing late every time. Let's wrap this up! ⏳",
    ],
    skipped_session: [
      "Missed the focus session? No worries, let's schedule a quick 25-minute sprint now! ⏱️",
      "Consistency builds champions. Ready for a quick study session? 🧠",
    ],
    completed_encouragement: [
      "Great job finishing that! Momentum is building. Keep going! 🔥",
      "Task crushed! One step closer to that 98% target. 🚀",
      "Solid focus! You're making real progress today. ⭐",
    ],
  },
  savage: {
    missed_task: [
      "Bro, the task didn't disappear. You just disappeared from the task. 💀",
      "Your pending task is aging like milk on a hot Mumbai afternoon. 🥛",
      "Ghosting your syllabus won't make the MSBTE examiner ghost your paper. 👻",
      "The task had one job: to be completed by you. You had one job: to complete it. Both failed. 💀",
    ],
    postponed: [
      "{taskTitle} has been waiting longer than some friendships. 😭",
      "Rescheduling this task for the 5th time? Is it a study session or an album release? 💿",
      "You've postponed this so much, it's about to graduate before you do. 🎓💀",
      "Keep pushing it back and you'll be revising this in Semester 6. 😭",
    ],
    missed_assignment: [
      "That deadline was real, bro. It wasn't a suggestion. 💀",
      "Your assignment is currently in the void. Teachers do grade these, you know? 📄",
      "Missing assignment deadlines while dreaming of 98%? Math ain't mathing. 📉",
    ],
    skipped_session: [
      "You scheduled the study session. You skipped the study session. SOUL is disappointed. 😭",
      "Setting a timer and scrolling Instagram is not what we meant by 'Deep Focus'. 📱💀",
      "Your brain wanted focus. Your thumb chose reels. Character regression. 📉",
    ],
    completed_encouragement: [
      "Finally. Character development unlocked. 🔥",
      "Look at you actually doing what you planned. Who are you and what did you do with the procrastinator? 🧠✨",
      "W in the chat! You actually finished it. Proud of you. 👑",
    ],
  },
  maximum: {
    missed_task: [
      "Bro is allergic to finishing tasks. Call an ambulance. 🚑💀",
      "The task literally had feelings and you broke its heart. 💔",
      "At this rate, AI will finish your diploma before you finish this task. 🤖💀",
      "Bro, your task is filing a missing person report on you right now. 📋💀",
    ],
    postponed: [
      "Postponed again? The Guinness World Records team just called regarding your delay streak. 🏆😭",
      "{taskTitle} has applied for senior citizen pension waiting for you. 👴💀",
      "You've rescheduled this so many times it qualifies as a renewable energy source. ⚡",
    ],
    missed_assignment: [
      "Teacher's red pen is already warming up. That deadline wasn't an optional quest! 🚨💀",
      "98% target saw you miss that assignment and took a screenshot for evidence. 📸😭",
    ],
    skipped_session: [
      "Bro skipped the study session like it was an 8 AM Monday morning lecture. 🛌💀",
      "SOUL's neural networks felt physical pain when you skipped that focus block. 💔🤖",
    ],
    completed_encouragement: [
      "ABSOLUTE ACADEMIC WEAPON! You actually locked in! 🚀🔥",
      "98% TARGET JUST MOVED CLOSER. Elite discipline! 👑⚡",
      "Finally some chef-grade cooking! That's how engineering toppers operate! 👨‍🍳🔥",
    ],
  },
};

export class RoastEngine {
  /**
   * Determine if a roast is allowed based on skip reason
   */
  static isRoastAllowed(reason?: TaskSkipReason): boolean {
    if (!reason) return true;
    const validExemptions: TaskSkipReason[] = [
      'emergency',
      'health',
      'college_work',
      'travel',
      'personal',
      'rest',
    ];
    return !validExemptions.includes(reason);
  }

  /**
   * Generate a roast or encouragement message
   */
  static generateRoast(
    type: 'missed_task' | 'postponed' | 'missed_assignment' | 'skipped_session' | 'completed_encouragement',
    settings: SoulRoastSettings,
    taskTitle?: string,
    reason?: TaskSkipReason
  ): RoastItem | null {
    // Check if roasts are globally enabled
    if (!settings.enabled && type !== 'completed_encouragement') {
      return null;
    }

    // Check specific notification toggle
    if (type === 'missed_task' && !settings.notifications.missedTaskRoast) return null;
    if (type === 'postponed' && !settings.notifications.postponedTaskRoast) return null;
    if (type === 'completed_encouragement' && !settings.notifications.completedEncouragement) return null;

    // Check exemption rule (No roast if valid reason provided)
    if (!this.isRoastAllowed(reason) && type !== 'completed_encouragement') {
      return null;
    }

    const intensity = settings.intensity || 'savage';
    const templates = ROAST_TEMPLATES[intensity][type] || ROAST_TEMPLATES['savage'][type];
    const rawTemplate = templates[Math.floor(Math.random() * templates.length)];

    const message = rawTemplate.replace('{taskTitle}', taskTitle || 'This unit/task');

    return {
      id: `roast-${Date.now()}`,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intensity,
      taskTitle,
    };
  }
}
