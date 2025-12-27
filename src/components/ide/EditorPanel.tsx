import { useState, useCallback, useRef } from 'react';
import { X, FileCode, Monitor, Server } from 'lucide-react';
import { SyntaxHighlightedCode } from './SyntaxHighlightedCode';

interface EditorTab {
  id: string;
  path: string;
  name: string;
  category: 'frontend' | 'backend' | 'other';
}

interface CursorPosition {
  line: number;
  column: number;
}

interface EditorPanelProps {
  tabs: EditorTab[];
  activeTab: string | null;
  onTabChange: (id: string) => void;
  onTabClose: (id: string) => void;
  getFileContent: (path: string) => string | null;
  onContentChange?: (path: string, content: string) => void;
  onCursorChange?: (position: CursorPosition) => void;
  isAnalyzing: boolean;
  analysisStep: string | null;
  analysisType: 'frontend' | 'backend' | 'full';
}

export function EditorPanel({
  tabs,
  activeTab,
  onTabChange,
  onTabClose,
  getFileContent,
  onContentChange,
  onCursorChange,
  isAnalyzing,
  analysisStep,
  analysisType,
}: EditorPanelProps) {
  const activeTabData = tabs.find((t) => t.id === activeTab);
  const originalContent = activeTabData ? getFileContent(activeTabData.path) : null;
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [currentLine, setCurrentLine] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const content = activeTabData 
    ? (editedContent[activeTabData.path] ?? originalContent) 
    : null;

  const getCursorPosition = useCallback((textarea: HTMLTextAreaElement): CursorPosition => {
    const text = textarea.value;
    const selectionStart = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, selectionStart);
    const lines = textBeforeCursor.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    return { line, column };
  }, []);

  const handleCursorChange = useCallback(() => {
    if (textareaRef.current) {
      const position = getCursorPosition(textareaRef.current);
      setCurrentLine(position.line);
      onCursorChange?.(position);
    }
  }, [getCursorPosition, onCursorChange]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeTabData) return;
    const newContent = e.target.value;
    setEditedContent(prev => ({ ...prev, [activeTabData.path]: newContent }));
    onContentChange?.(activeTabData.path, newContent);
    handleCursorChange();
  }, [activeTabData, onContentChange, handleCursorChange]);

  if (tabs.length === 0) {
    return (
      <div className="flex-1 bg-panel flex flex-col items-center justify-center">
        <FileCode className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-medium text-foreground mb-2">No file open</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Select a file from the Explorer to view its contents
        </p>
      </div>
    );
  }

  const lines = content?.split('\n') || [];

  return (
    <div className="flex-1 bg-panel flex flex-col overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center bg-secondary/30 border-b border-border overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center gap-2 px-3 py-2 border-r border-border cursor-pointer transition-colors shrink-0 ${
              activeTab === tab.id
                ? 'bg-panel border-t-2 border-t-primary'
                : 'hover:bg-secondary/50'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.category === 'frontend' ? (
              <Monitor className="w-3.5 h-3.5 text-primary" />
            ) : tab.category === 'backend' ? (
              <Server className="w-3.5 h-3.5 text-success" />
            ) : (
              <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <span className={`text-xs ${activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'}`}>
              {tab.name}
              {editedContent[tab.path] !== undefined && editedContent[tab.path] !== getFileContent(tab.path) && (
                <span className="ml-1 text-warning">●</span>
              )}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="w-4 h-4 rounded hover:bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Breadcrumb */}
      {activeTabData && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border bg-secondary/20">
          {activeTabData.path.split('/').map((part, idx, arr) => (
            <span key={idx}>
              <span className="hover:text-foreground cursor-pointer">{part}</span>
              {idx < arr.length - 1 && <span className="mx-1">/</span>}
            </span>
          ))}
        </div>
      )}

      {/* Code Editor with Syntax Highlighting */}
      <div className="flex-1 overflow-hidden flex min-h-0">
        {content !== null ? (
          <div className="flex-1 flex min-h-0 min-w-0 overflow-auto scrollbar-thin items-start bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
            {/* Line Numbers */}
            <div
              aria-hidden="true"
              className="bg-secondary/40 border-r border-border px-2 py-4 select-none pointer-events-none sticky left-0 shrink-0"
            >
              <div className="font-mono text-xs text-right">
                {lines.map((_, idx) => (
                  <div
                    key={idx}
                    className={`leading-6 px-1 -mx-1 ${
                      currentLine === idx + 1
                        ? 'text-foreground bg-primary/20 rounded-sm'
                        : 'text-line-number'
                    }`}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Code Preview + Editable Layer */}
            <div className="relative w-max min-w-full">
              {/* Syntax Highlighted Code - Always Visible */}
              <div className="pointer-events-none" aria-hidden="true">
                <SyntaxHighlightedCode content={content} filename={activeTabData?.name || ''} />
              </div>

              {/* Transparent Textarea for Editing - Always on top but invisible text */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onKeyUp={handleCursorChange}
                onMouseUp={handleCursorChange}
                onClick={handleCursorChange}
                onFocus={handleCursorChange}
                wrap="off"
                className="absolute inset-0 bg-transparent font-mono text-sm p-4 resize-none outline-none leading-6 w-full h-full text-transparent caret-foreground selection:bg-primary/30"
                spellCheck={false}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Unable to load file content</p>
          </div>
        )}
      </div>
    </div>
  );
}

export type { EditorTab };
