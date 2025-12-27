import { useState, useRef, useEffect } from 'react';
import {
  File,
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
  Sparkles,
  ListChecks,
  Activity,
  Info,
  Lightbulb,
  Cpu,
  Brain,
  GraduationCap,
  Monitor,
  Server,
  Play,
  Beaker,
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

interface MenuBarProps {
  onAction: (action: string) => void;
  hasProject?: boolean;
  hasFrontend?: boolean;
  hasBackend?: boolean;
  isAnalyzing?: boolean;
  showTerminal?: boolean;
  showAnalysisPanel?: boolean;
}

export function MenuBar({ onAction, hasProject = false, hasFrontend = false, hasBackend = false, isAnalyzing = false, showTerminal = true, showAnalysisPanel = true }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMenuMode, setIsMenuMode] = useState(false);
  const menuBarRef = useRef<HTMLDivElement>(null);

  const menus: MenuData[] = [
    {
      label: 'File',
      items: [
        { label: 'New Project', icon: <File className="w-4 h-4" />, shortcut: 'Ctrl+N', disabled: true },
        { label: 'Open Project Folder', icon: <FolderOpen className="w-4 h-4" />, shortcut: 'Ctrl+O', action: 'upload' },
        { label: 'Upload React Project', icon: <Upload className="w-4 h-4" />, shortcut: 'Ctrl+U', action: 'upload', highlight: true },
        { label: 'Close Project', icon: <X className="w-4 h-4" />, shortcut: 'Ctrl+W', action: 'close', disabled: !hasProject },
        { separator: true, label: '' },
        { label: 'Save Report', icon: <FileText className="w-4 h-4" />, shortcut: 'Ctrl+S', action: 'saveReport', disabled: !hasProject },
        { label: 'Export Analysis (PDF)', icon: <FileDown className="w-4 h-4" />, shortcut: 'Ctrl+E', action: 'exportPdf', disabled: !hasProject },
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
        { label: 'Clear Analysis Results', icon: <Trash2 className="w-4 h-4" />, action: 'clearResults', disabled: !hasProject },
      ],
    },
    {
      label: 'Selection',
      items: [
        { label: 'Select All Files', icon: <Files className="w-4 h-4" />, action: 'selectAllFiles', disabled: !hasProject },
        { label: 'Select Current File', icon: <FileCode className="w-4 h-4" />, action: 'selectCurrent', disabled: !hasProject },
        { label: 'Select Smelly Files Only', icon: <AlertTriangle className="w-4 h-4" />, action: 'selectSmelly', disabled: !hasProject },
        { separator: true, label: '' },
        { label: 'Clear Selection', icon: <XCircle className="w-4 h-4" />, action: 'clearSelection' },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Toggle File Explorer', icon: <PanelLeft className="w-4 h-4" />, shortcut: 'Ctrl+B', action: 'toggleExplorer' },
        { label: showAnalysisPanel ? 'Hide Analysis Panel' : 'Show Analysis Panel', icon: <PanelRight className="w-4 h-4" />, shortcut: 'Ctrl+J', action: 'toggleAnalysis' },
        { label: showTerminal ? 'Hide Terminal' : 'Show Terminal', icon: <PanelBottom className="w-4 h-4" />, shortcut: 'Ctrl+`', action: 'toggleLogs' },
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
        { label: 'Go to Frontend Smells', icon: <Monitor className="w-4 h-4" />, shortcut: 'Ctrl+1', action: 'goSmells', disabled: !hasProject },
        { label: 'Go to Backend Smells', icon: <Server className="w-4 h-4" />, shortcut: 'Ctrl+2', action: 'goFeatures', disabled: !hasProject },
        { label: 'Go to Bug Classification', icon: <Bug className="w-4 h-4" />, shortcut: 'Ctrl+3', action: 'goClassification', disabled: !hasProject },
        { separator: true, label: '' },
        { label: 'Go to Reports', icon: <BarChart3 className="w-4 h-4" />, shortcut: 'Ctrl+4', action: 'goReports', disabled: !hasProject },
      ],
    },
    {
      label: 'Run',
      items: [
        { label: 'Analyze Frontend', icon: <Monitor className="w-4 h-4" />, shortcut: 'F5', action: 'runSmells', disabled: !hasFrontend || isAnalyzing },
        { label: 'Analyze Backend', icon: <Server className="w-4 h-4" />, shortcut: 'F6', action: 'runFeatures', disabled: !hasBackend || isAnalyzing },
        { separator: true, label: '' },
        { label: 'Run Full Analysis', icon: <Sparkles className="w-4 h-4" />, shortcut: 'F8', action: 'runPipeline', highlight: true, disabled: !hasProject || isAnalyzing },
      ],
    },
    {
      label: 'Terminal',
      items: [
        { label: showTerminal ? 'Hide Terminal' : 'Show Terminal', icon: <PanelBottom className="w-4 h-4" />, shortcut: 'Ctrl+`', action: 'toggleLogs' },
        { label: 'New Terminal', icon: <Play className="w-4 h-4" />, action: 'newTerminal', disabled: !showTerminal },
        { separator: true, label: '' },
        { label: 'Clear Logs', icon: <Trash2 className="w-4 h-4" />, action: 'clearLogs', disabled: !showTerminal },
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
      className="h-9 bg-panel border-b border-border flex items-center px-2 select-none"
    >
      {/* App Icon & Title */}
      <div className="flex items-center gap-2 mr-4 pr-4 border-r border-border">
        <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
          <Beaker className="w-3 h-3 text-primary" />
        </div>
        <span className="text-xs font-medium text-foreground">Smell Aware Bug Classification</span>
      </div>

      {/* Menu Items */}
      {menus.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            onClick={() => handleMenuClick(menu.label)}
            onMouseEnter={() => handleMenuHover(menu.label)}
            className={`px-2.5 py-1 text-xs transition-colors rounded-sm ${
              activeMenu === menu.label
                ? 'bg-primary/15 text-primary'
                : 'text-foreground hover:bg-secondary'
            }`}
          >
            {menu.label}
          </button>

          {activeMenu === menu.label && (
            <div className="absolute top-full left-0 mt-0.5 min-w-[220px] bg-popover border border-border rounded-md shadow-lg py-1 z-50 animate-fade-in">
              {menu.items.map((item, idx) =>
                item.separator ? (
                  <div key={idx} className="h-px bg-border my-1 mx-2" />
                ) : (
                  <button
                    key={idx}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left transition-colors ${
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
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                )
              )}
              <div className="px-3 py-1.5 mt-1 border-t border-border">
                <p className="text-[9px] text-muted-foreground/60 italic">
                  Simulation mode — academic demo
                </p>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex-1" />

      {/* Status Indicators */}
      <div className="flex items-center gap-2 text-[10px]">
        {hasProject && (
          <>
            {hasFrontend && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                <Monitor className="w-3 h-3" />
                Frontend
              </span>
            )}
            {hasBackend && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-success/10 text-success">
                <Server className="w-3 h-3" />
                Backend
              </span>
            )}
          </>
        )}
        <span className="px-1.5 py-0.5 bg-accent/10 text-accent rounded font-medium">
          DEMO
        </span>
      </div>
    </div>
  );
}
