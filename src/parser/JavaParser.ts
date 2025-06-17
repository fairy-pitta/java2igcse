import { ASTNode, SourcePosition } from '../types/ast';

export class JavaParser {
  private tokens: string[] = [];
  private current = 0;
  private line = 1;
  private column = 1;

  parse(code: string): ASTNode {
    this.tokens = this.tokenize(code);
    this.current = 0;
    this.line = 1;
    this.column = 1;
    
    const statements: ASTNode[] = [];
    
    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
    }
    
    return {
      type: 'Program',
      children: statements,
      position: { line: 1, column: 1, offset: 0 }
    };
  }

  private tokenize(code: string): string[] {
    // 簡単なトークナイザー
    const tokens: string[] = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i]!;
      
      if (inString) {
        current += char;
        if (char === stringChar && code[i - 1] !== '\\') {
          tokens.push(current);
          current = '';
          inString = false;
        }
        continue;
      }
      
      // Handle comments
      if (char === '/' && i + 1 < code.length && code[i + 1] === '/') {
        // Skip to end of line
        while (i < code.length && code[i] !== '\n') {
          i++;
        }
        continue;
      }
      
      if (char === '"' || char === "'") {
        if (current) {
          tokens.push(current);
          current = '';
        }
        current = char;
        inString = true;
        stringChar = char;
        continue;
      }
      
      if (/\s/.test(char)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        continue;
      }
      
      if (/[;(){}\[\],]/.test(char)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(char!);
        continue;
      }
      
      // Handle dots (member access vs decimal point)
      if (char === '.') {
        // If current is a number and next is a digit, it's a decimal
        if (/\d/.test(current) && i + 1 < code.length && /\d/.test(code[i + 1]!)) {
          current += char;
          continue;
        }
        // Otherwise it's member access
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(char!);
        continue;
      }
      
      if (/[-+*/%=<>!&|]/.test(char!)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        
        // Handle multi-character operators
        let operator: string = char!;
        if (i + 1 < code.length) {
          const next = code[i + 1];
          if ((char === '=' && next === '=') ||
              (char === '!' && next === '=') ||
              (char === '<' && next === '=') ||
              (char === '>' && next === '=') ||
              (char === '&' && next === '&') ||
              (char === '|' && next === '|') ||
              (char === '+' && next === '+') ||
              (char === '-' && next === '-')) {
            operator += next;
            i++;
          }
        }
        tokens.push(operator);
        continue;
      }
      
      current += char;
    }
    
    if (current) {
      tokens.push(current);
    }
    
    return tokens.filter(token => token.trim().length > 0);
  }

  private parseStatement(): ASTNode | null {
    if (this.isAtEnd()) return null;
    
    const token = this.peek();
    
    // Control flow statements
    if (token === 'if') {
      return this.parseIfStatement();
    }
    
    if (token === 'for') {
      return this.parseForStatement();
    }
    
    if (token === 'while') {
      return this.parseWhileStatement();
    }
    
    if (token === 'do') {
      return this.parseDoWhileStatement();
    }
    
    if (token === 'switch') {
      return this.parseSwitchStatement();
    }
    
    if (token === 'break') {
      return this.parseBreakStatement();
    }
    
    if (token === 'continue') {
      return this.parseContinueStatement();
    }
    
    if (token === '{') {
      return this.parseBlockStatement();
    }
    
    // Variable declaration
    if (this.isType(token) || token === 'final' || token === 'static') {
      return this.parseVariableDeclaration();
    }
    
    // Method call or assignment
    if (this.isIdentifier(token)) {
      return this.parseExpressionStatement();
    }
    
    // Skip unknown tokens
    this.advance();
    return null;
  }

  private parseVariableDeclaration(): ASTNode {
    const position = this.getCurrentPosition();
    const modifiers: string[] = [];
    
    // Handle modifiers
    while (this.match('final', 'static', 'public', 'private', 'protected')) {
      modifiers.push(this.previous());
    }
    
    const dataType = this.advance();
    const name = this.advance();
    
    let initializer: ASTNode | undefined;
    
    if (this.match('=')) {
      initializer = this.parseExpression();
    }
    
    this.consume(';', 'Expected ";" after variable declaration');
    
    const result: ASTNode = {
      type: 'VariableDeclaration',
      name,
      dataType,
      position,
      value: { modifiers }
    };
    
    if (initializer) {
      result.initializer = initializer;
    }
    
    return result;
  }

  private parseForVariableDeclaration(): ASTNode {
    const position = this.getCurrentPosition();
    const modifiers: string[] = [];
    
    // Handle modifiers
    while (this.match('final', 'static', 'public', 'private', 'protected')) {
      modifiers.push(this.previous());
    }
    
    const dataType = this.advance();
    const name = this.advance();
    
    let initializer: ASTNode | undefined;
    
    if (this.match('=')) {
      initializer = this.parseExpression();
    }
    
    // Note: Don't consume ';' here - it will be handled by parseForStatement
    
    const result: ASTNode = {
      type: 'VariableDeclaration',
      name,
      dataType,
      position,
      value: { modifiers }
    };
    
    if (initializer) {
      result.initializer = initializer;
    }
    
    return result;
  }

  private parseExpressionStatement(): ASTNode {
    const expr = this.parseExpression();
    this.consume(';', 'Expected ";" after expression');
    return expr;
  }

  private parseExpression(): ASTNode {
    return this.parseAssignment();
  }

  private parseAssignment(): ASTNode {
    const expr = this.parseLogicalOr();
    
    if (this.match('=')) {
      const right = this.parseAssignment();
      return {
        type: 'Assignment',
        left: expr,
        right,
        position: this.getCurrentPosition()
      };
    }
    
    return expr;
  }

  private parseLogicalOr(): ASTNode {
    let expr = this.parseLogicalAnd();
    
    while (this.match('||')) {
      const operator = this.previous();
      const right = this.parseLogicalAnd();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator,
        right,
        position: this.getCurrentPosition()
      };
    }
    
    return expr;
  }

  private parseLogicalAnd(): ASTNode {
    let expr = this.parseEquality();
    
    while (this.match('&&')) {
      const operator = this.previous();
      const right = this.parseEquality();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator,
        right,
        position: this.getCurrentPosition()
      };
    }
    
    return expr;
  }

  private parseEquality(): ASTNode {
    let expr = this.parseComparison();
    
    while (this.match('==', '!=')) {
      const operator = this.previous();
      const right = this.parseComparison();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator,
        right,
        position: this.getCurrentPosition()
      };
    }
    
    return expr;
  }

  private parseComparison(): ASTNode {
    let expr = this.parseTerm();
    
    while (this.match('>', '>=', '<', '<=')) {
      const operator = this.previous();
      const right = this.parseTerm();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator,
        right,
        position: this.getCurrentPosition()
      };
    }
    
    return expr;
  }

  private parseTerm(): ASTNode {
    let expr = this.parseFactor();
    
    while (this.match('+', '-', '&')) {
      const operator = this.previous();
      const right = this.parseFactor();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator,
        right,
        position: this.getCurrentPosition()
      };
    }
    
    return expr;
  }

  private parseFactor(): ASTNode {
    let expr = this.parseUnary();
    
    while (this.match('*', '/', '%')) {
      const operator = this.previous();
      const right = this.parseUnary();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator,
        right,
        position: this.getCurrentPosition()
      };
    }
    
    return expr;
  }

  private parseUnary(): ASTNode {
    if (this.match('!', '-', '+')) {
      const operator = this.previous();
      const expr = this.parseUnary();
      return {
        type: 'UnaryExpression',
        operator,
        expression: expr,
        position: this.getCurrentPosition()
      };
    }
    
    return this.parseCall();
  }

  private parseCall(): ASTNode {
    let expr = this.parsePrimary();
    
    while (true) {
      if (this.match('(')) {
        expr = this.finishCall(expr);
      } else if (this.match('.')) {
        const name = this.consume('IDENTIFIER', 'Expected property name after "."');
        expr = {
          type: 'MemberExpression',
          object: expr,
          property: { type: 'Identifier', name },
          position: this.getCurrentPosition()
        };
      } else if (this.match('++', '--')) {
        const operator = this.previous();
        expr = {
          type: 'UpdateExpression',
          operator,
          argument: expr,
          prefix: false,
          position: this.getCurrentPosition()
        };
      } else {
        break;
      }
    }
    
    return expr;
  }

  private finishCall(callee: ASTNode): ASTNode {
    const args: ASTNode[] = [];
    
    if (!this.check(')')) {
      do {
        args.push(this.parseExpression());
      } while (this.match(','));
    }
    
    this.consume(')', 'Expected ")" after arguments');
    
    // Handle method calls
    let name = '';
    if (callee.type === 'MemberExpression') {
      name = this.getMemberExpressionName(callee);
    } else if (callee.type === 'Identifier') {
      name = callee.name || '';
    }
    
    return {
      type: 'MethodCall',
      name,
      children: args,
      position: this.getCurrentPosition()
    };
  }

  private getMemberExpressionName(expr: ASTNode): string {
    // Simplified member expression name extraction
    if (expr.type === 'MemberExpression') {
      const objectName = expr.object?.name || this.getMemberExpressionName(expr.object!);
      const propertyName = expr.property?.name || '';
      return `${objectName}.${propertyName}`;
    }
    return expr.name || '';
  }

  private parsePrimary(): ASTNode {
    if (this.match('true')) {
      return {
        type: 'Literal',
        value: true,
        position: this.getCurrentPosition()
      };
    }
    
    if (this.match('false')) {
      return {
        type: 'Literal',
        value: false,
        position: this.getCurrentPosition()
      };
    }
    
    if (this.isNumber(this.peek())) {
      const value = this.advance();
      return {
        type: 'Literal',
        value: this.parseNumber(value),
        position: this.getCurrentPosition()
      };
    }
    
    if (this.isString(this.peek())) {
      const value = this.advance();
      return {
        type: 'Literal',
        value: value.slice(1, -1), // Remove quotes
        position: this.getCurrentPosition()
      };
    }
    
    if (this.isIdentifier(this.peek())) {
      const name = this.advance();
      return {
        type: 'Identifier',
        name,
        position: this.getCurrentPosition()
      };
    }
    
    if (this.match('(')) {
      const expr = this.parseExpression();
      this.consume(')', 'Expected ")" after expression');
      return expr;
    }
    
    throw new Error(`Unexpected token: ${this.peek()}`);
  }

  private parseNumber(value: string): number {
    if (value.includes('.')) {
      return parseFloat(value);
    }
    return parseInt(value, 10);
  }

  // Helper methods
  private match(...types: string[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: string): boolean {
    if (this.isAtEnd()) return false;
    return this.peek() === type;
  }

  private advance(): string {
    if (!this.isAtEnd()) {
      this.current++;
      this.column++;
    }
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }

  private peek(): string {
    return this.tokens[this.current] || '';
  }

  private previous(): string {
    return this.tokens[this.current - 1] || '';
  }

  private consume(type: string, message: string): string {
    if (this.check(type)) return this.advance();
    if (type === 'IDENTIFIER' && this.isIdentifier(this.peek())) {
      return this.advance();
    }
    throw new Error(`${message}. Got: ${this.peek()}`);
  }

  private isType(token: string): boolean {
    return ['int', 'double', 'float', 'boolean', 'String', 'char', 'long', 'short', 'byte'].includes(token);
  }

  private isIdentifier(token: string): boolean {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(token);
  }

  private isNumber(token: string): boolean {
    return /^\d+(\.\d+)?$/.test(token);
  }

  private isString(token: string): boolean {
    return (token.startsWith('"') && token.endsWith('"')) ||
           (token.startsWith("'") && token.endsWith("'"));
  }

  private getCurrentPosition(): SourcePosition {
    return {
      line: this.line,
      column: this.column,
      offset: this.current
    };
  }

  private parseIfStatement(): ASTNode {
    const position = this.getCurrentPosition();
    this.consume('if', 'Expected "if"');
    this.consume('(', 'Expected "(" after "if"');
    const condition = this.parseExpression();
    this.consume(')', 'Expected ")" after if condition');
    
    const thenBranch = this.parseStatement();
    let elseBranch: ASTNode | undefined;
    
    if (this.match('else')) {
      elseBranch = this.parseStatement();
    }
    
    return {
      type: 'IfStatement',
      condition,
      thenBranch,
      elseBranch,
      position
    };
  }

  private parseForStatement(): ASTNode {
    const position = this.getCurrentPosition();
    this.consume('for', 'Expected "for"');
    this.consume('(', 'Expected "(" after "for"');
    
    // Check for enhanced for loop (for-each)
    const checkpoint = this.current;
    let isEnhancedFor = false;
    
    // Look ahead to see if this is an enhanced for loop
    let lookahead = 0;
    while (this.current + lookahead < this.tokens.length && this.tokens[this.current + lookahead] !== ')') {
      if (this.tokens[this.current + lookahead] === ':') {
        isEnhancedFor = true;
        break;
      }
      lookahead++;
    }
    
    if (isEnhancedFor) {
      // Enhanced for loop: for (Type var : iterable)
      const elementType = this.advance();
      const elementName = this.advance();
      this.consume(':', 'Expected ":" in enhanced for loop');
      const iterable = this.parseExpression();
      this.consume(')', 'Expected ")" after for clause');
      const body = this.parseStatement();
      
      return {
        type: 'EnhancedForStatement',
        elementType,
        elementName,
        iterable,
        body,
        position
      };
    } else {
      // Traditional for loop: for (init; condition; update)
      let init: ASTNode | null = null;
      if (!this.check(';')) {
        if (this.isType(this.peek())) {
          init = this.parseForVariableDeclaration();
        } else {
          init = this.parseExpression();
        }
        this.consume(';', 'Expected ";" after for loop initializer');
      } else {
        this.advance(); // consume ';'
      }
      
      let condition: ASTNode | null = null;
      if (!this.check(';')) {
        condition = this.parseExpression();
      }
      this.consume(';', 'Expected ";" after for loop condition');
      
      let update: ASTNode | null = null;
      if (!this.check(')')) {
        update = this.parseExpression();
      }
      this.consume(')', 'Expected ")" after for clause');
      
      const body = this.parseStatement();
      
      return {
        type: 'ForStatement',
        init,
        condition,
        update,
        body,
        position
      };
    }
  }

  private parseWhileStatement(): ASTNode {
    const position = this.getCurrentPosition();
    this.consume('while', 'Expected "while"');
    this.consume('(', 'Expected "(" after "while"');
    const condition = this.parseExpression();
    this.consume(')', 'Expected ")" after while condition');
    const body = this.parseStatement();
    
    return {
      type: 'WhileStatement',
      condition,
      body,
      position
    };
  }

  private parseDoWhileStatement(): ASTNode {
    const position = this.getCurrentPosition();
    this.consume('do', 'Expected "do"');
    const body = this.parseStatement();
    this.consume('while', 'Expected "while" after do body');
    this.consume('(', 'Expected "(" after "while"');
    const condition = this.parseExpression();
    this.consume(')', 'Expected ")" after while condition');
    this.consume(';', 'Expected ";" after do-while statement');
    
    return {
      type: 'DoWhileStatement',
      body,
      condition,
      position
    };
  }

  private parseSwitchStatement(): ASTNode {
    const position = this.getCurrentPosition();
    this.consume('switch', 'Expected "switch"');
    this.consume('(', 'Expected "(" after "switch"');
    const discriminant = this.parseExpression();
    this.consume(')', 'Expected ")" after switch expression');
    this.consume('{', 'Expected "{" before switch body');
    
    const cases: ASTNode[] = [];
    let defaultCase: ASTNode | undefined;
    
    while (!this.check('}') && !this.isAtEnd()) {
      if (this.match('case')) {
        const caseValue = this.parseExpression();
        this.consume(':', 'Expected ";" after case value');
        const statements: ASTNode[] = [];
        
        while (!this.check('case') && !this.check('default') && !this.check('}') && !this.isAtEnd()) {
          const stmt = this.parseStatement();
          if (stmt) statements.push(stmt);
        }
        
        cases.push({
          type: 'SwitchCase',
          test: caseValue,
          consequent: statements,
          position: this.getCurrentPosition()
        });
      } else if (this.match('default')) {
        this.consume(':', 'Expected ":" after "default"');
        const statements: ASTNode[] = [];
        
        while (!this.check('case') && !this.check('default') && !this.check('}') && !this.isAtEnd()) {
          const stmt = this.parseStatement();
          if (stmt) statements.push(stmt);
        }
        
        defaultCase = {
          type: 'SwitchCase',
          test: null,
          consequent: statements,
          position: this.getCurrentPosition()
        };
      } else {
        this.advance();
      }
    }
    
    this.consume('}', 'Expected "}" after switch body');
    
    return {
      type: 'SwitchStatement',
      discriminant,
      cases,
      defaultCase,
      position
    };
  }

  private parseBreakStatement(): ASTNode {
    const position = this.getCurrentPosition();
    this.consume('break', 'Expected "break"');
    this.consume(';', 'Expected ";" after "break"');
    
    return {
      type: 'BreakStatement',
      position
    };
  }

  private parseContinueStatement(): ASTNode {
    const position = this.getCurrentPosition();
    this.consume('continue', 'Expected "continue"');
    this.consume(';', 'Expected ";" after "continue"');
    
    return {
      type: 'ContinueStatement',
      position
    };
  }

  private parseBlockStatement(): ASTNode {
    const position = this.getCurrentPosition();
    this.consume('{', 'Expected "{"');
    
    const statements: ASTNode[] = [];
    while (!this.check('}') && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
    }
    
    this.consume('}', 'Expected "}"');
    
    return {
      type: 'BlockStatement',
      body: statements,
      position
    };
  }
}