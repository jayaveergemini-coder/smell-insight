import { Upload, Play, Bug, Beaker, Monitor, Server, Sparkles, AlertCircle } from 'lucide-react';

interface ActionBarProps {
  onUpload: () => void;
  onAnalyzeFrontend: () => void;
  onAnalyzeBackend: () => void;
  onRunFullAnalysis: () => void;
  isAnalyzing: boolean;
  hasProject: boolean;
  hasFrontend: boolean;
  hasBackend: boolean;
  validationErrors?: string[];
}

export function ActionBar({
  onUpload,
  onAnalyzeFrontend,
  onAnalyzeBackend,
  onRunFullAnalysis,
  isAnalyzing,
  hasProject,
  hasFrontend,
  hasBackend,
  validationErrors = [],
}: ActionBarProps) {
  const showValidationWarning = hasProject && validationErrors.length > 0 && (!hasFrontend || !hasBackend);

  return (
    <header className="bg-panel border-b border-border shadow-soft">
      <div className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Beaker className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-base font-semibold text-foreground">
              Smell Aware Bug Classification
            </h1>
          </div>
          <span className="status-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            Demo Mode
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onUpload}
            className="action-button-secondary"
            disabled={isAnalyzing}
          >
            <Upload className="w-4 h-4" />
            Upload React Project
          </button>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <button
            onClick={onAnalyzeFrontend}
            className="action-button-secondary"
            disabled={!hasProject || !hasFrontend || isAnalyzing}
            title={!hasFrontend ? 'No frontend folder detected' : 'Analyze frontend code'}
          >
            <Monitor className="w-4 h-4" />
            Analyze Frontend
          </button>
          <button
            onClick={onAnalyzeBackend}
            className="action-button-secondary"
            disabled={!hasProject || !hasBackend || isAnalyzing}
            title={!hasBackend ? 'No backend folder detected' : 'Analyze backend code'}
          >
            <Server className="w-4 h-4" />
            Analyze Backend
          </button>
          <button
            onClick={onRunFullAnalysis}
            className="action-button"
            disabled={!hasProject || isAnalyzing}
          >
            <Sparkles className="w-4 h-4" />
            Run Full Analysis
          </button>
        </div>
      </div>
      
      {showValidationWarning && (
        <div className="px-4 py-2 bg-warning/10 border-t border-warning/20 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-warning" />
          <span className="text-warning font-medium">Partial structure detected:</span>
          <span className="text-warning/80">
            {!hasFrontend && 'Missing frontend folder. '}
            {!hasBackend && 'Missing backend folder. '}
            Analysis will continue with available code.
          </span>
        </div>
      )}
    </header>
  );
}
