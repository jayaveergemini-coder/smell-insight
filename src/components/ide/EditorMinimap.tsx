import { useRef, useEffect, useState, useCallback } from 'react';

interface EditorMinimapProps {
  content: string;
  containerRef: React.RefObject<HTMLDivElement>;
  currentLine: number;
  totalLines: number;
}

export function EditorMinimap({ content, containerRef, currentLine, totalLines }: EditorMinimapProps) {
  const minimapRef = useRef<HTMLDivElement>(null);
  const [viewportTop, setViewportTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const lines = content.split('\n');
  const lineHeight = 3; // Height of each line in minimap (px)
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
    }
  }, [isDragging, handleMinimapClick]);

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
    >
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
          top: (currentLine - 1) * 4 + 4,
        }}
      />
    </div>
  );
}
