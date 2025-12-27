import { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  ChevronRight,
  ChevronDown,
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

const demoFiles: FileNode[] = [
  {
    name: 'frontend',
    type: 'folder',
    children: [
      {
        name: 'src',
        type: 'folder',
        children: [
          { name: 'App.tsx', type: 'file' },
          { name: 'index.tsx', type: 'file' },
          { name: 'utils.ts', type: 'file' },
        ],
      },
      { name: 'package.json', type: 'file' },
    ],
  },
  {
    name: 'backend',
    type: 'folder',
    children: [
      {
        name: 'src',
        type: 'folder',
        children: [
          { name: 'server.py', type: 'file' },
          { name: 'routes.py', type: 'file' },
          { name: 'models.py', type: 'file' },
        ],
      },
      { name: 'requirements.txt', type: 'file' },
    ],
  },
  {
    name: 'ml-engine',
    type: 'folder',
    children: [
      { name: 'classifier.py', type: 'file' },
      { name: 'feature_extractor.py', type: 'file' },
      { name: 'model.pkl', type: 'file' },
    ],
  },
  { name: 'package.json', type: 'file' },
  { name: 'README.md', type: 'file' },
];

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
      return <FileText className="w-4 h-4 text-muted-foreground" />;
    case 'tsx':
    case 'ts':
    case 'jsx':
    case 'js':
      return <FileCode className="w-4 h-4 text-primary" />;
    case 'py':
      return <FileCode className="w-4 h-4 text-success" />;
    default:
      return <FileCode className="w-4 h-4 text-muted-foreground" />;
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
  const [isOpen, setIsOpen] = useState(depth < 2);
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
    <div className="animate-fade-in" style={{ animationDelay: `${depth * 30}ms` }}>
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
  const displayFiles = files.length > 0 ? files : demoFiles;

  return (
    <aside className="w-64 ide-sidebar flex flex-col h-full">
      <div className="ide-panel-header">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Project Explorer
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {displayFiles.map((node, idx) => (
          <FileTreeItem
            key={idx}
            node={node}
            depth={0}
            path=""
            selectedFile={selectedFile}
            onSelectFile={onSelectFile}
          />
        ))}
      </div>
      <div className="px-3 py-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          📁 Uploaded project structure (read-only)
        </p>
      </div>
    </aside>
  );
}

export type { FileNode };
