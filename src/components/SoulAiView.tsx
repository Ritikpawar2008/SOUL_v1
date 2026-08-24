import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Flame, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Play, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { 
  AcademicTask, 
  ActivityHistoryItem, 
  Subject, 
  TimetableSlot, 
  UserPreferences 
} from '../types';
import { getDayOfWeekFromDate } from '../lib/schedulingEngine';

interface SoulAiViewProps {
  preferences: UserPreferences;
  currentTime: Date;
  timetable: TimetableSlot[];
  subjects: Subject[];
  tasks: AcademicTask[];
  history: ActivityHistoryItem[];
  onStartStudySession: (item: any) => void;
  onNavigateTab: (tab: any) => void;
  onLogUnitStudy: (subjectCode: string, unitNumber: number, minutes: number, completed: boolean) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
  quickActions?: {
    label: string;
    actionType: 'start_task' | 'navigate' | 'complete_unit';
    payload: any;
  }[];
}

const QUICK_PROMPTS = [
  'Plan my evening',
  'What should I study today?',
  'I have completed CLC Unit 2',
  'I couldn’t complete my assignment',
  'Move my study session',
  'I have an exam next week',
  'How much free time do I have?',
];

export const SoulAiView: React.FC<SoulAiViewProps> = ({
  preferences,
  currentTime,
  timetable,
  subjects,
  tasks,
  history,
  onStartStudySession,
  onNavigateTab,
  onLogUnitStudy,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'model',
      text: `Hello! I am **SOUL**, your personal student operating system. 

I understand your fixed college timetable at ${preferences.collegeName} (2-hour continuous lecture & practical blocks), your non-negotiable **Gym block (04:00 PM – 07:00 PM)**, and your syllabus across **CLC, OSY, and STE**.

How can I optimize your academic flow right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: 'Plan My Evening', actionType: 'navigate', payload: { prompt: 'Plan my evening' } },
        { label: 'What Should I Study?', actionType: 'navigate', payload: { prompt: 'What should I study today?' } },
      ],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    const currentDay = getDayOfWeekFromDate(currentTime);

    // Build rich student context for Gemini
    const context = {
      currentDay,
      currentTime: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      preferences,
      pendingTasks: tasks.filter(t => t.status !== 'completed').map(t => ({
        title: t.title,
        subject: t.subjectCode,
        deadline: t.deadline,
        priority: t.priority,
        type: t.type,
      })),
      subjectsOverview: subjects.map(s => ({
        code: s.code,
        completedUnits: s.units.filter(u => u.status === 'completed').length,
        totalUnits: s.units.length,
        studyingUnit: s.units.find(u => u.status === 'studying')?.unitNumber,
      })),
      recentActivity: history.slice(0, 3),
    };

    try {
      const res = await fetch('/api/soul-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6),
          context,
        }),
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-reply`,
        sender: 'model',
        text: data.text || 'I have analyzed your situation. What would you like to do next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: data.quickActions || [],
      };

      setMessages(prev => [...prev, aiMessage]);

      // If message indicated completion of a unit, trigger state update
      const lower = textToSend.toLowerCase();
      if (lower.includes('completed clc') || lower.includes('done clc')) {
        onLogUnitStudy('CLC', 2, 45, true);
      } else if (lower.includes('completed osy') || lower.includes('done osy')) {
        onLogUnitStudy('OSY', 2, 45, true);
      }
    } catch (err) {
      console.error('Chat failed:', err);
      // Fallback
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-fallback`,
          sender: 'model',
          text: `I have received your request: "${textToSend}".
• Gym block (04:00 PM – 07:00 PM) remains protected.
• Your highest academic priority is OSY Manual Exp 3 (due in 3 days) and CLC Unit 2.
• Would you like me to start a 45-minute focus session?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: any) => {
    if (action.actionType === 'start_task') {
      onStartStudySession({
        subjectCode: action.payload?.subject || 'CLC',
        unitNumber: action.payload?.unit || 2,
        title: action.payload?.task || `${action.payload?.subject || 'CLC'} Study Session`,
      });
      onNavigateTab('today');
    } else if (action.actionType === 'navigate') {
      if (action.payload?.prompt) {
        handleSendMessage(action.payload.prompt);
      } else if (action.payload?.tab) {
        onNavigateTab(action.payload.tab);
      }
    }
  };

  return (
    <div className="space-y-6 pb-16 flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      
      {/* Top Banner */}
      <section className="relative overflow-hidden p-6 bg-[#0C1214] border border-cyan-500/30 flex items-center justify-between gap-4 shrink-0">
        <div className="absolute right-0 bottom-0 text-7xl font-black tracking-tighter leading-none text-white/[0.02] select-none pointer-events-none uppercase font-display">
          INTELLIGENCE
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-display font-black text-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">SOUL INTELLIGENCE CO-PILOT</h3>
              <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 text-[9px] font-mono font-black uppercase tracking-wider">
                GEMINI 3.7 FLASH
              </span>
            </div>
            <p className="text-xs font-mono text-white/50 uppercase mt-0.5">
              TIMETABLE SYNC • GYM CONSTRAINT GUARDS • ADAPTIVE RESCHEDULING
            </p>
          </div>
        </div>

        <div className="relative z-10 hidden sm:flex items-center gap-2 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
          <span className="w-2 h-2 bg-cyan-400 animate-ping" />
          <span>CONNECTED TO SYSTEM STATE</span>
        </div>
      </section>

      {/* CHAT LOG CONTAINER */}
      <div className="flex-1 bg-[#0C1214] p-6 border border-white/10 overflow-y-auto space-y-4">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[70%] p-5 space-y-3 ${
                  isUser
                    ? 'bg-cyan-400 text-black font-semibold font-sans'
                    : 'bg-white/5 border border-white/10 text-white/90 font-sans text-sm'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">
                  {msg.text}
                </div>

                {/* Quick Interactive Actions */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {msg.quickActions.map((qa, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(qa)}
                        className="px-3.5 py-1.5 bg-white text-black hover:bg-cyan-400 text-xs font-mono font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{qa.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] font-mono ${isUser ? 'text-black/60' : 'text-white/40'} text-right`}>
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 bg-white text-black flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-white/5 border border-white/10 flex items-center gap-3 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 bg-cyan-400 animate-ping" />
              <span className="uppercase font-bold tracking-wider">SOUL is analyzing your schedule and constraints...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* QUICK PROMPT PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-4 py-2 bg-[#0C1214] hover:bg-white/10 border border-white/10 text-xs font-mono text-white/70 hover:text-cyan-400 whitespace-nowrap uppercase font-bold tracking-wider transition cursor-pointer flex items-center gap-2"
          >
            <span className="text-cyan-400">⚡</span>
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* INPUT FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-3 bg-[#0C1214] p-2 border border-white/20 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask SOUL e.g. 'Plan my evening', 'I have a CLC test next week', 'Reschedule my study'..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          className="flex-1 px-4 py-3 bg-transparent text-white placeholder-white/30 text-sm focus:outline-none font-mono"
        />

        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-black text-xs uppercase tracking-wider transition disabled:opacity-30 cursor-pointer flex items-center gap-2"
        >
          <span>SEND</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
