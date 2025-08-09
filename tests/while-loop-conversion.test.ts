// Tests for while loop conversion to IGCSE pseudocode

import { JavaParser } from '../src/parsers/java-parser';
import { TypeScriptParser } from '../src/parsers/typescript-parser';
import { JavaASTTransformer } from '../src/transformers/java-transformer';
import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';
import { IGCSEPseudocodeGenerator } from '../src/generators/pseudocode-generator';

describe('While Loop Conversion', () => {
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

  describe('Java While Loop Conversion', () => {
    test('converts simple while loop', () => {
      const input = 'while (x > 0) { x = x - 1; }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE x > 0 DO');
      expect(pseudocode).toContain('ENDWHILE');
    });

    test('converts while loop with logical operators', () => {
      const input = 'while (x > 0 && y < 10) { x = x - 1; }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE x > 0 AND y < 10 DO');
      expect(pseudocode).toContain('ENDWHILE');
    });

    test('converts while loop with OR operator', () => {
      const input = 'while (x > 0 || y < 10) { x = x - 1; }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE x > 0 OR y < 10 DO');
      expect(pseudocode).toContain('ENDWHILE');
    });

    test('converts while loop with NOT operator', () => {
      const input = 'while (!finished) { finished = true; }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE NOT finished DO');
      expect(pseudocode).toContain('ENDWHILE');
    });

    test('converts while loop with equality operators', () => {
      const input = 'while (x == 5 && y != 10) { x = x + 1; }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE x = 5 AND y <> 10 DO');
      expect(pseudocode).toContain('ENDWHILE');
    });

    test('converts while loop with multiple statements in body', () => {
      const input = `while (count < 10) {
        count = count + 1;
        System.out.println(count);
      }`;
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE count < 10 DO');
      expect(pseudocode).toContain('count ← count + 1');
      expect(pseudocode).toContain('OUTPUT count');
      expect(pseudocode).toContain('ENDWHILE');
    });
  });

  describe('TypeScript While Loop Conversion', () => {
    test('converts simple TypeScript while loop', () => {
      const input = 'while (x > 0) { x = x - 1; }';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE x > 0 DO');
      expect(pseudocode).toContain('ENDWHILE');
    });

    test('converts TypeScript while loop with logical operators', () => {
      const input = 'while (x > 0 && y < 10) { x = x - 1; }';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE x > 0 AND y < 10 DO');
      expect(pseudocode).toContain('ENDWHILE');
    });

    test('converts TypeScript while loop with console.log', () => {
      const input = `while (count < 5) {
        console.log(count);
        count++;
      }`;
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE count < 5 DO');
      expect(pseudocode).toContain('OUTPUT count');
      expect(pseudocode).toContain('ENDWHILE');
    });
  });

  describe('While Loop Edge Cases', () => {
    test('handles while loop with empty body', () => {
      const input = 'while (x > 0) { }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE x > 0 DO');
      expect(pseudocode).toContain('ENDWHILE');
    });

    test('handles while loop without braces (single statement)', () => {
      const input = 'while (x > 0) x = x - 1;';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE x > 0 DO');
      expect(pseudocode).toContain('x ← x - 1');
      expect(pseudocode).toContain('ENDWHILE');
    });

    test('handles complex condition with parentheses', () => {
      const input = 'while ((x > 0) && (y < 10 || z == 5)) { x = x - 1; }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE (x > 0) AND (y < 10 OR z = 5) DO');
      expect(pseudocode).toContain('ENDWHILE');
    });
  });
});