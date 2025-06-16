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
      
      if (/[;(){}\[\],.]/.test(char)) {
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
              (char === '|' && next === '|')) {
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
}