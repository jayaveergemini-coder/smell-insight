import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
}

export function HelpDialog({ open, onOpenChange, title, content }: HelpDialogProps) {
  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    lines.forEach((line, idx) => {
      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-2xl font-bold text-foreground mb-4 mt-6 first:mt-0">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-xl font-semibold text-foreground mb-3 mt-5">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-lg font-medium text-foreground mb-2 mt-4">
            {line.slice(4)}
          </h3>
        );
      }
      // Table detection
      else if (line.startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        if (!line.includes('---')) {
          const cells = line.split('|').filter(c => c.trim());
          tableRows.push(cells.map(c => c.trim()));
        }
      }
      // End of table
      else if (inTable && !line.startsWith('|')) {
        inTable = false;
        elements.push(
          <div key={`table-${idx}`} className="my-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary">
                  {tableRows[0]?.map((cell, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium text-foreground">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-t border-border">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-2 text-muted-foreground">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      // List items
      else if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)$/);
        if (match) {
          elements.push(
            <div key={idx} className="flex gap-2 mb-2 ml-4">
              <span className="text-primary">•</span>
              <span>
                <strong className="text-foreground">{match[1]}</strong>
                {match[2] && <span className="text-muted-foreground"> - {match[2]}</span>}
              </span>
            </div>
          );
        }
      } else if (line.startsWith('- ')) {
        elements.push(
          <div key={idx} className="flex gap-2 mb-1.5 ml-4">
            <span className="text-primary">•</span>
            <span className="text-muted-foreground">{line.slice(2)}</span>
          </div>
        );
      }
      // Numbered list
      else if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.+)$/);
        if (match) {
          elements.push(
            <div key={idx} className="flex gap-2 mb-1.5 ml-4">
              <span className="text-primary font-medium w-5">{match[1]}.</span>
              <span className="text-muted-foreground">{match[2]}</span>
            </div>
          );
        }
      }
      // Regular paragraph
      else if (line.trim()) {
        elements.push(
          <p key={idx} className="text-muted-foreground mb-3 leading-relaxed">
            {line}
          </p>
        );
      }
    });

    // Handle table at end of content
    if (inTable && tableRows.length > 0) {
      elements.push(
        <div key="final-table" className="my-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                {tableRows[0]?.map((cell, i) => (
                  <th key={i} className="px-3 py-2 text-left font-medium text-foreground">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, rowIdx) => (
                <tr key={rowIdx} className="border-t border-border">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-3 py-2 text-muted-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border bg-secondary/30">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="px-6 py-4">
            {renderContent(content)}
          </div>
        </ScrollArea>
        <div className="px-6 py-3 border-t border-border bg-secondary/20">
          <p className="text-xs text-muted-foreground text-center">
            Final Year Project — Smell Aware Bug Classification Using Machine Learning
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
