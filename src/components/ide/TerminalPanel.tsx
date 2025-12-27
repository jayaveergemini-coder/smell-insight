import { useState, useRef, useEffect, useCallback } from 'react';
import { CheckCircle2, Loader2, Terminal, Trash2, Download, Plus, X, Folder } from 'lucide-react';

interface LogEntry {
  id: number;
  type: 'success' | 'info' | 'pending' | 'input' | 'output' | 'path';
  message: string;
  timestamp: string;
}

interface TerminalTab {
  id: string;
  name: string;
  logs: LogEntry[];
  currentPath: string;
}

interface TerminalPanelProps {
  logs: LogEntry[];
  onClear: () => void;
  onCommand?: (command: string) => void;
  projectPath?: string;
  projectFolders?: string[];
}

export function TerminalPanel({ logs, onClear, onCommand, projectPath = '', projectFolders = [] }: TerminalPanelProps) {
  const [terminals, setTerminals] = useState<TerminalTab[]>([
    { id: 'terminal-1', name: 'Terminal 1', logs: [], currentPath: projectPath || '~' }
  ]);
  const [activeTerminal, setActiveTerminal] = useState('terminal-1');
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const currentTerminal = terminals.find(t => t.id === activeTerminal);
  const currentPath = currentTerminal?.currentPath || '~';
  const displayLogs = activeTerminal === 'terminal-1' ? logs : (currentTerminal?.logs || []);

  // Update terminal path when project is loaded
  useEffect(() => {
    if (projectPath) {
      setTerminals(prev => prev.map(t => 
        t.id === 'terminal-1' ? { ...t, currentPath: projectPath } : t
      ));
    }
  }, [projectPath]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayLogs]);

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
      case 'info':
        return <span className="w-3.5 h-3.5 flex items-center justify-center text-primary">›</span>;
      case 'pending':
        return <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />;
      case 'input':
        return <span className="w-3.5 h-3.5 flex items-center justify-center text-success">$</span>;
      case 'output':
        return <span className="w-3.5 h-3.5 flex items-center justify-center text-muted-foreground">→</span>;
      case 'path':
        return <Folder className="w-3.5 h-3.5 text-primary" />;
    }
  };

  const processCommand = useCallback((command: string): { output: string; newPath?: string } => {
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'cd': {
        const target = args[0] || '~';
        if (target === '~' || target === '/') {
          return { output: `Changed directory to ${projectPath || '~'}`, newPath: projectPath || '~' };
        }
        if (target === '..') {
          const pathParts = currentPath.split('/').filter(Boolean);
          if (pathParts.length > 1) {
            const newPath = pathParts.slice(0, -1).join('/');
            return { output: `Changed directory to ${newPath}`, newPath };
          }
          return { output: 'Already at root directory', newPath: currentPath };
        }
        // Check if folder exists
        const newPath = currentPath === '~' ? target : `${currentPath}/${target}`;
        const folderExists = projectFolders.some(f => f === target || f.startsWith(`${target}/`) || newPath.includes(target));
        if (folderExists || ['frontend', 'backend', 'src', 'components', 'routes', 'controllers'].includes(target)) {
          return { output: `Changed directory to ${newPath}`, newPath };
        }
        return { output: `cd: ${target}: No such file or directory` };
      }
      case 'pwd':
        return { output: currentPath };
      case 'ls':
        const items = projectFolders.length > 0 
          ? projectFolders.slice(0, 10).join('  ')
          : 'frontend/  backend/  package.json  README.md';
        return { output: items };
      case 'clear':
        return { output: '__CLEAR__' };
      case 'help':
        return { output: 'Available commands: cd, pwd, ls, clear, help, analyze, exit' };
      case 'analyze':
        return { output: 'Starting code analysis... (use menu for full analysis)' };
      case 'exit':
        return { output: 'Terminal session ended (simulation)' };
      default:
        return { output: `Command "${cmd}" executed (simulation)` };
    }
  }, [currentPath, projectPath, projectFolders]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInputValue('');
      }
    } else if (e.key === 'Enter' && inputValue.trim()) {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const inputLog: LogEntry = { id: Date.now(), type: 'input', message: `${currentPath} $ ${inputValue}`, timestamp };
      
      // Add to history
      setCommandHistory(prev => [...prev, inputValue]);
      setHistoryIndex(-1);

      const { output, newPath } = processCommand(inputValue);
      
      if (output === '__CLEAR__') {
        if (activeTerminal === 'terminal-1') {
          onClear();
        } else {
          setTerminals(prev => prev.map(t => t.id === activeTerminal ? { ...t, logs: [] } : t));
        }
      } else {
        const outputLog: LogEntry = { id: Date.now() + 1, type: 'output', message: output, timestamp };
        
        if (activeTerminal === 'terminal-1') {
          onCommand?.(inputValue);
        } else {
          setTerminals(prev => prev.map(t => 
            t.id === activeTerminal 
              ? { ...t, logs: [...t.logs, inputLog, outputLog], currentPath: newPath || t.currentPath }
              : t
          ));
        }
      }

      // Update path if changed
      if (newPath) {
        setTerminals(prev => prev.map(t => 
          t.id === activeTerminal ? { ...t, currentPath: newPath } : t
        ));
      }
      
      setInputValue('');
    }
  }, [inputValue, activeTerminal, onCommand, onClear, processCommand, currentPath, commandHistory, historyIndex]);

  const addNewTerminal = useCallback(() => {
    const newId = `terminal-${Date.now()}`;
    const newName = `Terminal ${terminals.length + 1}`;
    setTerminals(prev => [...prev, { id: newId, name: newName, logs: [], currentPath: projectPath || '~' }]);
    setActiveTerminal(newId);
  }, [terminals.length, projectPath]);

  const closeTerminal = useCallback((id: string) => {
    if (terminals.length === 1) return;
    setTerminals(prev => {
      const newTerminals = prev.filter(t => t.id !== id);
      if (activeTerminal === id) {
        setActiveTerminal(newTerminals[newTerminals.length - 1].id);
      }
      return newTerminals;
    });
  }, [terminals.length, activeTerminal]);

  return (
    <div className="h-48 bg-log border-t border-border flex flex-col">
      {/* Terminal Tabs Header */}
      <div className="flex items-center justify-between border-b border-border bg-panel-header">
        <div className="flex items-center overflow-x-auto scrollbar-thin">
          {terminals.map((term) => (
            <div
              key={term.id}
              onClick={() => setActiveTerminal(term.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 border-r border-border cursor-pointer transition-colors ${
                activeTerminal === term.id ? 'bg-panel' : 'hover:bg-secondary/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
              <span className={`text-xs ${activeTerminal === term.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {term.name}
              </span>
              {terminals.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); closeTerminal(term.id); }}
                  className="w-4 h-4 rounded hover:bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addNewTerminal}
            className="p-1.5 hover:bg-secondary/50 transition-colors"
            title="New Terminal"
          >
            <Plus className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex items-center gap-1 px-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">Simulation</span>
          <button
            onClick={onClear}
            className="p-1.5 rounded hover:bg-secondary transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-secondary transition-colors"
            title="Export logs"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Logs Area */}
      <div 
        className="flex-1 overflow-y-auto scrollbar-thin font-mono cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {displayLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            No logs yet. Run analysis or type commands (try: help, cd, ls, pwd)
          </div>
        ) : (
          displayLogs.map((log, idx) => (
            <div
              key={log.id}
              className="flex items-start gap-2 px-4 py-1 hover:bg-secondary/30 transition-colors text-xs animate-fade-in"
              style={{ animationDelay: `${idx * 20}ms` }}
            >
              {getIcon(log.type)}
              <span className="text-muted-foreground shrink-0">[{log.timestamp}]</span>
              <span className={`${log.type === 'input' ? 'text-success' : log.type === 'path' ? 'text-primary' : 'text-foreground'}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Input Area with Path */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-secondary/20">
        <span className="text-primary text-xs font-mono truncate max-w-32" title={currentPath}>
          {currentPath.length > 20 ? '...' + currentPath.slice(-17) : currentPath}
        </span>
        <span className="text-success text-xs font-mono">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command (help for list)..."
          className="flex-1 bg-transparent text-foreground text-xs font-mono outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}

export type { LogEntry };
