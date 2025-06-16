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
    // For now, we'll handle hints in a simple way
    // In a real implementation, this would be passed through the context
    if (hint.integerDivision) {
      javaCode = javaCode.replace(/\/(?=.*integer division)/g, ' DIV ');
    }
    return this.convert(javaCode);
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
        case 'MethodCall':
          return this.convertMethodCall(n, ctx);
        case 'Literal':
          return this.convertLiteral(n, ctx);
        case 'Identifier':
          return this.convertIdentifier(n, ctx);
        case 'Program':
        case 'Block':
          return this.convertBlock(n, ctx);
        default:
          throw new ConversionError(`Unsupported node type: ${n.type}`, n, ctx);
      }
    });
    return result;
  }

  private convertVariableDeclaration(node: ASTNode, context: ConversionContext): string[] {
    const dataType = this.mapJavaTypeToIGCSE(node.dataType || 'int');
    const name = node.name || 'unknown';
    const isFinal = node.value?.modifiers?.includes('final') || node.value?.modifiers?.includes('static final');
    
    if (isFinal && node.initializer) {
      const value = this.convertNode(node.initializer, context);
      return [`CONSTANT ${name} = ${value.join(' ')}`];
    }
    
    const result = [`DECLARE ${name} : ${dataType}`];
    
    if (node.initializer) {
      const value = this.convertNode(node.initializer, context);
      result.push(`${name} ← ${value.join(' ')}`);
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
    const operator = this.mapOperator(node.operator!);
    return [`${left.join(' ')} ${operator} ${right.join(' ')}`];
  }

  private convertUnaryExpression(node: ASTNode, context: ConversionContext): string[] {
    const operand = this.convertNode(node.expression!, context);
    const operator = this.mapUnaryOperator(node.operator!);
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
    const statements = node.children || [];
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
}