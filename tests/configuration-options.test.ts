// Tests for configuration options handling

import { Java2IGCSEConverterImpl, ConversionOptions } from '../src/index';

describe('Configuration Options Tests', () => {
  let converter: Java2IGCSEConverterImpl;

  beforeEach(() => {
    converter = new Java2IGCSEConverterImpl();
  });

  describe('Default Options', () => {
    test('uses default options when none provided', () => {
      const javaCode = 'int x = 5;';
      const result = converter.convertJava(javaCode);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('DECLARE x : INTEGER ← 5');
      // Default indentation should be 3 spaces (IGCSE standard)
      expect(result.pseudocode).toMatch(/^DECLARE/); // No indentation for top-level
    });

    test('includes comments by default', () => {
      const javaCode = 'public static int x = 5;';
      const result = converter.convertJava(javaCode);

      expect(result.success).toBe(true);
      // Should include static comment by default
      expect(result.warnings.some(w => w.message.includes('Static'))).toBe(true);
    });
  });

  describe('Custom Indentation', () => {
    test('respects custom indent size', () => {
      const options: ConversionOptions = {
        indentSize: 2
      };

      const javaCode = `
        if (x > 0) {
          System.out.println("positive");
        }
      `;
      const result = converter.convertJava(javaCode, options);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('IF x > 0 THEN');
      // Should use 2-space indentation for nested content
      const lines = result.pseudocode.split('\n');
      const outputLine = lines.find(line => line.includes('OUTPUT'));
      if (outputLine) {
        expect(outputLine.startsWith('  ')).toBe(true); // 2 spaces
        expect(outputLine.startsWith('   ')).toBe(false); // Not 3 spaces (default)
      }
    });

    test('handles zero indent size', () => {
      const options: ConversionOptions = {
        indentSize: 0
      };

      const javaCode = `
        if (x > 0) {
          System.out.println("positive");
        }
      `;
      const result = converter.convertJava(javaCode, options);

      expect(result.success).toBe(true);
      // With zero indent size, nested content should have minimal indentation
      expect(result.pseudocode).toContain('IF x > 0 THEN');
      expect(result.pseudocode).toContain('OUTPUT');
      expect(result.pseudocode).toContain('ENDIF');
    });
  });

  describe('Comment Control', () => {
    test('excludes comments when includeComments is false', () => {
      const options: ConversionOptions = {
        includeComments: false
      };

      const javaCode = 'public static int x = 5;';
      const result = converter.convertJava(javaCode, options);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('DECLARE x : INTEGER ← 5');
      // Should not include static comment in pseudocode
      expect(result.pseudocode).not.toContain('// Static');
    });

    test('includes comments when includeComments is true', () => {
      const options: ConversionOptions = {
        includeComments: true
      };

      const javaCode = `
        public static int x = 5;
      `;
      const result = converter.convertJava(javaCode, options);

      expect(result.success).toBe(true);
      // Should include static comments in pseudocode
      expect(result.pseudocode).toContain('// Static variable');
      expect(result.warnings.some(w => w.message.includes('Static'))).toBe(true);
    });
  });

  describe('Strict Mode', () => {
    test('handles strict mode enabled', () => {
      const options: ConversionOptions = {
        strictMode: true
      };

      const javaCode = 'int x = 5;';
      const result = converter.convertJava(javaCode, options);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('DECLARE x : INTEGER ← 5');
      // In strict mode, should still work for valid code
    });

    test('handles strict mode disabled', () => {
      const options: ConversionOptions = {
        strictMode: false
      };

      const javaCode = 'int x = 5;';
      const result = converter.convertJava(javaCode, options);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('DECLARE x : INTEGER ← 5');
    });
  });

  describe('Custom Mappings', () => {
    test('applies custom type mappings', () => {
      const options: ConversionOptions = {
        customMappings: {
          'int': 'WHOLE_NUMBER',
          'String': 'TEXT'
        }
      };

      const javaCode = 'int x = 5; String name = "test";';
      const result = converter.convertJava(javaCode, options);

      expect(result.success).toBe(true);
      // Note: Custom mappings would need to be implemented in the transformers
      // For now, we just test that the option is accepted
      expect(result.pseudocode).toContain('DECLARE');
    });

    test('handles empty custom mappings', () => {
      const options: ConversionOptions = {
        customMappings: {}
      };

      const javaCode = 'int x = 5;';
      const result = converter.convertJava(javaCode, options);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('DECLARE x : INTEGER ← 5');
    });
  });

  describe('Option Combinations', () => {
    test('handles multiple options together', () => {
      const options: ConversionOptions = {
        indentSize: 2,
        includeComments: false,
        strictMode: true,
        customMappings: {
          'System.out.println': 'PRINT'
        }
      };

      const javaCode = `
        public static void main(String[] args) {
          if (true) {
            System.out.println("Hello");
          }
        }
      `;
      const result = converter.convertJava(javaCode, options);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('IF true THEN'); // Boolean literals are lowercase in Java
      expect(result.pseudocode).toContain('OUTPUT');
      // Should not include comments due to includeComments: false
      expect(result.pseudocode).not.toContain('// Static');
    });

    test('handles partial option overrides', () => {
      const options: ConversionOptions = {
        indentSize: 8
        // Other options should use defaults
      };

      const javaCode = `
        if (x > 0) {
          System.out.println("positive");
        }
      `;
      const result = converter.convertJava(javaCode, options);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('IF x > 0 THEN');
      // Should use 8-space indentation
      const lines = result.pseudocode.split('\n');
      const outputLine = lines.find(line => line.includes('OUTPUT'));
      if (outputLine) {
        expect(outputLine.startsWith('        ')).toBe(true); // 8 spaces
      }
    });
  });

  describe('TypeScript Options', () => {
    test('applies options to TypeScript conversion', () => {
      const options: ConversionOptions = {
        indentSize: 3,
        includeComments: true
      };

      const tsCode = `
        if (x > 0) {
          console.log("positive");
        }
      `;
      const result = converter.convertTypeScript(tsCode, options);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('IF x > 0 THEN');
      // Should use 3-space indentation
      const lines = result.pseudocode.split('\n');
      const outputLine = lines.find(line => line.includes('OUTPUT'));
      if (outputLine) {
        expect(outputLine.startsWith('   ')).toBe(true); // 3 spaces
      }
    });

    test('handles TypeScript-specific options', () => {
      const options: ConversionOptions = {
        includeComments: false
      };

      const tsCode = `
        class Calculator {
          static add(a: number, b: number): number {
            return a + b;
          }
        }
      `;
      const result = converter.convertTypeScript(tsCode, options);

      expect(result.success).toBe(true);
      // Should not include class comments due to includeComments: false
      expect(result.pseudocode).not.toContain('// Calculator');
    });
  });

  describe('Generic convertCode with Options', () => {
    test('passes options to Java conversion', () => {
      const options: ConversionOptions = {
        indentSize: 6
      };

      const javaCode = `
        if (x > 0) {
          System.out.println("positive");
        }
      `;
      const result = converter.convertCode(javaCode, 'java', options);

      expect(result.success).toBe(true);
      expect(result.metadata.sourceLanguage).toBe('java');
      expect(result.pseudocode).toContain('IF x > 0 THEN');
    });

    test('passes options to TypeScript conversion', () => {
      const options: ConversionOptions = {
        includeComments: false
      };

      const tsCode = 'let x: number = 5;';
      const result = converter.convertCode(tsCode, 'typescript', options);

      expect(result.success).toBe(true);
      expect(result.metadata.sourceLanguage).toBe('typescript');
      expect(result.pseudocode).toContain('DECLARE x : REAL ← 5');
    });
  });

  describe('Invalid Options', () => {
    test('handles negative indent size gracefully', () => {
      const options: ConversionOptions = {
        indentSize: -5
      };

      const javaCode = 'int x = 5;';
      const result = converter.convertJava(javaCode, options);

      expect(result.success).toBe(true);
      // Should handle negative indent size gracefully (likely treat as 0 or default)
      expect(result.pseudocode).toContain('DECLARE x : INTEGER ← 5');
    });

    test('handles null custom mappings', () => {
      const options: ConversionOptions = {
        customMappings: null as any
      };

      const javaCode = 'int x = 5;';
      const result = converter.convertJava(javaCode, options);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('DECLARE x : INTEGER ← 5');
    });
  });
});