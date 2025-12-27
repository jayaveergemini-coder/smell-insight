import { useState } from 'react';
import {
  Files,
  Search,
  AlertTriangle,
  Puzzle,
  Settings,
  LucideIcon,
} from 'lucide-react';

export type ActivityView = 'explorer' | 'search' | 'smells' | 'extensions' | 'settings';

interface ActivityBarProps {
  activeView: ActivityView;
  onViewChange: (view: ActivityView) => void;
}

interface ActivityItem {
  id: ActivityView;
  icon: LucideIcon;
  label: string;
}

const activities: ActivityItem[] = [
  { id: 'explorer', icon: Files, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'smells', icon: AlertTriangle, label: 'Code Smell Analysis' },
  { id: 'extensions', icon: Puzzle, label: 'Extensions' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  return (
    <aside className="w-12 bg-sidebar-bg border-r border-border flex flex-col items-center py-2 shrink-0">
      {activities.map((activity) => {
        const Icon = activity.icon;
        const isActive = activeView === activity.id;
        
        return (
          <div key={activity.id} className="relative group">
            <button
              onClick={() => onViewChange(activity.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg mb-1 transition-all ${
                isActive
                  ? 'bg-primary/15 text-primary border-l-2 border-primary -ml-[1px]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
            
            {/* Tooltip */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {activity.label}
            </div>
          </div>
        );
      })}
      
      <div className="flex-1" />
      
      {/* Bottom indicator */}
      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
        <span className="text-[9px] font-bold text-accent">FYP</span>
      </div>
    </aside>
  );
}
