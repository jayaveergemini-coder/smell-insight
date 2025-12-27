import { Monitor, Server, Play, Sparkles, Loader2 } from 'lucide-react';

interface EditorToolbarProps {
  onAnalyzeCurrent: () => void;
  onAnalyzeFrontend: () => void;
  onAnalyzeBackend: () => void;
  onRunFullAnalysis: () => void;
  hasProject: boolean;
  hasFrontend: boolean;
  hasBackend: boolean;
  hasActiveFile: boolean;
  isAnalyzing: boolean;
  status: 'idle' | 'analyzing' | 'completed';
}

export function EditorToolbar({
  onAnalyzeCurrent,
  onAnalyzeFrontend,
  onAnalyzeBackend,
  onRunFullAnalysis,
  hasProject,
  hasFrontend,
  hasBackend,
  hasActiveFile,
  isAnalyzing,
  status,
}: EditorToolbarProps) {
  return (
    <div className="h-10 bg-panel border-b border-border flex items-center justify-between px-3">
      <div className="flex items-center gap-1">
        <button
          onClick={onAnalyzeCurrent}
          disabled={!hasActiveFile || isAnalyzing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary"
        >
          <Play className="w-3.5 h-3.5" />
          Analyze Current File
        </button>
        
        <div className="w-px h-5 bg-border mx-1" />
        
        <button
          onClick={onAnalyzeFrontend}
          disabled={!hasFrontend || isAnalyzing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary"
        >
          <Monitor className="w-3.5 h-3.5 text-primary" />
          Analyze Frontend
        </button>
        
        <button
          onClick={onAnalyzeBackend}
          disabled={!hasBackend || isAnalyzing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary"
        >
          <Server className="w-3.5 h-3.5 text-success" />
          Analyze Backend
        </button>
        
        <div className="w-px h-5 bg-border mx-1" />
        
        <button
          onClick={onRunFullAnalysis}
          disabled={!hasProject || isAnalyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          Run Full Analysis
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
          status === 'idle' ? 'bg-secondary text-muted-foreground' :
          status === 'analyzing' ? 'bg-primary/15 text-primary' :
          'bg-success/15 text-success'
        }`}>
          {status === 'analyzing' && <Loader2 className="w-3 h-3 animate-spin" />}
          <span className="capitalize">{status}</span>
        </div>
      </div>
    </div>
  );
}
