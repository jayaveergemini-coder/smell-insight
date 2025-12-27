import { useRef, useEffect, useState, useCallback } from 'react';

interface EditorMinimapProps {
  content: string;
  containerRef: React.RefObject<HTMLDivElement>;
  currentLine: number;
  totalLines: number;
}

interface HoverPreview {
  visible: boolean;
  lines: string[];
  startLine: number;
  top: number;
}

export function EditorMinimap({ content, containerRef, currentLine, totalLines }: EditorMinimapProps) {
  const minimapRef = useRef<HTMLDivElement>(null);
  const [viewportTop, setViewportTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPreview, setHoverPreview] = useState<HoverPreview>({ visible: false, lines: [], startLine: 0, top: 0 });

  const lines = content.split('\n');
  const lineHeight = 4; // Height of each line in minimap (px)
  const minimapHeight = lines.length * lineHeight;

  // Update viewport indicator based on scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !minimapRef.current) return;

    const updateViewport = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const minimapContainer = minimapRef.current;
      
      if (!minimapContainer) return;
      
      const minimapContainerHeight = minimapContainer.clientHeight;
      const scale = minimapContainerHeight / scrollHeight;
      
      setViewportTop(scrollTop * scale);
      setViewportHeight(Math.max(clientHeight * scale, 20));
    };

    updateViewport();
    container.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);

    return () => {
      container.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, [containerRef, content]);

  const handleMinimapClick = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    const minimap = minimapRef.current;
    if (!container || !minimap) return;

    const rect = minimap.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const minimapContainerHeight = minimap.clientHeight;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    const scrollRatio = clickY / minimapContainerHeight;
    const targetScroll = scrollRatio * scrollHeight - clientHeight / 2;
    
    container.scrollTo({
      top: Math.max(0, Math.min(targetScroll, scrollHeight - clientHeight)),
      behavior: 'smooth'
    });
  }, [containerRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    handleMinimapClick(e);
  }, [handleMinimapClick]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      handleMinimapClick(e);
      return;
    }

    // Handle hover preview
    const minimap = minimapRef.current;
    if (!minimap) return;

    const rect = minimap.getBoundingClientRect();
    const hoverY = e.clientY - rect.top;
    const hoveredLine = Math.floor((hoverY - 4) / lineHeight);
    
    if (hoveredLine >= 0 && hoveredLine < lines.length) {
      const previewLinesCount = 7;
      const startLine = Math.max(0, hoveredLine - Math.floor(previewLinesCount / 2));
      const endLine = Math.min(lines.length, startLine + previewLinesCount);
      const previewLines = lines.slice(startLine, endLine);
      
      setHoverPreview({
        visible: true,
        lines: previewLines,
        startLine: startLine + 1,
        top: Math.min(Math.max(hoverY - 60, 0), rect.height - 150),
      });
    }
  }, [isDragging, handleMinimapClick, lines, lineHeight]);

  const handleMouseLeave = useCallback(() => {
    setHoverPreview({ visible: false, lines: [], startLine: 0, top: 0 });
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

  // Generate color for each line based on content
  const getLineColor = (line: string): string => {
    const trimmed = line.trim();
    if (!trimmed) return 'transparent';
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return 'hsl(var(--success) / 0.4)';
    }
    if (trimmed.startsWith('import') || trimmed.startsWith('export') || trimmed.startsWith('from')) {
      return 'hsl(var(--primary) / 0.5)';
    }
    if (trimmed.includes('function') || trimmed.includes('=>') || trimmed.includes('const') || trimmed.includes('let')) {
      return 'hsl(var(--accent-foreground) / 0.4)';
    }
    if (trimmed.startsWith('<') || trimmed.includes('/>')) {
      return 'hsl(var(--warning) / 0.4)';
    }
    return 'hsl(var(--foreground) / 0.3)';
  };

  return (
    <div
      ref={minimapRef}
      className="w-[100px] bg-secondary/40 border-l border-border relative cursor-pointer select-none shrink-0 overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Hover Preview Tooltip */}
      {hoverPreview.visible && (
        <div
          className="absolute right-full mr-2 bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden pointer-events-none"
          style={{ top: hoverPreview.top, width: '300px' }}
        >
          <div className="bg-secondary/50 px-2 py-1 border-b border-border">
            <span className="text-xs text-muted-foreground font-mono">
              Lines {hoverPreview.startLine}-{hoverPreview.startLine + hoverPreview.lines.length - 1}
            </span>
          </div>
          <div className="p-2 font-mono text-xs leading-5 overflow-hidden">
            {hoverPreview.lines.map((line, idx) => (
              <div key={idx} className="flex">
                <span className="text-muted-foreground w-8 shrink-0 text-right pr-2">
                  {hoverPreview.startLine + idx}
                </span>
                <span className="text-foreground truncate">
                  {line || ' '}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Viewport indicator */}
      <div
        className="absolute left-0 right-0 bg-primary/30 border-y border-primary/50 pointer-events-none transition-all duration-75 z-10"
        style={{
          top: viewportTop,
          height: viewportHeight,
        }}
      />
      
      {/* Minimap content */}
      <div className="p-1" style={{ minHeight: minimapHeight }}>
        {lines.map((line, idx) => (
          <div
            key={idx}
            className="h-[4px] flex items-center"
          >
            <div
              className="h-[3px] rounded-sm ml-1"
              style={{
                width: `${Math.max(Math.min(line.length * 1, 90), line.trim() ? 4 : 0)}px`,
                backgroundColor: getLineColor(line),
              }}
            />
          </div>
        ))}
      </div>

      {/* Current line indicator */}
      <div
        className="absolute left-0 right-0 h-[4px] bg-primary pointer-events-none z-20"
        style={{
          top: (currentLine - 1) * lineHeight + 4,
        }}
      />
    </div>
  );
}
