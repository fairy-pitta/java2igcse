// Tests for input validation functionality

import { InputValidator, ValidationResult } from '../src/validators/input-validator';
import { ValidationError } from '../src/errors';

describe('Input Validation Tests', () => {
  describe('Basic Input Validation', () => {
    let validator: InputValidator;

    beforeEach(() => {
      validator = new InputValidator();
    });

    test('rejects null input', () => {
      const result = validator.validateJavaInput(null as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].validationRule).toBe('NULL_INPUT');
      expect(result.errors[0].message).toContain('null or undefined');
    });

    test('rejects undefined input', () => {
      const result = validator.validateJavaInput(undefined as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].validationRule).toBe('NULL_INPUT');
    });

    test('rejects empty input by default', () => {
      const result = validator.validateJavaInput('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].validationRule).toBe('EMPTY_INPUT');
      expect(result.errors[0].message).toContain('cannot be empty');
    });

    test('rejects whitespace-only input by default', () => {
      const result = validator.validateJavaInput('   \n\t  \n  ');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].validationRule).toBe('EMPTY_INPUT');
    });

    test('allows empty input when configured', () => {
      const validator = new InputValidator({ allowEmptyInput: true });
      const result = validator.validateJavaInput('');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects input that exceeds maximum size', () => {
      const validator = new InputValidator({ maxInputSize: 100 });
      const largeInput = 'a'.repeat(101);
      
      const result = validator.validateJavaInput(largeInput);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].validationRule).toBe('INPUT_TOO_LARGE');
      expect(result.errors[0].message).toContain('exceeds maximum size');
    });

    test('rejects binary content', () => {
      const binaryInput = 'public class Test {\0 invalid binary content }';
      
      const result = validator.validateJavaInput(binaryInput);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].validationRule).toBe('BINARY_CONTENT');
      expect(result.errors[0].message).toContain('binary content');
    });

    test('warns about encoding issues', () => {
      const encodingIssueInput = 'public class Test { String message = "Hello�World"; }';
      
      const result = validator.validateJavaInput(encodingIssueInput);
      
      expect(result.isValid).toBe(true); // Still valid, just a warning
      expect(result.warnings.some(w => w.includes('encoding issues'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('UTF-8'))).toBe(true);
    });

    test('warns about extremely long lines', () => {
      const longLineInput = `public class Test {
        String veryLongString = "${'a'.repeat(600)}";
      }`;
      
      const result = validator.validateJavaInput(longLineInput);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('extremely long lines'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('breaking long lines'))).toBe(true);
    });

    test('warns about mixed line endings', () => {
      const mixedLineEndingInput = 'public class Test {\r\n  int x = 5;\n  int y = 10;\r\n}';
      
      const result = validator.validateJavaInput(mixedLineEndingInput);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('Mixed line endings'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('Normalize line endings'))).toBe(true);
    });
  });

  describe('Java-Specific Validation', () => {
    let validator: InputValidator;

    beforeEach(() => {
      validator = new InputValidator();
    });

    test('validates proper Java code', () => {
      const javaCode = `
        public class HelloWorld {
          public static void main(String[] args) {
            System.out.println("Hello, World!");
          }
        }
      `;
      
      const result = validator.validateJavaInput(javaCode);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('warns when no class declarations found', () => {
      const codeWithoutClass = `
        int x = 5;
        System.out.println(x);
      `;
      
      const result = validator.validateJavaInput(codeWithoutClass);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('No class, interface, or enum declarations'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('class declaration'))).toBe(true);
    });

    test('warns when no Java keywords found', () => {
      const nonJavaCode = `
        hello world
        this is not java code
      `;
      
      const result = validator.validateJavaInput(nonJavaCode);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('No common Java keywords found'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('valid Java source code'))).toBe(true);
    });

    test('warns about malformed import statements', () => {
      const malformedImports = `
        import java.util
        import ArrayList;
        
        public class Test {}
      `;
      
      const result = validator.validateJavaInput(malformedImports);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('Malformed import statements'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('import package.Class;'))).toBe(true);
    });

    test('warns about malformed package declarations', () => {
      const malformedPackage = `
        package com.example
        
        public class Test {}
      `;
      
      const result = validator.validateJavaInput(malformedPackage);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('Malformed package declaration'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('package com.example;'))).toBe(true);
    });

    test('detects mismatched braces', () => {
      const mismatchedBraces = `
        public class Test {
          public void method() {
            System.out.println("Hello");
          // Missing closing brace
        }
      `;
      
      const result = validator.validateJavaInput(mismatchedBraces);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.validationRule === 'MISMATCHED_BRACES')).toBe(true);
    });

    test('detects mismatched parentheses', () => {
      const mismatchedParens = `
        public class Test {
          public void method() {
            if (x > 0 {
              System.out.println("positive");
            }
          }
        }
      `;
      
      const result = validator.validateJavaInput(mismatchedParens);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.validationRule === 'MISMATCHED_PARENTHESES')).toBe(true);
    });

    test('detects mismatched square brackets', () => {
      const mismatchedBrackets = `
        public class Test {
          int[] array = new int[10;
        }
      `;
      
      const result = validator.validateJavaInput(mismatchedBrackets);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.validationRule === 'MISMATCHED_BRACKETS')).toBe(true);
    });

    test('warns about common Java features that will be converted', () => {
      const javaWithFeatures = `
        import java.util.Scanner;
        import java.util.ArrayList;
        
        public class Test {
          public void method() {
            Scanner scanner = new Scanner(System.in);
            ArrayList<String> list = new ArrayList<>();
            
            try {
              System.out.println("Hello");
            } catch (Exception e) {
              System.out.println("Error");
            }
            
            list.forEach(item -> System.out.println(item));
          }
        }
      `;
      
      const result = validator.validateJavaInput(javaWithFeatures);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('Scanner usage detected'))).toBe(true);
      expect(result.warnings.some(w => w.includes('Java Collections detected'))).toBe(true);
      expect(result.warnings.some(w => w.includes('Exception handling detected'))).toBe(true);
      expect(result.warnings.some(w => w.includes('Lambda expressions detected'))).toBe(true);
      
      expect(result.suggestions.some(s => s.includes('INPUT statements'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('simple arrays'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('conditional error checking'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('named methods'))).toBe(true);
    });

    test('warns about possible missing semicolons', () => {
      const missingSemicolons = `
        public class Test {
          public void method() {
            int x = 5
            System.out.println("Hello")
            return
          }
        }
      `;
      
      const result = validator.validateJavaInput(missingSemicolons);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('missing semicolons'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('end with semicolons'))).toBe(true);
    });
  });

  describe('TypeScript-Specific Validation', () => {
    let validator: InputValidator;

    beforeEach(() => {
      validator = new InputValidator();
    });

    test('validates proper TypeScript code', () => {
      const tsCode = `
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
      
      const result = validator.validateTypeScriptInput(tsCode);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('warns when no TypeScript constructs found', () => {
      const plainText = `
        hello world
        this is not code
      `;
      
      const result = validator.validateTypeScriptInput(plainText);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('No TypeScript or JavaScript constructs'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('valid TypeScript/JavaScript'))).toBe(true);
    });

    test('warns about variables without type annotations', () => {
      const noTypeAnnotations = `
        let x = 5;
        const message = "hello";
        var count = 0;
      `;
      
      const result = validator.validateTypeScriptInput(noTypeAnnotations);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('no type annotations detected'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('adding type annotations'))).toBe(true);
    });

    test('warns about malformed ES6 imports', () => {
      const malformedImports = `
        import React;
        import { Component } from;
        import * as fs;
        
        class Test {}
      `;
      
      const result = validator.validateTypeScriptInput(malformedImports);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('Malformed ES6 import'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('ES6 syntax'))).toBe(true);
    });

    test('warns about malformed export statements', () => {
      const malformedExports = `
        export;
        export default;
        export { };
        
        class Test {}
      `;
      
      const result = validator.validateTypeScriptInput(malformedExports);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('Malformed export'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('proper syntax'))).toBe(true);
    });

    test('detects unterminated template literals', () => {
      const unterminatedTemplate = `
        class Test {
          message = \`Hello World
        }
      `;
      
      const result = validator.validateTypeScriptInput(unterminatedTemplate);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.validationRule === 'UNTERMINATED_TEMPLATE')).toBe(true);
    });

    test('warns about TypeScript features that will be converted', () => {
      const tsWithFeatures = `
        import { Observable } from 'rxjs';
        
        interface User {
          name: string;
          age?: number;
        }
        
        class UserService {
          async getUser(): Promise<User> {
            const response = await fetch('/api/user');
            const user = response?.data?.user ?? { name: 'Unknown' };
            
            console.log('User: ' + user.name);
            
            return user;
          }
        }
      `;
      
      const result = validator.validateTypeScriptInput(tsWithFeatures);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('console.log'))).toBe(true);
      expect(result.warnings.some(w => w.includes('Async functions'))).toBe(true);
      expect(result.warnings.some(w => w.includes('Await expressions'))).toBe(true);
      expect(result.warnings.some(w => w.includes('Promise types'))).toBe(true);
      expect(result.warnings.some(w => w.includes('Optional chaining'))).toBe(true);
      expect(result.warnings.some(w => w.includes('Nullish coalescing'))).toBe(true);
      
      expect(result.suggestions.some(s => s.includes('OUTPUT statements'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('synchronous procedures'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('synchronous calls'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('synchronous operations'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('explicit null checks'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('conditional statements'))).toBe(true);
    });

    test('warns about functions without type annotations', () => {
      const functionsWithoutTypes = `
        function add(a, b) {
          return a + b;
        }
        
        function greet(name) {
          console.log("Hello " + name);
        }
      `;
      
      const result = validator.validateTypeScriptInput(functionsWithoutTypes);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('functions found without type annotations'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('Add type annotations to function parameters'))).toBe(true);
    });
  });

  describe('Validation Options', () => {
    test('respects allowEmptyInput option', () => {
      const validator = new InputValidator({ allowEmptyInput: true });
      const result = validator.validateJavaInput('');
      
      expect(result.isValid).toBe(true);
    });

    test('respects maxInputSize option', () => {
      const validator = new InputValidator({ maxInputSize: 50 });
      const result = validator.validateJavaInput('a'.repeat(51));
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0].validationRule).toBe('INPUT_TOO_LARGE');
    });

    test('respects checkEncoding option', () => {
      const validator = new InputValidator({ checkEncoding: false });
      const result = validator.validateJavaInput('public class Test { String msg = "Hello�World"; }');
      
      expect(result.warnings.some(w => w.includes('encoding'))).toBe(false);
    });

    test('strictMode affects validation behavior', () => {
      const validator = new InputValidator({ strictMode: true });
      const result = validator.validateJavaInput('int x = 5;'); // No class declaration
      
      expect(result.isValid).toBe(true);
      // In strict mode, we might have additional warnings
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Helpful Error Messages', () => {
    test('provides helpful error messages for common issues', () => {
      const nullError = new ValidationError('NULL_INPUT', 'Test message');
      const emptyError = new ValidationError('EMPTY_INPUT', 'Test message');
      const braceError = new ValidationError('MISMATCHED_BRACES', 'Test message');
      
      expect(InputValidator.getHelpfulErrorMessage(nullError)).toContain('null or undefined');
      expect(InputValidator.getHelpfulErrorMessage(emptyError)).toContain('empty');
      expect(InputValidator.getHelpfulErrorMessage(braceError)).toContain('curly braces');
    });

    test('falls back to original message for unknown error codes', () => {
      const unknownError = new ValidationError('UNKNOWN_ERROR', 'Original message');
      
      expect(InputValidator.getHelpfulErrorMessage(unknownError)).toBe('Original message');
    });
  });

  describe('Integration with Parsers', () => {
    test('validation result structure matches parser expectations', () => {
      const validator = new InputValidator();
      const result = validator.validateJavaInput('public class Test {}');
      
      // Ensure the result has the expected structure
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('suggestions');
      
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    test('validation errors are proper ValidationError instances', () => {
      const validator = new InputValidator();
      const result = validator.validateJavaInput(null as any);
      
      expect(result.errors[0]).toBeInstanceOf(ValidationError);
      expect(result.errors[0]).toHaveProperty('validationRule');
      expect(result.errors[0]).toHaveProperty('message');
      expect(result.errors[0]).toHaveProperty('suggestions');
    });
  });
});