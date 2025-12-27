import { useState } from 'react';
import { X, FileCode, Lock, Monitor, Server } from 'lucide-react';

interface EditorTab {
  id: string;
  path: string;
  name: string;
  category: 'frontend' | 'backend' | 'other';
}

interface EditorPanelProps {
  tabs: EditorTab[];
  activeTab: string | null;
  onTabChange: (id: string) => void;
  onTabClose: (id: string) => void;
  getFileContent: (path: string) => string | null;
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
  isAnalyzing,
  analysisStep,
  analysisType,
}: EditorPanelProps) {
  const activeTabData = tabs.find((t) => t.id === activeTab);
  const content = activeTabData ? getFileContent(activeTabData.path) : null;
  const lines = content?.split('\n') || [];

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

      {/* Read-only Banner */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-warning/10 border-b border-warning/20">
        <Lock className="w-3.5 h-3.5 text-warning" />
        <span className="text-xs text-warning">
          Code view is read-only (analysis mode)
        </span>
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

      {/* Code View */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {content ? (
          <div className="code-block p-4 min-h-full">
            <table className="w-full">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-primary/5">
                    <td className="pr-4 text-line-number select-none text-right w-12 align-top text-xs">
                      {idx + 1}
                    </td>
                    <td className="whitespace-pre text-foreground text-sm font-mono">{line || ' '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
