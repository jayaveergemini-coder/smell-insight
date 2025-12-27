import { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  ChevronRight,
  ChevronDown,
  File,
  Monitor,
  Server,
} from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  category?: 'frontend' | 'backend' | 'other';
}

interface FileExplorerProps {
  files: FileNode[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  hasFrontend?: boolean;
  hasBackend?: boolean;
}

function getFileIcon(name: string, isFolder: boolean, isOpen: boolean) {
  if (isFolder) {
    const lowerName = name.toLowerCase();
    if (lowerName === 'frontend' || lowerName === 'client') {
      return <Monitor className="w-4 h-4 text-primary" />;
    }
    if (lowerName === 'backend' || lowerName === 'server' || lowerName === 'api') {
      return <Server className="w-4 h-4 text-success" />;
    }
    return isOpen ? <FolderOpen className="w-4 h-4 text-warning" /> : <Folder className="w-4 h-4 text-warning" />;
  }
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'json') return <FileJson className="w-4 h-4 text-warning" />;
  if (ext === 'tsx' || ext === 'jsx') return <FileCode className="w-4 h-4 text-primary" />;
  if (ext === 'ts' || ext === 'js') return <FileCode className="w-4 h-4 text-warning" />;
  if (ext === 'md' || ext === 'txt') return <FileText className="w-4 h-4 text-muted-foreground" />;
  return <File className="w-4 h-4 text-muted-foreground" />;
}

function FileTreeItem({ node, depth, path, selectedFile, onSelectFile }: {
  node: FileNode; depth: number; path: string; selectedFile: string | null; onSelectFile: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const isFolder = node.type === 'folder';
  const isSelected = selectedFile === fullPath;

  return (
    <div>
      <div
        className={`file-tree-item ${isSelected ? 'active' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => isFolder ? setIsOpen(!isOpen) : onSelectFile(fullPath)}
      >
        {isFolder && <span className="text-muted-foreground">{isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}</span>}
        {!isFolder && <span className="w-3" />}
        {getFileIcon(node.name, isFolder, isOpen)}
        <span className="text-sm truncate">{node.name}</span>
      </div>
      {isFolder && isOpen && node.children?.map((child, idx) => (
        <FileTreeItem key={idx} node={child} depth={depth + 1} path={fullPath} selectedFile={selectedFile} onSelectFile={onSelectFile} />
      ))}
    </div>
  );
}

export function FileExplorer({ files, selectedFile, onSelectFile, hasFrontend, hasBackend }: FileExplorerProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {files.length > 0 && (
        <div className="px-3 py-2 border-b border-border flex items-center gap-2 text-xs shrink-0">
          {hasFrontend && <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10"><Monitor className="w-3 h-3 text-primary" /><span className="text-primary font-medium">React</span></div>}
          {hasBackend && <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-success/10"><Server className="w-3 h-3 text-success" /><span className="text-success font-medium">Node.js</span></div>}
        </div>
      )}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {files.map((node, idx) => <FileTreeItem key={idx} node={node} depth={0} path="" selectedFile={selectedFile} onSelectFile={onSelectFile} />)}
      </div>
    </div>
  );
}

export type { FileNode };
