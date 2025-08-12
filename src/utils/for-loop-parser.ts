// For Loop Parser - utility to parse and convert for loop conditions

export interface ForLoopComponents {
  variable: string;
  startValue: string;
  endValue: string;
  stepValue?: string;
  isDecrement: boolean;
  warnings: string[];
}

export class ForLoopParser {
  /**
   * Parse a for loop condition and extract the end value
   * Examples:
   * - "i < 10" -> "9"
   * - "i <= 15" -> "15"
   * - "i > 0" -> "1" (for decrement loops)
   * - "i >= 1" -> "1" (for decrement loops)
   * - "i < array.length" -> "LENGTH(array)"
   * - "i < n" -> "n-1"
   */
  static parseEndCondition(condition: string, variable: string): {
    endValue: string;
    isDecrement: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let endValue = condition;
    let isDecrement = false;

    // Remove whitespace
    const cleanCondition = condition.trim();

    // Handle less than or equal conditions (increment loops) - CHECK THIS FIRST
    const lessThanEqualMatch = cleanCondition.match(new RegExp(`${variable}\\s*<=\\s*(.+)`));
    if (lessThanEqualMatch) {
      const rightSide = lessThanEqualMatch[1].trim();
      
      // Handle numeric values
      if (/^\d+$/.test(rightSide)) {
        endValue = rightSide;
        warnings.push(`Condition '${condition}' converted to 'TO ${endValue}' (inclusive upper bound)`);
      }
      // Handle array.length - 1
      else if (rightSide.includes('.length')) {
        const arrayName = rightSide.replace('.length', '');
        endValue = `LENGTH(${arrayName})`;
        warnings.push(`Condition '${condition}' converted to 'TO LENGTH(${arrayName})'`);
      }
      // Handle variable references
      else if (/^\w+$/.test(rightSide)) {
        endValue = rightSide;
        warnings.push(`Condition '${condition}' converted to 'TO ${rightSide}' (inclusive upper bound)`);
      }
      // Handle complex expressions
      else {
        endValue = rightSide;
        warnings.push(`Complex condition '${condition}' may need manual review`);
      }
      
      return { endValue, isDecrement, warnings };
    }

    // Handle less than conditions (increment loops) - CHECK THIS AFTER <=
    const lessThanMatch = cleanCondition.match(new RegExp(`${variable}\\s*<\\s*(.+)`));
    if (lessThanMatch) {
      const rightSide = lessThanMatch[1].trim();
      
      // Handle numeric values
      if (/^\d+$/.test(rightSide)) {
        const numValue = parseInt(rightSide);
        endValue = (numValue - 1).toString();
        warnings.push(`Condition '${condition}' converted to 'TO ${endValue}' (exclusive upper bound)`);
      }
      // Handle array.length
      else if (rightSide.includes('.length')) {
        const arrayName = rightSide.replace('.length', '');
        endValue = `LENGTH(${arrayName})`;
        warnings.push(`Condition '${condition}' converted to 'TO LENGTH(${arrayName})'`);
      }
      // Handle variable references
      else if (/^\w+$/.test(rightSide)) {
        endValue = `${rightSide}-1`;
        warnings.push(`Condition '${condition}' converted to 'TO ${rightSide}-1' (exclusive upper bound)`);
      }
      // Handle complex expressions
      else {
        endValue = rightSide;
        warnings.push(`Complex condition '${condition}' may need manual review`);
      }
      
      return { endValue, isDecrement, warnings };
    }

    // Handle greater than conditions (decrement loops)
    const greaterThanMatch = cleanCondition.match(new RegExp(`${variable}\\s*>\\s*(.+)`));
    if (greaterThanMatch) {
      isDecrement = true;
      const rightSide = greaterThanMatch[1].trim();
      
      // Handle numeric values
      if (/^\d+$/.test(rightSide)) {
        const numValue = parseInt(rightSide);
        endValue = (numValue + 1).toString();
        warnings.push(`Decrement condition '${condition}' converted to 'TO ${endValue}' (exclusive lower bound)`);
      }
      // Handle variable references
      else if (/^\w+$/.test(rightSide)) {
        endValue = `${rightSide}+1`;
        warnings.push(`Decrement condition '${condition}' converted to 'TO ${rightSide}+1' (exclusive lower bound)`);
      }
      // Handle complex expressions
      else {
        endValue = rightSide;
        warnings.push(`Complex decrement condition '${condition}' may need manual review`);
      }
      
      return { endValue, isDecrement, warnings };
    }

    // Handle greater than or equal conditions (decrement loops)
    const greaterThanEqualMatch = cleanCondition.match(new RegExp(`${variable}\\s*>=\\s*(.+)`));
    if (greaterThanEqualMatch) {
      isDecrement = true;
      const rightSide = greaterThanEqualMatch[1].trim();
      
      // Handle numeric values
      if (/^\d+$/.test(rightSide)) {
        endValue = rightSide;
        warnings.push(`Decrement condition '${condition}' converted to 'TO ${endValue}' (inclusive lower bound)`);
      }
      // Handle variable references
      else if (/^\w+$/.test(rightSide)) {
        endValue = rightSide;
        warnings.push(`Decrement condition '${condition}' converted to 'TO ${rightSide}' (inclusive lower bound)`);
      }
      // Handle complex expressions
      else {
        endValue = rightSide;
        warnings.push(`Complex decrement condition '${condition}' may need manual review`);
      }
      
      return { endValue, isDecrement, warnings };
    }

    // If no pattern matches, return the original condition with a warning
    warnings.push(`Unable to parse for loop condition '${condition}' - using as-is`);
    return { endValue: condition, isDecrement, warnings };
  }

  /**
   * Parse increment/decrement expression to determine step value
   * Examples:
   * - "i++" -> { step: "1", isDecrement: false }
   * - "i--" -> { step: "1", isDecrement: true }
   * - "i += 2" -> { step: "2", isDecrement: false }
   * - "i -= 3" -> { step: "3", isDecrement: true }
   */
  static parseIncrementExpression(expression: string, variable: string): {
    stepValue: string;
    isDecrement: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let stepValue = "1";
    let isDecrement = false;

    const cleanExpression = expression.trim();

    // Handle increment (i++)
    if (cleanExpression === `${variable}++` || cleanExpression === `++${variable}`) {
      stepValue = "1";
      isDecrement = false;
      return { stepValue, isDecrement, warnings };
    }

    // Handle decrement (i--)
    if (cleanExpression === `${variable}--` || cleanExpression === `--${variable}`) {
      stepValue = "1";
      isDecrement = true;
      return { stepValue, isDecrement, warnings };
    }

    // Handle compound assignment (i += 2, i -= 3)
    const compoundMatch = cleanExpression.match(new RegExp(`${variable}\\s*([+\\-])=\\s*(.+)`));
    if (compoundMatch) {
      const operator = compoundMatch[1];
      const value = compoundMatch[2].trim();
      
      stepValue = value;
      isDecrement = operator === '-';
      
      warnings.push(`Compound assignment '${expression}' converted to step ${stepValue}`);
      return { stepValue, isDecrement, warnings };
    }

    // Handle assignment (i = i + 2, i = i - 3)
    const assignmentMatch = cleanExpression.match(new RegExp(`${variable}\\s*=\\s*${variable}\\s*([+\\-])\\s*(.+)`));
    if (assignmentMatch) {
      const operator = assignmentMatch[1];
      const value = assignmentMatch[2].trim();
      
      stepValue = value;
      isDecrement = operator === '-';
      
      warnings.push(`Assignment expression '${expression}' converted to step ${stepValue}`);
      return { stepValue, isDecrement, warnings };
    }

    // If no pattern matches, assume step 1
    warnings.push(`Unable to parse increment expression '${expression}' - assuming step 1`);
    return { stepValue: "1", isDecrement, warnings };
  }

  /**
   * Parse complete for loop components
   */
  static parseForLoop(
    variable: string,
    startValue: string,
    endCondition: string,
    incrementExpression: string
  ): ForLoopComponents {
    const warnings: string[] = [];

    // Parse end condition
    const endResult = this.parseEndCondition(endCondition, variable);
    warnings.push(...endResult.warnings);

    // Parse increment expression
    const incrementResult = this.parseIncrementExpression(incrementExpression, variable);
    warnings.push(...incrementResult.warnings);

    // Determine if this is a decrement loop (either from condition or increment)
    const isDecrement = endResult.isDecrement || incrementResult.isDecrement;

    // Convert start value for 1-based indexing if needed
    let convertedStartValue = startValue;
    if (startValue === "0" && !isDecrement) {
      convertedStartValue = "1";
      warnings.push(`Start value converted from 0 to 1 for 1-based indexing`);
    }

    return {
      variable,
      startValue: convertedStartValue,
      endValue: endResult.endValue,
      stepValue: incrementResult.stepValue !== "1" ? incrementResult.stepValue : undefined,
      isDecrement,
      warnings
    };
  }
}