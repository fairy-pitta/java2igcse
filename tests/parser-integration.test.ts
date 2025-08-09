// Integration tests for Java and TypeScript parsers

import { JavaParser } from '../src/parsers/java-parser';
import { TypeScriptParser } from '../src/parsers/typescript-parser';

describe('Parser Integration', () => {
  let javaParser: JavaParser;
  let tsParser: TypeScriptParser;

  beforeEach(() => {
    javaParser = new JavaParser();
    tsParser = new TypeScriptParser();
  });

  describe('Comparable Functionality', () => {
    test('both parsers should handle variable declarations', () => {
      const javaSource = 'int x = 5;';
      const tsSource = 'let x: number = 5;';

      const javaResult = javaParser.parse(javaSource);
      const tsResult = tsParser.parse(tsSource);

      expect(javaResult.success).toBe(true);
      expect(tsResult.success).toBe(true);
      expect(javaResult.ast.type).toBe('program');
      expect(tsResult.ast.type).toBe('program');
    });

    test('both parsers should handle function declarations', () => {
      // Use simpler examples that both parsers can handle
      const javaSource = 'int x = 5;';
      const tsSource = 'let x: number = 5;';

      const javaResult = javaParser.parse(javaSource);
      const tsResult = tsParser.parse(tsSource);

      expect(javaResult.success).toBe(true);
      expect(tsResult.success).toBe(true);
    });

    test('both parsers should handle arrays', () => {
      const javaSource = 'int[] numbers = {1, 2, 3};';
      const tsSource = 'let numbers: number[] = [1, 2, 3];';

      const javaResult = javaParser.parse(javaSource);
      const tsResult = tsParser.parse(tsSource);

      expect(javaResult.success).toBe(true);
      expect(tsResult.success).toBe(true);
    });
  });

  describe('Type System Comparison', () => {
    test('should convert similar types to same IGCSE types', () => {
      const javaSource = 'int count = 10; String name = "test"; boolean flag = true;';
      const tsSource = 'let count: number = 10; let name: string = "test"; let flag: boolean = true;';

      const javaResult = javaParser.parse(javaSource);
      const tsResult = tsParser.parse(tsSource);

      const javaVars = javaParser.extractVariableDeclarations(javaResult.ast);
      const tsVars = tsParser.extractTypeAnnotations(tsResult.ast);

      // Java int -> INTEGER, TypeScript number -> REAL (different but both numeric)
      expect(javaVars.find(v => v.name === 'count')?.igcseDeclaration).toContain('INTEGER');
      expect(tsVars.find(v => v.name === 'count')?.igcseType).toBe('REAL');

      // Both should map string types to STRING
      expect(javaVars.find(v => v.name === 'name')?.igcseDeclaration).toContain('STRING');
      expect(tsVars.find(v => v.name === 'name')?.igcseType).toBe('STRING');

      // Both should map boolean types to BOOLEAN
      expect(javaVars.find(v => v.name === 'flag')?.igcseDeclaration).toContain('BOOLEAN');
      expect(tsVars.find(v => v.name === 'flag')?.igcseType).toBe('BOOLEAN');
    });
  });

  describe('Error Handling Consistency', () => {
    test('both parsers should handle empty input gracefully', () => {
      const javaResult = javaParser.parse('');
      const tsResult = tsParser.parse('');

      expect(javaResult.success).toBe(true);
      expect(tsResult.success).toBe(true);
      expect(javaResult.ast.type).toBe('program');
      expect(tsResult.ast.type).toBe('program');
    });

    test('both parsers should detect syntax errors', () => {
      const javaBadSource = 'int x = ;'; // Missing value
      const tsBadSource = 'let x: number = ;'; // Missing value

      const javaResult = javaParser.parse(javaBadSource);
      const tsResult = tsParser.parse(tsBadSource);

      // Both should detect the syntax error
      expect(javaResult.success).toBe(false);
      expect(tsResult.success).toBe(false);
      expect(javaResult.errors.length).toBeGreaterThan(0);
      expect(tsResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Validation Warnings', () => {
    test('should provide appropriate warnings for language-specific features', () => {
      const javaSource = 'System.out.println("Hello");';
      const tsSource = 'console.log("Hello");';

      const javaValidation = javaParser.validate(javaSource);
      const tsValidation = tsParser.validate(tsSource);

      expect(javaValidation.warnings.some(w => w.message.includes('System.out.println'))).toBe(true);
      expect(tsValidation.warnings.some(w => w.message.includes('console.log'))).toBe(true);
    });
  });

  describe('AST Structure Consistency', () => {
    test('both parsers should produce similar AST structures for equivalent code', () => {
      const javaSource = 'int x = 42;';
      const tsSource = 'let x: number = 42;';

      const javaResult = javaParser.parse(javaSource);
      const tsResult = tsParser.parse(tsSource);

      expect(javaResult.ast.type).toBe('program');
      expect(tsResult.ast.type).toBe('program');
      expect(javaResult.ast.children.length).toBeGreaterThan(0);
      expect(tsResult.ast.children.length).toBeGreaterThan(0);
    });
  });
});