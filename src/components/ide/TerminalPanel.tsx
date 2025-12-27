import { useState, useRef, useEffect, useCallback } from 'react';
import { CheckCircle2, Loader2, Terminal, Trash2, Download, Plus, X } from 'lucide-react';

interface LogEntry {
  id: number;
  type: 'success' | 'info' | 'pending' | 'input' | 'output';
  message: string;
  timestamp: string;
}

interface TerminalTab {
  id: string;
  name: string;
  logs: LogEntry[];
}

interface TerminalPanelProps {
  logs: LogEntry[];
  onClear: () => void;
  onCommand?: (command: string) => void;
}

export function TerminalPanel({ logs, onClear, onCommand }: TerminalPanelProps) {
  const [terminals, setTerminals] = useState<TerminalTab[]>([
    { id: 'terminal-1', name: 'Terminal 1', logs: [] }
  ]);
  const [activeTerminal, setActiveTerminal] = useState('terminal-1');
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const currentTerminal = terminals.find(t => t.id === activeTerminal);
  const displayLogs = activeTerminal === 'terminal-1' ? logs : (currentTerminal?.logs || []);

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
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newLog: LogEntry = { id: Date.now(), type: 'input', message: inputValue, timestamp };
      
      if (activeTerminal === 'terminal-1') {
        onCommand?.(inputValue);
      } else {
        setTerminals(prev => prev.map(t => 
          t.id === activeTerminal 
            ? { ...t, logs: [...t.logs, newLog, { id: Date.now() + 1, type: 'output', message: `Command "${inputValue}" executed (simulation)`, timestamp }] }
            : t
        ));
      }
      setInputValue('');
    }
  }, [inputValue, activeTerminal, onCommand]);

  const addNewTerminal = useCallback(() => {
    const newId = `terminal-${Date.now()}`;
    const newName = `Terminal ${terminals.length + 1}`;
    setTerminals(prev => [...prev, { id: newId, name: newName, logs: [] }]);
    setActiveTerminal(newId);
  }, [terminals.length]);

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
            No logs yet. Run analysis or type commands.
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
              <span className={`${log.type === 'input' ? 'text-success' : 'text-foreground'}`}>{log.message}</span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-secondary/20">
        <span className="text-success text-xs font-mono">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command and press Enter..."
          className="flex-1 bg-transparent text-foreground text-xs font-mono outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}

export type { LogEntry };
