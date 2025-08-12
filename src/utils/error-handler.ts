// Error Handler - utility for better error messages and recovery

export interface ParseErrorInfo {
  message: string;
  line: number;
  column: number;
  code: string;
  severity: 'error' | 'warning' | 'info';
  suggestions?: string[];
  context?: string;
}

export class ErrorHandler {
  /**
   * Create a descriptive error message for parsing failures
   */
  static createDescriptiveErrorMessage(error: any, sourceCode?: string, position?: number): string {
    let message = 'Parse error occurred';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    
    // Add context if available
    if (sourceCode && position !== undefined) {
      const lines = sourceCode.split('\n');
      const line = this.getLineFromPosition(sourceCode, position);
      const column = this.getColumnFromPosition(sourceCode, position);
      
      if (line > 0 && line <= lines.length) {
        const contextLine = lines[line - 1];
        const pointer = ' '.repeat(Math.max(0, column - 1)) + '^';
        
        message += `\n  at line ${line}, column ${column}:\n  ${contextLine}\n  ${pointer}`;
      }
    }
    
    return message;
  }

  /**
   * Get line number from character position
   */
  static getLineFromPosition(source: string, position: number): number {
    const beforePosition = source.substring(0, position);
    return beforePosition.split('\n').length;
  }

  /**
   * Get column number from character position
   */
  static getColumnFromPosition(source: string, position: number): number {
    const beforePosition = source.substring(0, position);
    const lines = beforePosition.split('\n');
    return lines[lines.length - 1].length + 1;
  }

  /**
   * Suggest fixes for common parsing errors
   */
  static suggestFixes(errorMessage: string, context?: string): string[] {
    const suggestions: string[] = [];
    
    if (errorMessage.includes('Expected ")"')) {
      suggestions.push('Check for missing closing parenthesis');
      suggestions.push('Verify that all opening parentheses have matching closing ones');
    }
    
    if (errorMessage.includes('Expected "}"')) {
      suggestions.push('Check for missing closing brace');
      suggestions.push('Verify that all opening braces have matching closing ones');
    }
    
    if (errorMessage.includes('Expected ";"')) {
      suggestions.push('Add semicolon at the end of the statement');
      suggestions.push('Check if the previous statement is properly terminated');
    }
    
    if (errorMessage.includes('Unexpected token')) {
      suggestions.push('Check for typos in keywords or identifiers');
      suggestions.push('Verify that all strings are properly quoted');
      suggestions.push('Check for missing operators or separators');
    }
    
    if (errorMessage.includes('for loop') || errorMessage.includes('for statement')) {
      suggestions.push('Verify for loop syntax: for (init; condition; increment)');
      suggestions.push('Check that all three parts of the for loop are present');
      suggestions.push('Ensure condition uses comparison operators (<, <=, >, >=)');
    }
    
    if (errorMessage.includes('array') || errorMessage.includes('Array')) {
      suggestions.push('Check array declaration syntax');
      suggestions.push('Verify array indexing uses square brackets []');
      suggestions.push('For multi-dimensional arrays, ensure proper nesting');
    }
    
    if (errorMessage.includes('class') || errorMessage.includes('Class')) {
      suggestions.push('Check class declaration syntax');
      suggestions.push('Verify method declarations within the class');
      suggestions.push('Ensure proper visibility modifiers (public, private)');
    }
    
    if (errorMessage.includes('method') || errorMessage.includes('function')) {
      suggestions.push('Check method signature syntax');
      suggestions.push('Verify parameter list is properly formatted');
      suggestions.push('Ensure return type is specified if needed');
    }
    
    return suggestions;
  }

  /**
   * Create a recovery strategy for parsing errors
   */
  static createRecoveryStrategy(errorType: string, context?: string): {
    skipToNext: string[];
    insertMissing?: string;
    replaceWith?: string;
  } {
    switch (errorType) {
      case 'MISSING_SEMICOLON':
        return {
          skipToNext: ['\n', '}'],
          insertMissing: ';'
        };
        
      case 'MISSING_CLOSING_PAREN':
        return {
          skipToNext: ['\n', ';', '}'],
          insertMissing: ')'
        };
        
      case 'MISSING_CLOSING_BRACE':
        return {
          skipToNext: ['\n'],
          insertMissing: '}'
        };
        
      case 'INVALID_FOR_LOOP':
        return {
          skipToNext: ['{', '\n'],
          replaceWith: 'for (int i = 0; i < 10; i++)'
        };
        
      case 'INVALID_ARRAY_ACCESS':
        return {
          skipToNext: [';', '\n', '}'],
          replaceWith: 'array[0]'
        };
        
      default:
        return {
          skipToNext: [';', '\n', '}']
        };
    }
  }

  /**
   * Validate complex nested structures
   */
  static validateNestedStructure(source: string): {
    isValid: boolean;
    errors: ParseErrorInfo[];
    warnings: ParseErrorInfo[];
  } {
    const errors: ParseErrorInfo[] = [];
    const warnings: ParseErrorInfo[] = [];
    
    // Check for balanced parentheses, braces, and brackets
    const balanceResult = this.checkBalancedDelimiters(source);
    errors.push(...balanceResult.errors);
    warnings.push(...balanceResult.warnings);
    
    // Check for deeply nested structures
    const nestingResult = this.checkNestingDepth(source);
    warnings.push(...nestingResult.warnings);
    
    // Check for complex array access patterns
    const arrayResult = this.checkComplexArrayAccess(source);
    warnings.push(...arrayResult.warnings);
    
    // Check for multi-dimensional array declarations
    const multiDimArrayResult = this.checkMultiDimensionalArrays(source);
    warnings.push(...multiDimArrayResult.warnings);
    
    // Check for complex control flow structures
    const controlFlowResult = this.checkComplexControlFlow(source);
    warnings.push(...controlFlowResult.warnings);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check for balanced delimiters
   */
  private static checkBalancedDelimiters(source: string): {
    errors: ParseErrorInfo[];
    warnings: ParseErrorInfo[];
  } {
    const errors: ParseErrorInfo[] = [];
    const warnings: ParseErrorInfo[] = [];
    
    const stacks = {
      parentheses: [] as number[],
      braces: [] as number[],
      brackets: [] as number[]
    };
    
    let inString = false;
    let inComment = false;
    let stringChar = '';
    
    for (let i = 0; i < source.length; i++) {
      const char = source[i];
      const nextChar = i + 1 < source.length ? source[i + 1] : '';
      
      // Handle string literals
      if (!inComment && (char === '"' || char === "'")) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar && source[i - 1] !== '\\') {
          inString = false;
          stringChar = '';
        }
        continue;
      }
      
      // Handle comments
      if (!inString) {
        if (char === '/' && nextChar === '/') {
          inComment = true;
          continue;
        } else if (char === '\n') {
          inComment = false;
          continue;
        }
      }
      
      // Skip if in string or comment
      if (inString || inComment) {
        continue;
      }
      
      // Check delimiters
      switch (char) {
        case '(':
          stacks.parentheses.push(i);
          break;
        case ')':
          if (stacks.parentheses.length === 0) {
            errors.push({
              message: 'Unmatched closing parenthesis',
              line: this.getLineFromPosition(source, i),
              column: this.getColumnFromPosition(source, i),
              code: 'UNMATCHED_CLOSING_PAREN',
              severity: 'error'
            });
          } else {
            stacks.parentheses.pop();
          }
          break;
        case '{':
          stacks.braces.push(i);
          break;
        case '}':
          if (stacks.braces.length === 0) {
            errors.push({
              message: 'Unmatched closing brace',
              line: this.getLineFromPosition(source, i),
              column: this.getColumnFromPosition(source, i),
              code: 'UNMATCHED_CLOSING_BRACE',
              severity: 'error'
            });
          } else {
            stacks.braces.pop();
          }
          break;
        case '[':
          stacks.brackets.push(i);
          break;
        case ']':
          if (stacks.brackets.length === 0) {
            errors.push({
              message: 'Unmatched closing bracket',
              line: this.getLineFromPosition(source, i),
              column: this.getColumnFromPosition(source, i),
              code: 'UNMATCHED_CLOSING_BRACKET',
              severity: 'error'
            });
          } else {
            stacks.brackets.pop();
          }
          break;
      }
    }
    
    // Check for unclosed delimiters
    for (const pos of stacks.parentheses) {
      errors.push({
        message: 'Unclosed opening parenthesis',
        line: this.getLineFromPosition(source, pos),
        column: this.getColumnFromPosition(source, pos),
        code: 'UNCLOSED_OPENING_PAREN',
        severity: 'error'
      });
    }
    
    for (const pos of stacks.braces) {
      errors.push({
        message: 'Unclosed opening brace',
        line: this.getLineFromPosition(source, pos),
        column: this.getColumnFromPosition(source, pos),
        code: 'UNCLOSED_OPENING_BRACE',
        severity: 'error'
      });
    }
    
    for (const pos of stacks.brackets) {
      errors.push({
        message: 'Unclosed opening bracket',
        line: this.getLineFromPosition(source, pos),
        column: this.getColumnFromPosition(source, pos),
        code: 'UNCLOSED_OPENING_BRACKET',
        severity: 'error'
      });
    }
    
    return { errors, warnings };
  }

  /**
   * Check nesting depth
   */
  private static checkNestingDepth(source: string): {
    warnings: ParseErrorInfo[];
  } {
    const warnings: ParseErrorInfo[] = [];
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (let i = 0; i < source.length; i++) {
      const char = source[i];
      
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth--;
      }
    }
    
    if (maxDepth > 5) {
      warnings.push({
        message: `Deep nesting detected (${maxDepth} levels). Consider refactoring for better readability.`,
        line: 1,
        column: 1,
        code: 'DEEP_NESTING',
        severity: 'warning'
      });
    }
    
    return { warnings };
  }

  /**
   * Check for complex array access patterns
   */
  private static checkComplexArrayAccess(source: string): {
    warnings: ParseErrorInfo[];
  } {
    const warnings: ParseErrorInfo[] = [];
    
    // Check for multi-dimensional array access
    const multiDimPattern = /\w+\[.*?\]\[.*?\]\[.*?\]/g;
    const multiDimMatches = Array.from(source.matchAll(multiDimPattern));
    
    if (multiDimMatches.length > 0) {
      warnings.push({
        message: 'Multi-dimensional array access detected. Verify IGCSE conversion is correct.',
        line: 1,
        column: 1,
        code: 'MULTI_DIM_ARRAY',
        severity: 'warning'
      });
    }
    
    // Check for complex array indexing expressions
    const complexIndexPattern = /\w+\[[^\]]*[+\-*/][^\]]*\]/g;
    const complexIndexMatches = Array.from(source.matchAll(complexIndexPattern));
    
    if (complexIndexMatches.length > 0) {
      warnings.push({
        message: 'Complex array indexing expressions detected. Manual review recommended.',
        line: 1,
        column: 1,
        code: 'COMPLEX_ARRAY_INDEX',
        severity: 'warning'
      });
    }
    
    return { warnings };
  }

  /**
   * Check for multi-dimensional array declarations
   */
  private static checkMultiDimensionalArrays(source: string): {
    warnings: ParseErrorInfo[];
  } {
    const warnings: ParseErrorInfo[] = [];
    
    // Check for Java multi-dimensional array declarations
    const javaMultiDimPattern = /\w+\s*\[\s*\]\s*\[\s*\]\s*\[\s*\]/g;
    const javaMatches = Array.from(source.matchAll(javaMultiDimPattern));
    
    if (javaMatches.length > 0) {
      warnings.push({
        message: 'Multi-dimensional array declarations detected. Ensure proper IGCSE ARRAY[1:SIZE, 1:SIZE, 1:SIZE] syntax.',
        line: 1,
        column: 1,
        code: 'MULTI_DIM_ARRAY_DECL',
        severity: 'warning'
      });
    }
    
    // Check for TypeScript multi-dimensional array types
    const tsMultiDimPattern = /\w+\[\]\[\]\[\]/g;
    const tsMatches = Array.from(source.matchAll(tsMultiDimPattern));
    
    if (tsMatches.length > 0) {
      warnings.push({
        message: 'TypeScript multi-dimensional array types detected. Ensure proper IGCSE conversion.',
        line: 1,
        column: 1,
        code: 'TS_MULTI_DIM_ARRAY',
        severity: 'warning'
      });
    }
    
    return { warnings };
  }

  /**
   * Check for complex control flow structures
   */
  private static checkComplexControlFlow(source: string): {
    warnings: ParseErrorInfo[];
  } {
    const warnings: ParseErrorInfo[] = [];
    
    // Check for deeply nested for loops
    const nestedForPattern = /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)/g;
    const nestedForMatches = Array.from(source.matchAll(nestedForPattern));
    
    if (nestedForMatches.length > 0) {
      warnings.push({
        message: 'Triple-nested for loops detected. Ensure proper IGCSE FOR/NEXT structure.',
        line: 1,
        column: 1,
        code: 'TRIPLE_NESTED_FOR',
        severity: 'warning'
      });
    }
    
    // Check for complex switch statements
    const complexSwitchPattern = /switch\s*\([^)]*\)\s*\{[^}]*case[^:]*:[^}]*case[^:]*:[^}]*default\s*:/g;
    const switchMatches = Array.from(source.matchAll(complexSwitchPattern));
    
    if (switchMatches.length > 0) {
      warnings.push({
        message: 'Complex switch statements detected. Ensure proper IGCSE CASE/OF/OTHERWISE/ENDCASE structure.',
        line: 1,
        column: 1,
        code: 'COMPLEX_SWITCH',
        severity: 'warning'
      });
    }
    
    // Check for async/await patterns
    const asyncPattern = /async\s+function|async\s*\(|await\s+/g;
    const asyncMatches = Array.from(source.matchAll(asyncPattern));
    
    if (asyncMatches.length > 0) {
      warnings.push({
        message: 'Async/await patterns detected. These will be converted to comments with procedure calls.',
        line: 1,
        column: 1,
        code: 'ASYNC_AWAIT',
        severity: 'warning'
      });
    }
    
    return { warnings };
  }
}