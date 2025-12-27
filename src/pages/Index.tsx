import { useState, useCallback, useRef } from 'react';
import { ActivityBar, ActivityView } from '@/components/ide/ActivityBar';
import { FileExplorer, FileNode } from '@/components/ide/FileExplorer';
import { SearchPanel } from '@/components/ide/SearchPanel';
import { SmellsPanel } from '@/components/ide/SmellsPanel';
import { ExtensionsPanel } from '@/components/ide/ExtensionsPanel';
import { SettingsPanel } from '@/components/ide/SettingsPanel';
import { EditorPanel, EditorTab } from '@/components/ide/EditorPanel';
import { EditorToolbar } from '@/components/ide/EditorToolbar';
import { TerminalPanel, LogEntry } from '@/components/ide/TerminalPanel';
import { ResultsPanel } from '@/components/ide/ResultsPanel';
import { MenuBar } from '@/components/ide/MenuBar';
import { extractFolderFiles, ExtractedFile, countFilesAndFolders, ProjectValidation } from '@/lib/folderExtractor';
import { toast } from '@/hooks/use-toast';
import { HelpDialog } from '@/components/ide/HelpDialog';
import { Upload } from 'lucide-react';

const Index = () => {
  // Project state
  const [files, setFiles] = useState<FileNode[]>([]);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [validation, setValidation] = useState<ProjectValidation>({ isValid: false, hasFrontend: false, hasBackend: false, errors: [] });
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Editor state
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Panel state
  const [activeView, setActiveView] = useState<ActivityView>('explorer');
  const [showLogs, setShowLogs] = useState(true);
  const [showResults, setShowResults] = useState(true);

  // Analysis state
  const [hasResults, setHasResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'completed'>('idle');
  const [analysisType, setAnalysisType] = useState<'frontend' | 'backend' | 'full'>('full');
  const [analysisStep, setAnalysisStep] = useState<string | null>(null);
  const [resultsTab, setResultsTab] = useState<'summary' | 'features' | 'classification'>('summary');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Help dialog
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [helpContent, setHelpContent] = useState({ title: '', content: '' });

  const hasProject = files.length > 0;

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), type, message, timestamp }]);
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
      setValidation(projectValidation);
      setTabs([]);
      setActiveTab(null);
      setHasResults(false);
      setAnalysisStatus('idle');
      
      if (projectValidation.hasFrontend) addLog('success', 'Frontend folder detected');
      if (projectValidation.hasBackend) addLog('success', 'Backend folder detected');
      addLog('success', `Project loaded: ${counts.files} files in ${counts.folders} directories`);
      
      toast({
        title: projectValidation.isValid ? 'Project uploaded' : 'Partial structure',
        description: projectValidation.isValid 
          ? `Loaded ${counts.files} files` 
          : 'Some folders may be missing',
        variant: projectValidation.isValid ? 'default' : 'destructive',
      });
    } catch (error) {
      addLog('info', 'Failed to process folder');
      toast({ title: 'Upload failed', description: 'Could not process the folder', variant: 'destructive' });
    }

    if (folderInputRef.current) folderInputRef.current.value = '';
  }, [addLog]);

  const getFileContent = useCallback((path: string): string | null => {
    const file = extractedFiles.find(f => {
      const filePath = f.path.split('/').slice(1).join('/');
      return filePath === path || f.path.endsWith('/' + path);
    });
    return file?.content ?? null;
  }, [extractedFiles]);

  const handleFileSelect = useCallback((path: string) => {
    const fileName = path.split('/').pop() || path;
    const category = path.toLowerCase().includes('frontend') ? 'frontend' : 
                     path.toLowerCase().includes('backend') ? 'backend' : 'other';
    
    const existingTab = tabs.find(t => t.path === path);
    if (existingTab) {
      setActiveTab(existingTab.id);
    } else {
      const newTab: EditorTab = { id: `tab-${Date.now()}`, path, name: fileName, category };
      setTabs(prev => [...prev, newTab]);
      setActiveTab(newTab.id);
    }
  }, [tabs]);

  const handleTabClose = useCallback((id: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== id);
      if (activeTab === id && newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        setActiveTab(null);
      }
      return newTabs;
    });
  }, [activeTab]);

  const runAnalysis = useCallback(async (type: 'frontend' | 'backend' | 'full') => {
    setIsAnalyzing(true);
    setAnalysisStatus('analyzing');
    setAnalysisType(type);
    setHasResults(false);

    const steps = type === 'frontend' 
      ? ['Scanning components', 'Analyzing JSX', 'Extracting metrics']
      : type === 'backend'
      ? ['Scanning services', 'Analyzing logic', 'Extracting metrics']
      : ['Scanning frontend', 'Scanning backend', 'Detecting smells', 'Extracting features', 'Running ML model'];

    for (const step of steps) {
      setAnalysisStep(step);
      addLog('info', `${step}...`);
      await new Promise(r => setTimeout(r, 800));
    }

    setIsAnalyzing(false);
    setAnalysisStep(null);
    setAnalysisStatus('completed');
    setHasResults(true);
    setResultsTab(type === 'full' ? 'classification' : 'summary');
    addLog('success', `${type.charAt(0).toUpperCase() + type.slice(1)} analysis completed`);
    addLog('success', 'Bug classified successfully');
    toast({ title: 'Analysis Complete', description: 'Results are ready to view' });
  }, [addLog]);

  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case 'upload': handleUploadClick(); break;
      case 'close': 
        setFiles([]); setExtractedFiles([]); setTabs([]); setActiveTab(null); 
        setHasResults(false); setValidation({ isValid: false, hasFrontend: false, hasBackend: false, errors: [] });
        addLog('info', 'Project closed');
        break;
      case 'runSmells': if (validation.hasFrontend) runAnalysis('frontend'); break;
      case 'runFeatures': if (validation.hasBackend) runAnalysis('backend'); break;
      case 'runPipeline': if (hasProject) runAnalysis('full'); break;
      case 'clearLogs': setLogs([]); break;
      case 'toggleLogs': setShowLogs(prev => !prev); break;
      case 'toggleAnalysis': setShowResults(prev => !prev); break;
      case 'helpOverview':
      case 'helpSystem':
      case 'helpTech':
      case 'helpML':
      case 'helpAbout':
        setHelpContent({ title: 'Help', content: 'Documentation for academic demonstration' });
        setHelpDialogOpen(true);
        break;
      default: toast({ title: 'Action', description: `${action} (simulation)` });
    }
  }, [handleUploadClick, runAnalysis, hasProject, validation, addLog]);

  const resetLayout = useCallback(() => {
    setShowLogs(true);
    setShowResults(true);
    setActiveView('explorer');
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderChange}
        className="hidden"
      />

      {/* Menu Bar */}
      <MenuBar 
        onAction={handleMenuAction}
        hasProject={hasProject}
        hasFrontend={validation.hasFrontend}
        hasBackend={validation.hasBackend}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />

        {/* Side Panel */}
        <aside className="w-64 bg-sidebar-bg border-r border-border flex flex-col shrink-0">
          <div className="p-3 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {activeView === 'explorer' && 'Project Explorer'}
              {activeView === 'search' && 'Search'}
              {activeView === 'smells' && 'Code Smells'}
              {activeView === 'extensions' && 'Extensions'}
              {activeView === 'settings' && 'Settings'}
            </span>
          </div>

          {activeView === 'explorer' && (
            <>
              {hasProject ? (
                <FileExplorer
                  files={files}
                  selectedFile={tabs.find(t => t.id === activeTab)?.path || null}
                  onSelectFile={handleFileSelect}
                  hasFrontend={validation.hasFrontend}
                  hasBackend={validation.hasBackend}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <Upload className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm font-medium text-foreground mb-2">No project loaded</p>
                  <p className="text-xs text-muted-foreground text-center mb-4">
                    Upload a React + Backend project folder
                  </p>
                  <button
                    onClick={handleUploadClick}
                    className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Upload Project
                  </button>
                </div>
              )}
            </>
          )}
          {activeView === 'search' && <SearchPanel onResultClick={handleFileSelect} />}
          {activeView === 'smells' && <SmellsPanel hasResults={hasResults} />}
          {activeView === 'extensions' && <ExtensionsPanel />}
          {activeView === 'settings' && (
            <SettingsPanel
              showLogs={showLogs}
              showAnalysis={showResults}
              onToggleLogs={() => setShowLogs(prev => !prev)}
              onToggleAnalysis={() => setShowResults(prev => !prev)}
              onResetLayout={resetLayout}
            />
          )}
        </aside>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorToolbar
            onAnalyzeCurrent={() => toast({ title: 'Analyze', description: 'Current file analysis (simulation)' })}
            onAnalyzeFrontend={() => runAnalysis('frontend')}
            onAnalyzeBackend={() => runAnalysis('backend')}
            onRunFullAnalysis={() => runAnalysis('full')}
            hasProject={hasProject}
            hasFrontend={validation.hasFrontend}
            hasBackend={validation.hasBackend}
            hasActiveFile={activeTab !== null}
            isAnalyzing={isAnalyzing}
            status={analysisStatus}
          />
          
          <div className="flex-1 flex overflow-hidden">
            <EditorPanel
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onTabClose={handleTabClose}
              getFileContent={getFileContent}
              isAnalyzing={isAnalyzing}
              analysisStep={analysisStep}
              analysisType={analysisType}
            />

            {/* Results Panel */}
            {showResults && (
              <ResultsPanel
                hasResults={hasResults}
                activeTab={resultsTab}
                onTabChange={setResultsTab}
              />
            )}
          </div>

          {/* Terminal */}
          {showLogs && <TerminalPanel logs={logs} onClear={() => setLogs([])} />}
        </div>
      </div>

      <HelpDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} title={helpContent.title} content={helpContent.content} />
    </div>
  );
};

export default Index;
