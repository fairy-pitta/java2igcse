// Tests for nested loop conversion to IGCSE pseudocode

import { JavaParser } from '../src/parsers/java-parser';
import { TypeScriptParser } from '../src/parsers/typescript-parser';
import { JavaASTTransformer } from '../src/transformers/java-transformer';
import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';
import { IGCSEPseudocodeGenerator } from '../src/generators/pseudocode-generator';

describe('Nested Loop Conversion', () => {
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

  describe('Java Nested Loop Conversion', () => {
    test('converts nested for loops', () => {
      const input = `for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 2; j++) {
          System.out.println(i + " " + j);
        }
      }`;
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 2');
      expect(pseudocode).toContain('FOR j ← 0 TO 1');
      expect(pseudocode).toContain('NEXT j');
      expect(pseudocode).toContain('NEXT i');
      
      // Check proper indentation
      const lines = pseudocode.split('\n');
      const outerForIndex = lines.findIndex(line => line.includes('FOR i ← 0 TO 2'));
      const innerForIndex = lines.findIndex(line => line.includes('FOR j ← 0 TO 1'));
      const innerNextIndex = lines.findIndex(line => line.includes('NEXT j'));
      const outerNextIndex = lines.findIndex(line => line.includes('NEXT i'));
      
      expect(outerForIndex).toBeLessThan(innerForIndex);
      expect(innerForIndex).toBeLessThan(innerNextIndex);
      expect(innerNextIndex).toBeLessThan(outerNextIndex);
      
      // Check indentation levels
      expect(lines[innerForIndex].startsWith('    ')).toBe(true); // Inner loop should be indented
      expect(lines[innerNextIndex].startsWith('    ')).toBe(true); // Inner NEXT should be indented
    });

    test('converts for loop inside while loop', () => {
      const input = `while (x > 0) {
        for (int i = 0; i < x; i++) {
          System.out.println(i);
        }
        x = x - 1;
      }`;
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE x > 0 DO');
      expect(pseudocode).toContain('FOR i ← 0 TO x-1');
      expect(pseudocode).toContain('NEXT i');
      expect(pseudocode).toContain('ENDWHILE');
    });

    test('converts while loop inside for loop', () => {
      const input = `for (int i = 0; i < 3; i++) {
        int j = 0;
        while (j < i) {
          System.out.println(j);
          j = j + 1;
        }
      }`;
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 2');
      expect(pseudocode).toContain('WHILE j < i DO');
      expect(pseudocode).toContain('ENDWHILE');
      expect(pseudocode).toContain('NEXT i');
    });

    test('converts triple nested for loops', () => {
      const input = `for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 2; j++) {
          for (int k = 0; k < 2; k++) {
            System.out.println(i + j + k);
          }
        }
      }`;
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 1');
      expect(pseudocode).toContain('FOR j ← 0 TO 1');
      expect(pseudocode).toContain('FOR k ← 0 TO 1');
      expect(pseudocode).toContain('NEXT k');
      expect(pseudocode).toContain('NEXT j');
      expect(pseudocode).toContain('NEXT i');
    });

    test('converts nested loops with different step values', () => {
      const input = `for (int i = 0; i < 10; i += 2) {
        for (int j = 5; j > 0; j--) {
          System.out.println(i * j);
        }
      }`;
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 9 STEP 2');
      expect(pseudocode).toContain('FOR j ← 5 TO 1 STEP -1');
      expect(pseudocode).toContain('NEXT j');
      expect(pseudocode).toContain('NEXT i');
    });
  });

  describe('TypeScript Nested Loop Conversion', () => {
    test('converts nested TypeScript for loops', () => {
      const input = `for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          console.log(i, j);
        }
      }`;
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 2');
      expect(pseudocode).toContain('FOR j ← 0 TO 1');
      expect(pseudocode).toContain('NEXT j');
      expect(pseudocode).toContain('NEXT i');
    });

    test('converts TypeScript for loop inside while loop', () => {
      const input = `while (x > 0) {
        for (let i = 0; i < x; i++) {
          console.log(i);
        }
        x--;
      }`;
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('WHILE x > 0 DO');
      expect(pseudocode).toContain('FOR i ← 0 TO x-1');
      expect(pseudocode).toContain('NEXT i');
      expect(pseudocode).toContain('ENDWHILE');
    });

    test('converts TypeScript while loop inside for loop', () => {
      const input = `for (let i = 0; i < 3; i++) {
        let j = 0;
        while (j < i) {
          console.log(j);
          j++;
        }
      }`;
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 2');
      expect(pseudocode).toContain('WHILE j < i DO');
      expect(pseudocode).toContain('ENDWHILE');
      expect(pseudocode).toContain('NEXT i');
    });
  });

  describe('Nested Loop Edge Cases', () => {
    test('handles nested loops with same variable names (should be avoided but handled)', () => {
      const input = `for (int i = 0; i < 2; i++) {
        for (int i = 0; i < 3; i++) {
          System.out.println(i);
        }
      }`;
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 1');
      expect(pseudocode).toContain('FOR i ← 0 TO 2');
      expect(pseudocode).toContain('NEXT i');
      // Should have two NEXT i statements
      const nextCount = (pseudocode.match(/NEXT i/g) || []).length;
      expect(nextCount).toBe(2);
    });

    test('handles deeply nested loops with proper indentation', () => {
      const input = `for (int a = 0; a < 2; a++) {
        for (int b = 0; b < 2; b++) {
          for (int c = 0; c < 2; c++) {
            for (int d = 0; d < 2; d++) {
              System.out.println(a + b + c + d);
            }
          }
        }
      }`;
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR a ← 0 TO 1');
      expect(pseudocode).toContain('FOR b ← 0 TO 1');
      expect(pseudocode).toContain('FOR c ← 0 TO 1');
      expect(pseudocode).toContain('FOR d ← 0 TO 1');
      expect(pseudocode).toContain('NEXT d');
      expect(pseudocode).toContain('NEXT c');
      expect(pseudocode).toContain('NEXT b');
      expect(pseudocode).toContain('NEXT a');
    });

    test('handles nested loops with complex conditions and statements', () => {
      const input = `for (int i = 0; i < 3; i++) {
        int sum = 0;
        for (int j = 0; j <= i; j++) {
          sum = sum + j;
          if (sum > 5) {
            System.out.println("Sum exceeded");
          }
        }
        System.out.println(sum);
      }`;
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);

      expect(parseResult.success).toBe(true);
      expect(transformResult.success).toBe(true);
      expect(pseudocode).toContain('FOR i ← 0 TO 2');
      expect(pseudocode).toContain('FOR j ← 0 TO i');
      expect(pseudocode).toContain('IF sum > 5 THEN');
      expect(pseudocode).toContain('ENDIF');
      expect(pseudocode).toContain('NEXT j');
      expect(pseudocode).toContain('NEXT i');
    });
  });
});