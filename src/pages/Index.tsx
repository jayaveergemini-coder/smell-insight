import { useState, useCallback, useRef } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
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
import { TrustDialog } from '@/components/ide/TrustDialog';
import { Upload, FolderUp } from 'lucide-react';

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
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [isResultsMinimized, setIsResultsMinimized] = useState(false);

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

  // Trust dialog
  const [trustDialogOpen, setTrustDialogOpen] = useState(false);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Project path for terminal
  const [projectPath, setProjectPath] = useState<string>('~');
  const [projectFolders, setProjectFolders] = useState<string[]>([]);

  const hasProject = files.length > 0;

  // Helper to extract folder names from tree
  const extractFolderNames = useCallback((nodes: FileNode[], prefix = ''): string[] => {
    const folders: string[] = [];
    for (const node of nodes) {
      if (node.type === 'folder') {
        const path = prefix ? `${prefix}/${node.name}` : node.name;
        folders.push(path);
        if (node.children) {
          folders.push(...extractFolderNames(node.children, path));
        }
      }
    }
    return folders;
  }, []);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), type, message, timestamp }]);
  }, []);

  const handleUploadClick = useCallback(() => {
    setTrustDialogOpen(true);
  }, []);

  const handleTrustConfirm = useCallback(() => {
    setTrustDialogOpen(false);
    folderInputRef.current?.click();
  }, []);

  const handleTrustCancel = useCallback(() => {
    setTrustDialogOpen(false);
    toast({
      title: 'Upload Cancelled',
      description: 'You chose not to trust this application. No files were accessed.',
      variant: 'destructive',
    });
    addLog('info', 'Upload cancelled - trust not granted');
  }, [addLog]);

  const processFiles = useCallback(async (fileList: FileList) => {
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
      
      // Extract project name and folder structure for terminal
      const rootName = tree[0]?.name || 'project';
      setProjectPath(`~/${rootName}`);
      const folderNames = extractFolderNames(tree);
      setProjectFolders(folderNames);
      
      addLog('success', `Working directory: ~/${rootName}`);
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
  }, [addLog]);

  const handleFolderChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    await processFiles(fileList);
    if (folderInputRef.current) folderInputRef.current.value = '';
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    // Collect all files from dropped items
    const allFiles: File[] = [];
    
    const traverseFileTree = async (entry: FileSystemEntry, path: string = ''): Promise<void> => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        return new Promise((resolve) => {
          fileEntry.file((file) => {
            // Create a new file with the full path
            const fullPath = path ? `${path}/${file.name}` : file.name;
            Object.defineProperty(file, 'webkitRelativePath', {
              value: fullPath,
              writable: false,
            });
            allFiles.push(file);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const dirReader = dirEntry.createReader();
        return new Promise((resolve) => {
          dirReader.readEntries(async (entries) => {
            for (const childEntry of entries) {
              await traverseFileTree(childEntry, path ? `${path}/${entry.name}` : entry.name);
            }
            resolve();
          });
        });
      }
    };

    try {
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) {
          await traverseFileTree(entry);
        }
      }

      if (allFiles.length > 0) {
        // Create a FileList-like object
        const dataTransfer = new DataTransfer();
        allFiles.forEach(file => dataTransfer.items.add(file));
        await processFiles(dataTransfer.files);
      }
    } catch (error) {
      addLog('info', 'Failed to process dropped folder');
      toast({ title: 'Drop failed', description: 'Could not process the dropped folder', variant: 'destructive' });
    }
  }, [processFiles, addLog]);

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

  const handleTerminalCommand = useCallback((command: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      ...prev,
      { id: Date.now(), type: 'input' as const, message: command, timestamp },
      { id: Date.now() + 1, type: 'output' as const, message: `Command "${command}" executed (simulation)`, timestamp }
    ]);
  }, []);

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
        showTerminal={showLogs}
        showAnalysisPanel={showResults}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />

        {/* Resizable Panels */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Side Panel - Resizable */}
          <ResizablePanel defaultSize={18} minSize={12} maxSize={35}>
            <aside className="h-full bg-sidebar-bg border-r border-border flex flex-col">
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
                <div 
                  className={`flex-1 flex flex-col overflow-hidden relative transition-all ${
                    isDragging ? 'bg-primary/5' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {/* Drag Overlay */}
                  {isDragging && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-lg m-2 pointer-events-none">
                      <div className="text-center">
                        <FolderUp className="w-12 h-12 text-primary mx-auto mb-2 animate-bounce" />
                        <p className="text-sm font-medium text-primary">Drop project folder here</p>
                        <p className="text-xs text-primary/70">Release to upload</p>
                      </div>
                    </div>
                  )}
                  
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
                      <div className="p-4 rounded-xl border-2 border-dashed border-border mb-4 transition-colors">
                        <Upload className="w-10 h-10 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">No project loaded</p>
                      <p className="text-xs text-muted-foreground text-center mb-4">
                        Drag & drop a folder or click below
                      </p>
                      <button
                        onClick={handleUploadClick}
                        className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Upload Project
                      </button>
                      <p className="text-[10px] text-muted-foreground mt-3">
                        Supports React + Node.js projects
                      </p>
                    </div>
                  )}
                </div>
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
          </ResizablePanel>

          {/* Resize Handle */}
          <ResizableHandle withHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />

          {/* Editor + Results Area */}
          <ResizablePanel defaultSize={82}>
            <div className="h-full flex flex-col overflow-hidden">
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
                <ResizablePanelGroup direction="horizontal">
                  {/* Editor Panel */}
                  <ResizablePanel defaultSize={showResults ? 65 : 100} minSize={30}>
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
                  </ResizablePanel>

                  {/* Results Panel - Resizable */}
                  {showResults && (
                    <>
                      <ResizableHandle withHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />
                      <ResizablePanel defaultSize={isResultsMinimized ? 5 : 35} minSize={5} maxSize={50}>
                        <ResultsPanel
                          hasResults={hasResults}
                          activeTab={resultsTab}
                          onTabChange={setResultsTab}
                          onMinimize={() => setIsResultsMinimized(prev => !prev)}
                          onClose={() => setShowResults(false)}
                          isMinimized={isResultsMinimized}
                        />
                      </ResizablePanel>
                    </>
                  )}
                </ResizablePanelGroup>
              </div>

              {/* Terminal */}
              {showLogs && (
                <TerminalPanel 
                  logs={logs} 
                  onClear={() => setLogs([])} 
                  onCommand={handleTerminalCommand}
                  projectPath={projectPath}
                  projectFolders={projectFolders}
                  onMinimize={() => setIsTerminalMinimized(prev => !prev)}
                  onClose={() => setShowLogs(false)}
                  isMinimized={isTerminalMinimized}
                />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <HelpDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} title={helpContent.title} content={helpContent.content} />
      <TrustDialog 
        open={trustDialogOpen} 
        onOpenChange={setTrustDialogOpen} 
        onConfirm={handleTrustConfirm}
        onCancel={handleTrustCancel}
      />
    </div>
  );
};

export default Index;
