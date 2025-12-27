import { useState, useCallback } from 'react';
import { ActionBar } from '@/components/ide/ActionBar';
import { FileExplorer, FileNode } from '@/components/ide/FileExplorer';
import { CodePanel } from '@/components/ide/CodePanel';
import { AnalysisPanel } from '@/components/ide/AnalysisPanel';
import { LogPanel, LogEntry } from '@/components/ide/LogPanel';

const Index = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [hasProject, setHasProject] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLogs((prev) => [
      ...prev,
      { id: Date.now(), type, message, timestamp },
    ]);
  }, []);

  const handleUpload = useCallback(() => {
    addLog('info', 'Uploading project folder...');
    
    setTimeout(() => {
      setHasProject(true);
      setFiles([
        {
          name: 'frontend',
          type: 'folder',
          children: [
            {
              name: 'src',
              type: 'folder',
              children: [
                { name: 'App.tsx', type: 'file' },
                { name: 'index.tsx', type: 'file' },
                { name: 'utils.ts', type: 'file' },
              ],
            },
            { name: 'package.json', type: 'file' },
          ],
        },
        {
          name: 'backend',
          type: 'folder',
          children: [
            {
              name: 'src',
              type: 'folder',
              children: [
                { name: 'server.py', type: 'file' },
                { name: 'routes.py', type: 'file' },
                { name: 'models.py', type: 'file' },
              ],
            },
            { name: 'requirements.txt', type: 'file' },
          ],
        },
        {
          name: 'ml-engine',
          type: 'folder',
          children: [
            { name: 'classifier.py', type: 'file' },
            { name: 'feature_extractor.py', type: 'file' },
            { name: 'model.pkl', type: 'file' },
          ],
        },
        { name: 'package.json', type: 'file' },
        { name: 'README.md', type: 'file' },
      ]);
      addLog('success', 'Project uploaded successfully');
      addLog('info', 'Found 3 directories, 12 files');
    }, 800);
  }, [addLog]);

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setHasResults(false);
    
    const steps = [
      { id: 'parsing', log: 'Parsing source files...' },
      { id: 'detecting', log: 'Detecting code smells...' },
      { id: 'extracting', log: 'Extracting ML features...' },
      { id: 'complete', log: 'Static analysis completed' },
    ];

    for (const step of steps) {
      setAnalysisStep(step.id);
      addLog(step.id === 'complete' ? 'success' : 'info', step.log);
      await new Promise((r) => setTimeout(r, 1200));
    }

    setIsAnalyzing(false);
    setAnalysisStep(null);
    setHasResults(true);
    addLog('success', 'Code smells detected: 27 issues found');
  }, [addLog]);

  const runBugClassification = useCallback(async () => {
    if (!hasResults) {
      await runAnalysis();
    }
    
    addLog('info', 'Running ML classification model...');
    await new Promise((r) => setTimeout(r, 1500));
    addLog('success', 'Bug classified successfully');
    addLog('info', 'Predicted: Logic Error (87.3% confidence)');
  }, [hasResults, runAnalysis, addLog]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <ActionBar
        onUpload={handleUpload}
        onRunSmellAnalysis={runAnalysis}
        onRunBugClassification={runBugClassification}
        isAnalyzing={isAnalyzing}
        hasProject={hasProject}
      />

      <div className="flex-1 flex overflow-hidden">
        <FileExplorer
          files={files}
          selectedFile={selectedFile}
          onSelectFile={setSelectedFile}
        />

        <main className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
          <div className="flex-1 flex gap-3 overflow-hidden">
            <CodePanel
              selectedFile={selectedFile}
              isAnalyzing={isAnalyzing}
              analysisStep={analysisStep}
            />
            <AnalysisPanel hasResults={hasResults} />
          </div>
        </main>
      </div>

      <LogPanel logs={logs} />
    </div>
  );
};

export default Index;
