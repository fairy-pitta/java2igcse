// Input validation utilities for java2igcse

import { ValidationError, ErrorCodes } from '../errors';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
  suggestions: string[];
}

export interface ValidationOptions {
  allowEmptyInput?: boolean;
  maxInputSize?: number;
  strictMode?: boolean;
  checkEncoding?: boolean;
}

export class InputValidator {
  private options: ValidationOptions;

  constructor(options: ValidationOptions = {}) {
    this.options = {
      allowEmptyInput: false,
      maxInputSize: 1024 * 1024, // 1MB default
      strictMode: false,
      checkEncoding: true,
      ...options
    };
  }

  validateJavaInput(sourceCode: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Basic input validation
    this.validateBasicInput(sourceCode, result);
    
    if (!result.isValid) {
      return result;
    }

    // Java-specific validation
    this.validateJavaSpecificSyntax(sourceCode, result);
    this.checkJavaCommonIssues(sourceCode, result);
    this.validateJavaStructure(sourceCode, result);

    return result;
  }

  validateTypeScriptInput(sourceCode: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Basic input validation
    this.validateBasicInput(sourceCode, result);
    
    if (!result.isValid) {
      return result;
    }

    // TypeScript-specific validation
    this.validateTypeScriptSpecificSyntax(sourceCode, result);
    this.checkTypeScriptCommonIssues(sourceCode, result);
    this.validateTypeScriptStructure(sourceCode, result);

    return result;
  }

  private validateBasicInput(sourceCode: string, result: ValidationResult): void {
    // Check for null or undefined
    if (sourceCode === null || sourceCode === undefined) {
      result.isValid = false;
      result.errors.push(new ValidationError(
        'NULL_INPUT',
        'Source code cannot be null or undefined',
        { suggestions: ['Provide valid source code string'] }
      ));
      return;
    }

    // Check for empty input
    if (!this.options.allowEmptyInput && sourceCode.trim().length === 0) {
      result.isValid = false;
      result.errors.push(new ValidationError(
        'EMPTY_INPUT',
        'Source code cannot be empty',
        { suggestions: ['Provide non-empty source code'] }
      ));
      return;
    }

    // Check input size
    if (sourceCode.length > this.options.maxInputSize!) {
      result.isValid = false;
      result.errors.push(new ValidationError(
        'INPUT_TOO_LARGE',
        `Source code exceeds maximum size of ${this.options.maxInputSize} characters`,
        { 
          suggestions: [
            'Break down large files into smaller modules',
            'Remove unnecessary comments or whitespace',
            'Increase maxInputSize option if needed'
          ] 
        }
      ));
      return;
    }

    // Check for binary content
    if (this.containsBinaryContent(sourceCode)) {
      result.isValid = false;
      result.errors.push(new ValidationError(
        'BINARY_CONTENT',
        'Source code appears to contain binary content',
        { suggestions: ['Ensure input is plain text source code'] }
      ));
      return;
    }

    // Check encoding issues
    if (this.options.checkEncoding && this.hasEncodingIssues(sourceCode)) {
      result.warnings.push('Source code may have encoding issues - some characters might not display correctly');
      result.suggestions.push('Ensure source code is saved with UTF-8 encoding');
    }

    // Check for extremely long lines
    const lines = sourceCode.split('\n');
    const longLines = lines.filter(line => line.length > 500);
    if (longLines.length > 0) {
      result.warnings.push(`Found ${longLines.length} extremely long lines (>500 characters)`);
      result.suggestions.push('Consider breaking long lines for better readability');
    }

    // Check for mixed line endings
    if (this.hasMixedLineEndings(sourceCode)) {
      result.warnings.push('Mixed line endings detected (\\n and \\r\\n)');
      result.suggestions.push('Normalize line endings to improve parsing consistency');
    }
  }

  private validateJavaSpecificSyntax(sourceCode: string, result: ValidationResult): void {
    // Check for basic Java structure
    if (!sourceCode.includes('class') && !sourceCode.includes('interface') && !sourceCode.includes('enum')) {
      result.warnings.push('No class, interface, or enum declarations found');
      result.suggestions.push('Java code typically contains at least one class declaration');
    }

    // Check for common Java syntax patterns
    const javaKeywords = ['public', 'private', 'protected', 'static', 'final', 'void', 'int', 'String', 'boolean'];
    const foundKeywords = javaKeywords.filter(keyword => sourceCode.includes(keyword));
    
    if (foundKeywords.length === 0) {
      result.warnings.push('No common Java keywords found - this might not be Java code');
      result.suggestions.push('Verify that the input is valid Java source code');
    }

    // Check for Java-specific imports
    const importLines = sourceCode.split('\n').filter(line => line.trim().startsWith('import'));
    const malformedImports = importLines.filter(line => !line.match(/import\s+[\w.]+\s*;/));
    
    if (malformedImports.length > 0) {
      result.warnings.push('Malformed import statements detected');
      result.suggestions.push('Ensure import statements follow Java syntax: import package.Class;');
    }

    // Check for package declaration format
    if (sourceCode.includes('package') && !sourceCode.match(/package\s+[\w.]+\s*;/)) {
      result.warnings.push('Malformed package declaration detected');
      result.suggestions.push('Ensure package declaration follows Java syntax: package com.example;');
    }
  }

  private validateTypeScriptSpecificSyntax(sourceCode: string, result: ValidationResult): void {
    // Check for TypeScript-specific features
    const tsFeatures = ['interface', 'type', 'enum', 'namespace', 'module', 'declare'];
    const foundFeatures = tsFeatures.filter(feature => sourceCode.includes(feature));
    
    if (foundFeatures.length === 0 && !sourceCode.includes('class') && !sourceCode.includes('function')) {
      result.warnings.push('No TypeScript or JavaScript constructs found');
      result.suggestions.push('Verify that the input is valid TypeScript/JavaScript source code');
    }

    // Check for type annotations
    if (sourceCode.includes(':') && sourceCode.match(/:\s*\w+/)) {
      // This looks like it might have type annotations, which is good for TypeScript
    } else if (sourceCode.includes('var') || sourceCode.includes('let') || sourceCode.includes('const')) {
      result.warnings.push('Variable declarations found but no type annotations detected');
      result.suggestions.push('Consider adding type annotations for better IGCSE conversion');
    }

    // Check for ES6+ imports
    const importLines = sourceCode.split('\n').filter(line => line.trim().startsWith('import'));
    const malformedImports = importLines.filter(line => !line.match(/import.*from\s+['"][^'"]+['"]/));
    
    if (importLines.length > 0 && malformedImports.length > 0) {
      result.warnings.push('Malformed ES6 import statements detected');
      result.suggestions.push('Ensure import statements follow ES6 syntax: import { item } from "module";');
    }

    // Check for export statements
    if (sourceCode.includes('export') && !sourceCode.match(/export\s+(default\s+)?(class|function|interface|type|const|let|var)/)) {
      result.warnings.push('Malformed export statements detected');
      result.suggestions.push('Ensure export statements follow proper syntax');
    }
  }

  private checkJavaCommonIssues(sourceCode: string, result: ValidationResult): void {
    // Check for common Java mistakes
    const commonIssues = [
      {
        pattern: /System\.out\.print\(/g,
        message: 'System.out.print() calls found',
        suggestion: 'System.out.print() will be converted to OUTPUT statements in IGCSE pseudocode'
      },
      {
        pattern: /Scanner\s+\w+\s*=\s*new\s+Scanner/g,
        message: 'Scanner usage detected',
        suggestion: 'Scanner input will be converted to INPUT statements in IGCSE pseudocode'
      },
      {
        pattern: /ArrayList|HashMap|LinkedList/g,
        message: 'Java Collections detected',
        suggestion: 'Collections will be converted to simple arrays in IGCSE pseudocode'
      },
      {
        pattern: /try\s*\{[\s\S]*catch/g,
        message: 'Exception handling detected',
        suggestion: 'Try-catch blocks will be converted to conditional error checking'
      },
      {
        pattern: /\w+\s*->\s*/g,
        message: 'Lambda expressions detected',
        suggestion: 'Lambda expressions will be converted to named methods'
      }
    ];

    for (const issue of commonIssues) {
      if (issue.pattern.test(sourceCode)) {
        result.warnings.push(issue.message);
        result.suggestions.push(issue.suggestion);
      }
    }

    // Check for missing semicolons (common issue)
    const lines = sourceCode.split('\n');
    let missingSemicolons = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length > 0 && 
          !line.endsWith(';') && 
          !line.endsWith('{') && 
          !line.endsWith('}') && 
          !line.startsWith('//') && 
          !line.startsWith('/*') && 
          !line.startsWith('*') &&
          !line.includes('if') &&
          !line.includes('while') &&
          !line.includes('for') &&
          !line.includes('else') &&
          (line.includes('=') || line.includes('System.out') || line.includes('return'))) {
        missingSemicolons++;
      }
    }

    if (missingSemicolons > 0) {
      result.warnings.push(`Possible missing semicolons detected in ${missingSemicolons} lines`);
      result.suggestions.push('Ensure all Java statements end with semicolons');
    }
  }

  private checkTypeScriptCommonIssues(sourceCode: string, result: ValidationResult): void {
    // Check for common TypeScript/JavaScript issues
    const commonIssues = [
      {
        pattern: /console\.log\(/g,
        message: 'console.log() calls found',
        suggestion: 'console.log() will be converted to OUTPUT statements in IGCSE pseudocode'
      },
      {
        pattern: /async\s+(function|\w+\s*\()/g,
        message: 'Async functions detected',
        suggestion: 'Async functions will be converted to synchronous procedures'
      },
      {
        pattern: /await\s+/g,
        message: 'Await expressions detected',
        suggestion: 'Await expressions will be converted to synchronous calls'
      },
      {
        pattern: /Promise\s*</g,
        message: 'Promise types detected',
        suggestion: 'Promises will be converted to synchronous operations'
      },
      {
        pattern: /\?\./g,
        message: 'Optional chaining detected',
        suggestion: 'Optional chaining will be converted to explicit null checks'
      },
      {
        pattern: /\?\?/g,
        message: 'Nullish coalescing detected',
        suggestion: 'Nullish coalescing will be converted to conditional statements'
      }
    ];

    for (const issue of commonIssues) {
      if (issue.pattern.test(sourceCode)) {
        result.warnings.push(issue.message);
        result.suggestions.push(issue.suggestion);
      }
    }

    // Check for missing type annotations in function parameters
    const functionMatches = sourceCode.match(/function\s+\w+\s*\([^)]*\)/g);
    if (functionMatches) {
      const functionsWithoutTypes = functionMatches.filter(func => !func.includes(':'));
      if (functionsWithoutTypes.length > 0) {
        result.warnings.push(`${functionsWithoutTypes.length} functions found without type annotations`);
        result.suggestions.push('Add type annotations to function parameters for better IGCSE conversion');
      }
    }
  }

  private validateJavaStructure(sourceCode: string, result: ValidationResult): void {
    // Check bracket matching
    const brackets = { '{': 0, '}': 0, '(': 0, ')': 0, '[': 0, ']': 0 };
    let inString = false;
    let inComment = false;
    let inLineComment = false;

    for (let i = 0; i < sourceCode.length; i++) {
      const char = sourceCode[i];
      const nextChar = i < sourceCode.length - 1 ? sourceCode[i + 1] : '';

      // Handle comments
      if (!inString && char === '/' && nextChar === '/') {
        inLineComment = true;
        i++; // Skip next character
        continue;
      }
      if (!inString && char === '/' && nextChar === '*') {
        inComment = true;
        i++; // Skip next character
        continue;
      }
      if (inComment && char === '*' && nextChar === '/') {
        inComment = false;
        i++; // Skip next character
        continue;
      }
      if (inLineComment && char === '\n') {
        inLineComment = false;
        continue;
      }

      if (inComment || inLineComment) continue;

      // Handle strings
      if (char === '"' && (i === 0 || sourceCode[i - 1] !== '\\')) {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      // Count brackets
      if (brackets.hasOwnProperty(char)) {
        brackets[char as keyof typeof brackets]++;
      }
    }

    // Check for mismatched brackets
    if (brackets['{'] !== brackets['}']) {
      result.errors.push(new ValidationError(
        'MISMATCHED_BRACES',
        `Mismatched braces: ${brackets['{']} opening, ${brackets['}']} closing`,
        { suggestions: ['Check that all code blocks are properly closed'] }
      ));
      result.isValid = false;
    }

    if (brackets['('] !== brackets[')']) {
      result.errors.push(new ValidationError(
        'MISMATCHED_PARENTHESES',
        `Mismatched parentheses: ${brackets['(']} opening, ${brackets[')']} closing`,
        { suggestions: ['Check that all method calls and conditions are properly closed'] }
      ));
      result.isValid = false;
    }

    if (brackets['['] !== brackets[']']) {
      result.errors.push(new ValidationError(
        'MISMATCHED_BRACKETS',
        `Mismatched square brackets: ${brackets['[']} opening, ${brackets[']']} closing`,
        { suggestions: ['Check that all array accesses are properly closed'] }
      ));
      result.isValid = false;
    }
  }

  private validateTypeScriptStructure(sourceCode: string, result: ValidationResult): void {
    // Similar to Java but with TypeScript-specific checks
    this.validateJavaStructure(sourceCode, result); // Reuse bracket checking

    // Check for template literal matching
    const templateLiterals = sourceCode.match(/`[^`]*`/g);
    const unmatched = sourceCode.match(/`[^`]*$/gm);
    
    if (unmatched && unmatched.length > 0) {
      result.errors.push(new ValidationError(
        'UNTERMINATED_TEMPLATE',
        'Unterminated template literal detected',
        { suggestions: ['Ensure all template literals are properly closed with backticks'] }
      ));
      result.isValid = false;
    }
  }

  private containsBinaryContent(sourceCode: string): boolean {
    // Check for null bytes or other binary indicators
    return sourceCode.includes('\0') || 
           /[\x00-\x08\x0E-\x1F\x7F-\xFF]/.test(sourceCode.substring(0, Math.min(1000, sourceCode.length)));
  }

  private hasEncodingIssues(sourceCode: string): boolean {
    // Check for common encoding issues
    return sourceCode.includes('�') || // Replacement character
           sourceCode.includes('\uFFFD') || // Unicode replacement character
           /[\x80-\xFF]/.test(sourceCode); // High-bit characters that might indicate encoding issues
  }

  private hasMixedLineEndings(sourceCode: string): boolean {
    return sourceCode.includes('\r\n') && sourceCode.includes('\n') && 
           sourceCode.split('\r\n').length !== sourceCode.split('\n').length;
  }

  // Utility method to get helpful error messages for common issues
  static getHelpfulErrorMessage(error: ValidationError): string {
    const helpMessages: Record<string, string> = {
      'NULL_INPUT': 'The source code input is null or undefined. Please provide a valid string containing your Java or TypeScript code.',
      'EMPTY_INPUT': 'The source code is empty. Please provide some code to convert to IGCSE pseudocode.',
      'INPUT_TOO_LARGE': 'The source code file is too large. Consider breaking it into smaller files or removing unnecessary content.',
      'BINARY_CONTENT': 'The input appears to contain binary data rather than text. Please ensure you are providing source code as plain text.',
      'MISMATCHED_BRACES': 'There are unmatched curly braces { } in your code. Each opening brace must have a corresponding closing brace.',
      'MISMATCHED_PARENTHESES': 'There are unmatched parentheses ( ) in your code. Check method calls, conditions, and expressions.',
      'MISMATCHED_BRACKETS': 'There are unmatched square brackets [ ] in your code. Check array declarations and accesses.',
      'UNTERMINATED_TEMPLATE': 'There is an unterminated template literal (backtick string) in your TypeScript code.'
    };

    return helpMessages[error.validationRule] || error.message;
  }
}

export default InputValidator;