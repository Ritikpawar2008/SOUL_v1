import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';

const groqApiKey = process.env.GROQ_API_KEY || '';
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.query.path as string || req.url || '';

  if (path.includes('health')) {
    return res.status(200).json({
      status: 'ok',
      engine: 'Groq Llama 3.3 70B (Vercel Serverless)',
      hasGroqKey: Boolean(groqApiKey),
    });
  }

  if (path.includes('chat') && req.method === 'POST') {
    try {
      const { message, history, context } = req.body || {};
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

      if (groq) {
        const messages: any[] = [
          { role: 'system', content: systemPrompt },
          ...(history || []).map((h: any) => ({
            role: h.sender === 'user' ? 'user' : 'assistant',
            content: h.text,
          })),
          { role: 'user', content: message || 'Hello' },
        ];

        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.6,
          max_tokens: 1024,
        });

        const replyText = completion.choices[0]?.message?.content || 'I have analyzed your situation.';
        return res.status(200).json({ text: replyText });
      }

      return res.status(200).json({
        text: `SOUL received: "${message}". Timetable and Gym (4:00 PM – 7:00 PM) are protected. You can start a 45-minute focus session on OSY Manual or CLC whenever ready.`,
      });
    } catch (err: any) {
      console.error('Vercel chat error:', err);
      return res.status(500).json({ error: 'Chat failed', details: err?.message });
    }
  }

  if (path.includes('parse-task') && req.method === 'POST') {
    try {
      const { textPrompt } = req.body || {};
      if (groq) {
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
            { role: 'user', content: `Parse this into tasks: "${textPrompt}"` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });

        const parsed = JSON.parse(completion.choices[0]?.message?.content || '{"tasks":[]}');
        return res.status(200).json(parsed);
      }

      const d = new Date();
      d.setDate(d.getDate() + 3);
      return res.status(200).json({
        tasks: [
          {
            title: textPrompt,
            subjectCode: 'CLC',
            type: 'study_session',
            deadline: d.toISOString().split('T')[0],
            priority: 'high',
            estimatedMinutes: 45,
            description: textPrompt,
          },
        ],
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Parse failed', details: err?.message });
    }
  }

  if (path.includes('suggest-evening') && req.method === 'POST') {
    try {
      const { gymEndTime = '19:00', bedtime = '23:30', strategy = 'balanced', customInstruction, tasks = [], subjects = [] } = req.body || {};
      
      if (groq) {
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

        const parsed = JSON.parse(completion.choices[0]?.message?.content || '{"slots":[],"summary":""}');
        const sanitizedSlots = (parsed.slots || []).map((slot: any, idx: number) => ({
          ...slot,
          id: slot.id || `ai-slot-${Date.now()}-${idx}`,
          completed: false,
        }));

        return res.status(200).json({
          slots: sanitizedSlots,
          summary: parsed.summary || 'Evening routine generated by SOUL Groq Intelligence.',
        });
      }

      return res.status(200).json({
        slots: [],
        summary: 'Evening schedule generated.',
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Evening suggestion failed', details: err?.message });
    }
  }

  return res.status(404).json({ error: 'Not found' });
}
