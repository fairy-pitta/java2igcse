// Tests for for loop conversion to IGCSE pseudocode

import { JavaParser } from '../src/parsers/java-parser';
import { TypeScriptParser } from '../src/parsers/typescript-parser';
import { JavaASTTransformer } from '../src/transformers/java-transformer';
import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';
import { IGCSEPseudocodeGenerator } from '../src/generators/pseudocode-generator';

describe('For Loop Conversion', () => {
  let javaParser: JavaParser;
  let typescriptParser: TypeScriptParser;
  let javaTransformer: JavaASTTransformer;
  let typescriptTransformer: TypeScriptASTTransformer;
  let generator: IGCSEPseudocodeGenerator;

  beforeEach(() => {
    javaParser = new JavaParser();
    typescriptParser = new TypeScriptParser();
    javaTransformer = new JavaASTTransformer();
    typescriptTransformer = new TypeScriptASTTransformer();
    generator = new IGCSEPseudocodeGenerator();
  });

  describe('Java For Loop Conversion', () => {
    test('converts simple for loop', () => {
      const input = 'for (int i = 0; i < 10; i++) { System.out.println(i); }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 9');
      expect(pseudocode).toContain('OUTPUT i');
      expect(pseudocode).toContain('NEXT i');
    });

    test('converts for loop with step value', () => {
      const input = 'for (int i = 0; i < 10; i += 2) { System.out.println(i); }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 9 STEP 2');
      expect(pseudocode).toContain('NEXT i');
    });

    test('converts for loop with different start and end values', () => {
      const input = 'for (int i = 5; i <= 15; i++) { System.out.println(i); }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 5 TO 15');
      expect(pseudocode).toContain('NEXT i');
    });

    test('converts for loop with decrement', () => {
      const input = 'for (int i = 10; i > 0; i--) { System.out.println(i); }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 10 TO 1 STEP -1');
      expect(pseudocode).toContain('NEXT i');
    });

    test('converts for loop with multiple statements in body', () => {
      const input = `for (int i = 0; i < 5; i++) {
        int square = i * i;
        System.out.println(square);
      }`;
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 4');
      expect(pseudocode).toContain('DECLARE square : INTEGER ← i * i');
      expect(pseudocode).toContain('OUTPUT square');
      expect(pseudocode).toContain('NEXT i');
    });
  });

  describe('TypeScript For Loop Conversion', () => {
    test('converts simple TypeScript for loop', () => {
      const input = 'for (let i = 0; i < 10; i++) { console.log(i); }';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 9');
      expect(pseudocode).toContain('OUTPUT i');
      expect(pseudocode).toContain('NEXT i');
    });

    test('converts TypeScript for loop with step value', () => {
      const input = 'for (let i = 0; i < 20; i += 3) { console.log(i); }';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 19 STEP 3');
      expect(pseudocode).toContain('NEXT i');
    });

    test('converts TypeScript for loop with const variable', () => {
      const input = 'for (const i = 0; i < 5; i++) { console.log(i); }';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 4');
      expect(pseudocode).toContain('NEXT i');
    });
  });

  describe('For Loop Edge Cases', () => {
    test('handles for loop with empty body', () => {
      const input = 'for (int i = 0; i < 5; i++) { }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 4');
      expect(pseudocode).toContain('NEXT i');
    });

    test('handles for loop without braces (single statement)', () => {
      const input = 'for (int i = 0; i < 3; i++) System.out.println(i);';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 2');
      expect(pseudocode).toContain('OUTPUT i');
      expect(pseudocode).toContain('NEXT i');
    });

    test('handles for loop with complex increment expression', () => {
      const input = 'for (int i = 0; i < 10; i = i + 2) { System.out.println(i); }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 9 STEP 2');
      expect(pseudocode).toContain('NEXT i');
    });

    test('handles for loop with variable in condition', () => {
      const input = 'for (int i = 0; i < n; i++) { System.out.println(i); }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO n-1');
      expect(pseudocode).toContain('NEXT i');
    });
  });
});