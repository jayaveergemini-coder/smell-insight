import { FileCode, Loader2, CheckCircle2, Monitor, Server, Database, Brain, Sparkles } from 'lucide-react';

interface CodePanelProps {
  selectedFile: string | null;
  isAnalyzing: boolean;
  analysisStep: string | null;
  analysisType?: 'frontend' | 'backend' | 'full';
  getFileContent?: (path: string) => string | null;
}

const frontendSteps = [
  { id: 'scan-frontend', label: 'Scanning frontend components...', icon: Monitor },
  { id: 'detect-jsx', label: 'Analyzing JSX complexity...', icon: FileCode },
  { id: 'extract-frontend', label: 'Extracting React metrics...', icon: Database },
  { id: 'complete-frontend', label: 'Frontend analysis complete', icon: CheckCircle2 },
];

const backendSteps = [
  { id: 'scan-backend', label: 'Scanning backend services...', icon: Server },
  { id: 'detect-logic', label: 'Analyzing business logic...', icon: FileCode },
  { id: 'extract-backend', label: 'Extracting API metrics...', icon: Database },
  { id: 'complete-backend', label: 'Backend analysis complete', icon: CheckCircle2 },
];

const fullSteps = [
  { id: 'scan-frontend', label: 'Scanning frontend components...', icon: Monitor },
  { id: 'scan-backend', label: 'Analyzing backend services...', icon: Server },
  { id: 'detect-smells', label: 'Detecting code smells...', icon: FileCode },
  { id: 'extract-metrics', label: 'Extracting ML features...', icon: Database },
  { id: 'prepare-ml', label: 'Preparing ML features...', icon: Brain },
  { id: 'complete', label: 'Full analysis complete', icon: Sparkles },
];

export function CodePanel({ selectedFile, isAnalyzing, analysisStep, analysisType = 'full', getFileContent }: CodePanelProps) {
  const getAnalysisSteps = () => {
    switch (analysisType) {
      case 'frontend':
        return frontendSteps;
      case 'backend':
        return backendSteps;
      default:
        return fullSteps;
    }
  };

  const getAnalysisTitle = () => {
    switch (analysisType) {
      case 'frontend':
        return 'Frontend Analysis';
      case 'backend':
        return 'Backend Analysis';
      default:
        return 'Full Project Analysis';
    }
  };

  const getAnalysisIcon = () => {
    switch (analysisType) {
      case 'frontend':
        return <Monitor className="w-8 h-8 text-primary" />;
      case 'backend':
        return <Server className="w-8 h-8 text-success" />;
      default:
        return <Sparkles className="w-8 h-8 text-accent" />;
    }
  };

  if (isAnalyzing) {
    const steps = getAnalysisSteps();
    
    return (
      <div className="flex-1 bg-panel rounded-lg border border-border overflow-hidden flex flex-col">
        <div className="ide-panel-header">
          <span className="text-sm font-medium">{getAnalysisTitle()} in Progress</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                {getAnalysisIcon()}
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Running {getAnalysisTitle()}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Processing your project files...
              </p>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => {
                const isActive = step.id === analysisStep;
                const stepIndex = steps.findIndex((s) => s.id === analysisStep);
                const isComplete = stepIndex > idx;
                const Icon = step.icon;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary/10 border border-primary/20'
                        : isComplete
                        ? 'bg-success/10 border border-success/20'
                        : 'bg-secondary/50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : isComplete
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isActive ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive
                          ? 'text-primary'
                          : isComplete
                          ? 'text-success'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isComplete && (
                      <CheckCircle2 className="w-4 h-4 text-success ml-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedFile) {
    return (
      <div className="flex-1 bg-panel rounded-lg border border-border overflow-hidden flex flex-col">
        <div className="ide-panel-header">
          <span className="text-sm font-medium">Welcome</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-6">
              <FileCode className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Smell Aware Bug Classification
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Upload your React + Backend project folder to analyze code smells
              and predict potential bug categories using machine learning.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {[
                {
                  step: '1',
                  title: 'Upload Project',
                  desc: 'Select your project folder containing frontend and backend',
                  icon: <FileCode className="w-4 h-4" />,
                },
                {
                  step: '2',
                  title: 'Analyze Code',
                  desc: 'Detect smells in React components and Node.js services',
                  icon: <Monitor className="w-4 h-4" />,
                },
                {
                  step: '3',
                  title: 'Classify Bugs',
                  desc: 'Get ML-based predictions for potential bug types',
                  icon: <Brain className="w-4 h-4" />,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-4 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-sm font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-1 flex items-center gap-2">
                    {item.icon}
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-secondary/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Expected structure:</strong> Project folder with{' '}
                <code className="bg-secondary px-1 rounded">frontend/</code> (React) and{' '}
                <code className="bg-secondary px-1 rounded">backend/</code> (Node.js) directories
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const content = getFileContent?.(selectedFile) ?? '// No preview available for this file';
  const lines = content.split('\n');

  return (
    <div className="flex-1 bg-panel rounded-lg border border-border overflow-hidden flex flex-col">
      <div className="ide-panel-header">
        <span className="text-sm font-medium font-mono">{selectedFile}</span>
        <span className="text-xs text-muted-foreground">Read-only</span>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin">
        <div className="code-block p-4">
          <table className="w-full">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-primary/5">
                  <td className="pr-4 text-line-number select-none text-right w-12 align-top">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre text-foreground">{line}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
