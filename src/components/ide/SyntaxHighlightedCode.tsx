import { useMemo } from 'react';
import { tokenizeLine, getFileExtension } from '@/lib/syntaxHighlighter';

interface SyntaxHighlightedCodeProps {
  content: string;
  filename: string;
}

const tokenColorMap: Record<string, string> = {
  keyword: 'text-syntax-keyword font-semibold',
  string: 'text-syntax-string',
  number: 'text-syntax-number',
  comment: 'text-syntax-comment italic',
  function: 'text-syntax-function',
  operator: 'text-syntax-operator',
  bracket: 'text-syntax-bracket',
  property: 'text-syntax-property',
  type: 'text-syntax-type',
  tag: 'text-syntax-tag font-semibold',
  attr: 'text-syntax-property',
  default: 'text-foreground',
};

export function SyntaxHighlightedCode({ content, filename }: SyntaxHighlightedCodeProps) {
  const fileExt = useMemo(() => getFileExtension(filename), [filename]);
  
  const highlightedLines = useMemo(() => {
    const lines = content.split('\n');
    return lines.map((line, lineIdx) => {
      if (!line) return <span key={lineIdx}>{'\n'}</span>;
      
      const tokens = tokenizeLine(line, fileExt);
      return (
        <span key={lineIdx}>
          {tokens.map((token, tokenIdx) => (
            <span key={tokenIdx} className={tokenColorMap[token.type] || tokenColorMap.default}>
              {token.value}
            </span>
          ))}
          {'\n'}
        </span>
      );
    });
  }, [content, fileExt]);

  return (
    <pre className="font-mono text-sm leading-6 whitespace-pre">
      {highlightedLines}
    </pre>
  );
}
