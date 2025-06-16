import { ConverterConfig } from '../types/ast';

export class PseudocodeFormatter {
  private indentLevel = 0;
  private readonly indentSize: number;

  constructor(config?: ConverterConfig) {
    this.indentSize = config?.indentSize || 2;
  }

  format(pseudocode: string[]): string {
    return pseudocode
      .map(line => this.formatLine(line))
      .join('\n')
      .trim();
  }

  private formatLine(line: string): string {
    const trimmed = line.trim();
    
    // Handle indentation changes
    if (this.shouldDecreaseIndent(trimmed)) {
      this.indentLevel = Math.max(0, this.indentLevel - 1);
    }
    
    const formatted = this.getIndent() + trimmed;
    
    if (this.shouldIncreaseIndent(trimmed)) {
      this.indentLevel++;
    }
    
    return formatted;
  }

  private shouldIncreaseIndent(line: string): boolean {
    const keywords = [
      'IF', 'ELSE', 'ELSEIF', 'WHILE', 'FOR', 'REPEAT',
      'PROCEDURE', 'FUNCTION', 'CASE'
    ];
    
    return keywords.some(keyword => 
      line.startsWith(keyword + ' ') || line === keyword
    );
  }

  private shouldDecreaseIndent(line: string): boolean {
    const keywords = [
      'ENDIF', 'ELSE', 'ELSEIF', 'ENDWHILE', 'NEXT', 'UNTIL',
      'ENDPROCEDURE', 'ENDFUNCTION', 'ENDCASE'
    ];
    
    return keywords.some(keyword => 
      line.startsWith(keyword) || line === keyword
    );
  }

  private getIndent(): string {
    return ' '.repeat(this.indentLevel * this.indentSize);
  }

  reset(): void {
    this.indentLevel = 0;
  }

  // Utility methods for specific formatting
  formatVariableDeclaration(name: string, type: string, value?: string): string {
    if (value !== undefined) {
      return `DECLARE ${name} : ${this.mapJavaTypeToPseudocode(type)} ← ${value}`;
    }
    return `DECLARE ${name} : ${this.mapJavaTypeToPseudocode(type)}`;
  }

  formatAssignment(variable: string, value: string): string {
    return `${variable} ← ${value}`;
  }

  formatMethodCall(name: string, args: string[]): string {
    if (name === 'System.out.println') {
      return `OUTPUT ${args.join(', ')}`;
    }
    if (name === 'System.out.print') {
      return `OUTPUT ${args.join(', ')}`;
    }
    if (name.includes('Scanner') && name.includes('next')) {
      return `INPUT ${args.join(', ')}`;
    }
    
    return `${name}(${args.join(', ')})`;
  }

  formatBinaryExpression(left: string, operator: string, right: string): string {
    const pseudoOperator = this.mapOperatorToPseudocode(operator);
    return `${left} ${pseudoOperator} ${right}`;
  }

  formatUnaryExpression(operator: string, expression: string): string {
    const pseudoOperator = this.mapOperatorToPseudocode(operator);
    return `${pseudoOperator}${expression}`;
  }

  private mapJavaTypeToPseudocode(javaType: string): string {
    const typeMap: { [key: string]: string } = {
      'int': 'INTEGER',
      'double': 'REAL',
      'float': 'REAL',
      'boolean': 'BOOLEAN',
      'String': 'STRING',
      'char': 'CHAR',
      'long': 'INTEGER',
      'short': 'INTEGER',
      'byte': 'INTEGER'
    };
    
    return typeMap[javaType] || javaType.toUpperCase();
  }

  private mapOperatorToPseudocode(operator: string): string {
    const operatorMap: { [key: string]: string } = {
      '==': '=',
      '!=': '<>',
      '&&': 'AND',
      '||': 'OR',
      '!': 'NOT ',
      '&': '&', // String concatenation
      '+': '+',
      '-': '-',
      '*': '*',
      '/': '/',
      '%': 'MOD',
      '<': '<',
      '>': '>',
      '<=': '<=',
      '>=': '>='
    };
    
    return operatorMap[operator] || operator;
  }

  formatLiteral(value: any): string {
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }
    return String(value);
  }

  formatConstant(name: string, _type: string, value: string): string {
    return `CONSTANT ${name} = ${value}`;
  }
}