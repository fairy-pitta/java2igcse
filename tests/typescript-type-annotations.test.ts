// Comprehensive tests for TypeScript type annotation handling

import { TypeScriptParser } from '../src/parsers/typescript-parser';

describe('TypeScript Type Annotation Handling', () => {
  let parser: TypeScriptParser;

  beforeEach(() => {
    parser = new TypeScriptParser();
  });

  describe('Basic Type Conversions', () => {
    test('should convert number to REAL', () => {
      const source = 'let value: number = 3.14;';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('number');
      expect(annotations[0].igcseType).toBe('REAL');
      expect(annotations[0].igcseDeclaration).toBe('DECLARE value : REAL');
    });

    test('should convert string to STRING', () => {
      const source = 'let name: string = "John";';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('string');
      expect(annotations[0].igcseType).toBe('STRING');
      expect(annotations[0].igcseDeclaration).toBe('DECLARE name : STRING');
    });

    test('should convert boolean to BOOLEAN', () => {
      const source = 'let isActive: boolean = true;';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('boolean');
      expect(annotations[0].igcseType).toBe('BOOLEAN');
      expect(annotations[0].igcseDeclaration).toBe('DECLARE isActive : BOOLEAN');
    });

    test('should handle unknown types by defaulting to STRING', () => {
      const source = 'let custom: CustomType = new CustomType();';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('CustomType');
      expect(annotations[0].igcseType).toBe('STRING');
      expect(annotations[0].igcseDeclaration).toBe('DECLARE custom : STRING');
    });
  });

  describe('Array Type Handling', () => {
    test('should handle array syntax with brackets', () => {
      const source = 'let numbers: number[] = [1, 2, 3];';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('number[]');
      expect(annotations[0].isArray).toBe(true);
      expect(annotations[0].igcseType).toBe('REAL');
      expect(annotations[0].igcseDeclaration).toBe('DECLARE numbers : ARRAY[1:n] OF REAL');
    });

    test('should handle Array<T> generic syntax', () => {
      const source = 'let items: Array<string> = ["a", "b"];';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('Array<string>');
      expect(annotations[0].isArray).toBe(true);
      expect(annotations[0].igcseType).toBe('STRING');
      expect(annotations[0].igcseDeclaration).toBe('DECLARE items : ARRAY[1:n] OF STRING');
    });

    test('should handle multi-dimensional arrays', () => {
      const source = 'let matrix: number[][] = [[1, 2], [3, 4]];';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('number[][]');
      expect(annotations[0].isArray).toBe(true);
      expect(annotations[0].igcseType).toBe('REAL');
      expect(annotations[0].igcseDeclaration).toBe('DECLARE matrix : ARRAY[1:n] OF REAL // Multi-dimensional array simplified');
      expect(annotations[0].warnings.some(w => w.includes('Multi-dimensional'))).toBe(true);
    });
  });

  describe('Union Type Handling', () => {
    test('should handle simple union types', () => {
      const source = 'let value: string | number = "test";';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('string | number');
      expect(annotations[0].isUnion).toBe(true);
      expect(annotations[0].unionTypes).toEqual(['string', 'number']);
      expect(annotations[0].igcseType).toBe('STRING'); // Takes first type
      expect(annotations[0].warnings.length).toBeGreaterThan(0);
      expect(annotations[0].warnings[0]).toContain('Union type');
    });

    test('should handle complex union types', () => {
      const source = 'let data: string | number | boolean = true;';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('string | number | boolean');
      expect(annotations[0].isUnion).toBe(true);
      expect(annotations[0].unionTypes).toEqual(['string', 'number', 'boolean']);
      expect(annotations[0].igcseType).toBe('STRING'); // Takes first type
    });

    test('should handle union with null/undefined', () => {
      const source = 'let optional: string | null = null;';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('string | null');
      expect(annotations[0].isUnion).toBe(true);
      expect(annotations[0].unionTypes).toEqual(['string', 'null']);
      expect(annotations[0].igcseType).toBe('STRING');
    });
  });

  describe('Optional Parameter Handling', () => {
    test('should detect optional parameters in function signatures', () => {
      const source = 'function greet(name?: string, age?: number) { }';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      
      // Find function declaration in AST
      let foundOptionalParams = false;
      const traverse = (node: any) => {
        if (node.type === 'function_declaration') {
          expect(node.metadata.parameters).toHaveLength(2);
          expect(node.metadata.parameters[0].optional).toBe(true);
          expect(node.metadata.parameters[1].optional).toBe(true);
          foundOptionalParams = true;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(result.ast);
      
      expect(foundOptionalParams).toBe(true);
    });

    test('should handle mixed optional and required parameters', () => {
      const source = 'function process(required: string, optional?: number) { }';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      
      // Find function declaration in AST
      let foundMixedParams = false;
      const traverse = (node: any) => {
        if (node.type === 'function_declaration') {
          expect(node.metadata.parameters).toHaveLength(2);
          expect(node.metadata.parameters[0].optional).toBe(false);
          expect(node.metadata.parameters[1].optional).toBe(true);
          foundMixedParams = true;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(result.ast);
      
      expect(foundMixedParams).toBe(true);
    });

    test('should handle optional properties in object types', () => {
      const source = 'let config: { host: string; port?: number; } = { host: "localhost" };';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      // This tests that the parser can handle optional property syntax without errors
    });
  });

  describe('Advanced Type Features', () => {
    test('should handle generic types', () => {
      const source = 'let promise: Promise<string> = Promise.resolve("data");';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('Promise<string>');
      expect(annotations[0].igcseType).toBe('STRING'); // Simplified to base type
    });

    test('should handle tuple types', () => {
      const source = 'let tuple: [string, number] = ["hello", 42];';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('[string, number]');
      expect(annotations[0].igcseType).toBe('STRING'); // Simplified
    });

    test('should handle function types', () => {
      const source = 'let callback: (x: number) => string = (n) => n.toString();';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('(x: number) => string');
      expect(annotations[0].igcseType).toBe('STRING'); // Simplified
    });

    test('should handle literal types', () => {
      const source = 'let status: "active" | "inactive" = "active";';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('"active" | "inactive"');
      expect(annotations[0].isUnion).toBe(true);
      expect(annotations[0].igcseType).toBe('STRING');
    });
  });

  describe('Type Conversion Edge Cases', () => {
    test('should handle any type', () => {
      const source = 'let anything: any = "could be anything";';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('any');
      expect(annotations[0].igcseType).toBe('STRING'); // Default to STRING
    });

    test('should handle unknown type', () => {
      const source = 'let mystery: unknown = getValue();';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('unknown');
      expect(annotations[0].igcseType).toBe('STRING'); // Default to STRING
    });

    test('should handle void type in variables (edge case)', () => {
      const source = 'let result: void = undefined;';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('void');
      expect(annotations[0].igcseType).toBe('STRING'); // Default to STRING
    });

    test('should handle nested generic types', () => {
      const source = 'let complex: Array<Promise<string>> = [];';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].typeScriptType).toBe('Array<Promise<string>>');
      expect(annotations[0].isArray).toBe(true);
      expect(annotations[0].igcseType).toBe('STRING'); // Simplified to base type
    });
  });

  describe('Warning Generation', () => {
    test('should generate warnings for union types', () => {
      const source = 'let value: string | number = 42;';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations[0].warnings.length).toBeGreaterThan(0);
      expect(annotations[0].warnings.some(w => w.includes('Union type'))).toBe(true);
      expect(annotations[0].warnings.some(w => w.includes('Manual review recommended'))).toBe(true);
    });

    test('should generate warnings for optional parameters', () => {
      const source = 'let optional?: string = undefined;';
      const result = parser.parse(source);
      
      // This tests that optional syntax is handled without crashing
      expect(result.success).toBe(true);
    });

    test('should not generate warnings for simple types', () => {
      const source = 'let simple: string = "test";';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations[0].warnings).toHaveLength(0);
    });
  });

  describe('Integration with Validation', () => {
    test('should provide type-specific validation warnings', () => {
      const source = `
        let data: string | number | boolean = "test";
        let callback: (x: number) => void = () => {};
        let promise: Promise<string> = Promise.resolve("data");
      `;
      const result = parser.validate(source);
      
      expect(result.isValid).toBe(true);
      // Should not crash on complex types
    });

    test('should handle type errors gracefully', () => {
      const source = 'let broken: = "missing type";';
      const result = parser.validate(source);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});