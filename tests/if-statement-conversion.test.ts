// Tests for if-statement conversion from Java to IGCSE pseudocode

import { JavaParser } from '../src/parsers/java-parser';
import { JavaASTTransformer } from '../src/transformers/java-transformer';
import { IGCSEPseudocodeGenerator } from '../src/generators/pseudocode-generator';

describe('If Statement Conversion', () => {
  let parser: JavaParser;
  let transformer: JavaASTTransformer;
  let generator: IGCSEPseudocodeGenerator;

  beforeEach(() => {
    parser = new JavaParser();
    transformer = new JavaASTTransformer();
    generator = new IGCSEPseudocodeGenerator();
  });

  describe('Simple if statements', () => {
    test('converts simple if statement', () => {
      const javaCode = 'if (x > 0) { System.out.println("positive"); }';
      
      const parseResult = parser.parse(javaCode);
      expect(parseResult.success).toBe(true);
      
      const transformResult = transformer.transform(parseResult.ast);
      expect(transformResult.success).toBe(true);
      
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF x > 0 THEN');
      expect(pseudocode).toContain('OUTPUT "positive"');
      expect(pseudocode).toContain('ENDIF');
    });

    test('converts if statement with equality operator', () => {
      const javaCode = 'if (count == 5) { System.out.println("five"); }';
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF count = 5 THEN');
      expect(pseudocode).toContain('OUTPUT "five"');
      expect(pseudocode).toContain('ENDIF');
    });

    test('converts if statement with inequality operator', () => {
      const javaCode = 'if (value != 0) { System.out.println("not zero"); }';
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF value <> 0 THEN');
      expect(pseudocode).toContain('OUTPUT "not zero"');
      expect(pseudocode).toContain('ENDIF');
    });

    test('converts if statement with logical AND operator', () => {
      const javaCode = 'if (x > 0 && x < 10) { System.out.println("single digit"); }';
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF x > 0 AND x < 10 THEN');
      expect(pseudocode).toContain('OUTPUT "single digit"');
      expect(pseudocode).toContain('ENDIF');
    });

    test('converts if statement with logical OR operator', () => {
      const javaCode = 'if (x < 0 || x > 100) { System.out.println("out of range"); }';
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF x < 0 OR x > 100 THEN');
      expect(pseudocode).toContain('OUTPUT "out of range"');
      expect(pseudocode).toContain('ENDIF');
    });

    test('converts if statement with logical NOT operator', () => {
      const javaCode = 'if (!isValid) { System.out.println("invalid"); }';
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF NOT isValid THEN');
      expect(pseudocode).toContain('OUTPUT "invalid"');
      expect(pseudocode).toContain('ENDIF');
    });

    test('converts if statement without braces', () => {
      const javaCode = 'if (x > 0) System.out.println("positive");';
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF x > 0 THEN');
      expect(pseudocode).toContain('OUTPUT "positive"');
      expect(pseudocode).toContain('ENDIF');
    });

    test('maintains proper indentation in if statement body', () => {
      const javaCode = `if (x > 0) {
        System.out.println("positive");
        System.out.println("greater than zero");
      }`;
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      const lines = pseudocode.split('\n');
      expect(lines[0]).toBe('IF x > 0 THEN');
      expect(lines[1]).toMatch(/^\s{4}OUTPUT "positive"$/);
      expect(lines[2]).toMatch(/^\s{4}OUTPUT "greater than zero"$/);
      expect(lines[3]).toBe('ENDIF');
    });
  });

  describe('If-else statements', () => {
    test('converts simple if-else statement', () => {
      const javaCode = `if (x > 0) {
        System.out.println("positive");
      } else {
        System.out.println("not positive");
      }`;
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF x > 0 THEN');
      expect(pseudocode).toContain('OUTPUT "positive"');
      expect(pseudocode).toContain('ELSE');
      expect(pseudocode).toContain('OUTPUT "not positive"');
      expect(pseudocode).toContain('ENDIF');
    });

    test('maintains proper indentation in if-else statement', () => {
      const javaCode = `if (score >= 60) {
        System.out.println("pass");
      } else {
        System.out.println("fail");
      }`;
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      const lines = pseudocode.split('\n');
      expect(lines[0]).toBe('IF score >= 60 THEN');
      expect(lines[1]).toMatch(/^\s{4}OUTPUT "pass"$/);
      expect(lines[2]).toBe('ELSE');
      expect(lines[3]).toMatch(/^\s{4}OUTPUT "fail"$/);
      expect(lines[4]).toBe('ENDIF');
    });

    test('handles nested conditions in if-else', () => {
      const javaCode = `if (x > 0 && y > 0) {
        System.out.println("both positive");
      } else {
        System.out.println("at least one not positive");
      }`;
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF x > 0 AND y > 0 THEN');
      expect(pseudocode).toContain('OUTPUT "both positive"');
      expect(pseudocode).toContain('ELSE');
      expect(pseudocode).toContain('OUTPUT "at least one not positive"');
      expect(pseudocode).toContain('ENDIF');
    });
  });

  describe('If-else if-else chains', () => {
    test('converts simple if-else if chain', () => {
      const javaCode = `if (grade >= 90) {
        System.out.println("A");
      } else if (grade >= 80) {
        System.out.println("B");
      } else {
        System.out.println("C or below");
      }`;
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF grade >= 90 THEN');
      expect(pseudocode).toContain('OUTPUT "A"');
      expect(pseudocode).toContain('ELSE IF grade >= 80 THEN');
      expect(pseudocode).toContain('OUTPUT "B"');
      expect(pseudocode).toContain('ELSE');
      expect(pseudocode).toContain('OUTPUT "C or below"');
      expect(pseudocode).toContain('ENDIF');
    });

    test('converts multiple else if conditions', () => {
      const javaCode = `if (score >= 90) {
        System.out.println("excellent");
      } else if (score >= 80) {
        System.out.println("good");
      } else if (score >= 70) {
        System.out.println("average");
      } else if (score >= 60) {
        System.out.println("pass");
      } else {
        System.out.println("fail");
      }`;
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF score >= 90 THEN');
      expect(pseudocode).toContain('ELSE IF score >= 80 THEN');
      expect(pseudocode).toContain('ELSE IF score >= 70 THEN');
      expect(pseudocode).toContain('ELSE IF score >= 60 THEN');
      expect(pseudocode).toContain('ELSE');
      expect(pseudocode).toContain('ENDIF');
    });

    test('maintains proper indentation in complex if-else if-else chain', () => {
      const javaCode = `if (x > 0) {
        System.out.println("positive");
      } else if (x < 0) {
        System.out.println("negative");
      } else {
        System.out.println("zero");
      }`;
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      const lines = pseudocode.split('\n');
      expect(lines[0]).toBe('IF x > 0 THEN');
      expect(lines[1]).toMatch(/^\s{4}OUTPUT "positive"$/);
      expect(lines[2]).toBe('ELSE IF x < 0 THEN');
      expect(lines[3]).toMatch(/^\s{4}OUTPUT "negative"$/);
      expect(lines[4]).toBe('ELSE');
      expect(lines[5]).toMatch(/^\s{4}OUTPUT "zero"$/);
      expect(lines[6]).toBe('ENDIF');
    });

    test('handles complex conditions in else if chains', () => {
      const javaCode = `if (age >= 18 && hasLicense) {
        System.out.println("can drive");
      } else if (age >= 16 && hasPermit) {
        System.out.println("can drive with supervision");
      } else {
        System.out.println("cannot drive");
      }`;
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF age >= 18 AND hasLicense THEN');
      expect(pseudocode).toContain('ELSE IF age >= 16 AND hasPermit THEN');
      expect(pseudocode).toContain('OUTPUT "can drive"');
      expect(pseudocode).toContain('OUTPUT "can drive with supervision"');
      expect(pseudocode).toContain('OUTPUT "cannot drive"');
    });
  });

  describe('Error handling', () => {
    test('handles malformed if statement gracefully', () => {
      const javaCode = 'if (x > 0 { System.out.println("missing paren"); }';
      
      const parseResult = parser.parse(javaCode);
      // Should still attempt to parse and provide some result
      expect(parseResult.ast).toBeDefined();
    });

    test('handles missing condition', () => {
      const javaCode = 'if () { System.out.println("empty condition"); }';
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      // Should generate some output even with empty condition
      expect(pseudocode).toBeDefined();
    });

    test('handles missing braces', () => {
      const javaCode = 'if (x > 0) System.out.println("no braces");';
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF x > 0 THEN');
      expect(pseudocode).toContain('OUTPUT "no braces"');
      expect(pseudocode).toContain('ENDIF');
    });
  });

  describe('Integration with other features', () => {
    test('handles if statement with variable declarations', () => {
      const javaCode = `int result;
      if (x > 0) {
        result = 1;
      } else {
        result = -1;
      }`;
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('DECLARE result : INTEGER');
      expect(pseudocode).toContain('IF x > 0 THEN');
      expect(pseudocode).toContain('ELSE');
      expect(pseudocode).toContain('ENDIF');
    });

    test('handles if statement with multiple statements in blocks', () => {
      const javaCode = `if (isValid) {
        System.out.println("Processing...");
        int count = 0;
        System.out.println("Done");
      }`;
      
      const parseResult = parser.parse(javaCode);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('IF isValid THEN');
      expect(pseudocode).toContain('OUTPUT "Processing..."');
      expect(pseudocode).toContain('DECLARE count : INTEGER');
      expect(pseudocode).toContain('OUTPUT "Done"');
      expect(pseudocode).toContain('ENDIF');
    });
  });
});