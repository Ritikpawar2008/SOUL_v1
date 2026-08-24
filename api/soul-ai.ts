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
      const systemPrompt = `You are SOUL — the high-performance AI personal student operating system for a computer engineering student at Vidyavardhini's Bhausaheb Vartak Polytechnic.
Key system rules:
- NEVER fix subjects to rigid calendar dates. Recommend dynamically based on available free time and pending urgency.
- College timetable is fixed: lectures and practical labs are continuous 2-hour blocks (09:00–11:00, 11:00–01:00, 01:30–03:30) across core subjects: OSY, CLC, STE, and ENDS.
- GYM is a STRICT NON-NEGOTIABLE FIXED BLOCK: 04:00 PM to 07:00 PM. Never schedule study/assignments during gym.
- Provide crisp, structured, editorial-style advice. Be empowering, concise, and direct with concrete actionable steps and durations.
- Focus on practical student outcomes: Syllabus mastery, Spaced repetition revisions (R1/R2/R3), Manual completion percentage, Assignment deadlines, and physical recovery.
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
              content: `You are an accurate academic task parser for engineering students. Available subjects: CLC, OSY, STE, ENDS.
Extract tasks from user text and return strictly valid JSON matching this structure:
{
  "tasks": [
    {
      "title": "Clean concise task title",
      "subjectCode": "CLC" | "OSY" | "STE" | "ENDS",
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
