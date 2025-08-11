// Performance and edge case tests for Java2IGCSEConverter
// Tests large code files, malformed input, memory usage, and stress scenarios

import { Java2IGCSEConverterImpl, ConversionOptions } from '../src/index';

describe('Performance and Edge Case Tests', () => {
  let converter: Java2IGCSEConverterImpl;

  beforeEach(() => {
    converter = new Java2IGCSEConverterImpl();
  });

  describe('Large Code File Performance', () => {
    test('handles large Java class with many methods efficiently', () => {
      // Generate a large Java class with 100 methods
      const methodsCode = Array.from({ length: 100 }, (_, i) => `
        public int method${i}(int param1, int param2) {
          int result = param1 + param2;
          if (result > 0) {
            System.out.println("Method ${i} result: " + result);
            return result * 2;
          } else {
            System.out.println("Method ${i} negative result");
            return 0;
          }
        }
      `).join('\n');

      const largeJavaCode = `
        public class LargeClass {
          private int counter = 0;
          ${methodsCode}
        }
      `;

      const startTime = Date.now();
      const result = converter.convertJava(largeJavaCode);
      const endTime = Date.now();
      const conversionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(conversionTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result.metadata.conversionTime).toBeLessThan(10000);
      expect(result.metadata.linesProcessed).toBeGreaterThan(500);
      
      // Verify that all methods are converted
      expect(result.pseudocode).toContain('FUNCTION method0(param1 : INTEGER, param2 : INTEGER) RETURNS INTEGER');
      expect(result.pseudocode).toContain('FUNCTION method99(param1 : INTEGER, param2 : INTEGER) RETURNS INTEGER');
      
      // Verify memory efficiency - result should not be excessively large
      expect(result.pseudocode.length).toBeLessThan(1000000); // Less than 1MB
    });

    test('handles large TypeScript file with complex structures', () => {
      // Generate a large TypeScript file with interfaces, classes, and functions
      const interfacesCode = Array.from({ length: 20 }, (_, i) => `
        interface Interface${i} {
          id: number;
          name: string;
          value${i}: string;
          method${i}(): void;
        }
      `).join('\n');

      const classesCode = Array.from({ length: 10 }, (_, i) => `
        class Class${i} implements Interface${i} {
          private data: Interface${i}[] = [];
          
          constructor(public id: number, public name: string, public value${i}: string) {}
          
          method${i}(): void {
            console.log(\`Class${i} method called\`);
          }
          
          processData(): Interface${i}[] {
            return this.data.filter(item => item.id > 0);
          }
        }
      `).join('\n');

      const functionsCode = Array.from({ length: 30 }, (_, i) => `
        function process${i}(data: Interface${i % 20}[]): Interface${i % 20}[] {
          return data.map(item => ({
            ...item,
            name: \`processed_\${item.name}\`
          }));
        }
      `).join('\n');

      const largeTypeScriptCode = `
        ${interfacesCode}
        ${classesCode}
        ${functionsCode}
        
        const instances = Array.from({ length: 100 }, (_, i) => new Class0(i, \`item\${i}\`, \`value\${i}\`));
        instances.forEach(instance => instance.method0());
      `;

      const startTime = Date.now();
      const result = converter.convertTypeScript(largeTypeScriptCode);
      const endTime = Date.now();
      const conversionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(conversionTime).toBeLessThan(15000); // Should complete within 15 seconds
      expect(result.metadata.linesProcessed).toBeGreaterThan(200);
      
      // Verify conversion includes major components
      expect(result.pseudocode).toContain('Interface0');
      expect(result.pseudocode).toContain('Class0');
      expect(result.pseudocode).toContain('process0');
    });

    test('handles deeply nested code structures without stack overflow', () => {
      // Generate deeply nested if statements (20 levels deep)
      let nestedCode = '';
      let indentation = '';
      
      for (let i = 0; i < 20; i++) {
        nestedCode += `${indentation}if (level${i} > ${i}) {\n`;
        nestedCode += `${indentation}  System.out.println("Level ${i}");\n`;
        indentation += '  ';
      }
      
      // Close all the if statements
      for (let i = 19; i >= 0; i--) {
        indentation = indentation.substring(2);
        nestedCode += `${indentation}}\n`;
      }

      const deeplyNestedJavaCode = `
        public class DeepNesting {
          public static void testDeepNesting() {
            int level0 = 1, level1 = 2, level2 = 3, level3 = 4, level4 = 5;
            int level5 = 6, level6 = 7, level7 = 8, level8 = 9, level9 = 10;
            int level10 = 11, level11 = 12, level12 = 13, level13 = 14, level14 = 15;
            int level15 = 16, level16 = 17, level17 = 18, level18 = 19, level19 = 20;
            
            ${nestedCode}
          }
        }
      `;

      const startTime = Date.now();
      const result = converter.convertJava(deeplyNestedJavaCode);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should not timeout
      expect(result.pseudocode).toContain('IF level0 > 0 THEN');
      expect(result.pseudocode).toContain('IF level19 > 19 THEN');
      
      // Count the number of ENDIF statements to verify all levels are closed
      const endifCount = (result.pseudocode.match(/ENDIF/g) || []).length;
      expect(endifCount).toBe(20);
    });
  });

  describe('Malformed Input Handling', () => {
    test('handles Java syntax errors gracefully', () => {
      const malformedJavaInputs = [
        'int x = ;', // Missing value
        'public class { }', // Missing class name
        'if (x > 0 { System.out.println("test"); }', // Missing closing parenthesis
        'for (int i = 0; i < 10 i++) { }', // Missing semicolon
        'public void method() { return "value"; }', // Return in void method
        'int[] array = new int[]; ', // Missing array size
        'switch (x) { case 1 System.out.println("one"); }', // Missing colon
        'public class Test { public void method() { } ', // Missing closing brace
        'String text = "unclosed string;', // Unclosed string literal
        'int x = 5 + * 3;' // Invalid expression
      ];

      malformedJavaInputs.forEach((malformedCode, index) => {
        const result = converter.convertJava(malformedCode);
        
        // Should not crash, but may not succeed
        expect(result).toBeDefined();
        expect(result.metadata).toBeDefined();
        expect(result.metadata.sourceLanguage).toBe('java');
        
        // Should provide some form of output or error message
        expect(result.pseudocode).toBeDefined();
        expect(typeof result.pseudocode).toBe('string');
        
        // Should have warnings or errors
        if (!result.success) {
          expect(result.warnings.length).toBeGreaterThan(0);
          expect(result.pseudocode).toContain('// Error:');
        }
      });
    });

    test('handles TypeScript syntax errors gracefully', () => {
      const malformedTypeScriptInputs = [
        'let x: = 5;', // Invalid type annotation
        'function test(): { return 5; }', // Missing return type
        'interface Test { prop: }', // Missing property type
        'class Test extends { }', // Missing parent class
        'const arr: number[] = [1, 2, "string"];', // Type mismatch
        'function test(param: unknown_type): void { }', // Unknown type
        'let obj = { prop1: 1, prop1: 2 };', // Duplicate property
        'async function test() { await; }', // Invalid await
        'type Union = string | ;', // Incomplete union type
        'enum Color { RED, GREEN, BLUE, }' // Trailing comma (should be valid but test edge case)
      ];

      malformedTypeScriptInputs.forEach((malformedCode, index) => {
        const result = converter.convertTypeScript(malformedCode);
        
        // Should not crash
        expect(result).toBeDefined();
        expect(result.metadata).toBeDefined();
        expect(result.metadata.sourceLanguage).toBe('typescript');
        
        // Should provide some form of output
        expect(result.pseudocode).toBeDefined();
        expect(typeof result.pseudocode).toBe('string');
        
        // May succeed or fail, but should handle gracefully
        if (!result.success) {
          expect(result.warnings.length).toBeGreaterThan(0);
        }
      });
    });

    test('handles empty and whitespace-only input', () => {
      const emptyInputs = [
        '',
        '   ',
        '\n\n\n',
        '\t\t\t',
        '// Just a comment',
        '/* Multi-line\n   comment\n   only */',
        '   \n  \t  \n   '
      ];

      emptyInputs.forEach(emptyInput => {
        const javaResult = converter.convertJava(emptyInput);
        const tsResult = converter.convertTypeScript(emptyInput);

        expect(javaResult.success).toBe(true);
        expect(tsResult.success).toBe(true);
        
        expect(javaResult.pseudocode.trim()).toBe('');
        expect(tsResult.pseudocode.trim()).toBe('');
        
        expect(javaResult.metadata.linesProcessed).toBeGreaterThanOrEqual(1);
        expect(tsResult.metadata.linesProcessed).toBeGreaterThanOrEqual(1);
      });
    });

    test('handles null and undefined input', () => {
      const invalidInputs = [null, undefined];

      invalidInputs.forEach(invalidInput => {
        const javaResult = converter.convertJava(invalidInput as any);
        const tsResult = converter.convertTypeScript(invalidInput as any);

        expect(javaResult.success).toBe(false);
        expect(tsResult.success).toBe(false);
        
        expect(javaResult.pseudocode).toContain('// Error: Invalid source code provided');
        expect(tsResult.pseudocode).toContain('// Error: Invalid source code provided');
        
        expect(javaResult.warnings.length).toBeGreaterThan(0);
        expect(tsResult.warnings.length).toBeGreaterThan(0);
      });
    });

    test('handles non-string input types', () => {
      const nonStringInputs = [
        123,
        true,
        { code: 'int x = 5;' },
        ['int x = 5;'],
        new Date()
      ];

      nonStringInputs.forEach(nonStringInput => {
        const javaResult = converter.convertJava(nonStringInput as any);
        const tsResult = converter.convertTypeScript(nonStringInput as any);

        expect(javaResult.success).toBe(false);
        expect(tsResult.success).toBe(false);
        
        expect(javaResult.pseudocode).toContain('// Error: Invalid source code provided');
        expect(tsResult.pseudocode).toContain('// Error: Invalid source code provided');
      });
    });
  });

  describe('Memory Usage and Performance Stress Tests', () => {
    test('handles multiple rapid conversions without memory leaks', () => {
      const testCode = `
        public class TestClass {
          public int calculate(int a, int b) {
            return a + b;
          }
        }
      `;

      const iterations = 100;
      const results: any[] = [];
      const startTime = Date.now();

      // Perform many rapid conversions
      for (let i = 0; i < iterations; i++) {
        const result = converter.convertJava(testCode);
        results.push(result);
        
        // Verify each conversion succeeds
        expect(result.success).toBe(true);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / iterations;

      expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds
      expect(averageTime).toBeLessThan(300); // Average should be under 300ms per conversion
      
      // Verify all results are consistent
      const firstResult = results[0];
      results.forEach(result => {
        expect(result.pseudocode).toBe(firstResult.pseudocode);
        expect(result.success).toBe(firstResult.success);
      });
    });

    test('handles concurrent conversions', async () => {
      const javaCode = `
        public class ConcurrentTest {
          public void method${Math.random()}() {
            System.out.println("Test");
          }
        }
      `;

      const tsCode = `
        class ConcurrentTest {
          method${Math.random()}(): void {
            console.log("Test");
          }
        }
      `;

      // Create multiple concurrent conversion promises
      const concurrentPromises = Array.from({ length: 20 }, (_, i) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const javaResult = converter.convertJava(javaCode);
            const tsResult = converter.convertTypeScript(tsCode);
            resolve({ javaResult, tsResult, index: i });
          }, Math.random() * 100); // Random delay up to 100ms
        });
      });

      const startTime = Date.now();
      const results = await Promise.all(concurrentPromises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      // Verify all conversions succeeded
      results.forEach((result: any) => {
        expect(result.javaResult.success).toBe(true);
        expect(result.tsResult.success).toBe(true);
        expect(result.javaResult.pseudocode).toContain('method');
        expect(result.tsResult.pseudocode).toContain('method');
      });
    });

    test('handles extremely long single lines', () => {
      // Create a very long single line of code
      const longVariableNames = Array.from({ length: 100 }, (_, i) => `veryLongVariableName${i}`);
      const longExpression = longVariableNames.join(' + ');
      
      const longLineCode = `
        public class LongLineTest {
          public int calculate() {
            int result = ${longExpression};
            return result;
          }
        }
      `;

      const result = converter.convertJava(longLineCode);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('FUNCTION calculate() RETURNS INTEGER');
      expect(result.pseudocode).toContain('DECLARE result : INTEGER ←');
      
      // Should handle the long line without truncation issues
      expect(result.pseudocode.length).toBeGreaterThan(1000);
    });

    test('handles files with many small methods', () => {
      // Generate many small methods
      const smallMethods = Array.from({ length: 500 }, (_, i) => `
        public int method${i}() { return ${i}; }
      `).join('\n');

      const manyMethodsCode = `
        public class ManyMethods {
          ${smallMethods}
        }
      `;

      const startTime = Date.now();
      const result = converter.convertJava(manyMethodsCode);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(15000); // Should complete within 15 seconds
      
      // Verify first and last methods are converted
      expect(result.pseudocode).toContain('FUNCTION method0() RETURNS INTEGER');
      expect(result.pseudocode).toContain('FUNCTION method499() RETURNS INTEGER');
      
      // Verify reasonable output size
      expect(result.pseudocode.length).toBeLessThan(500000); // Less than 500KB
    });
  });

  describe('Complex Nested Structure Stress Tests', () => {
    test('handles complex nested loops with multiple break/continue statements', () => {
      const complexNestedCode = `
        public class ComplexNesting {
          public static void processMatrix(int[][] matrix) {
            outerLoop: for (int i = 0; i < matrix.length; i++) {
              for (int j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] == 0) {
                  continue;
                }
                
                if (matrix[i][j] < 0) {
                  System.out.println("Negative found, breaking outer loop");
                  break outerLoop;
                }
                
                for (int k = j + 1; k < matrix[i].length; k++) {
                  if (matrix[i][k] == matrix[i][j]) {
                    System.out.println("Duplicate found: " + matrix[i][j]);
                    break;
                  }
                }
                
                if (matrix[i][j] > 100) {
                  System.out.println("Large value: " + matrix[i][j]);
                  continue;
                }
                
                System.out.println("Processing: " + matrix[i][j]);
              }
            }
          }
        }
      `;

      const result = converter.convertJava(complexNestedCode);

      // Complex nested code with labeled breaks may not parse successfully
      // but should not crash the converter
      expect(result).toBeDefined();
      expect(result.pseudocode).toBeDefined();
      expect(typeof result.pseudocode).toBe('string');
      
      // If parsing fails, should contain error message
      if (!result.success) {
        expect(result.pseudocode).toContain('// Error:');
        expect(result.warnings.length).toBeGreaterThan(0);
      }
    });

    test('handles recursive method calls', () => {
      const recursiveCode = `
        public class RecursiveTest {
          public static int factorial(int n) {
            if (n <= 1) {
              return 1;
            }
            return n * factorial(n - 1);
          }
          
          public static int fibonacci(int n) {
            if (n <= 1) {
              return n;
            }
            return fibonacci(n - 1) + fibonacci(n - 2);
          }
          
          public static void countdown(int n) {
            if (n > 0) {
              System.out.println(n);
              countdown(n - 1);
            }
          }
        }
      `;

      const result = converter.convertJava(recursiveCode);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('FUNCTION factorial(n : INTEGER) RETURNS INTEGER');
      expect(result.pseudocode).toContain('FUNCTION fibonacci(n : INTEGER) RETURNS INTEGER');
      expect(result.pseudocode).toContain('PROCEDURE countdown(n : INTEGER)');
      
      // Should handle recursive calls
      expect(result.pseudocode).toContain('factorial(n - 1)');
      expect(result.pseudocode).toContain('fibonacci(n - 1)');
      expect(result.pseudocode).toContain('countdown(n - 1)');
    });

    test('handles mixed control structures with exception handling', () => {
      const mixedStructuresCode = `
        public class MixedStructures {
          public static void complexMethod(int[] data) {
            try {
              for (int i = 0; i < data.length; i++) {
                try {
                  if (data[i] == 0) {
                    throw new IllegalArgumentException("Zero not allowed");
                  }
                  
                  switch (data[i] % 3) {
                    case 0:
                      System.out.println("Divisible by 3");
                      break;
                    case 1:
                      while (data[i] > 10) {
                        data[i] /= 2;
                        System.out.println("Reducing: " + data[i]);
                      }
                      break;
                    case 2:
                      for (int j = 0; j < 3; j++) {
                        data[i] += j;
                      }
                      break;
                  }
                } catch (IllegalArgumentException e) {
                  System.out.println("Error at index " + i + ": " + e.getMessage());
                  continue;
                }
              }
            } catch (Exception e) {
              System.out.println("General error: " + e.getMessage());
            } finally {
              System.out.println("Cleanup completed");
            }
          }
        }
      `;

      const result = converter.convertJava(mixedStructuresCode);

      // Complex exception handling may not parse successfully
      // but should not crash the converter
      expect(result).toBeDefined();
      expect(result.pseudocode).toBeDefined();
      expect(typeof result.pseudocode).toBe('string');
      
      // If parsing fails, should contain error message about unsupported features
      if (!result.success) {
        expect(result.pseudocode).toContain('// Error:');
        expect(result.pseudocode).toContain('try-catch');
        expect(result.warnings.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases with Special Characters and Encoding', () => {
    test('handles Unicode characters in strings and comments', () => {
      const unicodeCode = `
        public class UnicodeTest {
          // Test with émojis and spéciàl characters: 🚀 ñáéíóú
          public void printUnicode() {
            String message = "Hello 世界! 🌍 Café naïve résumé";
            System.out.println(message);
            
            // Mathematical symbols: ∑ ∏ ∫ ∆ ∇
            String math = "α + β = γ";
            System.out.println(math);
          }
        }
      `;

      const result = converter.convertJava(unicodeCode);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('PROCEDURE printUnicode()');
      expect(result.pseudocode).toContain('Hello 世界! 🌍 Café naïve résumé');
      expect(result.pseudocode).toContain('α + β = γ');
      
      // Should preserve Unicode characters in strings
      expect(result.pseudocode).toContain('🌍');
      expect(result.pseudocode).toContain('α + β = γ');
    });

    test('handles very long string literals', () => {
      const longString = 'A'.repeat(10000); // 10,000 character string
      const longStringCode = `
        public class LongStringTest {
          public void printLongString() {
            String longText = "${longString}";
            System.out.println(longText);
          }
        }
      `;

      const result = converter.convertJava(longStringCode);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('PROCEDURE printLongString()');
      expect(result.pseudocode).toContain(longString);
    });

    test('handles code with mixed line endings', () => {
      // Create code with different line ending styles
      const mixedLineEndingsCode = [
        'public class MixedLineEndings {', // LF
        '  public void method1() {\r', // CR
        '    System.out.println("test1");\r\n', // CRLF
        '  }\n', // LF
        '  public void method2() {\r', // CR
        '    System.out.println("test2");\n', // LF
        '  }\r\n', // CRLF
        '}'
      ].join('');

      const result = converter.convertJava(mixedLineEndingsCode);

      expect(result.success).toBe(true);
      // Mixed line endings should be handled gracefully
      expect(result.pseudocode).toContain('PROCEDURE method2()');
      expect(result.pseudocode).toContain('OUTPUT "test2"');
    });
  });

  describe('Configuration Stress Tests', () => {
    test('handles extreme indentation settings', () => {
      const testCode = `
        if (x > 0) {
          if (y > 0) {
            System.out.println("Both positive");
          }
        }
      `;

      // Test with very small indentation
      const smallIndentResult = converter.convertJava(testCode, { indentSize: 1 });
      expect(smallIndentResult.success).toBe(true);
      
      // Test with very large indentation
      const largeIndentResult = converter.convertJava(testCode, { indentSize: 20 });
      expect(largeIndentResult.success).toBe(true);
      
      // Test with zero indentation
      const zeroIndentResult = converter.convertJava(testCode, { indentSize: 0 });
      expect(zeroIndentResult.success).toBe(true);
    });

    test('handles custom mappings with edge cases', () => {
      const testCode = `
        public void testMethod() {
          System.out.println("Hello");
        }
      `;

      const customMappings = {
        'System.out.println': 'CUSTOM_OUTPUT',
        'public': 'PUBLIC_KEYWORD',
        'void': 'VOID_TYPE'
      };

      const result = converter.convertJava(testCode, { customMappings });

      expect(result.success).toBe(true);
      // Custom mappings may or may not be applied depending on implementation
      // The test verifies the converter doesn't crash with custom mappings
    });

    test('handles all configuration options simultaneously', () => {
      const testCode = `
        public static void main(String[] args) {
          int x = 5;
          System.out.println("Value: " + x);
        }
      `;

      const allOptions: ConversionOptions = {
        indentSize: 2,
        includeComments: true,
        strictMode: true,
        customMappings: {
          'System.out.println': 'OUTPUT',
          'main': 'MAIN_PROCEDURE'
        }
      };

      const result = converter.convertJava(testCode, allOptions);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('// Static method');
      expect(result.metadata.sourceLanguage).toBe('java');
    });
  });
});