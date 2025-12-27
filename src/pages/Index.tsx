import { useState, useCallback, useRef } from 'react';
import { MenuBar } from '@/components/ide/MenuBar';
import { ActionBar } from '@/components/ide/ActionBar';
import { FileExplorer, FileNode } from '@/components/ide/FileExplorer';
import { CodePanel } from '@/components/ide/CodePanel';
import { AnalysisPanel } from '@/components/ide/AnalysisPanel';
import { LogPanel, LogEntry } from '@/components/ide/LogPanel';
import { extractFolderFiles, ExtractedFile, countFilesAndFolders, ProjectValidation } from '@/lib/folderExtractor';
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
  const [analysisType, setAnalysisType] = useState<'frontend' | 'backend' | 'full'>('full');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend' | 'classification'>('frontend');
  const [validation, setValidation] = useState<ProjectValidation>({ isValid: false, hasFrontend: false, hasBackend: false, errors: [] });
  const folderInputRef = useRef<HTMLInputElement>(null);

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
      { id: Date.now() + Math.random(), type, message, timestamp },
    ]);
  }, []);

  const handleUploadClick = useCallback(() => {
    folderInputRef.current?.click();
  }, []);

  const handleFolderChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    addLog('info', 'Processing uploaded folder...');

    try {
      const { files: extracted, tree, validation: projectValidation } = await extractFolderFiles(fileList);
      const counts = countFilesAndFolders(tree);
      
      setExtractedFiles(extracted);
      setFiles(tree);
      setHasProject(true);
      setSelectedFile(null);
      setHasResults(false);
      setValidation(projectValidation);
      
      if (projectValidation.hasFrontend) {
        addLog('success', 'Frontend folder detected');
      }
      if (projectValidation.hasBackend) {
        addLog('success', 'Backend folder detected');
      }
      
      addLog('success', 'Project structure loaded successfully');
      addLog('info', `Found ${counts.folders} directories, ${counts.files} files`);
      
      if (counts.frontendFiles > 0) {
        addLog('info', `Frontend: ${counts.frontendFiles} files`);
      }
      if (counts.backendFiles > 0) {
        addLog('info', `Backend: ${counts.backendFiles} files`);
      }
      
      if (!projectValidation.isValid) {
        toast({
          title: 'Invalid project structure',
          description: 'Please upload a valid React + Backend project structure',
          variant: 'destructive',
        });
      } else if (!projectValidation.hasFrontend || !projectValidation.hasBackend) {
        toast({
          title: 'Partial structure detected',
          description: `${!projectValidation.hasFrontend ? 'Frontend folder missing. ' : ''}${!projectValidation.hasBackend ? 'Backend folder missing.' : ''}`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Project uploaded',
          description: `Loaded ${counts.files} files from project folder`,
        });
      }
    } catch (error) {
      addLog('info', 'Failed to process folder');
      toast({
        title: 'Upload failed',
        description: 'Could not process the folder. Please try again.',
        variant: 'destructive',
      });
    }

    if (folderInputRef.current) {
      folderInputRef.current.value = '';
    }
  }, [addLog]);

  const getFileContent = useCallback((path: string): string | null => {
    const file = extractedFiles.find(f => {
      const filePath = f.path.split('/').slice(1).join('/');
      return filePath === path || f.path.endsWith('/' + path);
    });
    return file?.content ?? null;
  }, [extractedFiles]);

  const runFrontendAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisType('frontend');
    setHasResults(false);
    
    const steps = ['scan-frontend', 'detect-jsx', 'extract-frontend', 'complete-frontend'];
    
    for (const step of steps) {
      setAnalysisStep(step);
      addLog(step === 'complete-frontend' ? 'success' : 'info', 
        step === 'scan-frontend' ? 'Scanning frontend components...' :
        step === 'detect-jsx' ? 'Analyzing JSX complexity...' :
        step === 'extract-frontend' ? 'Extracting React metrics...' :
        'Frontend analysis completed'
      );
      await new Promise((r) => setTimeout(r, 1000));
    }

    setIsAnalyzing(false);
    setAnalysisStep(null);
    setHasResults(true);
    setActiveTab('frontend');
    addLog('success', 'Frontend code smells detected: 29 issues found');
  }, [addLog]);

  const runBackendAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisType('backend');
    setHasResults(false);
    
    const steps = ['scan-backend', 'detect-logic', 'extract-backend', 'complete-backend'];
    
    for (const step of steps) {
      setAnalysisStep(step);
      addLog(step === 'complete-backend' ? 'success' : 'info', 
        step === 'scan-backend' ? 'Scanning backend services...' :
        step === 'detect-logic' ? 'Analyzing business logic...' :
        step === 'extract-backend' ? 'Extracting API metrics...' :
        'Backend analysis completed'
      );
      await new Promise((r) => setTimeout(r, 1000));
    }

    setIsAnalyzing(false);
    setAnalysisStep(null);
    setHasResults(true);
    setActiveTab('backend');
    addLog('success', 'Backend code smells detected: 20 issues found');
  }, [addLog]);

  const runFullAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisType('full');
    setHasResults(false);
    
    const steps = ['scan-frontend', 'scan-backend', 'detect-smells', 'extract-metrics', 'prepare-ml', 'complete'];
    
    for (const step of steps) {
      setAnalysisStep(step);
      addLog(step === 'complete' ? 'success' : 'info', 
        step === 'scan-frontend' ? 'Scanning frontend components...' :
        step === 'scan-backend' ? 'Analyzing backend services...' :
        step === 'detect-smells' ? 'Detecting code smells...' :
        step === 'extract-metrics' ? 'Extracting ML features...' :
        step === 'prepare-ml' ? 'Preparing ML features...' :
        'Full analysis completed'
      );
      await new Promise((r) => setTimeout(r, 900));
    }

    setIsAnalyzing(false);
    setAnalysisStep(null);
    setHasResults(true);
    setActiveTab('classification');
    addLog('success', 'Total code smells detected: 49 issues');
    addLog('success', 'Bug classified successfully');
    addLog('info', 'Predicted: State Management Error (84.7% confidence)');
  }, [addLog]);

  const closeProject = useCallback(() => {
    setFiles([]);
    setExtractedFiles([]);
    setSelectedFile(null);
    setHasProject(false);
    setHasResults(false);
    setValidation({ isValid: false, hasFrontend: false, hasBackend: false, errors: [] });
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
        setActiveTab('frontend');
        break;
      case 'goFeatures':
        setActiveTab('backend');
        break;
      case 'goClassification':
        setActiveTab('classification');
        break;
      case 'runSmells':
        runFrontendAnalysis();
        break;
      case 'runFeatures':
        runBackendAnalysis();
        break;
      case 'runClassification':
      case 'runPipeline':
        runFullAnalysis();
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

This system demonstrates how code smells in both frontend (React) and backend (Node.js) can be used to predict and classify potential bugs using machine learning.

## Key Features
- **Folder-Based Upload**: Upload entire React + Backend projects
- **Separate Analysis**: Analyze frontend and backend independently
- **ML Classification**: Predict bug categories using trained models

## Project Structure
The system expects:
- \`frontend/\` - React application (components, hooks, etc.)
- \`backend/\` - Node.js/Express API (routes, controllers, etc.)`,
        });
        setHelpDialogOpen(true);
        break;
      case 'helpSystem':
        setHelpContent({
          title: 'How This System Works',
          content: `# System Architecture

## Analysis Pipeline

### Frontend Analysis
- Scans React components for:
  - Large Component smell
  - High JSX Complexity
  - Duplicate UI Logic
  - Missing PropTypes

### Backend Analysis
- Analyzes Node.js services for:
  - Long Methods
  - High Cyclomatic Complexity
  - Duplicate Business Logic
  - Large Controllers

### ML Classification
Combined features from both analyses are used to predict:
- Bug Category
- Confidence Score
- Risk Level`,
        });
        setHelpDialogOpen(true);
        break;
      case 'helpTech':
        setHelpContent({
          title: 'Technology Stack',
          content: `# Technologies Used

## Frontend Interface
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide Icons**

## Analysis
- **Static Analysis** for code parsing
- **Folder Upload API** for project loading

## Expected Project Structure
\`\`\`
project/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/
│   ├── routes/
│   ├── controllers/
│   └── server.js
└── README.md
\`\`\``,
        });
        setHelpDialogOpen(true);
        break;
      case 'helpML':
        setHelpContent({
          title: 'ML Model Explanation',
          content: `# Machine Learning Model

## Features from Frontend
- Component Line Count
- JSX Nesting Depth
- Props Complexity
- State Usage Patterns

## Features from Backend
- Method Length
- Cyclomatic Complexity
- API Route Count
- Error Handling Coverage

## Output Classes
1. State Management Error
2. API Integration Bug
3. Logic Error
4. Null Reference

## Model Accuracy: 84.7%`,
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
Develop a system that analyzes React + Node.js projects to detect code smells and predict potential bug categories.

## Scope
- Web-based IDE interface
- Separate frontend/backend analysis
- ML-based bug classification
- Academic demonstration

## Note
This is a prototype/simulation for academic demonstration purposes.`,
        });
        setHelpDialogOpen(true);
        break;
      default:
        toast({ title: 'Action', description: `${action} triggered (simulation)` });
    }
  }, [handleUploadClick, closeProject, addLog, runFrontendAnalysis, runBackendAnalysis, runFullAnalysis]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore - webkitdirectory is not in React types
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderChange}
        className="hidden"
      />
      
      <MenuBar onAction={handleMenuAction} />
      
      <ActionBar
        onUpload={handleUploadClick}
        onAnalyzeFrontend={runFrontendAnalysis}
        onAnalyzeBackend={runBackendAnalysis}
        onRunFullAnalysis={runFullAnalysis}
        isAnalyzing={isAnalyzing}
        hasProject={hasProject}
        hasFrontend={validation.hasFrontend}
        hasBackend={validation.hasBackend}
        validationErrors={validation.errors}
      />

      <div className="flex-1 flex overflow-hidden">
        {showExplorer && (
          <FileExplorer
            files={files}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            hasFrontend={validation.hasFrontend}
            hasBackend={validation.hasBackend}
          />
        )}

        <main className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
          <div className="flex-1 flex gap-3 overflow-hidden">
            <CodePanel
              selectedFile={selectedFile}
              isAnalyzing={isAnalyzing}
              analysisStep={analysisStep}
              analysisType={analysisType}
              getFileContent={getFileContent}
            />
            {showAnalysis && (
              <AnalysisPanel 
                hasResults={hasResults} 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                hasFrontend={validation.hasFrontend}
                hasBackend={validation.hasBackend}
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
