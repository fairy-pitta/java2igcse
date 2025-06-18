import { ASTNode, ConversionContext, ConversionError, ConverterConfig } from '../types/ast';
import { RecursionGuard } from './RecursionGuard';
import { JavaParser } from '../parser/JavaParser';
import { PseudocodeFormatter } from '../formatter/PseudocodeFormatter';

export interface ConversionHint {
  integerDivision?: boolean;
}

export class JavaToPseudocodeConverter {
  private parser: JavaParser;
  private formatter: PseudocodeFormatter;
  private config: ConverterConfig;

  constructor(config?: Partial<ConverterConfig>) {
    this.config = {
      maxDepth: 50,
      indentSize: 3,
      debugMode: false,
      strictMode: true,
      ...config
    };
    this.parser = new JavaParser();
    this.formatter = new PseudocodeFormatter(this.config);
  }

  convert(javaCode: string): string {
    try {
      const ast = this.parser.parse(javaCode);
      const context = this.createContext();
      const pseudocode = this.convertNode(ast, context);
      return this.formatter.format(pseudocode);
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }
      throw new Error(`Conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  convertWithHint(javaCode: string, hint: ConversionHint): string {
    try {
      const ast = this.parser.parse(javaCode);
      const context = this.createContext();
      
      // Apply hints to context
      if (hint.integerDivision) {
        context.integerDivision = true;
      }
      
      const pseudocode = this.convertNode(ast, context);
      return this.formatter.format(pseudocode);
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }
      throw new Error(`Conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createContext(): ConversionContext {
    return {
      depth: 0,
      maxDepth: this.config.maxDepth,
      visitedNodes: new Set(),
      parentChain: [],
      indentLevel: 0,
      currentScope: 'global'
    };
  }

  private convertNode(node: ASTNode, context: ConversionContext): string[] {
    const result = RecursionGuard.convert(node, context, (n, ctx) => {
      switch (n.type) {
        case 'VariableDeclaration':
          return this.convertVariableDeclaration(n, ctx);
        case 'Assignment':
          return this.convertAssignment(n, ctx);
        case 'BinaryExpression':
          return this.convertBinaryExpression(n, ctx);
        case 'UnaryExpression':
          return this.convertUnaryExpression(n, ctx);
        case 'UpdateExpression':
          return this.convertUpdateExpression(n, ctx);
        case 'MethodCall':
          return this.convertMethodCall(n, ctx);
        case 'Literal':
          return this.convertLiteral(n, ctx);
        case 'Identifier':
          return this.convertIdentifier(n, ctx);
        case 'Program':
        case 'Block':
        case 'BlockStatement':
          return this.convertBlock(n, ctx);
        case 'IfStatement':
          return this.convertIfStatement(n, ctx);
        case 'ForStatement':
          return this.convertForStatement(n, ctx);
        case 'EnhancedForStatement':
          return this.convertEnhancedForStatement(n, ctx);
        case 'WhileStatement':
          return this.convertWhileStatement(n, ctx);
        case 'DoWhileStatement':
          return this.convertDoWhileStatement(n, ctx);
        case 'SwitchStatement':
          return this.convertSwitchStatement(n, ctx);
        case 'BreakStatement':
          return this.convertBreakStatement(n, ctx);
        case 'ContinueStatement':
          return this.convertContinueStatement(n, ctx);
        default:
          throw new ConversionError(`Unsupported node type: ${n.type}`, n, ctx);
      }
    });
    return result;
  }

  private convertVariableDeclaration(node: ASTNode, context: ConversionContext): string[] {
    const dataType = this.mapJavaTypeToIGCSE(node.dataType || 'int');
    const name = node.name || 'unknown';
    const modifiers = node.value?.modifiers || [];
    const isFinal = modifiers.includes('final') || modifiers.includes('static');
    
    if (isFinal && node.initializer) {
      const value = this.convertNode(node.initializer, context);
      return [`CONSTANT ${name} = ${value.join(' ')}`];
    }
    
    const result = [`DECLARE ${name} : ${dataType}`];
    
    if (node.initializer) {
      // Check if it's a Scanner input method
      if (node.initializer.type === 'MethodCall' && 
          (node.initializer.name?.includes('nextInt') || 
           node.initializer.name?.includes('nextLine') || 
           node.initializer.name?.includes('next'))) {
        result.push(`INPUT ${name}`);
      } else {
        const value = this.convertNode(node.initializer, context);
        result.push(`${name} ← ${value.join(' ')}`);
      }
    }
    
    return result;
  }

  private convertAssignment(node: ASTNode, context: ConversionContext): string[] {
    const left = this.convertNode(node.left!, context);
    const right = this.convertNode(node.right!, context);
    return [`${left.join(' ')} ← ${right.join(' ')}`];
  }

  private convertBinaryExpression(node: ASTNode, context: ConversionContext): string[] {
    const left = this.convertNode(node.left!, context);
    const right = this.convertNode(node.right!, context);
    let operator = this.mapOperator(node.operator!);
    
    // Handle string concatenation: convert + to & when dealing with strings
    if (node.operator === '+' && this.isStringConcatenation(node.left!, node.right!)) {
      operator = '&';
    }
    
    // Handle integer division hint
    if (node.operator === '/' && context.integerDivision) {
      operator = 'DIV';
    }
    
    return [`${left.join(' ')} ${operator} ${right.join(' ')}`];
  }

  private convertUnaryExpression(node: ASTNode, context: ConversionContext): string[] {
    const operand = this.convertNode(node.expression!, context);
    const operator = this.mapUnaryOperator(node.operator!);
    
    // Handle negative numbers without space
    if (operator === '-' && operand.length === 1 && !isNaN(Number(operand[0]))) {
      return [`-${operand[0]}`];
    }
    
    return [`${operator} ${operand.join(' ')}`];
  }

  private convertMethodCall(node: ASTNode, context: ConversionContext): string[] {
    const methodName = node.name || '';
    
    // Handle System.out.println and System.out.print
    if (methodName.includes('println') || methodName.includes('print')) {
      const args = node.children || [];
      if (args.length > 0 && args[0]) {
        const argument = this.convertNode(args[0], context);
        return [`OUTPUT ${argument.join(' ')}`];
      }
      return ['OUTPUT'];
    }
    
    // Handle Scanner input methods
    if (methodName.includes('nextInt') || methodName.includes('nextLine') || methodName.includes('next')) {
      return ['INPUT']; // This will be handled by the assignment context
    }
    
    // Generic method call
    const args = (node.children || []).map(arg => this.convertNode(arg, context).join(' ')).join(', ');
    return [`${methodName}(${args})`];
  }

  private convertLiteral(node: ASTNode, _context: ConversionContext): string[] {
    const value = node.value;
    
    if (typeof value === 'string') {
      return [`"${value}"`];
    }
    
    if (typeof value === 'boolean') {
      return [value ? 'TRUE' : 'FALSE'];
    }
    
    return [String(value)];
  }

  private convertIdentifier(node: ASTNode, _context: ConversionContext): string[] {
    return [node.name || node.value || 'unknown'];
  }

  private convertBlock(node: ASTNode, context: ConversionContext): string[] {
    const statementsRaw = node.children || node.body || [];
    const statements = Array.isArray(statementsRaw) ? statementsRaw : [statementsRaw];
    const results: string[] = [];
    
    for (const stmt of statements) {
      const converted = this.convertNode(stmt, context);
      results.push(...converted);
    }
    
    return results.filter(line => line.trim().length > 0);
  }

  private mapJavaTypeToIGCSE(javaType: string): string {
    const typeMap: Record<string, string> = {
      'int': 'INTEGER',
      'integer': 'INTEGER',
      'long': 'INTEGER',
      'short': 'INTEGER',
      'byte': 'INTEGER',
      'double': 'REAL',
      'float': 'REAL',
      'boolean': 'BOOLEAN',
      'string': 'STRING',
      'String': 'STRING',
      'char': 'CHAR',
      'Character': 'CHAR'
    };
    
    return typeMap[javaType.toLowerCase()] || 'STRING';
  }

  private mapOperator(operator: string): string {
    const operatorMap: Record<string, string> = {
      '+': '+',
      '-': '-',
      '*': '*',
      '/': '/',
      '%': 'MOD',
      '==': '=',
      '!=': '≠',
      '<': '<',
      '>': '>',
      '<=': '≤',
      '>=': '≥',
      '&&': 'AND',
      '||': 'OR',
      '&': '&'  // String concatenation
    };
    
    return operatorMap[operator] || operator;
  }

  private mapUnaryOperator(operator: string): string {
    const operatorMap: Record<string, string> = {
      '!': 'NOT',
      '-': '-',
      '+': '+'
    };
    
    return operatorMap[operator] || operator;
  }

  private isStringConcatenation(left: ASTNode, right: ASTNode): boolean {
    // Check if either operand is a string literal
    if (left.type === 'Literal' && typeof left.value === 'string') {
      return true;
    }
    if (right.type === 'Literal' && typeof right.value === 'string') {
      return true;
    }
    
    // Check if either operand is a string variable (this is a simplified check)
    // In a real implementation, we'd need type information
    if (left.type === 'Identifier' && (left.name?.toLowerCase().includes('name') || left.name?.toLowerCase().includes('message') || left.name?.toLowerCase().includes('str'))) {
      return true;
    }
    if (right.type === 'Identifier' && (right.name?.toLowerCase().includes('name') || right.name?.toLowerCase().includes('message') || right.name?.toLowerCase().includes('str'))) {
      return true;
    }
    
    return false;
  }

  private convertIfStatement(node: ASTNode, context: ConversionContext): string[] {
    const condition = this.convertNode(node.condition!, context);
    const result = [`IF ${condition.join(' ')} THEN`];
    
    const thenBranch = this.convertNode(node.thenBranch!, { ...context, indentLevel: context.indentLevel + 1 });
    result.push(...thenBranch.map(line => `   ${line}`));
    
    if (node.elseBranch) {
      if (node.elseBranch.type === 'IfStatement') {
        // Handle else if
        const elseIfResult = this.convertIfStatement(node.elseBranch, context);
        result.push(`ELSE IF ${elseIfResult[0]?.substring(3) || ''}`); // Remove 'IF ' prefix and add 'ELSE IF'
        result.push(...elseIfResult.slice(1, -1)); // Skip first and last lines
      } else {
        result.push('ELSE');
        const elseBranch = this.convertNode(node.elseBranch, { ...context, indentLevel: context.indentLevel + 1 });
        result.push(...elseBranch.map(line => `   ${line}`));
      }
    }
    
    result.push('ENDIF');
    return result;
  }

  private convertForStatement(node: ASTNode, context: ConversionContext): string[] {
    // Traditional for loop: for (init; condition; update)
    const result: string[] = [];
    
    if (node.init) {
      // Handle initialization
      if (node.init.type === 'VariableDeclaration') {
        const varName = node.init.name;
        const initValue = node.init.initializer ? this.convertNode(node.init.initializer, context) : ['0'];
        
        // Extract end value from condition
        let endValue = '10'; // default
        let step = '1'; // default
        
        if (node.condition && node.condition.type === 'BinaryExpression') {
          const rightSide = this.convertNode(node.condition.right!, context);
          if (node.condition.operator === '<') {
            endValue = `${parseInt(rightSide.join(' ')) - 1}`;
          } else if (node.condition.operator === '<=') {
            endValue = rightSide.join(' ');
          } else if (node.condition.operator === '>') {
            endValue = `${parseInt(rightSide.join(' ')) + 1}`;
            step = '-1';
          } else if (node.condition.operator === '>=') {
            endValue = rightSide.join(' ');
            step = '-1';
          }
        }
        
        // Extract step from update
        if (node.update && node.update.type === 'UnaryExpression') {
          if (node.update.operator === '++') {
            step = '1';
          } else if (node.update.operator === '--') {
            step = '-1';
          }
        } else if (node.update && node.update.type === 'Assignment' && node.update.operator === '+=') {
          const stepValue = this.convertNode(node.update.right!, context);
          step = stepValue.join(' ');
        }
        
        if (step === '1') {
          result.push(`FOR ${varName} ← ${initValue.join(' ')} TO ${endValue}`);
        } else {
          result.push(`FOR ${varName} ← ${initValue.join(' ')} TO ${endValue} STEP ${step}`);
        }
      }
    }
    
    const bodyNode = node.body!;
    let body: string[];
    if (Array.isArray(bodyNode)) {
      body = bodyNode.flatMap(stmt => this.convertNode(stmt, { ...context, indentLevel: context.indentLevel + 1 }));
    } else {
      body = this.convertNode(bodyNode, { ...context, indentLevel: context.indentLevel + 1 });
    }
    result.push(...body.map(line => `   ${line}`));
    result.push('ENDFOR');
    
    return result;
  }

  private convertEnhancedForStatement(node: ASTNode, context: ConversionContext): string[] {
    const elementName = node.elementName;
    const iterable = this.convertNode(node.iterable!, context);
    const result = [`FOR EACH ${elementName} IN ${iterable.join(' ')}`];
    
    const bodyNode = node.body!;
    let body: string[];
    if (Array.isArray(bodyNode)) {
      body = bodyNode.flatMap(stmt => this.convertNode(stmt, { ...context, indentLevel: context.indentLevel + 1 }));
    } else {
      body = this.convertNode(bodyNode, { ...context, indentLevel: context.indentLevel + 1 });
    }
    result.push(...body.map(line => `   ${line}`));
    result.push('ENDFOR');
    
    return result;
  }

  private convertWhileStatement(node: ASTNode, context: ConversionContext): string[] {
    const condition = this.convertNode(node.condition!, context);
    const result = [`WHILE ${condition.join(' ')}`];
    
    const bodyNode = node.body!;
    let body: string[];
    if (Array.isArray(bodyNode)) {
      body = bodyNode.flatMap(stmt => this.convertNode(stmt, { ...context, indentLevel: context.indentLevel + 1 }));
    } else {
      body = this.convertNode(bodyNode, { ...context, indentLevel: context.indentLevel + 1 });
    }
    result.push(...body.map(line => `   ${line}`));
    result.push('ENDWHILE');
    
    return result;
  }

  private convertDoWhileStatement(node: ASTNode, context: ConversionContext): string[] {
    const result = ['REPEAT'];
    
    const bodyNode = node.body!;
    let body: string[];
    if (Array.isArray(bodyNode)) {
      body = bodyNode.flatMap(stmt => this.convertNode(stmt, { ...context, indentLevel: context.indentLevel + 1 }));
    } else {
      body = this.convertNode(bodyNode, { ...context, indentLevel: context.indentLevel + 1 });
    }
    result.push(...body.map(line => `   ${line}`));
    
    // Convert condition to UNTIL (negate the condition)
    const condition = this.convertNode(node.condition!, context);
    const negatedCondition = this.negateCondition(condition.join(' '));
    result.push(`UNTIL ${negatedCondition}`);
    
    return result;
  }

  private convertSwitchStatement(node: ASTNode, context: ConversionContext): string[] {
    const discriminant = this.convertNode(node.discriminant!, context);
    const result = [`CASE OF ${discriminant.join(' ')}`];
    
    // Process cases
    for (const caseNode of node.cases || []) {
      const testValue = this.convertNode(caseNode.test!, context);
      const consequent = caseNode.consequent || [];
      const statements = Array.isArray(consequent) ? consequent : [consequent];
      
      // Filter out break statements and convert other statements
      const caseBody = statements
        .filter((stmt: ASTNode) => stmt.type !== 'BreakStatement')
        .map((stmt: ASTNode) => this.convertNode(stmt, context))
        .flat();
      
      if (caseBody.length > 0) {
        result.push(`   ${testValue.join(' ')}: ${caseBody.join('; ')}`);
      } else {
        result.push(`   ${testValue.join(' ')}: `);
      }
    }
    
    // Process default case
    if (node.defaultCase) {
      const consequent = node.defaultCase.consequent || [];
      const statements = Array.isArray(consequent) ? consequent : [consequent];
      const defaultBody = statements
        .filter((stmt: ASTNode) => stmt.type !== 'BreakStatement')
        .map((stmt: ASTNode) => this.convertNode(stmt, context))
        .flat();
      
      if (defaultBody.length > 0) {
        result.push(`   OTHERWISE: ${defaultBody.join('; ')}`);
      } else {
        result.push(`   OTHERWISE: `);
      }
    }
    
    result.push('ENDCASE');
    return result;
  }

  private convertBreakStatement(_node: ASTNode, _context: ConversionContext): string[] {
    return ['EXIT FOR'];
  }

  private convertContinueStatement(_node: ASTNode, _context: ConversionContext): string[] {
    return ['NEXT FOR'];
  }

  private negateCondition(condition: string): string {
    // Simple negation logic
    if (condition.includes(' < ')) {
      return condition.replace(' < ', ' ≥ ');
    }
    if (condition.includes(' > ')) {
      return condition.replace(' > ', ' ≤ ');
    }
    if (condition.includes(' ≤ ')) {
      return condition.replace(' ≤ ', ' > ');
    }
    if (condition.includes(' ≥ ')) {
      return condition.replace(' ≥ ', ' < ');
    }
    if (condition.includes(' = ')) {
      return condition.replace(' = ', ' ≠ ');
    }
    if (condition.includes(' ≠ ')) {
      return condition.replace(' ≠ ', ' = ');
    }
    if (condition.includes(' AND ')) {
      return condition.replace(' AND ', ' OR ');
    }
    if (condition.includes(' OR ')) {
      return condition.replace(' OR ', ' AND ');
    }
    
    return `NOT (${condition})`;
  }

  private convertUpdateExpression(node: ASTNode, context: ConversionContext): string[] {
    const argument = this.convertNode(node.argument!, context);
    const variable = argument.join(' ');
    
    if (node.operator === '++') {
      return [`${variable} ← ${variable} + 1`];
    } else if (node.operator === '--') {
      return [`${variable} ← ${variable} - 1`];
    }
    
    return [`${variable} ${node.operator}`];
  }
}