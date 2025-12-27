import { Upload, Play, Bug, Beaker } from 'lucide-react';

interface ActionBarProps {
  onUpload: () => void;
  onRunSmellAnalysis: () => void;
  onRunBugClassification: () => void;
  isAnalyzing: boolean;
  hasProject: boolean;
}

export function ActionBar({
  onUpload,
  onRunSmellAnalysis,
  onRunBugClassification,
  isAnalyzing,
  hasProject,
}: ActionBarProps) {
  return (
    <header className="h-14 bg-panel border-b border-border flex items-center justify-between px-4 shadow-soft">
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
          Upload Project
        </button>
        <button
          onClick={onRunSmellAnalysis}
          className="action-button-secondary"
          disabled={!hasProject || isAnalyzing}
        >
          <Play className="w-4 h-4" />
          Run Smell Analysis
        </button>
        <button
          onClick={onRunBugClassification}
          className="action-button"
          disabled={!hasProject || isAnalyzing}
        >
          <Bug className="w-4 h-4" />
          Run Bug Classification
        </button>
      </div>
    </header>
  );
}
