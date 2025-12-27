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
  Image,
  FileType,
  Monitor,
  Server,
  FolderCode,
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

function getCategoryIcon(name: string, category?: 'frontend' | 'backend' | 'other') {
  const lowerName = name.toLowerCase();
  if (lowerName === 'frontend' || lowerName === 'client' || category === 'frontend') {
    return <Monitor className="w-4 h-4 text-primary" />;
  }
  if (lowerName === 'backend' || lowerName === 'server' || lowerName === 'api' || category === 'backend') {
    return <Server className="w-4 h-4 text-success" />;
  }
  return null;
}

function getFileIcon(name: string, isFolder: boolean, isOpen: boolean, category?: 'frontend' | 'backend' | 'other') {
  if (isFolder) {
    const categoryIcon = getCategoryIcon(name, category);
    if (categoryIcon && (name.toLowerCase() === 'frontend' || name.toLowerCase() === 'client' || 
        name.toLowerCase() === 'backend' || name.toLowerCase() === 'server' || name.toLowerCase() === 'api')) {
      return categoryIcon;
    }
    return isOpen ? (
      <FolderOpen className="w-4 h-4 text-warning" />
    ) : (
      <Folder className="w-4 h-4 text-warning" />
    );
  }

  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'json':
      return <FileJson className="w-4 h-4 text-warning" />;
    case 'md':
    case 'txt':
    case 'log':
      return <FileText className="w-4 h-4 text-muted-foreground" />;
    case 'tsx':
    case 'jsx':
      return <FileCode className="w-4 h-4 text-primary" />;
    case 'ts':
    case 'js':
      return <FileCode className="w-4 h-4 text-warning" />;
    case 'py':
      return <FileCode className="w-4 h-4 text-success" />;
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <FileType className="w-4 h-4 text-accent" />;
    case 'html':
    case 'htm':
      return <FileCode className="w-4 h-4 text-destructive" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
    case 'ico':
      return <Image className="w-4 h-4 text-accent" />;
    default:
      return <File className="w-4 h-4 text-muted-foreground" />;
  }
}

function FileTreeItem({
  node,
  depth,
  path,
  selectedFile,
  onSelectFile,
  parentCategory,
}: {
  node: FileNode;
  depth: number;
  path: string;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  parentCategory?: 'frontend' | 'backend' | 'other';
}) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const isFolder = node.type === 'folder';
  const isSelected = selectedFile === fullPath;
  const category = node.category || parentCategory;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(fullPath);
    }
  };

  // Determine category label for root folders
  const getCategoryLabel = () => {
    const lowerName = node.name.toLowerCase();
    if (lowerName === 'frontend' || lowerName === 'client') {
      return <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-medium">React</span>;
    }
    if (lowerName === 'backend' || lowerName === 'server' || lowerName === 'api') {
      return <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-success/15 text-success font-medium">Node.js</span>;
    }
    return null;
  };

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${depth * 15}ms` }}>
      <div
        className={`file-tree-item ${isSelected ? 'active' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {isFolder && (
          <span className="text-muted-foreground">
            {isOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        )}
        {!isFolder && <span className="w-3" />}
        {getFileIcon(node.name, isFolder, isOpen, category)}
        <span className="text-sm truncate flex-1">{node.name}</span>
        {depth === 0 && getCategoryLabel()}
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <FileTreeItem
              key={idx}
              node={child}
              depth={depth + 1}
              path={fullPath}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              parentCategory={category}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, selectedFile, onSelectFile, hasFrontend, hasBackend }: FileExplorerProps) {
  const hasFiles = files.length > 0;

  return (
    <aside className="w-72 ide-sidebar flex flex-col h-full">
      <div className="ide-panel-header">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Project Explorer
        </span>
      </div>
      
      {hasFiles && (
        <div className="px-3 py-2 border-b border-border flex items-center gap-2 text-xs">
          {hasFrontend && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10">
              <Monitor className="w-3 h-3 text-primary" />
              <span className="text-primary font-medium">Frontend</span>
            </div>
          )}
          {hasBackend && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-success/10">
              <Server className="w-3 h-3 text-success" />
              <span className="text-success font-medium">Backend</span>
            </div>
          )}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {hasFiles ? (
          files.map((node, idx) => (
            <FileTreeItem
              key={idx}
              node={node}
              depth={0}
              path=""
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))
        ) : (
          <div className="px-4 py-8 text-center">
            <FolderCode className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">
              No project uploaded
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload a React + Backend project folder to begin analysis
            </p>
          </div>
        )}
      </div>
      <div className="px-3 py-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {hasFiles ? '📁 Project structure (read-only)' : '📂 Accepts folder uploads'}
        </p>
      </div>
    </aside>
  );
}

export type { FileNode };
