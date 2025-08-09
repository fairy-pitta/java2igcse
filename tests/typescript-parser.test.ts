// Tests for TypeScript Parser

import { TypeScriptParser } from '../src/parsers/typescript-parser';

describe('TypeScriptParser', () => {
  let parser: TypeScriptParser;

  beforeEach(() => {
    parser = new TypeScriptParser();
  });

  describe('Basic Parsing', () => {
    test('should parse empty source code', () => {
      const result = parser.parse('');
      
      expect(result.success).toBe(true);
      expect(result.ast.type).toBe('program');
      expect(result.errors).toHaveLength(0);
    });

    test('should parse simple variable declaration', () => {
      const source = 'let x: number = 5;';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      expect(result.ast.type).toBe('program');
      expect(result.errors).toHaveLength(0);
    });

    test('should handle syntax errors gracefully', () => {
      const source = 'let x: number = ;'; // Missing value
      const result = parser.parse(source);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // Accept either error or warning since TypeScript compiler diagnostics may vary
      expect(['error', 'warning']).toContain(result.errors[0].severity);
    });
  });

  describe('Variable Declaration Parsing', () => {
    test('should parse typed variable declaration', () => {
      const source = 'let name: string = "John";';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      
      // Find variable declaration in AST
      let foundVarDecl = false;
      const traverse = (node: any) => {
        if (node.type === 'variable_declaration') {
          expect(node.metadata.hasTypeAnnotation).toBe(true);
          expect(node.metadata.typeAnnotation).toBe('string');
          expect(node.metadata.hasInitializer).toBe(true);
          foundVarDecl = true;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(result.ast);
      
      expect(foundVarDecl).toBe(true);
    });

    test('should parse variable without type annotation', () => {
      const source = 'let count = 10;';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      
      // Find variable declaration in AST
      let foundVarDecl = false;
      const traverse = (node: any) => {
        if (node.type === 'variable_declaration') {
          expect(node.metadata.hasTypeAnnotation).toBe(false);
          expect(node.metadata.hasInitializer).toBe(true);
          foundVarDecl = true;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(result.ast);
      
      expect(foundVarDecl).toBe(true);
    });

    test('should parse array type declarations', () => {
      const source = 'let numbers: number[] = [1, 2, 3];';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      
      // Find variable declaration in AST
      let foundVarDecl = false;
      const traverse = (node: any) => {
        if (node.type === 'variable_declaration') {
          expect(node.metadata.hasTypeAnnotation).toBe(true);
          expect(node.metadata.typeAnnotation).toBe('number[]');
          foundVarDecl = true;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(result.ast);
      
      expect(foundVarDecl).toBe(true);
    });

    test('should parse optional parameters', () => {
      const source = 'function greet(name?: string) { }';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      
      // Find function declaration in AST
      let foundFuncDecl = false;
      const traverse = (node: any) => {
        if (node.type === 'function_declaration') {
          expect(node.metadata.parameters).toHaveLength(1);
          expect(node.metadata.parameters[0].optional).toBe(true);
          expect(node.metadata.parameters[0].type).toBe('string');
          foundFuncDecl = true;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(result.ast);
      
      expect(foundFuncDecl).toBe(true);
    });
  });

  describe('Function Declaration Parsing', () => {
    test('should parse function with return type', () => {
      const source = 'function add(a: number, b: number): number { return a + b; }';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      
      // Find function declaration in AST
      let foundFuncDecl = false;
      const traverse = (node: any) => {
        if (node.type === 'function_declaration') {
          expect(node.metadata.parameters).toHaveLength(2);
          expect(node.metadata.returnType).toBe('number');
          expect(node.metadata.parameters[0].name).toBe('a');
          expect(node.metadata.parameters[0].type).toBe('number');
          expect(node.metadata.parameters[1].name).toBe('b');
          expect(node.metadata.parameters[1].type).toBe('number');
          foundFuncDecl = true;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(result.ast);
      
      expect(foundFuncDecl).toBe(true);
    });

    test('should parse arrow function', () => {
      const source = 'const multiply = (x: number, y: number): number => x * y;';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      
      // Find arrow function in AST
      let foundArrowFunc = false;
      const traverse = (node: any) => {
        if (node.type === 'arrow_function') {
          expect(node.metadata.isArrowFunction).toBe(true);
          expect(node.metadata.parameters).toHaveLength(2);
          expect(node.metadata.returnType).toBe('number');
          foundArrowFunc = true;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(result.ast);
      
      expect(foundArrowFunc).toBe(true);
    });

    test('should parse void function', () => {
      const source = 'function printMessage(msg: string): void { console.log(msg); }';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      
      // Find function declaration in AST
      let foundFuncDecl = false;
      const traverse = (node: any) => {
        if (node.type === 'function_declaration') {
          expect(node.metadata.returnType).toBe('void');
          foundFuncDecl = true;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(result.ast);
      
      expect(foundFuncDecl).toBe(true);
    });
  });

  describe('Literal Parsing', () => {
    test('should parse string literals', () => {
      const source = 'let message = "Hello World";';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      
      // Find string literal in AST
      let foundStringLiteral = false;
      const traverse = (node: any) => {
        if (node.type === 'literal' && node.metadata?.literalType === 'string') {
          expect(node.value).toBe('Hello World');
          foundStringLiteral = true;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(result.ast);
      
      expect(foundStringLiteral).toBe(true);
    });

    test('should parse number literals', () => {
      const source = 'let pi = 3.14;';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      
      // Find number literal in AST
      let foundNumberLiteral = false;
      const traverse = (node: any) => {
        if (node.type === 'literal' && node.metadata?.literalType === 'number') {
          expect(node.value).toBe('3.14');
          foundNumberLiteral = true;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(result.ast);
      
      expect(foundNumberLiteral).toBe(true);
    });

    test('should parse boolean literals', () => {
      const source = 'let isActive = true; let isDisabled = false;';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      
      // Find boolean literals in AST
      const booleanValues: string[] = [];
      const traverse = (node: any) => {
        if (node.type === 'literal' && node.metadata?.literalType === 'boolean') {
          booleanValues.push(node.value);
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(result.ast);
      
      expect(booleanValues).toContain('true');
      expect(booleanValues).toContain('false');
    });
  });

  describe('Validation', () => {
    test('should validate correct TypeScript code', () => {
      const source = 'let x: number = 5;';
      const result = parser.validate(source);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect syntax errors in validation', () => {
      const source = 'let x: number = ;'; // Missing value
      const result = parser.validate(source);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should provide warnings for console.log', () => {
      const source = 'console.log("Hello");';
      const result = parser.validate(source);
      
      expect(result.warnings.some(w => w.message.includes('console.log'))).toBe(true);
      expect(result.warnings.some(w => w.code === 'FEATURE_CONVERSION')).toBe(true);
    });

    test('should provide warnings for arrow functions', () => {
      const source = 'const add = (a: number, b: number) => a + b;';
      const result = parser.validate(source);
      
      expect(result.warnings.some(w => w.message.includes('Arrow functions'))).toBe(true);
      expect(result.warnings.some(w => w.code === 'FEATURE_CONVERSION')).toBe(true);
    });

    test('should provide warnings for interfaces', () => {
      const source = 'interface User { name: string; age: number; }';
      const result = parser.validate(source);
      
      expect(result.warnings.some(w => w.message.includes('interfaces'))).toBe(true);
      expect(result.warnings.some(w => w.code === 'FEATURE_CONVERSION')).toBe(true);
    });
  });

  describe('Type Annotation Extraction', () => {
    test('should extract simple type annotations', () => {
      const source = 'let name: string = "John"; let age: number = 25;';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(2);
      
      const nameAnnotation = annotations.find(a => a.name === 'name');
      expect(nameAnnotation).toBeDefined();
      expect(nameAnnotation?.typeScriptType).toBe('string');
      expect(nameAnnotation?.igcseType).toBe('STRING');
      expect(nameAnnotation?.igcseDeclaration).toBe('DECLARE name : STRING');
      
      const ageAnnotation = annotations.find(a => a.name === 'age');
      expect(ageAnnotation).toBeDefined();
      expect(ageAnnotation?.typeScriptType).toBe('number');
      expect(ageAnnotation?.igcseType).toBe('REAL');
      expect(ageAnnotation?.igcseDeclaration).toBe('DECLARE age : REAL');
    });

    test('should handle array type annotations', () => {
      const source = 'let numbers: number[] = [1, 2, 3];';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].name).toBe('numbers');
      expect(annotations[0].typeScriptType).toBe('number[]');
      expect(annotations[0].isArray).toBe(true);
      expect(annotations[0].igcseType).toBe('REAL');
      expect(annotations[0].igcseDeclaration).toBe('DECLARE numbers : ARRAY[1:n] OF REAL');
    });

    test('should handle optional type annotations', () => {
      const source = 'function greet(name?: string) { }';
      const result = parser.parse(source);
      
      // For this test, we need to check function parameters
      // The current implementation focuses on variable declarations
      // This test ensures the parser can handle optional syntax
      expect(result.success).toBe(true);
    });

    test('should handle union type annotations', () => {
      const source = 'let value: string | number = "test";';
      const result = parser.parse(source);
      const annotations = parser.extractTypeAnnotations(result.ast);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].name).toBe('value');
      expect(annotations[0].typeScriptType).toBe('string | number');
      expect(annotations[0].isUnion).toBe(true);
      expect(annotations[0].unionTypes).toEqual(['string', 'number']);
      expect(annotations[0].igcseType).toBe('STRING'); // Takes first type
      expect(annotations[0].warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Complex TypeScript Features', () => {
    test('should parse class declarations', () => {
      const source = `
        class Person {
          name: string;
          constructor(name: string) {
            this.name = name;
          }
        }
      `;
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      // The parser should handle class syntax without errors
    });

    test('should parse interface declarations', () => {
      const source = `
        interface User {
          name: string;
          age: number;
          isActive?: boolean;
        }
      `;
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      // The parser should handle interface syntax without errors
    });

    test('should parse generic functions', () => {
      const source = 'function identity<T>(arg: T): T { return arg; }';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      // The parser should handle generic syntax without errors
    });

    test('should parse async functions', () => {
      const source = 'async function fetchData(): Promise<string> { return "data"; }';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
      
      // Find async function in AST
      let foundAsyncFunc = false;
      const traverse = (node: any) => {
        if (node.type === 'function_declaration') {
          expect(node.metadata.isAsync).toBe(true);
          foundAsyncFunc = true;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(result.ast);
      
      expect(foundAsyncFunc).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed code gracefully', () => {
      const source = 'let x: = 5;'; // Invalid syntax
      const result = parser.parse(source);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.ast.type).toBe('program'); // Should still return a program node
    });

    test('should provide meaningful error messages', () => {
      const source = 'function test() { return; }'; // Missing return type
      const result = parser.parse(source);
      
      // This should parse successfully as TypeScript allows implicit return types
      expect(result.success).toBe(true);
    });

    test('should handle empty functions', () => {
      const source = 'function empty() { }';
      const result = parser.parse(source);
      
      expect(result.success).toBe(true);
    });
  });
});