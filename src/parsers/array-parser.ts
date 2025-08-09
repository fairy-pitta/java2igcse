// Enhanced Array Declaration Parser for Java to IGCSE conversion
import { JavaASTNode, SourceLocation } from '../index';
import { TypeConverter } from '../converters/type-converter';

export interface ArrayDeclarationInfo {
  name: string;
  baseType: string;
  dimensions: number[];
  initialization?: ArrayInitialization;
  igcseDeclaration: string;
  warnings: string[];
}

export interface ArrayInitialization {
  type: 'literal' | 'new' | 'empty';
  values?: any[];
  size?: number[];
}

export class ArrayParser {
  /**
   * Parse Java array declarations and convert to IGCSE format
   */
  static parseArrayDeclaration(node: JavaASTNode): ArrayDeclarationInfo | null {
    if (node.type !== 'variable_declaration') return null;
    if (node.children.length < 2) return null;

    const typeNode = node.children[0];
    const identifierNode = node.children[1];
    const initializationNode = node.children.length > 2 ? node.children[2] : null;

    if (!typeNode.metadata?.isArray) return null;

    const baseType = typeNode.value as string;
    const name = identifierNode.value as string;
    const dimensions = typeNode.metadata.arrayDimensions || [];

    let initialization: ArrayInitialization | undefined;
    const warnings: string[] = [];

    // Parse initialization if present
    if (initializationNode) {
      initialization = this.parseArrayInitialization(initializationNode, warnings);
    }

    // Generate IGCSE declaration
    const igcseDeclaration = this.generateIGCSEArrayDeclaration(
      name, 
      baseType, 
      dimensions, 
      initialization
    );

    return {
      name,
      baseType,
      dimensions,
      initialization,
      igcseDeclaration,
      warnings
    };
  }

  /**
   * Parse different types of array initialization
   */
  private static parseArrayInitialization(
    node: JavaASTNode, 
    warnings: string[]
  ): ArrayInitialization {
    // Handle literal array initialization: {1, 2, 3}
    if (this.isArrayLiteralInitialization(node)) {
      return this.parseArrayLiteralInitialization(node, warnings);
    }

    // Handle new array initialization: new int[5]
    if (this.isNewArrayInitialization(node)) {
      return this.parseNewArrayInitialization(node, warnings);
    }

    // Default to empty initialization
    warnings.push('Unknown array initialization pattern - treating as empty');
    return { type: 'empty' };
  }

  /**
   * Check if node represents array literal initialization
   */
  private static isArrayLiteralInitialization(node: JavaASTNode): boolean {
    // This would check for patterns like {1, 2, 3}
    // For now, we'll implement a basic check
    return node.type === 'array_literal' || 
           (node.type === 'literal' && node.value?.toString().startsWith('{'));
  }

  /**
   * Check if node represents new array initialization
   */
  private static isNewArrayInitialization(node: JavaASTNode): boolean {
    // This would check for patterns like new int[5]
    return node.type === 'new_expression' || 
           (node.type === 'expression' && node.value?.toString().includes('new'));
  }

  /**
   * Parse array literal initialization {1, 2, 3}
   */
  private static parseArrayLiteralInitialization(
    node: JavaASTNode, 
    warnings: string[]
  ): ArrayInitialization {
    const values: any[] = [];
    
    // Extract values from the literal
    if (node.value && typeof node.value === 'string') {
      const literalStr = node.value.toString();
      if (literalStr.startsWith('{') && literalStr.endsWith('}')) {
        const content = literalStr.slice(1, -1).trim();
        if (content) {
          values.push(...content.split(',').map(v => v.trim()));
        }
      }
    }

    return {
      type: 'literal',
      values
    };
  }

  /**
   * Parse new array initialization new int[5]
   */
  private static parseNewArrayInitialization(
    node: JavaASTNode, 
    warnings: string[]
  ): ArrayInitialization {
    const size: number[] = [];
    
    // Extract size information from new expression
    if (node.value && typeof node.value === 'string') {
      const newExpr = node.value.toString();
      const sizeMatch = newExpr.match(/\[(\d+)\]/g);
      if (sizeMatch) {
        size.push(...sizeMatch.map(match => parseInt(match.slice(1, -1))));
      }
    }

    return {
      type: 'new',
      size
    };
  }

  /**
   * Generate IGCSE array declaration with initialization
   */
  private static generateIGCSEArrayDeclaration(
    name: string,
    baseType: string,
    dimensions: number[],
    initialization?: ArrayInitialization
  ): string {
    // Convert base type to IGCSE
    const typeResult = TypeConverter.convertJavaType(baseType, true, dimensions);
    const arrayType = TypeConverter.generateIGCSEArrayDeclaration(
      typeResult.igcseType, 
      dimensions
    );

    let declaration = `DECLARE ${name} : ${arrayType}`;

    // Add initialization if present
    if (initialization) {
      declaration += '\n' + this.generateIGCSEArrayInitialization(
        name, 
        initialization, 
        typeResult.igcseType
      );
    }

    return declaration;
  }

  /**
   * Generate IGCSE array initialization statements
   */
  private static generateIGCSEArrayInitialization(
    name: string,
    initialization: ArrayInitialization,
    igcseType: string
  ): string {
    switch (initialization.type) {
      case 'literal':
        return this.generateLiteralInitialization(name, initialization, igcseType);
      
      case 'new':
        return this.generateNewInitialization(name, initialization);
      
      default:
        return `// ${name} initialized as empty array`;
    }
  }

  /**
   * Generate IGCSE code for literal array initialization
   */
  private static generateLiteralInitialization(
    name: string,
    initialization: ArrayInitialization,
    igcseType: string
  ): string {
    if (!initialization.values || initialization.values.length === 0) {
      return `// ${name} initialized as empty array`;
    }

    const assignments: string[] = [];
    initialization.values.forEach((value, index) => {
      const convertedValue = TypeConverter.convertLiteralValue(
        value.toString(), 
        igcseType
      );
      assignments.push(`${name}[${index + 1}] ← ${convertedValue}`);
    });

    return assignments.join('\n');
  }

  /**
   * Generate IGCSE code for new array initialization
   */
  private static generateNewInitialization(
    name: string,
    initialization: ArrayInitialization
  ): string {
    if (initialization.size && initialization.size.length > 0) {
      return `// ${name} initialized with size ${initialization.size.join('×')}`;
    }
    return `// ${name} initialized as new array`;
  }

  /**
   * Parse common Java array patterns
   */
  static parseCommonArrayPatterns(javaCode: string): {
    pattern: string;
    igcseEquivalent: string;
    explanation: string;
  }[] {
    const patterns = [
      {
        pattern: 'int[] arr = new int[5];',
        igcseEquivalent: 'DECLARE arr : ARRAY[1:5] OF INTEGER',
        explanation: 'Creates an integer array with 5 elements'
      },
      {
        pattern: 'String[] names = {"Alice", "Bob"};',
        igcseEquivalent: 'DECLARE names : ARRAY[1:n] OF STRING\nnames[1] ← "Alice"\nnames[2] ← "Bob"',
        explanation: 'Creates and initializes a string array with literal values'
      },
      {
        pattern: 'int[][] matrix = new int[3][4];',
        igcseEquivalent: 'DECLARE matrix : ARRAY[1:3] OF ARRAY[1:4] OF INTEGER',
        explanation: 'Creates a 2D integer array (3×4 matrix)'
      },
      {
        pattern: 'boolean[] flags = {true, false, true};',
        igcseEquivalent: 'DECLARE flags : ARRAY[1:n] OF BOOLEAN\nflags[1] ← TRUE\nflags[2] ← FALSE\nflags[3] ← TRUE',
        explanation: 'Creates and initializes a boolean array'
      }
    ];

    return patterns.filter(p => javaCode.includes(p.pattern.split(' ')[0]));
  }
}

// ArrayParser is already exported above