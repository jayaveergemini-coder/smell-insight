import { FileCode, GitBranch, Monitor, Server, AlertTriangle, CheckCircle2, Loader2, Cpu } from 'lucide-react';

interface StatusBarProps {
  hasProject: boolean;
  hasFrontend: boolean;
  hasBackend: boolean;
  totalFiles: number;
  totalFolders: number;
  currentFile: string | null;
  cursorLine: number;
  cursorColumn: number;
  isAnalyzing: boolean;
  analysisStatus: 'idle' | 'analyzing' | 'completed';
  smellCount?: number;
}

export function StatusBar({
  hasProject,
  hasFrontend,
  hasBackend,
  totalFiles,
  totalFolders,
  currentFile,
  cursorLine,
  cursorColumn,
  isAnalyzing,
  analysisStatus,
  smellCount = 0,
}: StatusBarProps) {
  const getFileType = (filename: string | null) => {
    if (!filename) return null;
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return 'React Component';
      case 'ts':
        return 'TypeScript';
      case 'js':
        return 'JavaScript';
      case 'json':
        return 'JSON';
      case 'css':
        return 'CSS';
      case 'html':
        return 'HTML';
      case 'md':
        return 'Markdown';
      default:
        return ext?.toUpperCase() || 'Plain Text';
    }
  };

  const getFileEncoding = () => 'UTF-8';
  const getLineEnding = () => 'LF';

  return (
    <div className="h-6 bg-primary/10 border-t border-border flex items-center justify-between px-3 text-[10px] select-none">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Git Branch (Simulation) */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>

        {/* Analysis Status */}
        <div className="flex items-center gap-1.5">
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3 h-3 text-primary animate-spin" />
              <span className="text-primary">Analyzing...</span>
            </>
          ) : analysisStatus === 'completed' ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-success" />
              <span className="text-success">Analysis Complete</span>
            </>
          ) : (
            <>
              <Cpu className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Ready</span>
            </>
          )}
        </div>

        {/* Smell Count */}
        {smellCount > 0 && (
          <div className="flex items-center gap-1 text-warning">
            <AlertTriangle className="w-3 h-3" />
            <span>{smellCount} issues</span>
          </div>
        )}
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-4">
        {hasProject && (
          <>
            {/* Project Stats */}
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>{totalFiles} files</span>
              <span>{totalFolders} folders</span>
            </div>

            {/* Stack Indicators */}
            <div className="flex items-center gap-2">
              {hasFrontend && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10">
                  <Monitor className="w-3 h-3 text-primary" />
                  <span className="text-primary">React</span>
                </div>
              )}
              {hasBackend && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-success/10">
                  <Server className="w-3 h-3 text-success" />
                  <span className="text-success">Node.js</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Cursor Position */}
        {currentFile && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>Ln {cursorLine}, Col {cursorColumn}</span>
          </div>
        )}

        {/* File Info */}
        {currentFile && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>{getLineEnding()}</span>
            <span>{getFileEncoding()}</span>
            <div className="flex items-center gap-1">
              <FileCode className="w-3 h-3" />
              <span>{getFileType(currentFile)}</span>
            </div>
          </div>
        )}

        {/* Mode Indicator */}
        <div className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
          Simulation
        </div>
      </div>
    </div>
  );
}
