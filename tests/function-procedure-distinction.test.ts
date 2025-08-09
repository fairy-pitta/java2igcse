// Tests for distinguishing functions vs procedures (Task 9.1)

import { JavaParser } from '../src/parsers/java-parser';
import { TypeScriptParser } from '../src/parsers/typescript-parser';
import { JavaASTTransformer } from '../src/transformers/java-transformer';
import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';

describe('Function vs Procedure Distinction', () => {
  let javaParser: JavaParser;
  let typescriptParser: TypeScriptParser;
  let javaTransformer: JavaASTTransformer;
  let typescriptTransformer: TypeScriptASTTransformer;

  beforeEach(() => {
    javaParser = new JavaParser();
    typescriptParser = new TypeScriptParser();
    javaTransformer = new JavaASTTransformer();
    typescriptTransformer = new TypeScriptASTTransformer();
  });

  describe('Java Method Distinction', () => {
    test('identifies void method as procedure', () => {
      const input = 'public void printHello() { System.out.println("Hello"); }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      // Find the method declaration in the IR
      const methodDecl = findNodeByKind(transformResult.result, 'procedure_declaration');
      expect(methodDecl).toBeDefined();
      expect(methodDecl?.metadata?.isProcedure).toBe(true);
      expect(methodDecl?.metadata?.igcseReturnType).toBeUndefined();
    });

    test('identifies method with return type as function', () => {
      const input = 'public int add(int a, int b) { return a + b; }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const methodDecl = findNodeByKind(transformResult.result, 'function_declaration');
      expect(methodDecl).toBeDefined();
      expect(methodDecl?.metadata?.isProcedure).toBe(false);
      expect(methodDecl?.metadata?.igcseReturnType).toBe('INTEGER');
    });

    test('parses method parameters correctly', () => {
      const input = 'public String concat(String a, String b) { return a + b; }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const methodDecl = findNodeByKind(transformResult.result, 'function_declaration');
      expect(methodDecl).toBeDefined();
      expect(methodDecl?.metadata?.parameters).toHaveLength(2);
      expect(methodDecl?.metadata?.parameters[0]).toEqual({
        name: 'a',
        type: 'STRING',
        isArray: false,
        isOptional: false
      });
      expect(methodDecl?.metadata?.parameters[1]).toEqual({
        name: 'b',
        type: 'STRING',
        isArray: false,
        isOptional: false
      });
    });

    test('handles method with array parameters', () => {
      const input = 'public void processArray(int[] numbers) { }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const methodDecl = findNodeByKind(transformResult.result, 'procedure_declaration');
      expect(methodDecl).toBeDefined();
      expect(methodDecl?.metadata?.parameters).toHaveLength(1);
      expect(methodDecl?.metadata?.parameters[0]).toEqual({
        name: 'numbers',
        type: 'INTEGER',
        isArray: true,
        isOptional: false
      });
    });

    test('handles static methods', () => {
      const input = 'public static void main(String[] args) { }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const methodDecl = findNodeByKind(transformResult.result, 'procedure_declaration');
      expect(methodDecl).toBeDefined();
      expect(methodDecl?.metadata?.isStatic).toBe(true);
      expect(methodDecl?.metadata?.isProcedure).toBe(true);
    });
  });

  describe('TypeScript Function Distinction', () => {
    test('identifies function with void return as procedure', () => {
      const input = 'function printHello(): void { console.log("Hello"); }';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const funcDecl = findNodeByKind(transformResult.result, 'procedure_declaration');
      expect(funcDecl).toBeDefined();
      expect(funcDecl?.metadata?.isProcedure).toBe(true);
      expect(funcDecl?.metadata?.returnType).toBeUndefined();
    });

    test('identifies function with return type as function', () => {
      const input = 'function add(a: number, b: number): number { return a + b; }';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const funcDecl = findNodeByKind(transformResult.result, 'function_declaration');
      expect(funcDecl).toBeDefined();
      expect(funcDecl?.metadata?.isProcedure).toBe(false);
      expect(funcDecl?.metadata?.returnType).toBe('REAL');
    });

    test('identifies function without explicit return type as procedure', () => {
      const input = 'function greet(name: string) { console.log("Hello " + name); }';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const funcDecl = findNodeByKind(transformResult.result, 'procedure_declaration');
      expect(funcDecl).toBeDefined();
      expect(funcDecl?.metadata?.isProcedure).toBe(true);
    });

    test('handles arrow function as procedure', () => {
      const input = 'const greet = (name: string): void => { console.log("Hello " + name); }';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const arrowFunc = findNodeByKind(transformResult.result, 'arrow_function_converted');
      expect(arrowFunc).toBeDefined();
      expect(arrowFunc?.metadata?.isProcedure).toBe(true);
    });

    test('handles arrow function with return type as function', () => {
      const input = 'const multiply = (a: number, b: number): number => a * b';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const arrowFunc = findNodeByKind(transformResult.result, 'arrow_function_converted');
      expect(arrowFunc).toBeDefined();
      expect(arrowFunc?.metadata?.isProcedure).toBe(false);
      expect(arrowFunc?.metadata?.returnType).toBe('REAL');
    });

    test('handles optional parameters', () => {
      const input = 'function greet(name: string, title?: string): void { }';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const funcDecl = findNodeByKind(transformResult.result, 'procedure_declaration');
      expect(funcDecl).toBeDefined();
      expect(funcDecl?.metadata?.parameters).toHaveLength(2);
      expect(funcDecl?.metadata?.parameters[0].isOptional).toBe(false);
      expect(funcDecl?.metadata?.parameters[1].isOptional).toBe(true);
    });
  });

  describe('Return Type Conversion', () => {
    test('converts Java primitive types to IGCSE types', () => {
      const testCases = [
        { input: 'public int getValue() { return 42; }', expected: 'INTEGER' },
        { input: 'public double getPrice() { return 19.99; }', expected: 'REAL' },
        { input: 'public String getName() { return "test"; }', expected: 'STRING' },
        { input: 'public boolean isValid() { return true; }', expected: 'BOOLEAN' },
        { input: 'public char getGrade() { return "A"; }', expected: 'CHAR' }
      ];

      testCases.forEach(({ input, expected }) => {
        const parseResult = javaParser.parse(input);
        const transformResult = javaTransformer.transform(parseResult.ast);
        
        expect(transformResult.success).toBe(true);
        const methodDecl = findNodeByKind(transformResult.result, 'function_declaration');
        expect(methodDecl?.metadata?.igcseReturnType).toBe(expected);
      });
    });

    test('converts TypeScript types to IGCSE types', () => {
      const testCases = [
        { input: 'function getValue(): number { return 42; }', expected: 'REAL' },
        { input: 'function getName(): string { return "test"; }', expected: 'STRING' },
        { input: 'function isValid(): boolean { return true; }', expected: 'BOOLEAN' }
      ];

      testCases.forEach(({ input, expected }) => {
        const parseResult = typescriptParser.parse(input);
        const transformResult = typescriptTransformer.transform(parseResult.ast);
        
        expect(transformResult.success).toBe(true);
        const funcDecl = findNodeByKind(transformResult.result, 'function_declaration');
        expect(funcDecl?.metadata?.returnType).toBe(expected);
      });
    });
  });
});

// Helper function to find nodes by kind in the IR tree
function findNodeByKind(node: any, kind: string): any {
  if (node.kind === kind) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByKind(child, kind);
      if (found) {
        return found;
      }
    }
  }
  
  return null;
}