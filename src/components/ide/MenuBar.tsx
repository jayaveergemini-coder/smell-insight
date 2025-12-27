import { useState, useRef, useEffect } from 'react';
import {
  File,
  Edit,
  MousePointer2,
  Layout,
  Navigation,
  Play,
  Terminal,
  HelpCircle,
  FolderOpen,
  Upload,
  X,
  FileDown,
  FileText,
  LogOut,
  Undo,
  Redo,
  Copy,
  CheckSquare,
  Trash2,
  Files,
  FileCode,
  AlertTriangle,
  XCircle,
  PanelLeft,
  PanelRight,
  PanelBottom,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Bug,
  Database,
  BarChart3,
  FileBarChart,
  Sparkles,
  ListChecks,
  Activity,
  Info,
  Lightbulb,
  Cpu,
  Brain,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';

interface MenuItemData {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  action?: string;
  highlight?: boolean;
}

interface MenuData {
  label: string;
  items: MenuItemData[];
}

const menus: MenuData[] = [
  {
    label: 'File',
    items: [
      { label: 'New Project', icon: <File className="w-4 h-4" />, shortcut: 'Ctrl+N', disabled: true },
      { label: 'Open Project Folder', icon: <FolderOpen className="w-4 h-4" />, shortcut: 'Ctrl+O', disabled: true },
      { label: 'Upload Project (ZIP)', icon: <Upload className="w-4 h-4" />, shortcut: 'Ctrl+U', action: 'upload' },
      { label: 'Close Project', icon: <X className="w-4 h-4" />, shortcut: 'Ctrl+W', action: 'close' },
      { separator: true, label: '' },
      { label: 'Save Report', icon: <FileText className="w-4 h-4" />, shortcut: 'Ctrl+S', action: 'saveReport' },
      { label: 'Export Analysis (PDF)', icon: <FileDown className="w-4 h-4" />, shortcut: 'Ctrl+E', action: 'exportPdf' },
      { separator: true, label: '' },
      { label: 'Exit', icon: <LogOut className="w-4 h-4" />, action: 'exit' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', icon: <Undo className="w-4 h-4" />, shortcut: 'Ctrl+Z', disabled: true },
      { label: 'Redo', icon: <Redo className="w-4 h-4" />, shortcut: 'Ctrl+Y', disabled: true },
      { separator: true, label: '' },
      { label: 'Copy', icon: <Copy className="w-4 h-4" />, shortcut: 'Ctrl+C', action: 'copy' },
      { label: 'Select All', icon: <CheckSquare className="w-4 h-4" />, shortcut: 'Ctrl+A', action: 'selectAll' },
      { separator: true, label: '' },
      { label: 'Clear Analysis Results', icon: <Trash2 className="w-4 h-4" />, action: 'clearResults' },
    ],
  },
  {
    label: 'Selection',
    items: [
      { label: 'Select All Files', icon: <Files className="w-4 h-4" />, action: 'selectAllFiles' },
      { label: 'Select Current File', icon: <FileCode className="w-4 h-4" />, action: 'selectCurrent' },
      { label: 'Select Smelly Files Only', icon: <AlertTriangle className="w-4 h-4" />, action: 'selectSmelly' },
      { separator: true, label: '' },
      { label: 'Clear Selection', icon: <XCircle className="w-4 h-4" />, action: 'clearSelection' },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Toggle File Explorer', icon: <PanelLeft className="w-4 h-4" />, shortcut: 'Ctrl+B', action: 'toggleExplorer' },
      { label: 'Toggle Analysis Panel', icon: <PanelRight className="w-4 h-4" />, shortcut: 'Ctrl+J', action: 'toggleAnalysis' },
      { label: 'Toggle Logs Panel', icon: <PanelBottom className="w-4 h-4" />, shortcut: 'Ctrl+`', action: 'toggleLogs' },
      { separator: true, label: '' },
      { label: 'Zoom In', icon: <ZoomIn className="w-4 h-4" />, shortcut: 'Ctrl++', action: 'zoomIn' },
      { label: 'Zoom Out', icon: <ZoomOut className="w-4 h-4" />, shortcut: 'Ctrl+-', action: 'zoomOut' },
      { separator: true, label: '' },
      { label: 'Reset Layout', icon: <RotateCcw className="w-4 h-4" />, action: 'resetLayout' },
    ],
  },
  {
    label: 'Go',
    items: [
      { label: 'Go to Code Smell Analysis', icon: <AlertTriangle className="w-4 h-4" />, shortcut: 'Ctrl+1', action: 'goSmells' },
      { label: 'Go to Feature Dataset', icon: <Database className="w-4 h-4" />, shortcut: 'Ctrl+2', action: 'goFeatures' },
      { label: 'Go to Bug Classification', icon: <Bug className="w-4 h-4" />, shortcut: 'Ctrl+3', action: 'goClassification' },
      { separator: true, label: '' },
      { label: 'Go to Reports', icon: <BarChart3 className="w-4 h-4" />, shortcut: 'Ctrl+4', action: 'goReports' },
    ],
  },
  {
    label: 'Run',
    items: [
      { label: 'Run Code Smell Detection', icon: <AlertTriangle className="w-4 h-4" />, shortcut: 'F5', action: 'runSmells' },
      { label: 'Generate Feature Dataset', icon: <Database className="w-4 h-4" />, shortcut: 'F6', action: 'runFeatures' },
      { label: 'Run Bug Classification Model', icon: <Bug className="w-4 h-4" />, shortcut: 'F7', action: 'runClassification' },
      { separator: true, label: '' },
      { label: 'Run Full Pipeline', icon: <Sparkles className="w-4 h-4" />, shortcut: 'F8', action: 'runPipeline', highlight: true },
    ],
  },
  {
    label: 'Terminal',
    items: [
      { label: 'Show Logs Panel', icon: <ListChecks className="w-4 h-4" />, action: 'showLogs' },
      { label: 'Clear Logs', icon: <Trash2 className="w-4 h-4" />, action: 'clearLogs' },
      { separator: true, label: '' },
      { label: 'View System Status', icon: <Activity className="w-4 h-4" />, action: 'viewStatus' },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'Project Overview', icon: <Info className="w-4 h-4" />, action: 'helpOverview' },
      { label: 'How This System Works', icon: <Lightbulb className="w-4 h-4" />, action: 'helpSystem' },
      { separator: true, label: '' },
      { label: 'Technology Stack', icon: <Cpu className="w-4 h-4" />, action: 'helpTech' },
      { label: 'ML Model Explanation', icon: <Brain className="w-4 h-4" />, action: 'helpML' },
      { separator: true, label: '' },
      { label: 'About Final Year Project', icon: <GraduationCap className="w-4 h-4" />, action: 'helpAbout' },
    ],
  },
];

interface MenuBarProps {
  onAction: (action: string) => void;
}

export function MenuBar({ onAction }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMenuMode, setIsMenuMode] = useState(false);
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setIsMenuMode(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (label: string) => {
    if (activeMenu === label) {
      setActiveMenu(null);
      setIsMenuMode(false);
    } else {
      setActiveMenu(label);
      setIsMenuMode(true);
    }
  };

  const handleMenuHover = (label: string) => {
    if (isMenuMode) {
      setActiveMenu(label);
    }
  };

  const handleItemClick = (item: MenuItemData) => {
    if (item.disabled || item.separator) return;
    if (item.action) {
      onAction(item.action);
    }
    setActiveMenu(null);
    setIsMenuMode(false);
  };

  return (
    <div
      ref={menuBarRef}
      className="h-8 bg-panel border-b border-border flex items-center px-2 select-none"
    >
      {menus.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            onClick={() => handleMenuClick(menu.label)}
            onMouseEnter={() => handleMenuHover(menu.label)}
            className={`px-3 py-1 text-sm transition-colors rounded-sm ${
              activeMenu === menu.label
                ? 'bg-primary/15 text-primary'
                : 'text-foreground hover:bg-secondary'
            }`}
          >
            {menu.label}
          </button>

          {activeMenu === menu.label && (
            <div className="absolute top-full left-0 mt-0.5 min-w-[240px] bg-popover border border-border rounded-md shadow-lg py-1 z-50 animate-fade-in">
              {menu.items.map((item, idx) =>
                item.separator ? (
                  <div key={idx} className="h-px bg-border my-1 mx-2" />
                ) : (
                  <button
                    key={idx}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={`w-full flex items-center gap-3 px-3 py-1.5 text-sm text-left transition-colors ${
                      item.disabled
                        ? 'text-muted-foreground/50 cursor-not-allowed'
                        : item.highlight
                        ? 'text-primary font-medium hover:bg-primary/10'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center opacity-70">
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                )
              )}
              <div className="px-3 py-1.5 mt-1 border-t border-border">
                <p className="text-[10px] text-muted-foreground/70 italic">
                  Simulation mode — no real system access
                </p>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex-1" />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-[10px] font-medium">
          DEMO
        </span>
      </div>
    </div>
  );
}
