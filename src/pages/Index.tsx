import { useState, useCallback, useRef } from 'react';
import { MenuBar } from '@/components/ide/MenuBar';
import { ActionBar } from '@/components/ide/ActionBar';
import { FileExplorer, FileNode } from '@/components/ide/FileExplorer';
import { CodePanel } from '@/components/ide/CodePanel';
import { AnalysisPanel } from '@/components/ide/AnalysisPanel';
import { LogPanel, LogEntry } from '@/components/ide/LogPanel';
import { extractZipFile, ExtractedFile, countFilesAndFolders } from '@/lib/zipExtractor';
import { toast } from '@/hooks/use-toast';
import { HelpDialog } from '@/components/ide/HelpDialog';

const Index = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [hasProject, setHasProject] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'smells' | 'features' | 'classification'>('smells');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Panel visibility
  const [showExplorer, setShowExplorer] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showLogs, setShowLogs] = useState(true);

  // Help dialog
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [helpContent, setHelpContent] = useState<{ title: string; content: string }>({ title: '', content: '' });

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

  const closeProject = useCallback(() => {
    setFiles([]);
    setExtractedFiles([]);
    setSelectedFile(null);
    setHasProject(false);
    setHasResults(false);
    setLogs([]);
    addLog('info', 'Project closed');
  }, [addLog]);

  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case 'upload':
        handleUploadClick();
        break;
      case 'close':
        closeProject();
        break;
      case 'saveReport':
      case 'exportPdf':
        toast({ title: 'Export', description: 'Report export simulation triggered' });
        addLog('info', 'Generating report...');
        break;
      case 'exit':
        toast({ title: 'Exit', description: 'Exit simulation - page would close' });
        break;
      case 'clearResults':
        setHasResults(false);
        addLog('info', 'Analysis results cleared');
        break;
      case 'selectSmelly':
        toast({ title: 'Selection', description: 'Files with code smells selected' });
        break;
      case 'toggleExplorer':
        setShowExplorer(prev => !prev);
        break;
      case 'toggleAnalysis':
        setShowAnalysis(prev => !prev);
        break;
      case 'toggleLogs':
        setShowLogs(prev => !prev);
        break;
      case 'goSmells':
        setActiveTab('smells');
        break;
      case 'goFeatures':
        setActiveTab('features');
        break;
      case 'goClassification':
        setActiveTab('classification');
        break;
      case 'runSmells':
      case 'runFeatures':
        runAnalysis();
        break;
      case 'runClassification':
        runBugClassification();
        break;
      case 'runPipeline':
        runAnalysis().then(() => runBugClassification());
        break;
      case 'showLogs':
        setShowLogs(true);
        break;
      case 'clearLogs':
        setLogs([]);
        break;
      case 'helpOverview':
        setHelpContent({
          title: 'Project Overview',
          content: `# Smell Aware Bug Classification

This system demonstrates how code smells can be used to predict and classify potential bugs in software projects using machine learning.

## Key Features
- **Code Smell Detection**: Identifies common code quality issues
- **Feature Extraction**: Converts code metrics into ML-ready features
- **Bug Classification**: Predicts bug categories using trained models

## Workflow
1. Upload a project (ZIP file)
2. Run code smell analysis
3. Generate feature dataset
4. Execute ML classification
5. Review results and reports`,
        });
        setHelpDialogOpen(true);
        break;
      case 'helpSystem':
        setHelpContent({
          title: 'How This System Works',
          content: `# System Architecture

## Analysis Pipeline

### Step 1: Static Analysis
The system parses source code files and performs static analysis to detect code smells such as:
- Long Methods
- Large Classes
- Duplicate Code
- Complex Conditionals

### Step 2: Feature Extraction
Detected smells are converted into numerical features:
- Lines of Code (LOC)
- Cyclomatic Complexity
- Nesting Depth
- Duplication Percentage

### Step 3: ML Classification
Features are fed into a trained Random Forest classifier that predicts:
- Bug Category (Logic Error, Null Reference, etc.)
- Confidence Score
- Risk Level`,
        });
        setHelpDialogOpen(true);
        break;
      case 'helpTech':
        setHelpContent({
          title: 'Technology Stack',
          content: `# Technologies Used

## Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icon Library

## Analysis Engine
- **JSZip** - ZIP File Processing
- **Static Analysis** - Code Parsing

## Machine Learning (Conceptual)
- **Python / scikit-learn** - Model Training
- **Random Forest** - Classification Algorithm
- **Feature Engineering** - Smell-based metrics

## Design
- **VS Code-inspired** - IDE-like interface
- **Shadcn/ui** - Component Library`,
        });
        setHelpDialogOpen(true);
        break;
      case 'helpML':
        setHelpContent({
          title: 'ML Model Explanation',
          content: `# Machine Learning Model

## Algorithm: Random Forest Classifier

### Why Random Forest?
- Handles high-dimensional feature spaces
- Robust to overfitting
- Provides feature importance rankings
- Works well with imbalanced datasets

## Features Used
| Feature | Description |
|---------|-------------|
| LOC | Lines of Code |
| CC | Cyclomatic Complexity |
| LMC | Long Method Count |
| DCP | Duplicate Code Percentage |
| LCC | Large Class Count |
| DNL | Deep Nesting Level |

## Output Classes
1. Logic Error
2. Null Reference
3. Resource Leak
4. Concurrency Issue

## Model Performance
- Accuracy: 87.3%
- Precision: 0.85
- Recall: 0.82
- F1-Score: 0.83`,
        });
        setHelpDialogOpen(true);
        break;
      case 'helpAbout':
        setHelpContent({
          title: 'About Final Year Project',
          content: `# Final Year Project

## Title
**Smell Aware Bug Classification Using Machine Learning**

## Objective
To develop a system that leverages code smell detection and machine learning to predict potential bug categories in software projects.

## Scope
- Web-based IDE interface for project analysis
- Static code analysis for smell detection
- ML-based bug classification
- Comprehensive reporting

## Academic Context
This project demonstrates:
- Software Engineering principles
- Machine Learning applications
- Full-stack development skills
- Research methodology

## Note
This is a prototype/simulation for academic demonstration purposes. The ML model predictions shown are illustrative.`,
        });
        setHelpDialogOpen(true);
        break;
      default:
        toast({ title: 'Action', description: `${action} triggered (simulation)` });
    }
  }, [handleUploadClick, closeProject, addLog, runAnalysis, runBugClassification]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <MenuBar onAction={handleMenuAction} />
      
      <ActionBar
        onUpload={handleUploadClick}
        onRunSmellAnalysis={runAnalysis}
        onRunBugClassification={runBugClassification}
        isAnalyzing={isAnalyzing}
        hasProject={hasProject}
      />

      <div className="flex-1 flex overflow-hidden">
        {showExplorer && (
          <FileExplorer
            files={files}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
          />
        )}

        <main className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
          <div className="flex-1 flex gap-3 overflow-hidden">
            <CodePanel
              selectedFile={selectedFile}
              isAnalyzing={isAnalyzing}
              analysisStep={analysisStep}
              getFileContent={getFileContent}
            />
            {showAnalysis && (
              <AnalysisPanel 
                hasResults={hasResults} 
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}
          </div>
        </main>
      </div>

      {showLogs && <LogPanel logs={logs} />}

      <HelpDialog
        open={helpDialogOpen}
        onOpenChange={setHelpDialogOpen}
        title={helpContent.title}
        content={helpContent.content}
      />
    </div>
  );
};

export default Index;
