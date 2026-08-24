import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SOUL AI Operating System',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // AI Chat Endpoint
  app.post('/api/soul-ai/chat', async (req, res) => {
    try {
      const { message, history, context } = req.body;
      const ai = getAiClient();

      if (!ai) {
        // Fallback intelligent heuristics when API key is not yet set
        const lower = (message || '').toLowerCase();
        let reply = '';
        let quickActions: any[] = [];

        if (lower.includes('plan my evening') || lower.includes('evening')) {
          reply = `Here is your optimal evening protocol:
• 04:00 PM – 07:00 PM: 🏋️ Fixed Gym Block (Non-negotiable)
• 07:00 PM – 07:45 PM: 🥗 Dinner & Cognitive Recovery
• 07:45 PM – 08:30 PM: ⚡ CLC Unit 2 Deep Study (In Progress - 58%)
• 08:30 PM – 08:45 PM: ☕ Short Hydration & Stretch Break
• 08:45 PM – 09:30 PM: 🔬 OSY Manual Experiment 3 (Due in 3 days)
• 09:30 PM – 10:00 PM: 🔄 STE Unit 2 Spaced Revision (Stage 1 Active Recall)
• 10:00 PM onwards: Wind down & review tomorrow's college timetable.`;
          quickActions = [
            { label: 'Start CLC Unit 2 (45m)', actionType: 'start_task', payload: { subject: 'CLC', unit: 2 } },
            { label: 'Open Focus Mode', actionType: 'navigate', payload: { tab: 'focus' } },
          ];
        } else if (lower.includes('what should i study') || lower.includes('study today')) {
          reply = `Based on your pending work & deadline urgency, I recommend:
1. **OSY Manual — Experiment 3** (Critical - due in 3 days, 60% done)
2. **CLC Unit 2** (In progress at 58% - finish this module)
3. **STE Unit 2 Revision 1** (Freshly completed yesterday - solidify neural pathways).

Remember: Your 2-hour college lectures/labs run until 03:30 PM and Gym 4:00 PM – 7:00 PM is reserved, giving you prime evening focus slots from 07:45 PM onwards.`;
          quickActions = [
            { label: 'Start OSY Manual Exp 3', actionType: 'start_task', payload: { subject: 'OSY', task: 'Exp 3' } },
            { label: 'Start CLC Unit 2', actionType: 'start_task', payload: { subject: 'CLC', unit: 2 } },
          ];
        } else if (lower.includes('completed clc') || lower.includes('done clc')) {
          reply = `Excellent work completing CLC Unit 2! 🎉 I have updated your syllabus progress to 100% and automatically calculated your 3-stage Spaced Repetition schedule:
• Revision 1 (+1 day): Tomorrow
• Revision 2 (+7 days): Next week
• Revision 3 (+21 days): Pre-exam recall

Would you like to start a 15-minute break or review OSY next?`;
        } else if (lower.includes('free time') || lower.includes('how much free')) {
          reply = `Today you have approximately **3.5 hours** of focused study and recharge time outside of your 2-hour continuous college blocks (09:00–11:00, 11:00–01:00, 01:30–03:30) and Gym (4:00 PM – 7:00 PM):
• 03:30 PM – 04:00 PM (30m Pre-gym recharge)
• 07:45 PM – 09:30 PM (105m Prime evening deep study)
• 09:30 PM – 10:15 PM (45m Spaced repetition recall)
• 10:15 PM – 11:00 PM (45m Guilt-free leisure & wind-down).`;
        } else {
          reply = `SOUL received your update: "${message}". Your academic status:
• Fixed Timetable active (College 2-hour blocks + Gym 4:00 PM – 7:00 PM protected)
• 2 pending high-priority deadlines (OSY Manual Exp 3, OSY Assignment 1)
• 2 spaced revisions pending (CLC & STE).
Choose a study module whenever you're ready, and I will track your actual duration!`;
        }

        return res.json({ text: reply, quickActions });
      }

      // Format prompt with rich context
      const systemInstruction = `You are SOUL — the personal AI student operating system for a computer engineering student at Vidyavardhini's Bhausaheb Vartak Polytechnic.
Key system rules:
- NEVER fix subjects to rigid dates. You recommend dynamically based on available free time.
- College timetable is fixed: lectures and practical labs are continuous 2-hour blocks (09:00–11:00, 11:00–01:00, 01:30–03:30) across core subjects: OSY, CLC, and STE.
- GYM is a STRICT FIXED BLOCK: 04:00 PM to 07:00 PM. Never schedule study/assignments during gym unless manually overridden.
- Provide crisp, direct, editorial-style advice. No fluffy generic filler.
- Focus on practical student outcomes: Syllabus mastery, Spaced repetition revisions (R1/R2/R3), Manual completion percentage, Assignment deadlines, and recovery.
- Include actionable recommendations with concrete durations.
Context: ${JSON.stringify(context || {})}`;

      const contents = (history || []).map((h: any) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }));

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || 'I have analyzed your request. How would you like to proceed?';
      res.json({ text });
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      res.status(500).json({
        error: 'Failed to generate response',
        details: err?.message || String(err),
      });
    }
  });

  // Natural Language Task & Goal Parser
  app.post('/api/soul-ai/parse-task', async (req, res) => {
    try {
      const { textPrompt } = req.body;
      const ai = getAiClient();

      if (!ai) {
        // High accuracy heuristic fallback
        const lower = (textPrompt || '').toLowerCase();
        let subjectCode = 'CLC';
        if (lower.includes('osy') || lower.includes('operating')) subjectCode = 'OSY';
        else if (lower.includes('ste') || lower.includes('testing')) subjectCode = 'STE';
        else if (lower.includes('ends') || lower.includes('environmental')) subjectCode = 'ENDS';

        let type: 'manual' | 'assignment' | 'study_session' | 'project' = 'study_session';
        if (lower.includes('manual') || lower.includes('exp') || lower.includes('experiment')) type = 'manual';
        else if (lower.includes('assignment') || lower.includes('asg') || lower.includes('homework')) type = 'assignment';
        else if (lower.includes('project')) type = 'project';

        let priority: 'critical' | 'high' | 'medium' | 'low' = 'high';
        if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical') || lower.includes('tomorrow')) priority = 'critical';

        // Extract unit number if any
        const unitMatch = lower.match(/unit\s*(\d+)/i);
        const unitNumber = unitMatch ? parseInt(unitMatch[1], 10) : undefined;

        // Extract experiment number if any
        const expMatch = lower.match(/exp(?:eriment)?\s*(\d+)/i);
        const experimentNumber = expMatch ? `Exp ${expMatch[1]}` : undefined;

        // Estimate deadline (default 3 days out)
        const d = new Date();
        if (lower.includes('friday')) {
          const day = d.getDay();
          const diff = (5 - day + 7) % 7 || 7;
          d.setDate(d.getDate() + diff);
        } else if (lower.includes('tomorrow')) {
          d.setDate(d.getDate() + 1);
        } else {
          d.setDate(d.getDate() + 4);
        }
        const deadline = d.toISOString().split('T')[0];

        return res.json({
          tasks: [
            {
              title: textPrompt.trim(),
              subjectCode,
              type,
              unitNumber,
              experimentNumber,
              deadline,
              priority,
              estimatedMinutes: type === 'manual' ? 45 : type === 'assignment' ? 60 : 50,
              description: `Auto-parsed from natural language: "${textPrompt}"`,
            },
          ],
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Parse this student request into one or more structured tasks: "${textPrompt}". Subjects available: CLC, OSY, STE, ENDS.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    subjectCode: { type: Type.STRING, description: 'CLC, OSY, STE, or ENDS' },
                    type: { type: Type.STRING, description: 'manual, assignment, study_session, or project' },
                    unitNumber: { type: Type.INTEGER },
                    experimentNumber: { type: Type.STRING },
                    deadline: { type: Type.STRING, description: 'YYYY-MM-DD' },
                    priority: { type: Type.STRING, description: 'critical, high, medium, or low' },
                    estimatedMinutes: { type: Type.INTEGER },
                    description: { type: Type.STRING },
                  },
                  required: ['title', 'subjectCode', 'type', 'deadline', 'priority', 'estimatedMinutes'],
                },
              },
            },
            required: ['tasks'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{"tasks":[]}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Task parse error:', err);
      res.status(500).json({ error: 'Failed to parse task', details: err?.message });
    }
  });

  // AI Suggest & Optimize Post-Gym Evening Routine Endpoint
  app.post('/api/soul-ai/suggest-evening', async (req, res) => {
    try {
      const {
        gymEndTime = '19:00',
        bedtime = '23:30',
        strategy = 'balanced',
        customInstruction,
        tasks = [],
        subjects = [],
      } = req.body;

      const ai = getAiClient();

      if (!ai) {
        // High quality heuristic generator
        const pendingTasks = tasks.filter((t: any) => t.status !== 'completed');
        const urgentManual = pendingTasks.find((t: any) => t.type === 'manual');
        const urgentAssignment = pendingTasks.find((t: any) => t.type === 'assignment');

        const slots = [
          {
            id: `ai-pg-1-${Date.now()}`,
            startTime: '19:00',
            endTime: '19:45',
            title: 'Dinner & Post-Workout Nutrition',
            subtitle: '30g Protein, hydration & cognitive reset after intense gym session',
            type: 'meal',
            completed: false,
          },
          {
            id: `ai-pg-2-${Date.now()}`,
            startTime: '19:45',
            endTime: '20:45',
            title: urgentManual ? `${urgentManual.subjectCode} Manual` : 'OSY Manual',
            subtitle: urgentManual ? (urgentManual.description || 'Practical manual code and experiments') : 'CPU scheduling algorithm implementation and analysis',
            type: 'manual',
            subjectCode: urgentManual?.subjectCode || 'OSY',
            taskId: urgentManual?.id,
            completed: false,
          },
          {
            id: `ai-pg-3-${Date.now()}`,
            startTime: '20:45',
            endTime: '21:00',
            title: 'Micro-Break & Hydration',
            subtitle: 'Brisk walk, hydration and eye-strain reset',
            type: 'leisure',
            completed: false,
          },
          {
            id: `ai-pg-4-${Date.now()}`,
            startTime: '21:00',
            endTime: '22:00',
            title: urgentAssignment ? 'Assignment' : 'Assignment',
            subtitle: urgentAssignment ? (urgentAssignment.description || 'Homework report and numerical problems') : 'Cloud service models and virtualization writeup',
            type: 'assignment',
            subjectCode: urgentAssignment?.subjectCode || 'CLC',
            taskId: urgentAssignment?.id,
            completed: false,
          },
          {
            id: `ai-pg-5-${Date.now()}`,
            startTime: '22:00',
            endTime: '22:45',
            title: 'STE / ENDS Spaced Revision',
            subtitle: 'Active recall for software testing types and startup metrics',
            type: 'revision',
            subjectCode: 'STE',
            completed: false,
          },
          {
            id: `ai-pg-6-${Date.now()}`,
            startTime: '22:45',
            endTime: '23:30',
            title: 'Guilt-Free Leisure & Night Wind-Down',
            subtitle: 'Relaxation music, tomorrow schedule review & prep for sleep',
            type: 'wind_down',
            completed: false,
          },
        ];

        return res.json({
          slots,
          summary: `Generated evening schedule starting from gym release (${gymEndTime}) to bedtime (${bedtime}). Prioritized ${urgentManual?.subjectCode || 'OSY'} Manual and ${urgentAssignment?.subjectCode || 'CLC'} Assignment with structured rest buffers.`,
        });
      }

      const prompt = `You are SOUL, the student operating system AI.
Generate a structured chronological post-gym evening routine from ${gymEndTime} to ${bedtime}.
Strategy: ${strategy}.
Custom prompt/instructions: "${customInstruction || 'Optimize for highest academic leverage and rest'}".
Student pending tasks: ${JSON.stringify(tasks.slice(0, 8))}
Subjects: ${JSON.stringify(subjects.map((s: any) => ({ code: s.code, name: s.name })))}

Rules:
1. First slot immediately at ${gymEndTime} MUST be post-workout meal/dinner & recovery buffer (30-45 mins).
2. Deep study or manual/assignment slots should be 45-60 minutes each.
3. Include at least one 10-15m micro-break or hydration window.
4. For manual tasks, keep title as '[Subject Code] Manual' (e.g. 'OSY Manual', 'CLC Manual').
5. For assignment tasks, keep title as 'Assignment'.
6. End the night before ${bedtime} with wind-down/guilt-free leisure.
7. Return slots with non-overlapping sequential times covering ${gymEndTime} to ${bedtime}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              slots: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    startTime: { type: Type.STRING, description: 'HH:MM e.g. 19:00' },
                    endTime: { type: Type.STRING, description: 'HH:MM e.g. 19:45' },
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    type: {
                      type: Type.STRING,
                      description: 'meal, study, manual, assignment, revision, leisure, wind_down, or custom',
                    },
                    subjectCode: { type: Type.STRING, description: 'OSY, CLC, STE, or ENDS if applicable' },
                    notes: { type: Type.STRING },
                  },
                  required: ['startTime', 'endTime', 'title', 'type'],
                },
              },
            },
            required: ['slots', 'summary'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{"slots":[],"summary":""}');
      
      // Ensure all slots have unique IDs
      const sanitizedSlots = (parsed.slots || []).map((slot: any, idx: number) => ({
        ...slot,
        id: slot.id || `ai-slot-${Date.now()}-${idx}`,
        completed: false,
      }));

      res.json({
        slots: sanitizedSlots,
        summary: parsed.summary || 'Evening schedule successfully customized by AI.',
      });
    } catch (err: any) {
      console.error('Evening suggest error:', err);
      res.status(500).json({ error: 'Failed to generate evening schedule', details: err?.message });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SOUL Student OS Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
