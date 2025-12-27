import { FileNode } from '@/components/ide/FileExplorer';

export interface ExtractedFile {
  path: string;
  content: string;
  isDirectory: boolean;
}

export interface ProjectValidation {
  isValid: boolean;
  hasFrontend: boolean;
  hasBackend: boolean;
  errors: string[];
}

export async function extractFolderFiles(fileList: FileList): Promise<{
  files: ExtractedFile[];
  tree: FileNode[];
  validation: ProjectValidation;
}> {
  const extractedFiles: ExtractedFile[] = [];
  const filePromises: Promise<void>[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const relativePath = file.webkitRelativePath || file.name;
    
    // Skip hidden files and node_modules
    if (relativePath.includes('node_modules') || 
        relativePath.split('/').some(p => p.startsWith('.'))) {
      continue;
    }

    const promise = new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        extractedFiles.push({
          path: relativePath,
          content: typeof reader.result === 'string' ? reader.result : '// Binary file - preview not available',
          isDirectory: false,
        });
        resolve();
      };
      reader.onerror = () => {
        extractedFiles.push({
          path: relativePath,
          content: '// Could not read file',
          isDirectory: false,
        });
        resolve();
      };
      
      // Only read text files
      const ext = file.name.split('.').pop()?.toLowerCase();
      const textExtensions = ['js', 'jsx', 'ts', 'tsx', 'json', 'md', 'txt', 'css', 'scss', 'html', 'py', 'yml', 'yaml', 'env', 'gitignore', 'lock'];
      if (textExtensions.includes(ext || '') || !ext) {
        reader.readAsText(file);
      } else {
        extractedFiles.push({
          path: relativePath,
          content: '// Binary file - preview not available',
          isDirectory: false,
        });
        resolve();
      }
    });
    filePromises.push(promise);
  }

  await Promise.all(filePromises);

  const tree = buildFileTree(extractedFiles);
  const validation = validateProjectStructure(extractedFiles);
  
  return { files: extractedFiles, tree, validation };
}

function buildFileTree(files: ExtractedFile[]): FileNode[] {
  const root: FileNode[] = [];
  const pathMap = new Map<string, FileNode>();

  // Sort files by path depth and name
  const sortedFiles = [...files].sort((a, b) => {
    const aDepth = a.path.split('/').length;
    const bDepth = b.path.split('/').length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    return a.path.localeCompare(b.path);
  });

  for (const file of sortedFiles) {
    const cleanPath = file.path.replace(/\/$/, '');
    const parts = cleanPath.split('/');
    
    // Skip the root folder name if it exists
    const startIndex = parts.length > 1 ? 1 : 0;
    
    let currentPath = '';
    let currentLevel = root;

    for (let i = startIndex; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      let existing = pathMap.get(currentPath);

      if (!existing) {
        const newNode: FileNode = {
          name: part,
          type: isLast && !file.isDirectory ? 'file' : 'folder',
          children: isLast && !file.isDirectory ? undefined : [],
          category: detectCategory(currentPath),
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

function detectCategory(path: string): 'frontend' | 'backend' | 'other' {
  const lowerPath = path.toLowerCase();
  if (lowerPath.startsWith('frontend') || lowerPath.startsWith('client') || lowerPath.startsWith('src')) {
    return 'frontend';
  }
  if (lowerPath.startsWith('backend') || lowerPath.startsWith('server') || lowerPath.startsWith('api')) {
    return 'backend';
  }
  return 'other';
}

function validateProjectStructure(files: ExtractedFile[]): ProjectValidation {
  const paths = files.map(f => f.path.toLowerCase());
  const errors: string[] = [];
  
  // Check for frontend structure
  const hasFrontendFolder = paths.some(p => 
    p.includes('/frontend/') || p.includes('/client/') || p.startsWith('frontend/') || p.startsWith('client/')
  );
  const hasFrontendPackageJson = paths.some(p => 
    p.includes('frontend/package.json') || p.includes('client/package.json')
  );
  const hasFrontendSrc = paths.some(p => 
    p.includes('frontend/src/') || p.includes('client/src/')
  );
  const hasReactFiles = paths.some(p => p.endsWith('.jsx') || p.endsWith('.tsx'));
  
  // Check for backend structure
  const hasBackendFolder = paths.some(p => 
    p.includes('/backend/') || p.includes('/server/') || p.includes('/api/') ||
    p.startsWith('backend/') || p.startsWith('server/') || p.startsWith('api/')
  );
  const hasBackendPackageJson = paths.some(p => 
    p.includes('backend/package.json') || p.includes('server/package.json') || p.includes('api/package.json')
  );
  const hasServerFile = paths.some(p => 
    p.includes('server.js') || p.includes('server.ts') || p.includes('index.js') || p.includes('app.js')
  );

  // Flexible validation - accept various project structures
  const hasFrontend = hasFrontendFolder || hasReactFiles || hasFrontendSrc;
  const hasBackend = hasBackendFolder || hasServerFile;

  if (!hasFrontend && !hasBackend) {
    errors.push('No recognizable frontend or backend structure found');
  }
  
  if (!hasFrontend) {
    errors.push('Frontend folder (frontend/ or client/) not detected');
  }
  
  if (!hasBackend) {
    errors.push('Backend folder (backend/ or server/) not detected');
  }

  // Allow projects with at least one valid structure
  const isValid = hasFrontend || hasBackend;

  return {
    isValid,
    hasFrontend,
    hasBackend,
    errors,
  };
}

export function countFilesAndFolders(tree: FileNode[]): { 
  files: number; 
  folders: number;
  frontendFiles: number;
  backendFiles: number;
} {
  let files = 0;
  let folders = 0;
  let frontendFiles = 0;
  let backendFiles = 0;

  const count = (nodes: FileNode[], parentCategory?: 'frontend' | 'backend' | 'other') => {
    for (const node of nodes) {
      const category = node.category || parentCategory;
      if (node.type === 'folder') {
        folders++;
        if (node.children) {
          count(node.children, category);
        }
      } else {
        files++;
        if (category === 'frontend') frontendFiles++;
        if (category === 'backend') backendFiles++;
      }
    }
  };

  count(tree);
  return { files, folders, frontendFiles, backendFiles };
}
