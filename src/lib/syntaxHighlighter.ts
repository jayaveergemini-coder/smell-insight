// Simple syntax highlighter for code preview

interface Token {
  type: 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'operator' | 'bracket' | 'property' | 'type' | 'tag' | 'attr' | 'default';
  value: string;
}

const JS_KEYWORDS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue', 'default', 'try', 'catch', 'finally',
  'throw', 'new', 'delete', 'typeof', 'instanceof', 'in', 'of', 'class', 'extends',
  'super', 'this', 'static', 'get', 'set', 'async', 'await', 'yield', 'import',
  'export', 'from', 'as', 'default', 'null', 'undefined', 'true', 'false', 'void',
];

const TS_TYPES = [
  'string', 'number', 'boolean', 'object', 'any', 'void', 'never', 'unknown',
  'Array', 'Promise', 'Record', 'Partial', 'Required', 'Pick', 'Omit', 'Exclude',
  'Extract', 'NonNullable', 'ReturnType', 'Parameters', 'interface', 'type', 'enum',
];

const REACT_KEYWORDS = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext', 'useReducer'];

export function tokenizeLine(line: string, fileExt: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const isJsTs = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'].includes(fileExt);
  const isJson = fileExt === 'json';
  const isCss = ['css', 'scss', 'sass', 'less'].includes(fileExt);
  const isHtml = ['html', 'htm', 'xml', 'svg'].includes(fileExt);

  while (i < line.length) {
    const remaining = line.slice(i);

    // Comments (// or /* or # for some files)
    if (isJsTs && remaining.startsWith('//')) {
      tokens.push({ type: 'comment', value: remaining });
      break;
    }
    if (isJsTs && remaining.startsWith('/*')) {
      const endIdx = remaining.indexOf('*/');
      const commentEnd = endIdx === -1 ? remaining.length : endIdx + 2;
      tokens.push({ type: 'comment', value: remaining.slice(0, commentEnd) });
      i += commentEnd;
      continue;
    }
    if (isCss && remaining.startsWith('/*')) {
      const endIdx = remaining.indexOf('*/');
      const commentEnd = endIdx === -1 ? remaining.length : endIdx + 2;
      tokens.push({ type: 'comment', value: remaining.slice(0, commentEnd) });
      i += commentEnd;
      continue;
    }
    if (isHtml && remaining.startsWith('<!--')) {
      const endIdx = remaining.indexOf('-->');
      const commentEnd = endIdx === -1 ? remaining.length : endIdx + 3;
      tokens.push({ type: 'comment', value: remaining.slice(0, commentEnd) });
      i += commentEnd;
      continue;
    }

    // Strings (single, double, template)
    if (remaining[0] === '"' || remaining[0] === "'" || remaining[0] === '`') {
      const quote = remaining[0];
      let j = 1;
      while (j < remaining.length) {
        if (remaining[j] === quote && remaining[j - 1] !== '\\') {
          j++;
          break;
        }
        j++;
      }
      tokens.push({ type: 'string', value: remaining.slice(0, j) });
      i += j;
      continue;
    }

    // Numbers
    const numberMatch = remaining.match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i);
    if (numberMatch) {
      tokens.push({ type: 'number', value: numberMatch[0] });
      i += numberMatch[0].length;
      continue;
    }

    // JSX/HTML tags
    if ((isJsTs || isHtml) && remaining.startsWith('<')) {
      const tagMatch = remaining.match(/^<\/?([A-Za-z][A-Za-z0-9]*)/);
      if (tagMatch) {
        tokens.push({ type: 'bracket', value: remaining[0] });
        if (remaining[1] === '/') {
          tokens.push({ type: 'bracket', value: '/' });
          tokens.push({ type: 'tag', value: tagMatch[1] });
          i += tagMatch[0].length;
        } else {
          tokens.push({ type: 'tag', value: tagMatch[1] });
          i += tagMatch[0].length;
        }
        continue;
      }
    }

    // Operators
    const opMatch = remaining.match(/^(===|!==|==|!=|<=|>=|=>|&&|\|\||[+\-*/%=<>!&|^~?:])/);
    if (opMatch) {
      tokens.push({ type: 'operator', value: opMatch[0] });
      i += opMatch[0].length;
      continue;
    }

    // Brackets
    if ('{}[]()'.includes(remaining[0])) {
      tokens.push({ type: 'bracket', value: remaining[0] });
      i++;
      continue;
    }

    // Words (keywords, types, functions, identifiers)
    const wordMatch = remaining.match(/^[A-Za-z_$][A-Za-z0-9_$]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      const nextChar = remaining[word.length] || '';
      
      if (JS_KEYWORDS.includes(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (TS_TYPES.includes(word)) {
        tokens.push({ type: 'type', value: word });
      } else if (REACT_KEYWORDS.includes(word)) {
        tokens.push({ type: 'function', value: word });
      } else if (nextChar === '(') {
        tokens.push({ type: 'function', value: word });
      } else if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
        // PascalCase - likely a component or class
        tokens.push({ type: 'type', value: word });
      } else {
        tokens.push({ type: 'property', value: word });
      }
      i += word.length;
      continue;
    }

    // Default: single character
    tokens.push({ type: 'default', value: remaining[0] });
    i++;
  }

  return tokens;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}
