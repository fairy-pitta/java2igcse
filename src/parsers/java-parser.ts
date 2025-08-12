// Simple Java Parser for IGCSE conversion - self-contained to avoid circular imports

// Local interfaces
interface SourceLocation {
  line: number;
  column: number;
}

interface ParseError {
  message: string;
  line: number;
  column: number;
  code: string;
  severity: 'error' | 'warning';
}

interface Warning {
  message: string;
  line?: number;
  column?: number;
  code: string;
  severity: 'warning' | 'info';
}

interface JavaASTNode {
  type: string;
  children: JavaASTNode[];
  value?: any;
  location?: SourceLocation;
  metadata?: Record<string, any>;
}

interface ParseResult<T> {
  ast: T;
  errors: ParseError[];
  success: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: ParseError[];
  warnings: Warning[];
}

export interface JavaParseResult extends ParseResult<JavaASTNode> {
  ast: JavaASTNode;
  errors: ParseError[];
  success: boolean;
}

export interface VariableDeclarationInfo {
  name: string;
  javaType: string;
  isArray: boolean;
  arrayDimensions: number[];
  initialValue?: string;
  igcseDeclaration: string;
  warnings: string[];
}

interface ArrayDeclarationInfo {
  name: string;
  baseType: string;
  dimensions: number[];
  igcseDeclaration: string;
  warnings: string[];
}

export class JavaParser {
  private source: string = '';
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private errors: ParseError[] = [];
  private warnings: ParseError[] = [];
  private currentClassName: string | null = null;

  parse(sourceCode: string): JavaParseResult {
    this.source = sourceCode.trim();
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.errors = [];
    this.warnings = [];

    // Input validation - allow empty input for backward compatibility
    if (sourceCode === null || sourceCode === undefined) {
      this.addError('Source code cannot be null or undefined', 'INVALID_INPUT');
      return {
        ast: { type: 'program', children: [], location: { line: 1, column: 1 } },
        errors: this.errors,
        success: false
      };
    }

    // For empty input, return empty program but mark as successful for backward compatibility
    if (sourceCode.trim().length === 0) {
      return {
        ast: { type: 'program', children: [], location: { line: 1, column: 1 } },
        errors: this.errors,
        success: true
      };
    }

    // Check for basic Java syntax requirements
    this.validateBasicSyntax(sourceCode);

    try {
      const ast = this.parseProgram();
      
      // Post-parse validation
      this.validateAST(ast);
      
      // Even if there are errors, try to return a partial AST for better conversion
      const hasOnlyWarnings = this.errors.every(e => e.severity === 'warning');
      
      return {
        ast,
        errors: [...this.errors, ...this.warnings],
        success: hasOnlyWarnings || this.errors.length === 0
      };
    } catch (error) {
      // Try to create a partial AST even on parse failure
      let partialAst: JavaASTNode;
      
      try {
        // Attempt to parse what we can
        partialAst = this.parsePartialProgram();
      } catch (secondError) {
        // If even partial parsing fails, create minimal AST
        partialAst = { type: 'program', children: [], location: this.getCurrentLocation() };
      }
      
      const parseError: ParseError = {
        message: this.createDescriptiveErrorMessage(error),
        line: this.line,
        column: this.column,
        code: 'PARSE_ERROR',
        severity: 'warning' // Treat as warning to allow partial conversion
      };
      
      return {
        ast: partialAst,
        errors: [...this.errors, parseError, ...this.warnings],
        success: true // Allow partial conversion to proceed
      };
    }
  }

  validate(sourceCode: string): ValidationResult {
    const parseResult = this.parse(sourceCode);
    const warnings: Warning[] = [];

    if (sourceCode.includes('System.out.println')) {
      warnings.push({
        message: 'System.out.println will be converted to OUTPUT statement',
        code: 'FEATURE_CONVERSION',
        severity: 'info'
      });
    }

    return {
      isValid: parseResult.success,
      errors: parseResult.errors,
      warnings
    };
  }

  extractVariableDeclarations(ast: JavaASTNode): VariableDeclarationInfo[] {
    const declarations: VariableDeclarationInfo[] = [];
    
    this.traverseAST(ast, (node) => {
      if (node.type === 'variable_declaration') {
        const declaration = this.convertVariableDeclaration(node);
        if (declaration) {
          declarations.push(declaration);
        }
      }
    });

    return declarations;
  }

  extractArrayDeclarations(ast: JavaASTNode): ArrayDeclarationInfo[] {
    const declarations: ArrayDeclarationInfo[] = [];
    
    this.traverseAST(ast, (node) => {
      if (node.type === 'variable_declaration') {
        const typeNode = node.children[0];
        if (typeNode.metadata?.isArray) {
          const identifierNode = node.children[1];
          const name = identifierNode.value as string;
          const baseType = typeNode.value as string;
          const dimensions = typeNode.metadata.arrayDimensions || [];
          
          declarations.push({
            name,
            baseType,
            dimensions,
            igcseDeclaration: `DECLARE ${name} : ARRAY[1:n] OF ${this.convertJavaTypeToIGCSE(baseType)}`,
            warnings: []
          });
        }
      }
    });

    return declarations;
  }

  private convertVariableDeclaration(node: JavaASTNode): VariableDeclarationInfo | null {
    if (node.children.length < 2) return null;

    const typeNode = node.children[0];
    const identifierNode = node.children[1];
    const valueNode = node.children.length > 2 ? node.children[2] : null;

    const javaType = typeNode.value as string;
    const name = identifierNode.value as string;
    const isArray = typeNode.metadata?.isArray || false;
    const arrayDimensions = typeNode.metadata?.arrayDimensions || [];
    const initialValue = valueNode?.value as string;

    let igcseDeclaration = '';
    const warnings: string[] = [];

    if (isArray) {
      const igcseType = this.convertJavaTypeToIGCSE(javaType);
      let arrayType = igcseType;
      
      // Build nested array type for multi-dimensional arrays
      for (let i = arrayDimensions.length - 1; i >= 0; i--) {
        arrayType = `ARRAY[1:n] OF ${arrayType}`;
      }
      
      igcseDeclaration = `DECLARE ${name} : ${arrayType}`;
    } else {
      const igcseType = this.convertJavaTypeToIGCSE(javaType);
      igcseDeclaration = `DECLARE ${name} : ${igcseType}`;
      
      if (initialValue) {
        const convertedValue = this.convertLiteralValue(initialValue, igcseType);
        igcseDeclaration += `\n${name} ← ${convertedValue}`;
      }
    }

    return {
      name,
      javaType,
      isArray,
      arrayDimensions,
      initialValue,
      igcseDeclaration,
      warnings
    };
  }

  private convertJavaTypeToIGCSE(javaType: string): string {
    switch (javaType) {
      case 'int': return 'INTEGER';
      case 'String': return 'STRING';
      case 'boolean': return 'BOOLEAN';
      case 'double':
      case 'float': return 'REAL';
      case 'char': return 'CHAR';
      default: return 'UNKNOWN';
    }
  }

  private convertLiteralValue(value: string, igcseType: string): string {
    switch (igcseType) {
      case 'BOOLEAN':
        return value === 'true' ? 'TRUE' : 'FALSE';
      case 'STRING':
        return value.startsWith('"') && value.endsWith('"') ? value : `"${value}"`;
      case 'CHAR':
        // Convert to single quotes for IGCSE
        if (value.startsWith('"') && value.endsWith('"')) {
          return `'${value.slice(1, -1)}'`;
        }
        return value.length === 1 ? `'${value}'` : value;
      default:
        return value;
    }
  }

  private traverseAST(node: JavaASTNode, callback: (node: JavaASTNode) => void): void {
    if (!node) return;

    callback(node);

    if (node.children) {
      for (const child of node.children) {
        this.traverseAST(child, callback);
      }
    }
  }

  private parseProgram(): JavaASTNode {
    const statements: JavaASTNode[] = [];
    
    while (!this.isAtEnd()) {
      this.skipWhitespace();
      if (this.isAtEnd()) break;
      
      const statement = this.parseStatement();
      if (statement) {
        statements.push(statement);
      }
    }

    return {
      type: 'program',
      children: statements,
      location: { line: 1, column: 1 }
    };
  }

  private parsePartialProgram(): JavaASTNode {
    const statements: JavaASTNode[] = [];
    let errorCount = 0;
    const maxErrors = 10; // Limit error recovery attempts
    
    while (!this.isAtEnd() && errorCount < maxErrors) {
      this.skipWhitespace();
      if (this.isAtEnd()) break;
      
      try {
        const statement = this.parseStatement();
        if (statement) {
          statements.push(statement);
          errorCount = 0; // Reset error count on successful parse
        }
      } catch (error) {
        errorCount++;
        // Skip to next potential statement start
        this.skipToNextStatement();
        
        // Add a placeholder for the failed statement
        statements.push({
          type: 'statement',
          children: [],
          location: this.getCurrentLocation(),
          metadata: { 
            parseError: true, 
            errorMessage: error instanceof Error ? error.message : 'Parse error'
          }
        });
      }
    }

    return {
      type: 'program',
      children: statements,
      location: { line: 1, column: 1 },
      metadata: { partialParse: true, errorCount }
    };
  }

  private parseStatement(): JavaASTNode | null {
    this.skipWhitespace();
    
    if (this.isAtEnd()) return null;

    // Check for if statement
    const currentPos = this.position;
    if (this.matchKeyword('if')) {
      this.position = currentPos; // Reset position before parsing
      return this.parseIfStatement();
    }

    // Check for while statement
    this.position = currentPos;
    if (this.matchKeyword('while')) {
      this.position = currentPos; // Reset position before parsing
      return this.parseWhileStatement();
    }

    // Check for for statement
    this.position = currentPos;
    if (this.matchKeyword('for')) {
      this.position = currentPos; // Reset position before parsing
      return this.parseForStatement();
    }

    // Check for switch statement
    this.position = currentPos;
    if (this.matchKeyword('switch')) {
      this.position = currentPos; // Reset position before parsing
      return this.parseSwitchStatement();
    }

    // Check for class declarations
    this.position = currentPos;
    if (this.matchKeyword('class')) {
      this.position = currentPos; // Reset position before parsing
      return this.parseClassDeclaration();
    }

    // Check for declarations with modifiers (public/private/static)
    this.position = currentPos;
    if (this.matchKeyword('public') || 
        (this.position = currentPos, this.matchKeyword('private')) || 
        (this.position = currentPos, this.matchKeyword('protected')) || 
        (this.position = currentPos, this.matchKeyword('static')) || 
        (this.position = currentPos, this.matchKeyword('final'))) {
      this.position = currentPos; // Reset position before parsing
      
      // Look ahead to determine if it's a method or variable declaration
      const saved = { position: this.position, line: this.line, column: this.column };
      
      // Skip modifiers
      while (this.matchKeyword('public') || this.matchKeyword('private') || 
             this.matchKeyword('protected') || this.matchKeyword('static') || 
             this.matchKeyword('final')) {
        this.skipWhitespace();
      }
      
      // Check for class declaration first
      if (this.matchKeyword('class')) {
        this.position = saved.position;
        this.line = saved.line;
        this.column = saved.column;
        return this.parseClassDeclaration();
      }
      
      // Check for constructor first (identifier matching class name followed by '(')
      if (this.currentClassName && this.isAlpha(this.peek())) {
        const identifierStart = this.position;
        let identifier = '';
        
        // Read the identifier
        while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') {
          identifier += this.advance();
        }
        
        this.skipWhitespace();
        
        // If identifier matches class name and is followed by '(', it's a constructor
        if (identifier === this.currentClassName && this.peek() === '(') {
          this.position = saved.position;
          this.line = saved.line;
          this.column = saved.column;
          return this.parseMethodDeclaration();
        }
        
        // Reset position to try other patterns
        this.position = identifierStart;
      }
      
      // Skip type
      if (this.matchKeyword('void') || this.matchKeyword('int') || 
          this.matchKeyword('String') || this.matchKeyword('boolean') || 
          this.matchKeyword('double') || this.matchKeyword('float') || 
          this.matchKeyword('char')) {
        this.skipWhitespace();
        
        // Skip identifier
        if (this.isAlpha(this.peek()) || this.peek() === '_') {
          while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') {
            this.advance();
          }
        }
        
        this.skipWhitespace();
        
        // If next character is '(', it's a method declaration
        if (this.peek() === '(') {
          this.position = saved.position;
          this.line = saved.line;
          this.column = saved.column;
          return this.parseMethodDeclaration();
        } else {
          // It's a variable declaration
          this.position = saved.position;
          this.line = saved.line;
          this.column = saved.column;
          return this.parseVariableDeclaration();
        }
      }
      
      // Reset position if we couldn't determine the type
      this.position = saved.position;
      this.line = saved.line;
      this.column = saved.column;
    }

    // Check for type keywords at current position (variable declarations)
    this.position = currentPos;
    if (this.matchKeyword('int') || 
        (this.position = currentPos, this.matchKeyword('String')) || 
        (this.position = currentPos, this.matchKeyword('boolean')) || 
        (this.position = currentPos, this.matchKeyword('double')) || 
        (this.position = currentPos, this.matchKeyword('float')) || 
        (this.position = currentPos, this.matchKeyword('char'))) {
      this.position = currentPos; // Reset position before parsing
      
      // Look ahead to see if this is a method declaration or variable declaration
      const saved = { position: this.position, line: this.line, column: this.column };
      
      // Skip type
      this.parseType();
      this.skipWhitespace();
      
      // Skip identifier
      if (this.isAlpha(this.peek()) || this.peek() === '_') {
        while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') {
          this.advance();
        }
      }
      
      this.skipWhitespace();
      
      // If next character is '(', it's a method declaration
      if (this.peek() === '(') {
        this.position = saved.position;
        this.line = saved.line;
        this.column = saved.column;
        return this.parseMethodDeclaration();
      } else {
        // It's a variable declaration
        this.position = saved.position;
        this.line = saved.line;
        this.column = saved.column;
        return this.parseVariableDeclaration();
      }
    }

    // Check for return statements
    this.position = currentPos;
    if (this.matchKeyword('return')) {
      this.position = currentPos; // Reset position before parsing
      return this.parseReturnStatement();
    }

    // Check for assignment statements and other expressions (identifier = expression, i++, etc.)
    this.position = currentPos;
    if (this.isAlpha(this.peek()) || this.peek() === '_') {
      // Look ahead to see if this is an assignment or other expression
      const saved = { position: this.position, line: this.line, column: this.column };
      let tempPos = this.position;
      
      // Skip identifier
      while (tempPos < this.source.length && (this.isAlphaNumeric(this.source[tempPos]) || this.source[tempPos] === '_')) {
        tempPos++;
      }
      
      // Check for member access (this.field or object.field)
      if (tempPos < this.source.length && this.source[tempPos] === '.') {
        tempPos++; // Skip '.'
        
        // Skip member name
        while (tempPos < this.source.length && (this.isAlphaNumeric(this.source[tempPos]) || this.source[tempPos] === '_')) {
          tempPos++;
        }
      }
      
      // Skip whitespace
      while (tempPos < this.source.length && /\s/.test(this.source[tempPos])) {
        tempPos++;
      }
      
      // Check for assignment operator
      if (tempPos < this.source.length && this.source[tempPos] === '=') {
        // This is an assignment
        return this.parseAssignmentStatement();
      }
      
      // Check for increment/decrement operators
      if (tempPos < this.source.length && 
          (this.source.substring(tempPos, tempPos + 2) === '++' || 
           this.source.substring(tempPos, tempPos + 2) === '--')) {
        // This is an increment/decrement statement
        return this.parseIncrementStatement();
      }
      
      // Reset position
      this.position = saved.position;
      this.line = saved.line;
      this.column = saved.column;
    }

    // Check for method calls (like System.out.println)
    this.position = currentPos;
    if (this.peek() !== '}' && this.peek() !== '{') {
      try {
        const expressionStatement = this.parseExpressionStatement();
        if (expressionStatement) {
          return expressionStatement;
        }
      } catch (error) {
        // Continue to error recovery
      }
    }

    // Error recovery - try to continue parsing
    this.skipToNextStatement();
    
    // Try to parse the next statement after recovery
    if (!this.isAtEnd()) {
      try {
        return this.parseStatement();
      } catch (error) {
        // If we still can't parse, return null
        return null;
      }
    }
    
    return null;
  }

  private parseVariableDeclaration(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    const modifiers: string[] = [];
    let visibility = 'public';
    let isStatic = false;
    let isFinal = false;
    
    // Parse modifiers (for static variables)
    while (true) {
      const currentPos = this.position;
      
      if (this.matchKeyword('public')) {
        visibility = 'public';
        modifiers.push('public');
        this.skipWhitespace();
      } else if (this.matchKeyword('private')) {
        visibility = 'private';
        modifiers.push('private');
        this.skipWhitespace();
      } else if (this.matchKeyword('protected')) {
        visibility = 'protected';
        modifiers.push('protected');
        this.skipWhitespace();
      } else if (this.matchKeyword('static')) {
        isStatic = true;
        modifiers.push('static');
        this.skipWhitespace();
      } else if (this.matchKeyword('final')) {
        isFinal = true;
        modifiers.push('final');
        this.skipWhitespace();
      } else {
        // No more modifiers found
        break;
      }
    }
    
    const type = this.parseType();
    
    this.skipWhitespace();
    const identifier = this.parseIdentifier();
    
    let initialValue: JavaASTNode | null = null;
    
    this.skipWhitespace();
    if (this.peek() === '=') {
      this.advance();
      this.skipWhitespace();
      initialValue = this.parseExpression();
    }
    
    this.skipWhitespace();
    if (this.peek() === ';') {
      this.advance();
    }

    return {
      type: 'variable_declaration',
      children: [type, identifier, ...(initialValue ? [initialValue] : [])],
      location: startLocation,
      metadata: {
        isStatic,
        isFinal,
        visibility,
        modifiers
      }
    };
  }

  private parseType(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    let typeName = '';
    
    // Try to match each type keyword
    const currentPos = this.position;
    if (this.matchKeyword('void')) {
      typeName = 'void';
    } else {
      this.position = currentPos;
      if (this.matchKeyword('int')) {
        typeName = 'int';
      } else {
        this.position = currentPos;
        if (this.matchKeyword('String')) {
          typeName = 'String';
        } else {
          this.position = currentPos;
          if (this.matchKeyword('boolean')) {
            typeName = 'boolean';
          } else {
            this.position = currentPos;
            if (this.matchKeyword('double')) {
              typeName = 'double';
            } else {
              this.position = currentPos;
              if (this.matchKeyword('float')) {
                typeName = 'float';
              } else {
                this.position = currentPos;
                if (this.matchKeyword('char')) {
                  typeName = 'char';
                } else {
                  this.addError('Expected type declaration');
                  return { type: 'type', value: 'unknown', children: [], location: startLocation };
                }
              }
            }
          }
        }
      }
    }

    this.skipWhitespace();
    let isArray = false;
    const arrayDimensions: number[] = [];
    
    while (this.peek() === '[') {
      this.advance();
      this.skipWhitespace();
      
      if (this.peek() === ']') {
        this.advance();
        isArray = true;
        arrayDimensions.push(0);
        this.skipWhitespace();
      } else {
        this.addError('Expected "]" after "["');
        break;
      }
    }

    return {
      type: 'type',
      value: typeName,
      children: [],
      location: startLocation,
      metadata: {
        isArray,
        arrayDimensions
      }
    };
  }

  private parseIdentifier(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    let identifier = '';
    
    if (!this.isAlpha(this.peek()) && this.peek() !== '_') {
      this.addError('Expected identifier');
      return { type: 'identifier', value: '', children: [], location: startLocation };
    }
    
    while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') {
      identifier += this.advance();
    }
    
    return {
      type: 'identifier',
      value: identifier,
      children: [],
      location: startLocation
    };
  }

  private parseExpression(): JavaASTNode {
    // First try to parse specific literal types
    if (this.isDigit(this.peek())) {
      return this.parseNumberLiteral();
    } else if (this.peek() === '"') {
      return this.parseStringLiteral();
    } else if (this.peek() === "'") {
      return this.parseCharLiteral();
    } else if (this.peek() === '{') {
      return this.parseArrayLiteral();
    } else {
      // Check for boolean literals
      const currentPos = this.position;
      if (this.matchKeyword('true') || (this.position = currentPos, this.matchKeyword('false'))) {
        this.position = currentPos; // Reset position
        return this.parseBooleanLiteral();
      }
      
      // Check for new expression
      this.position = currentPos;
      if (this.matchKeyword('new')) {
        this.position = currentPos; // Reset position
        return this.parseNewExpression();
      }
      
      // Check if it's a simple identifier
      this.position = currentPos;
      if (this.isAlpha(this.peek()) || this.peek() === '_') {
        // Look ahead to see if this is a simple identifier or complex expression
        let tempPos = this.position;
        while (tempPos < this.source.length && (this.isAlphaNumeric(this.source[tempPos]) || this.source[tempPos] === '_')) {
          tempPos++;
        }
        
        // Skip whitespace
        while (tempPos < this.source.length && /\s/.test(this.source[tempPos])) {
          tempPos++;
        }
        
        // If next character is an operator or end of expression, it's a simple identifier
        const nextChar = tempPos < this.source.length ? this.source[tempPos] : ';';
        if (nextChar === ';' || nextChar === ')' || nextChar === '}' || nextChar === '\n' || nextChar === ',' || nextChar === ']') {
          return this.parseIdentifier();
        }
      }
      
      // Otherwise, parse as complex expression
      this.position = currentPos;
      return this.parseComplexExpression();
    }
  }

  private parseComplexExpression(): JavaASTNode {
    // Parse the entire expression as a string for complex expressions
    const startLocation = this.getCurrentLocation();
    let expression = '';
    let parenCount = 0;
    let inString = false;
    
    while (!this.isAtEnd()) {
      const char = this.peek();
      
      if (char === '"' && !inString) {
        inString = true;
        expression += this.advance();
      } else if (char === '"' && inString) {
        inString = false;
        expression += this.advance();
      } else if (!inString && char === '(') {
        parenCount++;
        expression += this.advance();
      } else if (!inString && char === ')') {
        if (parenCount === 0) {
          break; // This might be the closing paren of a method call or condition
        }
        parenCount--;
        expression += this.advance();
      } else if (!inString && (char === ';' || char === '}' || char === '\n')) {
        break; // End of expression
      } else {
        expression += this.advance();
      }
    }
    
    // Check for empty expression (syntax error)
    if (expression.trim() === '') {
      this.addError(`Expected expression after "=" at line ${this.line}, column ${this.column}`);
      return {
        type: 'expression',
        value: '',
        children: [],
        location: startLocation,
        metadata: { expressionType: 'error' }
      };
    }
    
    return {
      type: 'expression',
      value: expression.trim(),
      children: [],
      location: startLocation,
      metadata: { expressionType: 'complex' }
    };
  }

  private parseArrayLiteral(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    let literal = '';
    
    while (!this.isAtEnd() && this.peek() !== ';') {
      literal += this.advance();
      if (this.peek() === '}') {
        literal += this.advance();
        break;
      }
    }
    
    return {
      type: 'array_literal',
      value: literal,
      children: [],
      location: startLocation,
      metadata: { literalType: 'array' }
    };
  }

  private parseNewExpression(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    let expression = '';
    
    while (!this.isAtEnd() && this.peek() !== ';') {
      expression += this.advance();
    }
    
    return {
      type: 'new_expression',
      value: expression,
      children: [],
      location: startLocation,
      metadata: { expressionType: 'new' }
    };
  }

  private parseNumberLiteral(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    let number = '';
    
    while (this.isDigit(this.peek()) || this.peek() === '.') {
      number += this.advance();
    }
    
    return {
      type: 'literal',
      value: number,
      children: [],
      location: startLocation,
      metadata: { literalType: 'number' }
    };
  }

  private parseStringLiteral(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    let string = '';
    
    this.advance();
    
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\\') {
        this.advance();
        if (!this.isAtEnd()) {
          string += this.advance();
        }
      } else {
        string += this.advance();
      }
    }
    
    if (this.peek() === '"') {
      this.advance();
    } else {
      this.addError('Unterminated string literal');
    }
    
    return {
      type: 'literal',
      value: string,
      children: [],
      location: startLocation,
      metadata: { literalType: 'string' }
    };
  }

  private parseCharLiteral(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    let char = '';
    
    this.advance(); // consume opening '
    
    if (this.peek() === '\\') {
      // Handle escape sequences
      this.advance();
      if (!this.isAtEnd()) {
        char += this.advance();
      }
    } else if (this.peek() !== "'" && !this.isAtEnd()) {
      char += this.advance();
    }
    
    if (this.peek() === "'") {
      this.advance(); // consume closing '
    } else {
      this.addError('Unterminated character literal');
    }
    
    return {
      type: 'literal',
      value: char,
      children: [],
      location: startLocation,
      metadata: { literalType: 'char' }
    };
  }

  private parseBooleanLiteral(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    let value = '';
    
    const currentPos = this.position;
    if (this.matchKeyword('true')) {
      value = 'true';
    } else {
      this.position = currentPos;
      if (this.matchKeyword('false')) {
        value = 'false';
      }
    }
    
    return {
      type: 'literal',
      value,
      children: [],
      location: startLocation,
      metadata: { literalType: 'boolean' }
    };
  }

  private parseIfStatement(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    
    // Parse 'if' keyword
    if (!this.matchKeyword('if')) {
      this.addError('Expected "if"');
      return { type: 'if_statement', children: [], location: startLocation };
    }
    
    this.skipWhitespace();
    
    // Parse opening parenthesis
    if (this.peek() !== '(') {
      this.addError('Expected "(" after "if"');
      return { type: 'if_statement', children: [], location: startLocation };
    }
    this.advance();
    
    // Parse condition
    const condition = this.parseCondition();
    
    this.skipWhitespace();
    
    // Parse closing parenthesis
    if (this.peek() !== ')') {
      this.addError('Expected ")" after condition');
    } else {
      this.advance();
    }
    
    this.skipWhitespace();
    
    // Parse then block
    const thenBlock = this.parseBlock();
    
    this.skipWhitespace();
    
    // Check for else
    let elseBlock: JavaASTNode | null = null;
    const currentPos = this.position;
    if (this.matchKeyword('else')) {
      this.skipWhitespace();
      
      // Check for else if
      const elseIfPos = this.position;
      if (this.matchKeyword('if')) {
        this.position = elseIfPos; // Reset to parse the full else if
        elseBlock = this.parseIfStatement(); // Recursive call for else if
      } else {
        // Regular else block
        elseBlock = this.parseBlock();
      }
    } else {
      this.position = currentPos; // Reset if no else found
    }
    
    const children = [condition, thenBlock];
    if (elseBlock) {
      children.push(elseBlock);
    }
    
    return {
      type: 'if_statement',
      children,
      location: startLocation,
      metadata: {
        hasElse: !!elseBlock,
        isElseIf: elseBlock?.type === 'if_statement'
      }
    };
  }

  private parseWhileStatement(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    
    // Parse 'while' keyword
    if (!this.matchKeyword('while')) {
      this.addError('Expected "while"');
      return { type: 'while_statement', children: [], location: startLocation };
    }
    
    this.skipWhitespace();
    
    // Parse opening parenthesis
    if (this.peek() !== '(') {
      this.addError('Expected "(" after "while"');
      return { type: 'while_statement', children: [], location: startLocation };
    }
    this.advance();
    
    // Parse condition
    const condition = this.parseCondition();
    
    this.skipWhitespace();
    
    // Parse closing parenthesis
    if (this.peek() !== ')') {
      this.addError('Expected ")" after condition');
    } else {
      this.advance();
    }
    
    this.skipWhitespace();
    
    // Parse body block
    const body = this.parseBlock();
    
    return {
      type: 'while_statement',
      children: [condition, body],
      location: startLocation,
      metadata: {
        condition: condition.metadata?.igcseCondition || condition.value
      }
    };
  }

  private parseForStatement(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    
    // Parse 'for' keyword
    if (!this.matchKeyword('for')) {
      this.addError('Expected "for"');
      return { type: 'for_statement', children: [], location: startLocation };
    }
    
    this.skipWhitespace();
    
    // Parse opening parenthesis
    if (this.peek() !== '(') {
      this.addError('Expected "(" after "for"');
      return { type: 'for_statement', children: [], location: startLocation };
    }
    this.advance();
    
    this.skipWhitespace();
    
    // Parse initialization (e.g., "int i = 0")
    const initialization = this.parseForInitialization();
    
    this.skipWhitespace();
    if (this.peek() === ';') {
      this.advance();
    }
    
    this.skipWhitespace();
    
    // Parse condition (e.g., "i < 10")
    const condition = this.parseForCondition();
    
    this.skipWhitespace();
    if (this.peek() === ';') {
      this.advance();
    }
    
    this.skipWhitespace();
    
    // Parse increment (e.g., "i++")
    const increment = this.parseForIncrement();
    
    this.skipWhitespace();
    
    // Parse closing parenthesis
    if (this.peek() !== ')') {
      this.addError('Expected ")" after for statement');
    } else {
      this.advance();
    }
    
    this.skipWhitespace();
    
    // Parse body block
    const body = this.parseBlock();
    
    return {
      type: 'for_statement',
      children: [initialization, condition, increment, body],
      location: startLocation,
      metadata: {
        variable: initialization.metadata?.variable,
        startValue: initialization.metadata?.startValue,
        endCondition: condition.value,
        incrementExpression: increment.value
      }
    };
  }

  private parseForInitialization(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    
    // Check if it's a variable declaration (int i = 0) or assignment (i = 0)
    const currentPos = this.position;
    
    // Try to match type keywords first
    if (this.matchKeyword('int') || 
        (this.position = currentPos, this.matchKeyword('String')) || 
        (this.position = currentPos, this.matchKeyword('boolean')) || 
        (this.position = currentPos, this.matchKeyword('double')) || 
        (this.position = currentPos, this.matchKeyword('float')) || 
        (this.position = currentPos, this.matchKeyword('char'))) {
      // This is a variable declaration
      this.position = currentPos; // Reset position
      const varDecl = this.parseVariableDeclaration();
      
      // Extract metadata for for loop processing
      const typeNode = varDecl.children[0];
      const identifierNode = varDecl.children[1];
      const valueNode = varDecl.children.length > 2 ? varDecl.children[2] : null;
      
      varDecl.metadata = {
        ...varDecl.metadata,
        variable: identifierNode.value,
        startValue: valueNode?.value || '0'
      };
      
      return varDecl;
    } else {
      // This is an assignment
      this.position = currentPos;
      return this.parseAssignmentStatement();
    }
  }

  private parseForCondition(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    let conditionText = '';
    
    // Parse until semicolon
    while (!this.isAtEnd() && this.peek() !== ';') {
      conditionText += this.advance();
    }
    
    return {
      type: 'for_condition',
      value: conditionText.trim(),
      children: [],
      location: startLocation,
      metadata: {
        originalCondition: conditionText.trim()
      }
    };
  }

  private parseForIncrement(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    let incrementText = '';
    
    // Parse until closing parenthesis
    while (!this.isAtEnd() && this.peek() !== ')') {
      incrementText += this.advance();
    }
    
    return {
      type: 'for_increment',
      value: incrementText.trim(),
      children: [],
      location: startLocation,
      metadata: {
        originalIncrement: incrementText.trim()
      }
    };
  }

  private parseReturnStatement(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    
    // Parse 'return' keyword
    if (!this.matchKeyword('return')) {
      this.addError('Expected "return"');
      return { type: 'return_statement', children: [], location: startLocation };
    }
    
    this.skipWhitespace();
    
    let expression: JavaASTNode | null = null;
    
    // Check if there's an expression after return
    if (this.peek() !== ';' && !this.isAtEnd()) {
      expression = this.parseExpression();
    }
    
    this.skipWhitespace();
    if (this.peek() === ';') {
      this.advance();
    }
    
    const children = expression ? [expression] : [];
    
    return {
      type: 'return_statement',
      children,
      location: startLocation,
      metadata: {
        hasExpression: !!expression,
        expression: expression?.value
      }
    };
  }

  private parseIncrementStatement(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    
    // Parse variable name
    const variable = this.parseIdentifier();
    
    this.skipWhitespace();
    
    // Parse increment/decrement operator
    let operator = '';
    if (this.peek() === '+' && this.source[this.position + 1] === '+') {
      operator = '++';
      this.advance();
      this.advance();
    } else if (this.peek() === '-' && this.source[this.position + 1] === '-') {
      operator = '--';
      this.advance();
      this.advance();
    } else {
      this.addError('Expected "++" or "--"');
      return { type: 'expression_statement', children: [variable], location: startLocation };
    }
    
    this.skipWhitespace();
    if (this.peek() === ';') {
      this.advance();
    }
    
    return {
      type: 'expression_statement',
      children: [variable],
      location: startLocation,
      metadata: {
        operator,
        variable: variable.value,
        isIncrement: operator === '++',
        isDecrement: operator === '--'
      }
    };
  }

  private parseAssignmentStatement(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    
    // Parse left-hand side (variable name or member access)
    let variableName = '';
    const variable = this.parseIdentifier();
    variableName = variable.value as string;
    
    this.skipWhitespace();
    
    // Check for member access (e.g., this.field)
    if (this.peek() === '.') {
      this.advance(); // consume '.'
      const memberName = this.parseIdentifier();
      variableName = `${variableName}.${memberName.value}`;
      this.skipWhitespace();
    }
    
    // Parse assignment operator
    if (this.peek() !== '=') {
      this.addError('Expected "=" in assignment');
      return { type: 'assignment_statement', children: [variable], location: startLocation };
    }
    this.advance();
    
    this.skipWhitespace();
    
    // Parse expression
    const expression = this.parseExpression();
    
    this.skipWhitespace();
    if (this.peek() === ';') {
      this.advance();
    }
    
    return {
      type: 'assignment_statement',
      children: [variable, expression],
      location: startLocation,
      metadata: {
        variable: variableName,
        expression: expression.value
      }
    };
  }

  private parseCondition(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    let conditionText = '';
    let parenCount = 0;
    
    // Parse the entire condition expression
    while (!this.isAtEnd()) {
      const char = this.peek();
      
      if (char === '(') {
        parenCount++;
        conditionText += this.advance();
      } else if (char === ')') {
        if (parenCount === 0) {
          break; // This is the closing paren for the if statement
        }
        parenCount--;
        conditionText += this.advance();
      } else {
        conditionText += this.advance();
      }
    }
    
    // Convert Java operators to IGCSE equivalents
    const igcseCondition = this.convertConditionOperators(conditionText.trim());
    
    return {
      type: 'condition',
      value: conditionText.trim(),
      children: [],
      location: startLocation,
      metadata: {
        igcseCondition,
        originalCondition: conditionText.trim()
      }
    };
  }

  private parseBlock(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    const statements: JavaASTNode[] = [];
    
    this.skipWhitespace();
    
    if (this.peek() === '{') {
      // Block with braces
      this.advance(); // consume '{'
      
      while (!this.isAtEnd() && this.peek() !== '}') {
        this.skipWhitespace();
        if (this.peek() === '}') break;
        
        const statement = this.parseStatement();
        if (statement) {
          statements.push(statement);
        }
      }
      
      if (this.peek() === '}') {
        this.advance(); // consume '}'
      } else {
        this.addError('Expected "}" to close block');
      }
    } else {
      // Single statement without braces
      const statement = this.parseStatement();
      if (statement) {
        statements.push(statement);
      }
    }
    
    return {
      type: 'block',
      children: statements,
      location: startLocation
    };
  }

  private parseExpressionStatement(): JavaASTNode | null {
    const startLocation = this.getCurrentLocation();
    
    // Try to parse method calls like System.out.println
    if (this.matchMethodCall()) {
      const methodCall = this.parseMethodCall();
      
      this.skipWhitespace();
      if (this.peek() === ';') {
        this.advance();
      }
      
      return {
        type: 'expression_statement',
        children: [methodCall],
        location: startLocation
      };
    }
    
    return null;
  }

  private matchMethodCall(): boolean {
    const saved = { position: this.position, line: this.line, column: this.column };
    
    // Look for patterns like "System.out.println" or "identifier("
    let foundMethodPattern = false;
    let tempPos = this.position;
    
    // Skip identifier characters and dots
    while (tempPos < this.source.length) {
      const char = this.source[tempPos];
      if (this.isAlphaNumeric(char) || char === '.' || char === '_') {
        tempPos++;
      } else if (char === '(') {
        foundMethodPattern = true;
        break;
      } else if (/\s/.test(char)) {
        tempPos++;
      } else {
        break;
      }
    }
    
    return foundMethodPattern;
  }

  private parseMethodDeclaration(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    const modifiers: string[] = [];
    let visibility = 'public';
    let isStatic = false;
    
    // Parse modifiers
    while (true) {
      const currentPos = this.position;
      
      if (this.matchKeyword('public')) {
        visibility = 'public';
        modifiers.push('public');
        this.skipWhitespace();
      } else if (this.matchKeyword('private')) {
        visibility = 'private';
        modifiers.push('private');
        this.skipWhitespace();
      } else if (this.matchKeyword('protected')) {
        visibility = 'protected';
        modifiers.push('protected');
        this.skipWhitespace();
      } else if (this.matchKeyword('static')) {
        isStatic = true;
        modifiers.push('static');
        this.skipWhitespace();
      } else {
        // No more modifiers found
        break;
      }
    }
    
    // Check if this might be a constructor (method name matches class name)
    let isConstructor = false;
    let returnType: JavaASTNode;
    let methodName: JavaASTNode;
    
    // Look ahead to see if the next identifier matches the class name
    const saved = { position: this.position, line: this.line, column: this.column };
    const potentialMethodName = this.parseIdentifier();
    
    if (this.currentClassName && potentialMethodName.value === this.currentClassName) {
      // This might be a constructor - check if there's no return type before it
      this.skipWhitespace();
      if (this.peek() === '(') {
        // This is a constructor - no return type
        isConstructor = true;
        methodName = potentialMethodName;
        returnType = {
          type: 'type',
          value: 'void', // Constructors are treated as procedures (void)
          children: [],
          location: startLocation,
          metadata: { isArray: false, arrayDimensions: [] }
        };
      } else {
        // Not a constructor, reset and parse normally
        this.position = saved.position;
        this.line = saved.line;
        this.column = saved.column;
        returnType = this.parseType();
        this.skipWhitespace();
        methodName = this.parseIdentifier();
        this.skipWhitespace();
      }
    } else {
      // Not a constructor, reset and parse normally
      this.position = saved.position;
      this.line = saved.line;
      this.column = saved.column;
      returnType = this.parseType();
      this.skipWhitespace();
      methodName = this.parseIdentifier();
      this.skipWhitespace();
    }
    
    // Parse parameters
    if (this.peek() !== '(') {
      this.addError('Expected "(" after method name');
      return { type: 'method_declaration', children: [], location: startLocation };
    }
    this.advance(); // consume '('
    
    const parameters: JavaASTNode[] = [];
    this.skipWhitespace();
    
    while (this.peek() !== ')' && !this.isAtEnd()) {
      const paramType = this.parseType();
      this.skipWhitespace();
      const paramName = this.parseIdentifier();
      
      parameters.push({
        type: 'parameter',
        children: [paramType, paramName],
        location: this.getCurrentLocation(),
        metadata: {
          parameterName: paramName.value,
          parameterType: paramType.value,
          isArray: paramType.metadata?.isArray || false
        }
      });
      
      this.skipWhitespace();
      if (this.peek() === ',') {
        this.advance();
        this.skipWhitespace();
      }
    }
    
    if (this.peek() === ')') {
      this.advance(); // consume ')'
    } else {
      this.addError('Expected ")" after parameters');
    }
    
    this.skipWhitespace();
    
    // Parse method body
    const body = this.parseBlock();
    
    // Determine if it's a procedure or function
    const returnTypeName = returnType.value as string;
    const isProcedure = returnTypeName === 'void' || isConstructor;
    const igcseReturnType = isProcedure ? undefined : this.convertJavaTypeToIGCSE(returnTypeName);
    
    return {
      type: 'method_declaration',
      children: [returnType, methodName, ...parameters, body],
      location: startLocation,
      metadata: {
        methodName: methodName.value,
        returnType: returnTypeName,
        igcseReturnType,
        isProcedure,
        isStatic,
        visibility,
        modifiers,
        isConstructor,
        parameters: parameters.map(p => ({
          name: p.metadata?.parameterName,
          type: this.convertJavaTypeToIGCSE(p.metadata?.parameterType),
          isArray: p.metadata?.isArray || false,
          isOptional: false
        }))
      }
    };
  }

  private parseMethodCall(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    let methodText = '';
    let parenCount = 0;
    let inString = false;
    let objectName = '';
    let methodName = '';
    const args: string[] = [];
    
    // Parse the method call text
    while (!this.isAtEnd()) {
      const char = this.peek();
      
      if (char === '"' && !inString) {
        inString = true;
        methodText += this.advance();
      } else if (char === '"' && inString) {
        inString = false;
        methodText += this.advance();
      } else if (!inString && char === '(') {
        if (parenCount === 0) {
          // This is the opening paren - extract object and method names
          const parts = methodText.split('.');
          if (parts.length >= 2) {
            methodName = parts[parts.length - 1];
            objectName = parts.slice(0, -1).join('.');
          } else {
            methodName = methodText;
          }
        }
        parenCount++;
        methodText += this.advance();
      } else if (!inString && char === ')') {
        methodText += this.advance();
        parenCount--;
        if (parenCount === 0) {
          break; // End of method call
        }
      } else {
        methodText += this.advance();
      }
    }
    
    // Extract arguments (simplified)
    const argsMatch = methodText.match(/\(([^)]*)\)/);
    if (argsMatch && argsMatch[1].trim()) {
      const argString = argsMatch[1].trim();
      // Simple argument parsing - split by comma but respect strings
      let currentArg = '';
      let inArgString = false;
      
      for (let i = 0; i < argString.length; i++) {
        const char = argString[i];
        if (char === '"' && !inArgString) {
          inArgString = true;
          currentArg += char;
        } else if (char === '"' && inArgString) {
          inArgString = false;
          currentArg += char;
        } else if (char === ',' && !inArgString) {
          args.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        args.push(currentArg.trim());
      }
    }
    
    return {
      type: 'method_call',
      value: methodText,
      children: [],
      location: startLocation,
      metadata: {
        objectName,
        methodName,
        arguments: args
      }
    };
  }

  private convertConditionOperators(condition: string): string {
    return condition
      .replace(/==/g, '=')
      .replace(/!=/g, '<>')
      .replace(/&&/g, 'AND')
      .replace(/\|\|/g, 'OR')
      .replace(/!/g, 'NOT ')
      .replace(/%/g, 'MOD')
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  }

  private isMethodDeclaration(): boolean {
    const saved = { position: this.position, line: this.line, column: this.column };
    
    // Check for modifiers
    let hasModifier = false;
    while (this.matchKeyword('public') || this.matchKeyword('private') || this.matchKeyword('protected') || this.matchKeyword('static')) {
      hasModifier = true;
      this.skipWhitespace();
    }
    
    // If no modifier found, reset and return false
    if (!hasModifier) {
      this.position = saved.position;
      this.line = saved.line;
      this.column = saved.column;
      return false;
    }
    
    // Check for return type
    let hasReturnType = false;
    if (this.matchKeyword('void') || this.matchKeyword('int') || this.matchKeyword('String') || 
        this.matchKeyword('boolean') || this.matchKeyword('double') || this.matchKeyword('float') || this.matchKeyword('char')) {
      hasReturnType = true;
      this.skipWhitespace();
    }
    
    if (!hasReturnType) {
      this.position = saved.position;
      this.line = saved.line;
      this.column = saved.column;
      return false;
    }
    
    // Check for identifier (method name)
    if (!(this.isAlpha(this.peek()) || this.peek() === '_')) {
      this.position = saved.position;
      this.line = saved.line;
      this.column = saved.column;
      return false;
    }
    
    while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') {
      this.advance();
    }
    
    this.skipWhitespace();
    
    // Check for opening parenthesis
    const isMethod = this.peek() === '(';
    
    // Reset position
    this.position = saved.position;
    this.line = saved.line;
    this.column = saved.column;
    
    return isMethod;
  }

  private matchKeyword(keyword: string): boolean {
    const saved = { position: this.position, line: this.line, column: this.column };
    
    // Check if we have enough characters left
    if (this.position + keyword.length > this.source.length) {
      return false;
    }
    
    // Check if the keyword matches
    for (let i = 0; i < keyword.length; i++) {
      if (this.source[this.position + i] !== keyword[i]) {
        return false;
      }
    }
    
    // Check that the next character is not alphanumeric (word boundary)
    const nextChar = this.position + keyword.length < this.source.length 
      ? this.source[this.position + keyword.length] 
      : '\0';
    
    if (this.isAlphaNumeric(nextChar)) {
      return false;
    }
    
    // Advance position
    for (let i = 0; i < keyword.length; i++) {
      this.advance();
    }
    
    return true;
  }

  private peekKeyword(keyword: string): boolean {
    const saved = { position: this.position, line: this.line, column: this.column };
    
    // Check if we have enough characters left
    if (this.position + keyword.length > this.source.length) {
      return false;
    }
    
    // Check if the keyword matches
    for (let i = 0; i < keyword.length; i++) {
      if (this.source[this.position + i] !== keyword[i]) {
        return false;
      }
    }
    
    // Check that the next character is not alphanumeric (word boundary)
    const nextChar = this.position + keyword.length < this.source.length 
      ? this.source[this.position + keyword.length] 
      : '\0';
    
    if (this.isAlphaNumeric(nextChar)) {
      return false;
    }
    
    // Don't advance position - just peek
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.position];
  }

  private advance(): string {
    if (this.isAtEnd()) return '\0';
    
    const char = this.source[this.position];
    this.position++;
    
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    
    return char;
  }

  private isAtEnd(): boolean {
    return this.position >= this.source.length;
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z]/.test(char);
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private skipWhitespace(): void {
    while (!this.isAtEnd() && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  private skipToNextStatement(): void {
    while (!this.isAtEnd() && this.peek() !== ';' && this.peek() !== '\n') {
      this.advance();
    }
    if (this.peek() === ';') {
      this.advance();
    }
  }

  private parseClassDeclaration(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    const modifiers: string[] = [];
    let visibility = 'public';
    
    // Parse modifiers (public, abstract, final, etc.)
    while (true) {
      const currentPos = this.position;
      
      if (this.matchKeyword('public')) {
        visibility = 'public';
        modifiers.push('public');
        this.skipWhitespace();
      } else if (this.matchKeyword('private')) {
        visibility = 'private';
        modifiers.push('private');
        this.skipWhitespace();
      } else if (this.matchKeyword('protected')) {
        visibility = 'protected';
        modifiers.push('protected');
        this.skipWhitespace();
      } else if (this.matchKeyword('abstract')) {
        modifiers.push('abstract');
        this.skipWhitespace();
      } else if (this.matchKeyword('final')) {
        modifiers.push('final');
        this.skipWhitespace();
      } else {
        // No more modifiers found
        break;
      }
    }
    
    // Parse 'class' keyword
    if (!this.matchKeyword('class')) {
      this.addError('Expected "class"');
      return { type: 'class_declaration', children: [], location: startLocation };
    }
    
    this.skipWhitespace();
    
    // Parse class name
    const className = this.parseIdentifier();
    this.currentClassName = className.value as string; // Track current class name for constructor detection
    this.skipWhitespace();
    
    // Parse inheritance (extends)
    let superClass: string | null = null;
    if (this.matchKeyword('extends')) {
      this.skipWhitespace();
      const superClassNode = this.parseIdentifier();
      superClass = superClassNode.value as string;
      this.skipWhitespace();
    }
    
    // Parse interfaces (implements)
    const interfaces: string[] = [];
    if (this.matchKeyword('implements')) {
      this.skipWhitespace();
      do {
        const interfaceNode = this.parseIdentifier();
        interfaces.push(interfaceNode.value as string);
        this.skipWhitespace();
        
        if (this.peek() === ',') {
          this.advance();
          this.skipWhitespace();
        } else {
          break;
        }
      } while (!this.isAtEnd());
    }
    
    // Parse class body
    const body = this.parseBlock();
    
    const heritage: string[] = [];
    if (superClass) {
      heritage.push(superClass);
    }
    heritage.push(...interfaces);
    
    return {
      type: 'class_declaration',
      children: [className, body],
      location: startLocation,
      metadata: {
        className: className.value,
        superClass,
        interfaces,
        heritage,
        visibility,
        modifiers
      }
    };
  }

  private parseSwitchStatement(): JavaASTNode {
    const startLocation = this.getCurrentLocation();
    
    // Parse 'switch' keyword
    if (!this.matchKeyword('switch')) {
      this.addError('Expected "switch"');
      return { type: 'switch_statement', children: [], location: startLocation };
    }
    
    this.skipWhitespace();
    
    // Parse '('
    if (this.peek() !== '(') {
      this.addError('Expected "(" after switch');
      return { type: 'switch_statement', children: [], location: startLocation };
    }
    this.advance();
    this.skipWhitespace();
    
    // Parse expression
    const expression = this.parseExpression();
    this.skipWhitespace();
    
    // Parse ')'
    if (this.peek() !== ')') {
      this.addError('Expected ")" after switch expression');
      return { type: 'switch_statement', children: [], location: startLocation };
    }
    this.advance();
    this.skipWhitespace();
    
    // Parse '{'
    if (this.peek() !== '{') {
      this.addError('Expected "{" after switch condition');
      return { type: 'switch_statement', children: [], location: startLocation };
    }
    this.advance();
    this.skipWhitespace();
    
    // Parse case statements
    const cases: JavaASTNode[] = [];
    let defaultCase: JavaASTNode | null = null;
    
    while (!this.isAtEnd() && this.peek() !== '}') {
      this.skipWhitespace();
      
      if (this.matchKeyword('case')) {
        this.skipWhitespace();
        
        // Capture the original case value text before parsing
        const caseValueStart = this.position;
        const caseValue = this.parseExpression();
        const caseValueEnd = this.position;
        const originalCaseValue = this.source.substring(caseValueStart, caseValueEnd).trim();
        
        this.skipWhitespace();
        
        if (this.peek() !== ':') {
          this.addError('Expected ":" after case value');
          break;
        }
        this.advance();
        this.skipWhitespace();
        
        // Parse case body - stop when we encounter another case, default, or closing brace
        const caseBody: JavaASTNode[] = [];
        let hasBreak = false;
        
        while (!this.isAtEnd() && this.peek() !== '}' && 
               !this.peekKeyword('case') && !this.peekKeyword('default')) {
          // Skip break statements as they don't translate to IGCSE pseudocode
          if (this.peekKeyword('break')) {
            this.matchKeyword('break'); // consume the break
            this.skipWhitespace();
            if (this.peek() === ';') {
              this.advance(); // consume semicolon
            }
            this.skipWhitespace();
            hasBreak = true;
            break; // Exit case body parsing
          }
          
          const stmt = this.parseStatement();
          if (stmt) {
            caseBody.push(stmt);
          }
          this.skipWhitespace();
        }
        
        // Add warning for fall-through behavior (missing break)
        if (!hasBreak && caseBody.length > 0) {
          this.addWarning(
            `Case '${originalCaseValue}' may fall through to next case (missing break statement)`,
            'FALL_THROUGH_WARNING'
          );
        }
        
        cases.push({
          type: 'case_statement',
          children: caseBody,
          location: this.getCurrentLocation(),
          metadata: {
            value: originalCaseValue || caseValue.value
          }
        });
      } else if (this.matchKeyword('default')) {
        this.skipWhitespace();
        
        if (this.peek() !== ':') {
          this.addError('Expected ":" after default');
          break;
        }
        this.advance();
        this.skipWhitespace();
        
        // Parse default body - stop when we encounter another case, default, or closing brace
        const defaultBody: JavaASTNode[] = [];
        while (!this.isAtEnd() && this.peek() !== '}' && 
               !this.peekKeyword('case') && !this.peekKeyword('default')) {
          // Skip break statements as they don't translate to IGCSE pseudocode
          if (this.peekKeyword('break')) {
            this.matchKeyword('break'); // consume the break
            this.skipWhitespace();
            if (this.peek() === ';') {
              this.advance(); // consume semicolon
            }
            this.skipWhitespace();
            break; // Exit default body parsing
          }
          
          const stmt = this.parseStatement();
          if (stmt) {
            defaultBody.push(stmt);
          }
          this.skipWhitespace();
        }
        
        defaultCase = {
          type: 'default_case',
          children: defaultBody,
          location: this.getCurrentLocation()
        };
      } else {
        // Skip unknown content
        this.advance();
      }
    }
    
    // Parse '}'
    if (this.peek() !== '}') {
      this.addError('Expected "}" to close switch statement');
    } else {
      this.advance();
    }
    
    const children = [...cases];
    if (defaultCase) {
      children.push(defaultCase);
    }
    
    return {
      type: 'switch_statement',
      children,
      location: startLocation,
      metadata: {
        expression: expression.value,
        cases: cases.map(c => c.metadata?.value),
        defaultCase: defaultCase ? true : false
      }
    };
  }

  private addError(message: string, code: string = 'PARSE_ERROR'): void {
    this.errors.push({
      message,
      line: this.line,
      column: this.column,
      code,
      severity: 'error'
    });
  }

  private addWarning(message: string, code: string): void {
    this.warnings.push({
      message,
      line: this.line,
      column: this.column,
      code,
      severity: 'warning'
    });
  }

  private getCurrentLocation(): SourceLocation {
    return { line: this.line, column: this.column };
  }

  private validateBasicSyntax(sourceCode: string): void {
    // Use ErrorHandler for comprehensive validation
    const { ErrorHandler } = require('../utils/error-handler');
    const validationResult = ErrorHandler.validateNestedStructure(sourceCode);
    
    // Convert validation errors to parser errors, but don't fail parsing
    validationResult.errors.forEach((error: any) => {
      this.addWarning(error.message, error.code);
    });
    
    // Add validation warnings as parser warnings
    validationResult.warnings.forEach((warning: any) => {
      this.addWarning(warning.message, warning.code);
    });

    // Check for common syntax issues (but treat as warnings for better recovery)
    const openBraces = (sourceCode.match(/\{/g) || []).length;
    const closeBraces = (sourceCode.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      this.addWarning(
        `Mismatched braces: ${openBraces} opening braces, ${closeBraces} closing braces. Parser will attempt recovery.`,
        'SYNTAX_WARNING'
      );
    }

    const openParens = (sourceCode.match(/\(/g) || []).length;
    const closeParens = (sourceCode.match(/\)/g) || []).length;
    
    if (openParens !== closeParens) {
      this.addWarning(
        `Mismatched parentheses: ${openParens} opening parentheses, ${closeParens} closing parentheses. Parser will attempt recovery.`,
        'SYNTAX_WARNING'
      );
    }

    // Check for unterminated strings (more precise check)
    const lines = sourceCode.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let inString = false;
      let escaped = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (escaped) {
          escaped = false;
          continue;
        }
        
        if (char === '\\') {
          escaped = true;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
        }
      }
      
      if (inString) {
        this.addError(`Unterminated string literal on line ${i + 1}`, 'SYNTAX_ERROR');
        break; // Only report the first one
      }
    }

    // Check for unsupported features and add warnings
    this.checkUnsupportedFeatures(sourceCode);
  }

  private checkUnsupportedFeatures(sourceCode: string): void {
    const unsupportedFeatures = [
      { pattern: /import\s+/, feature: 'import statements', suggestion: 'Remove import statements or add as comments' },
      { pattern: /package\s+/, feature: 'package declarations', suggestion: 'Remove package declarations or add as comments' },
      { pattern: /try\s*\{/, feature: 'try-catch blocks', suggestion: 'Convert to conditional error checking' },
      { pattern: /catch\s*\(/, feature: 'exception handling', suggestion: 'Use conditional statements for error handling' },
      { pattern: /throw\s+/, feature: 'throw statements', suggestion: 'Use return statements or error flags' },
      { pattern: /synchronized\s+/, feature: 'synchronized blocks', suggestion: 'Remove synchronization or add as comments' },
      { pattern: /volatile\s+/, feature: 'volatile keyword', suggestion: 'Remove volatile modifier' },
      { pattern: /transient\s+/, feature: 'transient keyword', suggestion: 'Remove transient modifier' },
      { pattern: /native\s+/, feature: 'native methods', suggestion: 'Convert to regular methods or add as comments' },
      { pattern: /abstract\s+/, feature: 'abstract classes/methods', suggestion: 'Convert to concrete implementations' },
      { pattern: /interface\s+/, feature: 'interfaces', suggestion: 'Convert to class with method signatures as comments' },
      { pattern: /enum\s+/, feature: 'enums', suggestion: 'Use constants or convert to class with static variables' },
      { pattern: /lambda|->/, feature: 'lambda expressions', suggestion: 'Convert to named methods' },
      { pattern: /Stream\s*</, feature: 'Java Streams', suggestion: 'Convert to traditional loops' },
      { pattern: /Optional\s*</, feature: 'Optional type', suggestion: 'Use null checks or boolean flags' },
      { pattern: /generic|<.*>/, feature: 'generics', suggestion: 'Remove generic type parameters' },
      { pattern: /annotation|@\w+/, feature: 'annotations', suggestion: 'Remove annotations or convert to comments' }
    ];

    for (const { pattern, feature, suggestion } of unsupportedFeatures) {
      if (pattern.test(sourceCode)) {
        this.addWarning(
          `Unsupported feature detected: ${feature}. ${suggestion}`,
          'UNSUPPORTED_FEATURE'
        );
      }
    }
  }

  private validateAST(ast: JavaASTNode): void {
    // Validate the generated AST for completeness and correctness
    this.traverseAST(ast, (node) => {
      // Check for incomplete nodes
      if (!node.type || node.type === 'unknown') {
        this.addError(
          `Incomplete AST node detected at line ${node.location?.line || 'unknown'}`,
          'AST_VALIDATION_ERROR'
        );
      }

      // Check for missing required children
      if (node.type === 'variable_declaration' && node.children.length < 2) {
        this.addError(
          `Incomplete variable declaration at line ${node.location?.line || 'unknown'}`,
          'AST_VALIDATION_ERROR'
        );
      }

      if (node.type === 'if_statement' && node.children.length < 2) {
        this.addError(
          `Incomplete if statement at line ${node.location?.line || 'unknown'}`,
          'AST_VALIDATION_ERROR'
        );
      }

      // Check for unsupported node types that slipped through
      const unsupportedTypes = ['lambda_expression', 'stream_operation', 'annotation'];
      if (unsupportedTypes.includes(node.type)) {
        this.addWarning(
          `Unsupported AST node type '${node.type}' at line ${node.location?.line || 'unknown'}`,
          'UNSUPPORTED_AST_NODE'
        );
      }
    });
  }

  private createDescriptiveErrorMessage(error: unknown): string {
    const { ErrorHandler } = require('../utils/error-handler');
    return ErrorHandler.createDescriptiveErrorMessage(error, this.source, this.position);
  }

  private getParsingContext(): { nearbyText?: string; expectedTokens?: string[] } {
    const contextLength = 20;
    const start = Math.max(0, this.position - contextLength);
    const end = Math.min(this.source.length, this.position + contextLength);
    const nearbyText = this.source.substring(start, end).trim();
    
    return {
      nearbyText: nearbyText.length > 0 ? nearbyText : undefined,
      expectedTokens: this.getExpectedTokens()
    };
  }

  private getExpectedTokens(): string[] {
    // Based on current parsing state, suggest what tokens might be expected
    const tokens: string[] = [];
    
    if (this.isAtEnd()) {
      tokens.push('end of input');
      return tokens;
    }

    const char = this.peek();
    
    if (char === '{') {
      tokens.push('statement', 'declaration');
    } else if (char === '}') {
      tokens.push('end of block');
    } else if (char === '(') {
      tokens.push('expression', 'parameter list');
    } else if (char === ')') {
      tokens.push('end of expression');
    } else if (char === ';') {
      tokens.push('end of statement');
    } else if (this.isAlpha(char)) {
      tokens.push('identifier', 'keyword');
    } else if (this.isDigit(char)) {
      tokens.push('number literal');
    } else if (char === '"') {
      tokens.push('string literal');
    }
    
    return tokens;
  }
}

export default JavaParser;