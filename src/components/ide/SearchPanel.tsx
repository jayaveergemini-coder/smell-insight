import { useState } from 'react';
import { Search as SearchIcon, Filter, FileCode, ChevronRight } from 'lucide-react';

interface SearchResult {
  file: string;
  line: number;
  preview: string;
  category: 'frontend' | 'backend';
}

interface SearchPanelProps {
  onResultClick: (file: string) => void;
}

const mockResults: SearchResult[] = [
  { file: 'frontend/src/App.jsx', line: 24, preview: 'const handleSubmit = async () => {', category: 'frontend' },
  { file: 'frontend/src/components/UserCard.jsx', line: 15, preview: 'function UserCard({ user }) {', category: 'frontend' },
  { file: 'backend/controllers/userController.js', line: 42, preview: 'async function createUser(req, res) {', category: 'backend' },
  { file: 'backend/routes/api.js', line: 8, preview: 'router.post("/users", validateUser,', category: 'backend' },
];

export function SearchPanel({ onResultClick }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [frontendOnly, setFrontendOnly] = useState(false);
  const [backendOnly, setBackendOnly] = useState(false);

  const filteredResults = mockResults.filter((result) => {
    if (frontendOnly && result.category !== 'frontend') return false;
    if (backendOnly && result.category !== 'backend') return false;
    if (query && !result.file.toLowerCase().includes(query.toLowerCase()) && 
        !result.preview.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in project..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div className="flex items-center gap-4 mt-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={frontendOnly}
              onChange={(e) => {
                setFrontendOnly(e.target.checked);
                if (e.target.checked) setBackendOnly(false);
              }}
              className="w-3.5 h-3.5 rounded border-border"
            />
            Frontend only
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={backendOnly}
              onChange={(e) => {
                setBackendOnly(e.target.checked);
                if (e.target.checked) setFrontendOnly(false);
              }}
              className="w-3.5 h-3.5 rounded border-border"
            />
            Backend only
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredResults.length > 0 ? (
          <div className="py-1">
            {filteredResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => onResultClick(result.file)}
                className="w-full px-3 py-2 text-left hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs">
                  <FileCode className={`w-3.5 h-3.5 ${result.category === 'frontend' ? 'text-primary' : 'text-success'}`} />
                  <span className="font-medium text-foreground truncate">{result.file}</span>
                  <span className="text-muted-foreground">:{result.line}</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono mt-1 truncate pl-5">
                  {result.preview}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground">
              {query ? 'No results found' : 'Enter a search query'}
            </p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Search is simulated for demonstration
        </p>
      </div>
    </div>
  );
}
