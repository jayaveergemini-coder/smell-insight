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
} from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileExplorerProps {
  files: FileNode[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}

function getFileIcon(name: string, isFolder: boolean, isOpen: boolean) {
  if (isFolder) {
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
    case 'ts':
    case 'jsx':
    case 'js':
      return <FileCode className="w-4 h-4 text-primary" />;
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
    case 'java':
    case 'kt':
    case 'go':
    case 'rs':
    case 'c':
    case 'cpp':
    case 'h':
      return <FileCode className="w-4 h-4 text-primary" />;
    case 'rb':
      return <FileCode className="w-4 h-4 text-destructive" />;
    case 'php':
      return <FileCode className="w-4 h-4 text-accent" />;
    case 'yml':
    case 'yaml':
    case 'toml':
      return <FileText className="w-4 h-4 text-warning" />;
    case 'lock':
      return <File className="w-4 h-4 text-muted-foreground" />;
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
}: {
  node: FileNode;
  depth: number;
  path: string;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(depth < 1);
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const isFolder = node.type === 'folder';
  const isSelected = selectedFile === fullPath;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(fullPath);
    }
  };

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${depth * 20}ms` }}>
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
        {getFileIcon(node.name, isFolder, isOpen)}
        <span className="text-sm truncate">{node.name}</span>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, selectedFile, onSelectFile }: FileExplorerProps) {
  const hasFiles = files.length > 0;

  return (
    <aside className="w-64 ide-sidebar flex flex-col h-full">
      <div className="ide-panel-header">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Project Explorer
        </span>
      </div>
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
            <Folder className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No project uploaded yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Upload a ZIP file to get started
            </p>
          </div>
        )}
      </div>
      <div className="px-3 py-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {hasFiles ? '📁 Uploaded project (read-only)' : '📦 Accepts .zip files'}
        </p>
      </div>
    </aside>
  );
}

export type { FileNode };
