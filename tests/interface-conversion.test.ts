// Tests for TypeScript interface conversion to comments

import { TypeScriptParser } from '../src/parsers/typescript-parser';
import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';
import { IGCSEPseudocodeGenerator } from '../src/generators/pseudocode-generator';

describe('Interface Conversion Tests', () => {
  let parser: TypeScriptParser;
  let transformer: TypeScriptASTTransformer;
  let generator: IGCSEPseudocodeGenerator;

  beforeEach(() => {
    parser = new TypeScriptParser();
    transformer = new TypeScriptASTTransformer();
    generator = new IGCSEPseudocodeGenerator();
  });

  describe('Simple Interface Conversion', () => {
    test('converts simple interface to descriptive comments', () => {
      const source = `
        interface User {
          id: number;
          name: string;
          email: string;
        }
      `;

      const parseResult = parser.parse(source);
      expect(parseResult.success).toBe(true);

      const transformResult = transformer.transform(parseResult.ast);
      expect(transformResult.success).toBe(true);

      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Interface: User');
      expect(pseudocode).toContain('// Properties: id (REAL), name (STRING), email (STRING)');
    });

    test('converts interface with array properties', () => {
      const source = `
        interface Student {
          id: number;
          name: string;
          grades: number[];
          isActive: boolean;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Interface: Student');
      expect(pseudocode).toContain('// Properties: id (REAL), name (STRING), grades (ARRAY[1:SIZE] OF REAL), isActive (BOOLEAN)');
    });
  });

  describe('Generic Interface Conversion', () => {
    test('converts generic interface with type parameters', () => {
      const source = `
        interface Repository<T> {
          save(item: T): void;
          findById(id: number): T | undefined;
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

    test('converts generic interface with constraints', () => {
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
    });
  });

  describe('Interface Inheritance', () => {
    test('converts interface with inheritance', () => {
      const source = `
        interface ExtendedUser extends User {
          role: string;
          permissions: string[];
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Interface: ExtendedUser');
      expect(pseudocode).toContain('// Extends: User');
      expect(pseudocode).toContain('// Properties: role (STRING), permissions (ARRAY[1:SIZE] OF STRING)');
    });

    test('converts interface with multiple inheritance', () => {
      const source = `
        interface AdminUser extends User, Permissions {
          adminLevel: number;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Interface: AdminUser');
      expect(pseudocode).toContain('// Extends: User, Permissions');
      expect(pseudocode).toContain('// Properties: adminLevel (REAL)');
    });
  });

  describe('Interface with Methods', () => {
    test('converts interface with method signatures', () => {
      const source = `
        interface Calculator {
          add(a: number, b: number): number;
          subtract(a: number, b: number): number;
          reset(): void;
          getHistory(): string[];
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Interface: Calculator');
      expect(pseudocode).toContain('// Methods: add(a : REAL, b : REAL) RETURNS REAL, subtract(a : REAL, b : REAL) RETURNS REAL, reset(), getHistory() RETURNS STRING');
    });

    test('converts interface with mixed properties and methods', () => {
      const source = `
        interface UserService {
          users: User[];
          currentUser: User;
          login(username: string, password: string): boolean;
          logout(): void;
          getCurrentUser(): User;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Interface: UserService');
      expect(pseudocode).toContain('// Properties: users (ARRAY[1:SIZE] OF STRING), currentUser (STRING)');
      expect(pseudocode).toContain('// Methods: login(username : STRING, password : STRING) RETURNS BOOLEAN, logout(), getCurrentUser() RETURNS STRING');
    });
  });

  describe('Complex Interface Scenarios', () => {
    test('converts interface with optional properties', () => {
      const source = `
        interface Config {
          host: string;
          port?: number;
          ssl?: boolean;
          timeout: number;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Interface: Config');
      expect(pseudocode).toContain('// Properties: host (STRING), port? (REAL), ssl? (BOOLEAN), timeout (REAL)');
    });

    test('converts interface with readonly properties', () => {
      const source = `
        interface ReadonlyConfig {
          readonly id: number;
          readonly name: string;
          mutable: boolean;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Interface: ReadonlyConfig');
      expect(pseudocode).toContain('// Properties: readonly id (REAL), readonly name (STRING), mutable (BOOLEAN)');
    });

    test('converts interface with index signatures', () => {
      const source = `
        interface Dictionary {
          [key: string]: any;
          [index: number]: string;
          name: string;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Interface: Dictionary');
      expect(pseudocode).toContain('// Index signatures: [STRING]: STRING, [REAL]: STRING');
      expect(pseudocode).toContain('// Properties: name (STRING)');
    });

    test('converts interface with union types', () => {
      const source = `
        interface FlexibleInterface {
          id: number | string;
          status: 'active' | 'inactive' | 'pending';
          data: string | number | boolean;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Interface: FlexibleInterface');
      expect(pseudocode).toContain('id (REAL | STRING)');
      expect(pseudocode).toContain('status (STRING)');
      expect(pseudocode).toContain('data (STRING | REAL | BOOLEAN)');
    });

    test('converts interface with function types', () => {
      const source = `
        interface CallbackInterface {
          onClick: (event: MouseEvent) => void;
          transform: (input: string) => number;
          validator: (value: any) => boolean;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Interface: CallbackInterface');
      expect(pseudocode).toContain('onClick (FUNCTION RETURNS STRING)');
      expect(pseudocode).toContain('transform (FUNCTION RETURNS REAL)');
      expect(pseudocode).toContain('validator (FUNCTION RETURNS BOOLEAN)');
    });

    test('converts empty interface with explanatory text', () => {
      const source = `
        interface EmptyInterface {
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Interface: EmptyInterface');
      expect(pseudocode).toContain('// Empty interface - can be extended by other interfaces');
    });

    test('generates warnings for interface conversion', () => {
      const source = `
        interface TestInterface {
          value: string;
        }
      `;

      const parseResult = parser.parse(source);
      const transformResult = transformer.transform(parseResult.ast);
      
      expect(transformResult.warnings).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("Interface 'TestInterface' converted to descriptive comments"),
          code: 'FEATURE_CONVERSION'
        })
      );
    });
  });
});