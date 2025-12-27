import JSZip from 'jszip';
import { FileNode } from '@/components/ide/FileExplorer';

export interface ExtractedFile {
  path: string;
  content: string;
  isDirectory: boolean;
}

export async function extractZipFile(file: File): Promise<{
  files: ExtractedFile[];
  tree: FileNode[];
}> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  
  const extractedFiles: ExtractedFile[] = [];
  const filePromises: Promise<void>[] = [];

  contents.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      const promise = zipEntry.async('string').then((content) => {
        extractedFiles.push({
          path: relativePath,
          content,
          isDirectory: false,
        });
      }).catch(() => {
        // Binary file - store empty content
        extractedFiles.push({
          path: relativePath,
          content: '// Binary file - preview not available',
          isDirectory: false,
        });
      });
      filePromises.push(promise);
    } else {
      extractedFiles.push({
        path: relativePath,
        content: '',
        isDirectory: true,
      });
    }
  });

  await Promise.all(filePromises);

  const tree = buildFileTree(extractedFiles);
  
  return { files: extractedFiles, tree };
}

function buildFileTree(files: ExtractedFile[]): FileNode[] {
  const root: FileNode[] = [];
  const pathMap = new Map<string, FileNode>();

  // Sort files so directories come first and paths are ordered
  const sortedFiles = [...files].sort((a, b) => {
    const aDepth = a.path.split('/').length;
    const bDepth = b.path.split('/').length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    return a.path.localeCompare(b.path);
  });

  for (const file of sortedFiles) {
    // Remove trailing slash for directories
    const cleanPath = file.path.replace(/\/$/, '');
    const parts = cleanPath.split('/');
    
    // Skip __MACOSX and hidden files
    if (parts.some(p => p.startsWith('__') || p.startsWith('.'))) {
      continue;
    }

    let currentPath = '';
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      let existing = pathMap.get(currentPath);

      if (!existing) {
        const newNode: FileNode = {
          name: part,
          type: isLast && !file.isDirectory ? 'file' : 'folder',
          children: isLast && !file.isDirectory ? undefined : [],
        };

        pathMap.set(currentPath, newNode);
        currentLevel.push(newNode);
        existing = newNode;
      }

      if (existing.children) {
        currentLevel = existing.children;
      }
    }
  }

  // Sort each level: folders first, then files, alphabetically
  const sortLevel = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(node => {
      if (node.children) {
        sortLevel(node.children);
      }
    });
  };

  sortLevel(root);
  
  return root;
}

export function countFilesAndFolders(tree: FileNode[]): { files: number; folders: number } {
  let files = 0;
  let folders = 0;

  const count = (nodes: FileNode[]) => {
    for (const node of nodes) {
      if (node.type === 'folder') {
        folders++;
        if (node.children) {
          count(node.children);
        }
      } else {
        files++;
      }
    }
  };

  count(tree);
  return { files, folders };
}
