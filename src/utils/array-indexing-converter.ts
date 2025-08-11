// Array Indexing Converter - converts 0-based array indexing to 1-based IGCSE indexing

export interface ArrayIndexConversionResult {
  convertedExpression: string;
  hasArrayAccess: boolean;
  warnings: string[];
}

export class ArrayIndexingConverter {
  /**
   * Convert array access expressions from 0-based to 1-based indexing
   * Examples:
   * - array[0] -> array[1]
   * - array[i] -> array[i+1] (when i starts from 0)
   * - array[i-1] -> array[i] (when i starts from 1)
   * - matrix[i][j] -> matrix[i+1][j+1] (when both start from 0)
   */
  static convertArrayAccess(expression: string, context?: ArrayIndexContext): ArrayIndexConversionResult {
    const warnings: string[] = [];
    let convertedExpression = expression;
    let hasArrayAccess = false;

    // Pattern to match array access: identifier[index] including multi-dimensional
    const arrayAccessPattern = /(\w+(?:\[[^\]]+\])+)/g;
    const matches = Array.from(expression.matchAll(arrayAccessPattern));

    if (matches.length === 0) {
      return {
        convertedExpression,
        hasArrayAccess: false,
        warnings
      };
    }

    hasArrayAccess = true;

    // Process each array access match from right to left to avoid position shifts
    const replacements: { start: number; end: number; replacement: string }[] = [];
    
    for (const match of matches) {
      const fullMatch = match[0]; // e.g., "array[i]" or "matrix[i][j]"
      const matchStart = match.index!;
      const matchEnd = matchStart + fullMatch.length;

      // Extract array name and all index expressions
      const arrayNameMatch = fullMatch.match(/^(\w+)/);
      const arrayName = arrayNameMatch ? arrayNameMatch[1] : '';
      
      // Extract all individual index expressions
      const indexPattern = /\[([^\]]+)\]/g;
      const indexMatches = Array.from(fullMatch.matchAll(indexPattern));
      
      let convertedAccess = arrayName;
      for (const indexMatch of indexMatches) {
        const indexExpression = indexMatch[1];
        const convertedIndex = this.convertIndexExpression(indexExpression, context);
        convertedAccess += `[${convertedIndex.expression}]`;
        warnings.push(...convertedIndex.warnings);
      }

      replacements.push({
        start: matchStart,
        end: matchEnd,
        replacement: convertedAccess
      });
    }
    
    // Apply replacements from right to left to avoid position shifts
    replacements.sort((a, b) => b.start - a.start);
    for (const replacement of replacements) {
      convertedExpression = convertedExpression.substring(0, replacement.start) + 
                           replacement.replacement + 
                           convertedExpression.substring(replacement.end);
    }

    return {
      convertedExpression,
      hasArrayAccess,
      warnings
    };
  }

  /**
   * Convert index expressions from 0-based to 1-based
   */
  private static convertIndexExpression(indexExpression: string, context?: ArrayIndexContext): {
    expression: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const trimmedIndex = indexExpression.trim();

    // Handle literal numeric indices
    if (/^\d+$/.test(trimmedIndex)) {
      const numericIndex = parseInt(trimmedIndex);
      const convertedIndex = numericIndex + 1;
      warnings.push(`Array index ${numericIndex} converted to ${convertedIndex} for 1-based indexing`);
      return {
        expression: convertedIndex.toString(),
        warnings
      };
    }

    // Handle simple variable indices (e.g., "i", "j", "k")
    if (/^\w+$/.test(trimmedIndex)) {
      // Check if this variable was converted from 0-based to 1-based (no further conversion needed)
      if (context && this.isConvertedVariable(trimmedIndex, context)) {
        warnings.push(`Variable ${trimmedIndex} already converted to 1-based - no further conversion needed`);
        return {
          expression: trimmedIndex,
          warnings
        };
      }
      
      // Check if this variable is a for loop variable that has been converted
      if (context && context.forLoopVariables && context.forLoopVariables[trimmedIndex]) {
        const loopInfo = context.forLoopVariables[trimmedIndex];
        if (loopInfo.start === 0) {
          // This was a 0-based loop variable, now converted to 1-based
          warnings.push(`For loop variable ${trimmedIndex} already converted to 1-based indexing`);
          return {
            expression: trimmedIndex,
            warnings
          };
        } else if (loopInfo.start === 1) {
          // This was a 1-based loop variable, now converted to 2-based (second element)
          warnings.push(`For loop variable ${trimmedIndex} already adjusted for 1-based array indexing`);
          return {
            expression: trimmedIndex,
            warnings
          };
        }
      }
      
      // Check if this variable is known to start from 0 (needs conversion to 1-based)
      if (context && this.isZeroBasedVariable(trimmedIndex, context)) {
        warnings.push(`Variable ${trimmedIndex} adjusted for 1-based array indexing`);
        return {
          expression: `${trimmedIndex} + 1`,
          warnings
        };
      }
      
      // Check if this variable is known to start from 1 (already 1-based)
      if (context && this.isOneBasedVariable(trimmedIndex, context)) {
        warnings.push(`Variable ${trimmedIndex} already 1-based - no conversion needed`);
        return {
          expression: trimmedIndex,
          warnings
        };
      }
      
      // If we don't know the context, assume it might need conversion
      // This is a conservative approach - we'll add a comment
      warnings.push(`Array index variable ${trimmedIndex} - verify if 1-based conversion needed`);
      return {
        expression: trimmedIndex,
        warnings
      };
    }

    // Handle expressions like "i - 1", "i + 1", etc.
    if (trimmedIndex.includes('+') || trimmedIndex.includes('-')) {
      return this.convertArithmeticIndexExpression(trimmedIndex, context, warnings);
    }

    // Handle method calls like "array.length", "list.size()"
    if (trimmedIndex.includes('.')) {
      return this.convertMethodCallIndexExpression(trimmedIndex, warnings);
    }

    // For complex expressions, return as-is with a warning
    warnings.push(`Complex array index expression '${trimmedIndex}' may need manual review for 1-based indexing`);
    return {
      expression: trimmedIndex,
      warnings
    };
  }

  /**
   * Convert arithmetic index expressions like "i - 1", "i + 1"
   */
  private static convertArithmeticIndexExpression(
    expression: string, 
    context?: ArrayIndexContext, 
    warnings: string[] = []
  ): { expression: string; warnings: string[] } {
    // Handle "i - 1" pattern (common in 0-based to 1-based conversion)
    const minusOnePattern = /^(\w+)\s*-\s*1$/;
    const minusOneMatch = expression.match(minusOnePattern);
    if (minusOneMatch) {
      const variable = minusOneMatch[1];
      if (context && this.isOneBasedVariable(variable, context)) {
        warnings.push(`Expression '${expression}' simplified to '${variable}' for 1-based indexing`);
        return { expression: variable, warnings };
      }
    }

    // Handle "i + 1" pattern
    const plusOnePattern = /^(\w+)\s*\+\s*1$/;
    const plusOneMatch = expression.match(plusOnePattern);
    if (plusOneMatch) {
      const variable = plusOneMatch[1];
      if (context && this.isZeroBasedVariable(variable, context)) {
        warnings.push(`Expression '${expression}' already adjusted for 1-based indexing`);
        return { expression: expression, warnings };
      }
    }

    // For other arithmetic expressions, return as-is with warning
    warnings.push(`Arithmetic index expression '${expression}' may need manual review`);
    return { expression, warnings };
  }

  /**
   * Convert method call index expressions like "array.length"
   */
  private static convertMethodCallIndexExpression(
    expression: string, 
    warnings: string[] = []
  ): { expression: string; warnings: string[] } {
    // Handle .length property access
    if (expression.endsWith('.length')) {
      const arrayName = expression.replace('.length', '');
      warnings.push(`Array length access '${expression}' converted to LENGTH(${arrayName})`);
      return {
        expression: `LENGTH(${arrayName})`,
        warnings
      };
    }

    // Handle .size() method calls
    if (expression.endsWith('.size()')) {
      const arrayName = expression.replace('.size()', '');
      warnings.push(`Array size method '${expression}' converted to LENGTH(${arrayName})`);
      return {
        expression: `LENGTH(${arrayName})`,
        warnings
      };
    }

    // For other method calls, return as-is with warning
    warnings.push(`Method call in array index '${expression}' may need manual conversion`);
    return { expression, warnings };
  }

  /**
   * Check if a variable is known to be zero-based (starts from 0)
   */
  private static isZeroBasedVariable(variable: string, context: ArrayIndexContext): boolean {
    return context.zeroBasedVariables?.includes(variable) || false;
  }

  /**
   * Check if a variable is known to be one-based (starts from 1)
   */
  private static isOneBasedVariable(variable: string, context: ArrayIndexContext): boolean {
    return context.oneBasedVariables?.includes(variable) || false;
  }

  /**
   * Check if a variable was converted from 0-based to 1-based
   */
  private static isConvertedVariable(variable: string, context: ArrayIndexContext): boolean {
    return context.convertedVariables?.includes(variable) || false;
  }

  /**
   * Convert assignment expressions that involve array access
   */
  static convertArrayAssignment(
    variable: string, 
    expression: string, 
    context?: ArrayIndexContext
  ): ArrayIndexConversionResult {
    const warnings: string[] = [];
    
    // Convert the variable (left side) if it's an array access
    const leftSideResult = this.convertArrayAccess(variable, context);
    warnings.push(...leftSideResult.warnings);
    
    // Convert the expression (right side) if it contains array access
    const rightSideResult = this.convertArrayAccess(expression, context);
    warnings.push(...rightSideResult.warnings);
    
    return {
      convertedExpression: `${leftSideResult.convertedExpression} ← ${rightSideResult.convertedExpression}`,
      hasArrayAccess: leftSideResult.hasArrayAccess || rightSideResult.hasArrayAccess,
      warnings
    };
  }

  /**
   * Convert for loop bounds to account for 1-based array indexing
   */
  static convertForLoopBounds(
    variable: string,
    startValue: string,
    endCondition: string,
    arrayContext?: string[]
  ): {
    startValue: string;
    endValue: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let convertedStart = startValue;
    let convertedEnd = endCondition;

    // Convert numeric start values for 1-based indexing when the end condition references array.length
    // This indicates the loop is iterating over an array
    const isArrayLoop = endCondition.includes('.length') || endCondition.includes('LENGTH(');
    
    if (isArrayLoop) {
      const numericStart = parseInt(startValue);
      if (!isNaN(numericStart)) {
        const convertedNumericStart = numericStart + 1;
        convertedStart = convertedNumericStart.toString();
        warnings.push(`For loop start value converted from ${startValue} to ${convertedStart} for 1-based array indexing`);
      }
    }

    // Convert end conditions that reference array.length
    if (endCondition.includes('.length')) {
      const lengthPattern = /(\w+)\.length/g;
      convertedEnd = endCondition.replace(lengthPattern, (match, arrayName) => {
        warnings.push(`Array length '${match}' converted to LENGTH(${arrayName})`);
        return `LENGTH(${arrayName})`;
      });
    }

    // Handle "< value" patterns - convert to proper end value for IGCSE
    if (convertedEnd.includes('<') && !convertedEnd.includes('<=')) {
      // Handle "< LENGTH(array)" patterns
      const lessThanLengthPattern = /(\w+)\s*<\s*LENGTH\((\w+)\)/;
      const lengthMatch = convertedEnd.match(lessThanLengthPattern);
      if (lengthMatch) {
        const loopVar = lengthMatch[1];
        const arrayName = lengthMatch[2];
        convertedEnd = `LENGTH(${arrayName})`;
        warnings.push(`Loop condition '${endCondition}' converted to 'TO LENGTH(${arrayName})' for 1-based indexing`);
      } else {
        // Handle "< number" patterns
        const lessThanNumberPattern = /(\w+)\s*<\s*(\d+)/;
        const numberMatch = convertedEnd.match(lessThanNumberPattern);
        if (numberMatch) {
          const loopVar = numberMatch[1];
          const endNumber = parseInt(numberMatch[2]);
          // For "i < 5", the end value should be 4 (since we're going TO 4, not WHILE < 5)
          convertedEnd = (endNumber - 1).toString();
          warnings.push(`Loop condition '${endCondition}' converted to 'TO ${convertedEnd}' for IGCSE format`);
        }
      }
    }

    return {
      startValue: convertedStart,
      endValue: convertedEnd,
      warnings
    };
  }
}

export interface ArrayIndexContext {
  zeroBasedVariables?: string[]; // Variables known to start from 0
  oneBasedVariables?: string[];  // Variables known to start from 1
  convertedVariables?: string[]; // Variables that were converted from 0-based to 1-based
  arrayNames?: string[];         // Names of arrays in current scope
  forLoopVariables?: { [key: string]: { start: number; end: string } }; // For loop variable contexts
}