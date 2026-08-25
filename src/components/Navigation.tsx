import React from 'react';
import { 
  Sun, 
  CalendarDays, 
  BookOpen, 
  Target, 
  Flame, 
  Coffee, 
  Sparkles 
} from 'lucide-react';

export type NavTabId = 'today' | 'planner' | 'academics' | 'focus' | 'goals' | 'life' | 'soul_ai';

interface NavigationProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  pendingTasksCount?: number;
  dueRevisionsCount?: number;
}

interface TabItem {
  id: NavTabId;
  number: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  pendingTasksCount = 0,
  dueRevisionsCount = 0,
}) => {
  const tabs: TabItem[] = [
    { id: 'today', number: '01', label: 'TODAY', icon: Sun },
    { id: 'planner', number: '02', label: 'PLANNER', icon: CalendarDays },
    { id: 'academics', number: '03', label: 'ACADEMICS', icon: BookOpen, badge: (pendingTasksCount + dueRevisionsCount) > 0 ? (pendingTasksCount + dueRevisionsCount) : undefined },
    { id: 'focus', number: '04', label: 'FOCUS', icon: Target },
    { id: 'goals', number: '05', label: 'GROWTH & GOALS', icon: Flame },
    { id: 'life', number: '06', label: 'LIFE', icon: Coffee },
    { id: 'soul_ai', number: '07', label: 'AI CO-PILOT', icon: Sparkles },
  ];

  return (
    <nav className="w-full border-b border-white/10 bg-[#080C0D] px-4 lg:px-8 py-0 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-3.5 text-xs font-mono tracking-[0.2em] uppercase font-bold transition-all cursor-pointer select-none border-b-2 ${
                isActive
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-400/[0.04]'
                  : 'border-transparent text-white/35 hover:text-white/80 hover:bg-white/[0.02]'
              }`}
            >
              <span className={`text-[10px] font-mono tracking-widest ${isActive ? 'text-cyan-400 font-black' : 'text-white/20'}`}>
                {tab.number}
              </span>
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-white/40'}`} />
              <span className={`tracking-[0.18em] ${isActive ? 'font-black' : 'font-semibold'}`}>{tab.label}</span>

              {tab.badge !== undefined && (
                <span className="flex items-center justify-center px-1.5 py-0.2 text-[9px] font-mono font-black bg-cyan-400 text-black">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
