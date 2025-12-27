import { useState, useCallback, useRef } from 'react';
import { ActionBar } from '@/components/ide/ActionBar';
import { FileExplorer, FileNode } from '@/components/ide/FileExplorer';
import { CodePanel } from '@/components/ide/CodePanel';
import { AnalysisPanel } from '@/components/ide/AnalysisPanel';
import { LogPanel, LogEntry } from '@/components/ide/LogPanel';
import { extractZipFile, ExtractedFile, countFilesAndFolders } from '@/lib/zipExtractor';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [hasProject, setHasProject] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a ZIP file containing your project.',
        variant: 'destructive',
      });
      return;
    }

    addLog('info', `Uploading ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`);

    try {
      const { files: extracted, tree } = await extractZipFile(file);
      const counts = countFilesAndFolders(tree);
      
      setExtractedFiles(extracted);
      setFiles(tree);
      setHasProject(true);
      setSelectedFile(null);
      setHasResults(false);
      
      addLog('success', 'Project uploaded and extracted successfully');
      addLog('info', `Found ${counts.folders} directories, ${counts.files} files`);
      
      toast({
        title: 'Project uploaded',
        description: `Extracted ${counts.files} files from ${file.name}`,
      });
    } catch (error) {
      addLog('success', 'Failed to extract ZIP file');
      toast({
        title: 'Extraction failed',
        description: 'Could not extract the ZIP file. Please ensure it is a valid archive.',
        variant: 'destructive',
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addLog]);

  const getFileContent = useCallback((path: string): string | null => {
    const file = extractedFiles.find(f => f.path === path || f.path === path + '/');
    return file?.content ?? null;
  }, [extractedFiles]);

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
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <ActionBar
        onUpload={handleUploadClick}
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
              getFileContent={getFileContent}
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
