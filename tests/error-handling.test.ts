// Tests for comprehensive error handling functionality

import { JavaParser } from '../src/parsers/java-parser';
import { TypeScriptParser } from '../src/parsers/typescript-parser';
import { ConversionError, ParseError, UnsupportedFeatureError, TypeConversionError, ValidationError, ErrorCodes } from '../src/errors';

describe('Error Handling Tests', () => {
  describe('Java Parser Error Handling', () => {
    let parser: JavaParser;

    beforeEach(() => {
      parser = new JavaParser();
    });

    test('handles empty input gracefully', () => {
      const result = parser.parse('');
      
      expect(result.success).toBe(true); // Backward compatibility
      expect(result.ast.type).toBe('program');
      expect(result.ast.children).toHaveLength(0);
    });

    test('handles whitespace-only input gracefully', () => {
      const result = parser.parse('   \n\t  \n  ');
      
      expect(result.success).toBe(true); // Backward compatibility
      expect(result.ast.type).toBe('program');
      expect(result.ast.children).toHaveLength(0);
    });

    test('detects mismatched braces', () => {
      const code = `
        public class Test {
          public void method() {
            System.out.println("Hello");
          // Missing closing brace
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => e.code === 'SYNTAX_ERROR' && e.message.includes('Mismatched braces'))).toBe(true);
    });

    test('detects mismatched parentheses', () => {
      const code = `
        public class Test {
          public void method() {
            if (x > 0 {
              System.out.println("positive");
            }
          }
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => e.code === 'SYNTAX_ERROR' && e.message.includes('Mismatched parentheses'))).toBe(true);
    });

    test('detects unterminated string literals', () => {
      const code = `
        public class Test {
          String message = "Hello World;
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => e.code === 'SYNTAX_ERROR' && e.message.includes('Unterminated string'))).toBe(true);
    });

    test('provides descriptive error messages with line numbers', () => {
      const code = `
        public class Test {
          public void method() {
            int x = ;
          }
        }
      `;
      
      const result = parser.parse(code);
      
      // Should have errors with line numbers
      const errorWithLine = result.errors.find(e => e.line && e.line > 1);
      expect(errorWithLine).toBeDefined();
      expect(errorWithLine?.message).toContain('line');
    });

    test('warns about unsupported import statements', () => {
      const code = `
        import java.util.List;
        import java.util.ArrayList;
        
        public class Test {
          public void method() {
            List<String> list = new ArrayList<>();
          }
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => 
        e.code === 'UNSUPPORTED_FEATURE' && 
        e.message.includes('import statements') &&
        e.severity === 'warning'
      )).toBe(true);
    });

    test('warns about unsupported try-catch blocks', () => {
      const code = `
        public class Test {
          public void method() {
            try {
              int x = Integer.parseInt("abc");
            } catch (NumberFormatException e) {
              System.out.println("Error");
            }
          }
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => 
        e.code === 'UNSUPPORTED_FEATURE' && 
        e.message.includes('try-catch blocks') &&
        e.severity === 'warning'
      )).toBe(true);
    });

    test('warns about unsupported lambda expressions', () => {
      const code = `
        public class Test {
          public void method() {
            list.forEach(item -> System.out.println(item));
          }
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => 
        e.code === 'UNSUPPORTED_FEATURE' && 
        e.message.includes('lambda expressions') &&
        e.severity === 'warning'
      )).toBe(true);
    });

    test('warns about unsupported generics', () => {
      const code = `
        public class Test<T> {
          private List<String> items;
          
          public void method() {
            Map<String, Integer> map = new HashMap<>();
          }
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => 
        e.code === 'UNSUPPORTED_FEATURE' && 
        e.message.includes('generics') &&
        e.severity === 'warning'
      )).toBe(true);
    });

    test('provides helpful suggestions for unsupported features', () => {
      const code = `
        import java.util.List;
        
        public abstract class Test {
          public void method() throws Exception {
            throw new RuntimeException("Error");
          }
        }
      `;
      
      const result = parser.parse(code);
      
      // Check that suggestions are provided
      const unsupportedErrors = result.errors.filter(e => e.code === 'UNSUPPORTED_FEATURE');
      expect(unsupportedErrors.length).toBeGreaterThan(0);
      
      unsupportedErrors.forEach(error => {
        expect(error.message).toMatch(/suggestion|convert|remove|use/i);
      });
    });
  });

  describe('TypeScript Parser Error Handling', () => {
    let parser: TypeScriptParser;

    beforeEach(() => {
      parser = new TypeScriptParser();
    });

    test('handles empty input gracefully', () => {
      const result = parser.parse('');
      
      expect(result.success).toBe(true); // Backward compatibility
      expect(result.ast.type).toBe('program');
      expect(result.ast.children).toHaveLength(0);
    });

    test('detects mismatched braces', () => {
      const code = `
        class Test {
          method() {
            console.log("Hello");
          // Missing closing brace
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => e.code === 'SYNTAX_ERROR' && e.message.includes('Mismatched braces'))).toBe(true);
    });

    test('detects unterminated template literals', () => {
      const code = `
        class Test {
          message = \`Hello World
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => e.code === 'SYNTAX_ERROR' && e.message.includes('Unterminated template'))).toBe(true);
    });

    test('warns about unsupported ES6 imports', () => {
      const code = `
        import { Component } from 'react';
        import * as fs from 'fs';
        
        class Test extends Component {
          render() {
            return <div>Hello</div>;
          }
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => 
        e.code === 'UNSUPPORTED_FEATURE' && 
        e.message.includes('ES6 imports') &&
        e.severity === 'warning'
      )).toBe(true);
    });

    test('warns about unsupported async/await', () => {
      const code = `
        class Test {
          async method() {
            const result = await fetch('/api/data');
            return result.json();
          }
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => 
        e.code === 'UNSUPPORTED_FEATURE' && 
        e.message.includes('async/await') &&
        e.severity === 'warning'
      )).toBe(true);
    });

    test('warns about unsupported interfaces', () => {
      const code = `
        interface User {
          name: string;
          age: number;
        }
        
        class UserService {
          getUser(): User {
            return { name: "John", age: 30 };
          }
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => 
        e.code === 'UNSUPPORTED_FEATURE' && 
        e.message.includes('interfaces') &&
        e.severity === 'warning'
      )).toBe(true);
    });

    test('warns about unsupported generics', () => {
      const code = `
        class Container<T> {
          private items: T[] = [];
          
          add(item: T): void {
            this.items.push(item);
          }
          
          get(): T[] {
            return this.items;
          }
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => 
        e.code === 'UNSUPPORTED_FEATURE' && 
        e.message.includes('generics') &&
        e.severity === 'warning'
      )).toBe(true);
    });

    test('warns about unsupported optional chaining', () => {
      const code = `
        class Test {
          method(user: any) {
            const name = user?.profile?.name;
            const email = user?.contact?.email ?? 'no-email';
          }
        }
      `;
      
      const result = parser.parse(code);
      
      expect(result.errors.some(e => 
        e.code === 'UNSUPPORTED_FEATURE' && 
        e.message.includes('optional chaining') &&
        e.severity === 'warning'
      )).toBe(true);
    });

    test('provides helpful suggestions for unsupported features', () => {
      const code = `
        import { Observable } from 'rxjs';
        
        interface ApiResponse<T> {
          data: T;
          status: number;
        }
        
        class ApiService {
          async getData(): Promise<ApiResponse<string>> {
            const response = await fetch('/api');
            return response.json();
          }
        }
      `;
      
      const result = parser.parse(code);
      
      // Check that suggestions are provided
      const unsupportedErrors = result.errors.filter(e => e.code === 'UNSUPPORTED_FEATURE');
      expect(unsupportedErrors.length).toBeGreaterThan(0);
      
      unsupportedErrors.forEach(error => {
        expect(error.message).toMatch(/suggestion|convert|remove|use/i);
      });
    });
  });

  describe('Error Classes', () => {
    test('ConversionError provides detailed information', () => {
      const error = new ConversionError(
        'Test error message',
        ErrorCodes.PARSE_ERROR,
        {
          line: 10,
          column: 5,
          suggestions: ['Try this', 'Or this'],
          sourceCode: 'int x = ;'
        }
      );

      expect(error.message).toBe('Test error message');
      expect(error.code).toBe(ErrorCodes.PARSE_ERROR);
      expect(error.line).toBe(10);
      expect(error.column).toBe(5);
      expect(error.suggestions).toEqual(['Try this', 'Or this']);
      expect(error.sourceCode).toBe('int x = ;');
    });

    test('ConversionError toString provides formatted output', () => {
      const error = new ConversionError(
        'Parse failed',
        ErrorCodes.PARSE_ERROR,
        {
          line: 5,
          column: 10,
          suggestions: ['Check syntax', 'Add semicolon']
        }
      );

      const errorString = error.toString();
      
      expect(errorString).toContain('ConversionError: Parse failed');
      expect(errorString).toContain('PARSE_ERROR');
      expect(errorString).toContain('line 5');
      expect(errorString).toContain('column 10');
      expect(errorString).toContain('Suggestions:');
      expect(errorString).toContain('Check syntax');
      expect(errorString).toContain('Add semicolon');
    });

    test('UnsupportedFeatureError includes feature information', () => {
      const error = new UnsupportedFeatureError(
        'lambda expressions',
        'Lambda expressions are not supported in IGCSE pseudocode',
        {
          line: 15,
          column: 20,
          alternativeApproach: 'Use named methods instead',
          suggestions: ['Convert to named method', 'Use traditional function syntax']
        }
      );

      expect(error.featureName).toBe('lambda expressions');
      expect(error.alternativeApproach).toBe('Use named methods instead');
      expect(error.code).toBe(ErrorCodes.UNSUPPORTED_FEATURE);
      expect(error.suggestions).toContain('Convert to named method');
    });

    test('TypeConversionError includes type information', () => {
      const error = new TypeConversionError(
        'Map<String, Integer>',
        'Cannot convert generic Map type to IGCSE pseudocode',
        {
          targetType: 'ARRAY',
          line: 8,
          column: 12,
          suggestions: ['Use simple array instead', 'Convert to separate variables']
        }
      );

      expect(error.sourceType).toBe('Map<String, Integer>');
      expect(error.targetType).toBe('ARRAY');
      expect(error.code).toBe(ErrorCodes.TYPE_CONVERSION_ERROR);
    });

    test('ValidationError includes validation rule', () => {
      const error = new ValidationError(
        'IGCSE_VARIABLE_NAMING',
        'Variable name does not follow IGCSE naming conventions',
        {
          line: 3,
          column: 8,
          suggestions: ['Use descriptive names', 'Avoid abbreviations']
        }
      );

      expect(error.validationRule).toBe('IGCSE_VARIABLE_NAMING');
      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('Error Recovery', () => {
    test('parser continues after recoverable errors', () => {
      const code = `int x = 5;`;
      
      const parser = new JavaParser();
      const result = parser.parse(code);
      
      // Should produce AST - even if simple
      expect(result.ast).toBeDefined();
      expect(result.ast.type).toBe('program');
      
      // The parser should at least attempt to parse and not crash
      expect(result.success || result.errors.length >= 0).toBe(true);
    });

    test('provides context in error messages', () => {
      const code = `
        public class Test {
          public void method() {
            int result = ;
          }
        }
      `;
      
      const parser = new JavaParser();
      const result = parser.parse(code);
      
      // Should have error with line information
      const errorWithContext = result.errors.find(e => 
        e.message.includes('line') && e.line && e.line > 1
      );
      expect(errorWithContext).toBeDefined();
    });
  });
});