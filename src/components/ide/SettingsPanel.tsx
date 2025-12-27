import { Sun, Moon, PanelBottom, PanelRight, RotateCcw, Monitor } from 'lucide-react';

interface SettingsPanelProps {
  showLogs: boolean;
  showAnalysis: boolean;
  onToggleLogs: () => void;
  onToggleAnalysis: () => void;
  onResetLayout: () => void;
}

export function SettingsPanel({
  showLogs,
  showAnalysis,
  onToggleLogs,
  onToggleAnalysis,
  onResetLayout,
}: SettingsPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
      <div className="space-y-4">
        {/* Theme Section */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Appearance
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 text-left">
              <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center">
                <Sun className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Light Theme</p>
                <p className="text-[10px] text-muted-foreground">Currently active</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 text-left transition-colors">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Moon className="w-4 h-4 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Dark Theme</p>
                <p className="text-[10px] text-muted-foreground">Not available in demo</p>
              </div>
            </button>
          </div>
        </div>

        {/* Layout Section */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Layout
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <PanelBottom className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Logs Panel</span>
              </div>
              <button
                onClick={onToggleLogs}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  showLogs ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    showLogs ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <PanelRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Analysis Panel</span>
              </div>
              <button
                onClick={onToggleAnalysis}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  showAnalysis ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    showAnalysis ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Actions
          </h3>
          <button
            onClick={onResetLayout}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Reset Layout</span>
          </button>
        </div>
      </div>

      <div className="mt-6 p-3 bg-secondary/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Monitor className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">System Info</span>
        </div>
        <div className="space-y-1 text-[10px] text-muted-foreground">
          <p>Mode: Academic Prototype</p>
          <p>Version: 1.0.0 (Demo)</p>
          <p>Settings are UI-only simulation</p>
        </div>
      </div>
    </div>
  );
}
