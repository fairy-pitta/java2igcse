// Tests for TypeScript async/await and Promise handling

import { TypeScriptParser } from '../src/parsers/typescript-parser';
import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';
import { IGCSEPseudocodeGenerator } from '../src/generators/pseudocode-generator';

describe('Async/Await and Promise Handling Tests', () => {
  let parser: TypeScriptParser;
  let transformer: TypeScriptASTTransformer;
  let generator: IGCSEPseudocodeGenerator;

  beforeEach(() => {
    parser = new TypeScriptParser();
    transformer = new TypeScriptASTTransformer();
    generator = new IGCSEPseudocodeGenerator();
  });

  describe('Async Function Conversion', () => {
    test('converts async function with descriptive comment', () => {
      const source = `
        async function fetchData(): Promise<string> {
          return "data";
        }
      `;

      const parseResult = parser.parse(source);
      expect(parseResult.success).toBe(true);

      const transformResult = transformer.transform(parseResult.ast);
      expect(transformResult.success).toBe(true);

      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Async function - handles asynchronous operations');
      expect(pseudocode).toContain('FUNCTION fetchData() RETURNS STRING');
      expect(pseudocode).toContain('ENDFUNCTION');
    });

    test('converts async procedure (Promise<void>)', () => {
      const source = `
        async function processData(): Promise<void> {
          console.log("Processing...");
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Async function - handles asynchronous operations');
      expect(pseudocode).toContain('PROCEDURE processData()');
      expect(pseudocode).toContain('ENDPROCEDURE');
    });

    test('converts async method with descriptive comment', () => {
      const source = `
        class DataService {
          async getData(): Promise<number> {
            return 42;
          }
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Async method - handles asynchronous operations');
      expect(pseudocode).toContain('FUNCTION getData() RETURNS REAL');
    });
  });

  describe('Promise Type Conversion', () => {
    test('converts Promise<string> to STRING', () => {
      const source = `
        async function getString(): Promise<string> {
          return "hello";
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('FUNCTION getString() RETURNS STRING');
    });

    test('converts Promise<number> to REAL', () => {
      const source = `
        async function getNumber(): Promise<number> {
          return 123;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('FUNCTION getNumber() RETURNS REAL');
    });

    test('converts Promise<boolean> to BOOLEAN', () => {
      const source = `
        async function getFlag(): Promise<boolean> {
          return true;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('FUNCTION getFlag() RETURNS BOOLEAN');
    });

    test('converts Promise<CustomType> to STRING', () => {
      const source = `
        async function getUser(): Promise<User> {
          return { id: 1, name: "John" };
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('FUNCTION getUser() RETURNS STRING');
    });

    test('converts Promise<void> to PROCEDURE', () => {
      const source = `
        async function saveData(): Promise<void> {
          // Save operation
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('PROCEDURE saveData()');
    });
  });

  describe('Warning Generation', () => {
    test('generates warnings for async function conversion', () => {
      const source = `
        async function testAsync(): Promise<string> {
          return "test";
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      
      expect(transformResult.warnings).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("Async function 'testAsync' converted to regular function"),
          code: 'FEATURE_CONVERSION'
        })
      );
    });

    test('generates warnings for Promise type conversion', () => {
      const source = `
        async function testPromise(): Promise<CustomType> {
          return {} as CustomType;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      
      expect(transformResult.warnings).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("Promise<CustomType> return type converted to CustomType"),
          code: 'FEATURE_CONVERSION'
        })
      );
    });

    test('generates warnings for async method conversion', () => {
      const source = `
        class TestClass {
          async testMethod(): Promise<void> {
            // Method body
          }
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      
      expect(transformResult.warnings).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("Async method 'testMethod' converted to regular procedure"),
          code: 'FEATURE_CONVERSION'
        })
      );
    });
  });

  describe('Complex Async Scenarios', () => {
    test('handles async function with parameters', () => {
      const source = `
        async function fetchUser(id: number, includeDetails: boolean): Promise<User> {
          return { id, name: "User" };
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Async function - handles asynchronous operations');
      expect(pseudocode).toContain('FUNCTION fetchUser(id : REAL, includeDetails : BOOLEAN) RETURNS STRING');
    });

    test('handles static async methods', () => {
      const source = `
        class ApiService {
          static async getData(): Promise<string> {
            return "data";
          }
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Static method');
      expect(pseudocode).toContain('// Async method - handles asynchronous operations');
      expect(pseudocode).toContain('FUNCTION getData() RETURNS STRING');
    });

    test('handles async arrow functions', () => {
      const source = `
        const fetchData = async (): Promise<number> => {
          return 42;
        };
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      // Arrow functions get converted to named procedures/functions
      expect(pseudocode).toContain('// Async function - handles asynchronous operations');
      expect(pseudocode).toContain('RETURNS REAL');
    });
  });
});