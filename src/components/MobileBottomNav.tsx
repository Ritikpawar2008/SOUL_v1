import React from 'react';
import { 
  Sun, 
  CalendarDays, 
  BookOpen, 
  Target, 
  Coffee, 
  Sparkles,
  Flame
} from 'lucide-react';
import { NavTabId } from './Navigation';

interface MobileBottomNavProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  pendingTasksCount?: number;
  dueRevisionsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  pendingTasksCount = 0,
  dueRevisionsCount = 0,
}) => {
  const totalBadges = pendingTasksCount + dueRevisionsCount;

  const items: {
    id: NavTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'today', label: 'TODAY', icon: Sun },
    { id: 'planner', label: 'PLANNER', icon: CalendarDays },
    { id: 'academics', label: 'ACADEMICS', icon: BookOpen, badge: totalBadges > 0 ? totalBadges : undefined },
    { id: 'focus', label: 'FOCUS', icon: Target },
    { id: 'life', label: 'LIFE', icon: Coffee },
    { id: 'soul_ai', label: 'SOUL AI', icon: Sparkles },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080C0D]/95 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom,8px)] pt-1 px-2 shadow-[0_-8px_24px_rgba(0,0,0,0.7)]">
      <div className="grid grid-cols-6 items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAi = item.id === 'soul_ai';

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-none transition-all cursor-pointer select-none active:scale-95 min-h-[52px] ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {/* Active Indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
              )}

              {/* Icon */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-cyan-400' : isAi ? 'text-cyan-300/60' : 'text-white/50'
                  }`}
                />

                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] flex items-center justify-center px-1 text-[9px] font-mono font-black bg-cyan-400 text-black rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[9px] font-mono tracking-tight uppercase mt-1 text-center truncate w-full ${
                isActive ? 'font-bold text-cyan-400' : 'font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
