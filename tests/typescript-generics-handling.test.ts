// Test for TypeScript generics handling implementation

import { TypeScriptParser } from '../src/parsers/typescript-parser';
import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';
import { IGCSEPseudocodeGenerator } from '../src/generators/pseudocode-generator';

describe('TypeScript Generics Handling', () => {
  let parser: TypeScriptParser;
  let transformer: TypeScriptASTTransformer;
  let generator: IGCSEPseudocodeGenerator;

  beforeEach(() => {
    parser = new TypeScriptParser();
    transformer = new TypeScriptASTTransformer();
    generator = new IGCSEPseudocodeGenerator();
  });

  describe('Generic Interfaces', () => {
    test('converts generic interface with single type parameter', () => {
      const source = `
        interface Repository<T> {
          save(item: T): void;
          findById(id: number): T;
          findAll(): T[];
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Generic interface: Repository<T>');
      expect(pseudocode).toContain('// Type parameter T represents any type');
      expect(pseudocode).toContain('// Methods: save(item : T), findById(id : REAL) RETURNS T, findAll() RETURNS ARRAY[1:SIZE] OF T');
    });

    test('converts generic interface with constrained type parameter', () => {
      const source = `
        interface Container<T extends { id: number }> {
          items: T[];
          add(item: T): void;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Generic interface: Container<T extends { id: number }>');
      expect(pseudocode).toContain('// Type parameter T represents any type with id property');
      expect(pseudocode).toContain('// Properties: items (ARRAY[1:SIZE] OF T)');
      expect(pseudocode).toContain('// Methods: add(item : T)');
    });

    test('converts generic interface with multiple type parameters', () => {
      const source = `
        interface Map<K, V> {
          get(key: K): V;
          set(key: K, value: V): void;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Generic interface: Map<K, V>');
      expect(pseudocode).toContain('// Type parameter K represents any type');
      expect(pseudocode).toContain('// Type parameter V represents any type');
      expect(pseudocode).toContain('// Methods: get(key : K) RETURNS V, set(key : K, value : V)');
    });
  });

  describe('Generic Classes', () => {
    test('converts generic class with single type parameter', () => {
      const source = `
        class List<T> {
          private items: T[] = [];
          
          add(item: T): void {
            this.items.push(item);
          }
          
          get(index: number): T {
            return this.items[index];
          }
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Generic class: List<T>');
      expect(pseudocode).toContain('// Type parameter T represents any type');
      expect(pseudocode).toContain('DECLARE items : ARRAY[1:SIZE] OF T ← []');
      expect(pseudocode).toContain('PROCEDURE add(item : T)');
      expect(pseudocode).toContain('FUNCTION get(index : REAL) RETURNS T');
    });

    test('converts generic class with constrained type parameter', () => {
      const source = `
        class Repository<T extends { id: number }> {
          private items: T[] = [];
          
          save(item: T): void {
            this.items.push(item);
          }
          
          findById(id: number): T | undefined {
            return this.items.find(item => item.id === id);
          }
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Generic class: Repository<T extends { id: number }>');
      expect(pseudocode).toContain('// Type parameter T represents any type with id property');
      expect(pseudocode).toContain('DECLARE items : ARRAY[1:SIZE] OF T ← []');
      expect(pseudocode).toContain('PROCEDURE save(item : T)');
      expect(pseudocode).toContain('FUNCTION findById(id : REAL) RETURNS T');
    });

    test('converts generic class with inheritance', () => {
      const source = `
        class InMemoryRepository<T> implements Repository<T> {
          private items: T[] = [];
          
          save(item: T): void {
            this.items.push(item);
          }
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Generic class: InMemoryRepository<T>');
      expect(pseudocode).toContain('// Type parameter T represents any type');
      expect(pseudocode).toContain('// InMemoryRepository implements Repository');
      expect(pseudocode).toContain('DECLARE items : ARRAY[1:SIZE] OF T ← []');
      expect(pseudocode).toContain('PROCEDURE save(item : T)');
    });
  });

  describe('Generic Functions', () => {
    test('converts generic function with type parameter', () => {
      const source = `
        function identity<T>(arg: T): T {
          return arg;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      // Generic functions should preserve the generic type in parameters and return type
      expect(pseudocode).toContain('FUNCTION identity(arg : T) RETURNS T');
    });

    test('converts generic function with array type parameter', () => {
      const source = `
        function getFirst<T>(items: T[]): T {
          return items[0];
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('FUNCTION getFirst(items : ARRAY[1:SIZE] OF T) RETURNS T');
    });
  });

  describe('Generic Type Preservation', () => {
    test('preserves generic types in variable declarations', () => {
      const source = `
        let items: T[] = [];
        let item: T;
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('DECLARE items : ARRAY[1:SIZE] OF T ← []');
      expect(pseudocode).toContain('DECLARE item : T');
    });

    test('preserves generic types in method signatures', () => {
      const source = `
        interface Service<T> {
          process(input: T): T[];
          validate(items: T[]): boolean;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Methods: process(input : T) RETURNS ARRAY[1:SIZE] OF T, validate(items : ARRAY[1:SIZE] OF T) RETURNS BOOLEAN');
    });
  });

  describe('Complex Generic Scenarios', () => {
    test('handles nested generic types', () => {
      const source = `
        interface Response<T> {
          data: T;
          items: T[];
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Generic interface: Response<T>');
      expect(pseudocode).toContain('// Properties: data (T), items (ARRAY[1:SIZE] OF T)');
    });

    test('handles multiple constraints', () => {
      const source = `
        interface Processor<T extends { id: number }, U extends { name: string }> {
          process(input: T): U;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Generic interface: Processor<T extends { id: number }, U extends { name: string }>');
      expect(pseudocode).toContain('// Type parameter T represents any type with id property');
      expect(pseudocode).toContain('// Type parameter U represents any type with name property');
      expect(pseudocode).toContain('// Methods: process(input : T) RETURNS U');
    });
  });
});