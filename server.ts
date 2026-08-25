import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

let groqClient: Groq | null = null;
let geminiClient: GoogleGenAI | null = null;

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!groqClient && apiKey) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!geminiClient && apiKey) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'soul-os-build',
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    const hasGroq = Boolean(process.env.GROQ_API_KEY);
    const hasGemini = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      status: 'ok',
      service: 'SOUL AI Student Operating System',
      hasApiKey: hasGroq || hasGemini,
      hasGroqKey: hasGroq,
      hasGeminiKey: hasGemini,
      primaryEngine: hasGroq ? 'Groq (Llama 3.3 70B)' : hasGemini ? 'Gemini 3.7 Flash' : 'Smart Heuristics',
    });
  });

  // AI Chat Endpoint
  app.post('/api/soul-ai/chat', async (req, res) => {
    try {
      const { message, history, context } = req.body;
      const groq = getGroqClient();
      const gemini = getGeminiClient();

      const systemPrompt = `You are SOUL — the ultimate high-performance AI personal growth, technical mentor, and student operating system for a computer engineering student at Vidyavardhini's Bhausaheb Vartak Polytechnic.
Key system rules:
- STUDENT IS STRICTLY IN BATCH C. When recommending practical laboratory work or timetable insights, ONLY suggest Batch C labs (Tuesday CLC in L-7 with NKD, Wednesday STE in L-7 with SSK, Thursday OSY in L-4 with MRV and STE in L-5 with SSK). Never suggest Batches A, B, or D.
- Core subjects are CLC (Cloud Computing), OSY (Operating Systems), and STE (Software Testing). Entrepreneurship (ENDS) is not part of the active core syllabus.
- FIXED MSBTE 2026-27 EXAM CALENDAR:
  * Academic Term: 15 July 2026 – 30 October 2026
  * Winter 2026 Exam Form Filling: Normal (17-31 Aug), Late fee (2-8 Sep), Super late fee (10-15 Sep)
  * CT-1 (First Class Test): 10–11 September 2026
  * CT-2 (Second Class Test): 12–14 October 2026
  * Practical Exam / Viva: 2–6 November 2026
  * MSBTE Theory Board Exam: 17 November – 9 December 2026
  * Winter 2026 Results: 2nd week of January 2027 (Tentative)
  These exam dates are strictly FIXED.
- ACADEMIC TARGET IS STRICTLY 98.0%. Guide the student on maintaining top-tier scores in CTs, practical manuals, and theory.
- PERSONAL GROWTH & TECHNICAL BEAST:
  * Guide the student to become technically strong in Linux, Programming, Data Structures, Core Computer Science Systems, Full-Stack Development, and AI.
  * Follow the "LEARN -> PRACTICE -> BUILD -> EXPLAIN" framework.
  * Help the student build 1 website/product every 1-2 weeks.
  * Encourage daily 5-minute English speaking and confidence building without stress.
  * Share daily Space Bytes and deep Tech Concepts.
- BALANCED ORCHESTRATION & FLEXIBILITY:
  * Weekly targets are targets, NOT rigid daily appointments.
  * GYM is a STRICT NON-NEGOTIABLE FIXED BLOCK: 04:00 PM to 07:00 PM.
  * Sleep is hard-bounded (11:00 PM - 06:30 AM). Never schedule tasks during sleep.
  * Do NOT overload the student (Consistency beats burnout).
  * Automatically throttle optional projects during exam weeks so academic preparation takes priority.
- Provide crisp, structured, editorial-style advice. Be empowering, concise, and direct with concrete actionable steps and durations.
Current student context: ${JSON.stringify(context || {})}`;

      // 1. Try Groq (Llama 3.3 70B)
      if (groq) {
        try {
          const messages: any[] = [
            { role: 'system', content: systemPrompt },
            ...(history || []).map((h: any) => ({
              role: h.sender === 'user' ? 'user' : 'assistant',
              content: h.text,
            })),
            { role: 'user', content: message },
          ];

          const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature: 0.6,
            max_tokens: 1024,
          });

          const replyText = completion.choices[0]?.message?.content || 'I have analyzed your situation. How would you like to proceed?';
          return res.json({ text: replyText });
        } catch (groqErr) {
          console.warn('Groq chat error, attempting Gemini fallback:', groqErr);
        }
      }

      // 2. Try Gemini fallback
      if (gemini) {
        try {
          const contents = (history || []).map((h: any) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          }));
          contents.push({
            role: 'user',
            parts: [{ text: message }],
          });

          const response = await gemini.models.generateContent({
            model: 'gemini-3.7-flash',
            contents,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
            },
          });

          const text = response.text || 'I have analyzed your request. What would you like to do next?';
          return res.json({ text });
        } catch (geminiErr) {
          console.warn('Gemini chat error, using heuristics:', geminiErr);
        }
      }

      // 3. Fallback intelligent heuristics
      const lower = (message || '').toLowerCase();
      let reply = '';
      let quickActions: any[] = [];

      if (lower.includes('plan my evening') || lower.includes('evening')) {
        reply = `Here is your optimal evening protocol:
• 04:00 PM – 07:00 PM: 🏋️ Fixed Gym Block (Non-negotiable)
• 07:00 PM – 07:45 PM: 🥗 Dinner & Cognitive Recovery Buffer
• 07:45 PM – 08:30 PM: ⚡ OSY Manual Deep Focus Slot (45 mins)
• 08:30 PM – 08:45 PM: ☕ Short Hydration & Stretch Break
• 08:45 PM – 09:45 PM: 📝 CLC Assignment Sprint
• 09:45 PM – 10:30 PM: 🔄 STE Spaced Revision (Stage 1 Active Recall)
• 10:30 PM onwards: Guilt-free wind down & schedule preview.`;
        quickActions = [
          { label: 'Start OSY Manual', actionType: 'start_task', payload: { subject: 'OSY', task: 'OSY Manual' } },
          { label: 'Open Focus Mode', actionType: 'navigate', payload: { tab: 'focus' } },
        ];
      } else if (lower.includes('what should i study') || lower.includes('study today')) {
        reply = `Based on your pending priorities & schedule:
1. **OSY Manual** (Practical code and experiment writeups)
2. **CLC Unit 1 / Assignment** (Cloud computing architecture fundamentals)
3. **STE Unit 1 Spaced Revision** (Active recall).

Your 2-hour college lecture blocks run until 03:30 PM, Gym 4:00 PM – 7:00 PM is reserved, leaving prime focus slots from 07:45 PM onwards.`;
        quickActions = [
          { label: 'Start OSY Focus', actionType: 'start_task', payload: { subject: 'OSY', task: 'OSY Study' } },
          { label: 'Start CLC Focus', actionType: 'start_task', payload: { subject: 'CLC', unit: 1 } },
        ];
      } else {
        reply = `SOUL received: "${message}". Current status:
• Fixed Timetable active (College 2-hour blocks + Gym 4:00 PM – 7:00 PM protected)
• All syllabus units and tasks initialized clean for tracking
• Ready to start a 45-minute focus session whenever you are!`;
      }

      return res.json({ text: reply, quickActions });
    } catch (err: any) {
      console.error('Chat endpoint error:', err);
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
      const groq = getGroqClient();

      if (groq) {
        try {
          const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are an accurate academic task parser for engineering students. Available subjects: CLC, OSY, STE.
Extract tasks from user text and return strictly valid JSON matching this structure:
{
  "tasks": [
    {
      "title": "Clean concise task title",
      "subjectCode": "CLC" | "OSY" | "STE",
      "type": "manual" | "assignment" | "study_session" | "project",
      "unitNumber": integer or null,
      "experimentNumber": string or null,
      "deadline": "YYYY-MM-DD",
      "priority": "critical" | "high" | "medium" | "low",
      "estimatedMinutes": integer,
      "description": "Short explanation"
    }
  ]
}`,
              },
              {
                role: 'user',
                content: `Parse this into tasks: "${textPrompt}"`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          });

          const content = completion.choices[0]?.message?.content || '{"tasks":[]}';
          const parsed = JSON.parse(content);
          return res.json(parsed);
        } catch (groqErr) {
          console.warn('Groq parser error, using heuristics:', groqErr);
        }
      }

      // Heuristic fallback
      const lower = (textPrompt || '').toLowerCase();
      let subjectCode = 'CLC';
      if (lower.includes('osy') || lower.includes('operating')) subjectCode = 'OSY';
      else if (lower.includes('ste') || lower.includes('testing')) subjectCode = 'STE';
      else if (lower.includes('ends') || lower.includes('entrepreneur') || lower.includes('environmental')) subjectCode = 'ENDS';

      let type: 'manual' | 'assignment' | 'study_session' | 'project' = 'study_session';
      if (lower.includes('manual') || lower.includes('exp') || lower.includes('experiment')) type = 'manual';
      else if (lower.includes('assignment') || lower.includes('asg') || lower.includes('homework')) type = 'assignment';
      else if (lower.includes('project')) type = 'project';

      let priority: 'critical' | 'high' | 'medium' | 'low' = 'high';
      if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical') || lower.includes('tomorrow')) priority = 'critical';

      const d = new Date();
      d.setDate(d.getDate() + 3);
      const deadline = d.toISOString().split('T')[0];

      return res.json({
        tasks: [
          {
            title: textPrompt.trim(),
            subjectCode,
            type,
            deadline,
            priority,
            estimatedMinutes: type === 'manual' ? 45 : type === 'assignment' ? 60 : 45,
            description: `Parsed: "${textPrompt}"`,
          },
        ],
      });
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

      const groq = getGroqClient();

      if (groq) {
        try {
          const prompt = `You are SOUL, the student operating system AI.
Generate a structured chronological post-gym evening routine from ${gymEndTime} to ${bedtime}.
Strategy: ${strategy}.
Custom prompt: "${customInstruction || 'Optimize for highest academic leverage and rest'}".
Student pending tasks: ${JSON.stringify(tasks.slice(0, 8))}
Subjects: ${JSON.stringify(subjects.map((s: any) => ({ code: s.code, name: s.name })))}

Rules:
1. First slot immediately at ${gymEndTime} MUST be post-workout meal/dinner & recovery buffer (30-45 mins).
2. Deep study or manual/assignment slots should be 45-60 minutes each.
3. Include at least one 10-15m micro-break or hydration window.
4. For manual tasks, keep title as '[Subject Code] Manual' (e.g. 'OSY Manual', 'CLC Manual').
5. For assignment tasks, keep title as 'Assignment'.
6. End the night before ${bedtime} with wind-down/guilt-free leisure.
7. Return strictly JSON with non-overlapping sequential times covering ${gymEndTime} to ${bedtime}:
{
  "summary": "Brief summary of routine",
  "slots": [
    {
      "id": "slot-1",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "title": "Title",
      "subtitle": "Short subtitle",
      "type": "meal" | "study" | "manual" | "assignment" | "revision" | "leisure" | "wind_down",
      "subjectCode": "OSY" | "CLC" | "STE" | "ENDS" (optional),
      "notes": "optional notes"
    }
  ]
}`;

          const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'You generate high-precision student evening schedules in valid JSON format.' },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
          });

          const content = completion.choices[0]?.message?.content || '{"slots":[],"summary":""}';
          const parsed = JSON.parse(content);
          const sanitizedSlots = (parsed.slots || []).map((slot: any, idx: number) => ({
            ...slot,
            id: slot.id || `ai-slot-${Date.now()}-${idx}`,
            completed: false,
          }));

          return res.json({
            slots: sanitizedSlots,
            summary: parsed.summary || 'Evening routine generated by SOUL Groq Intelligence.',
          });
        } catch (groqErr) {
          console.warn('Groq evening error, using heuristics:', groqErr);
        }
      }

      // Fallback
      const slots = [
        {
          id: `ai-pg-1-${Date.now()}`,
          startTime: '19:00',
          endTime: '19:45',
          title: 'Dinner & Post-Workout Nutrition',
          subtitle: '30g Protein, hydration & cognitive reset after gym',
          type: 'meal',
          completed: false,
        },
        {
          id: `ai-pg-2-${Date.now()}`,
          startTime: '19:45',
          endTime: '20:45',
          title: 'OSY Manual',
          subtitle: 'Operating Systems practicals & CPU scheduling implementation',
          type: 'manual',
          subjectCode: 'OSY',
          completed: false,
        },
        {
          id: `ai-pg-3-${Date.now()}`,
          startTime: '20:45',
          endTime: '21:00',
          title: 'Micro-Break & Hydration',
          subtitle: 'Brisk walk, hydration & mental recharge',
          type: 'leisure',
          completed: false,
        },
        {
          id: `ai-pg-4-${Date.now()}`,
          startTime: '21:00',
          endTime: '22:00',
          title: 'Assignment',
          subtitle: 'Cloud service models comparative study & numerical problems',
          type: 'assignment',
          subjectCode: 'CLC',
          completed: false,
        },
        {
          id: `ai-pg-5-${Date.now()}`,
          startTime: '22:00',
          endTime: '22:45',
          title: 'STE / ENDS Spaced Revision',
          subtitle: 'Stage 1 active recall & key definitions revision',
          type: 'revision',
          subjectCode: 'STE',
          completed: false,
        },
        {
          id: `ai-pg-6-${Date.now()}`,
          startTime: '22:45',
          endTime: '23:30',
          title: 'Guilt-Free Leisure & Night Wind-Down',
          subtitle: 'Lo-Fi music, digital scratchpad & preparation for sleep',
          type: 'wind_down',
          completed: false,
        },
      ];

      return res.json({
        slots,
        summary: `Evening schedule generated covering post-gym release (${gymEndTime}) to bedtime (${bedtime}).`,
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
