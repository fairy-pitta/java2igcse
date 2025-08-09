// Tests for Variable Declaration Transformer

import { VariableDeclarationTransformer } from '../src/transformers/variable-declaration-transformer';
import { BaseASTTransformer } from '../src/transformers/base-transformer';
import { IGCSEType } from '../src/index';

// Mock base transformer for testing
class MockBaseTransformer extends BaseASTTransformer<any> {
  transform(ast: any) {
    return this.createTransformResult(this.createIRNode('program', 'test'));
  }

  // Expose protected methods for testing
  public testDeclareVariable(name: string, type: IGCSEType, isArray: boolean = false, arrayDimensions?: number[]) {
    this.declareVariable(name, type, isArray, arrayDimensions);
  }

  public testGetContextSnapshot() {
    return this.getContextSnapshot();
  }
}

describe('VariableDeclarationTransformer', () => {
  let baseTransformer: MockBaseTransformer;
  let transformer: VariableDeclarationTransformer;

  beforeEach(() => {
    baseTransformer = new MockBaseTransformer();
    transformer = new VariableDeclarationTransformer(baseTransformer);
  });

  describe('Java variable declaration transformation', () => {
    test('transforms simple Java variable declaration', () => {
      const result = transformer.transformJavaVariableDeclaration(
        'int',
        'count',
        undefined,
        undefined,
        { line: 1, column: 1 }
      );

      expect(result.ir.type).toBe('declaration');
      expect(result.ir.kind).toBe('variable_declaration');
      expect(result.ir.metadata.language).toBe('java');
      expect(result.ir.metadata.variableName).toBe('count');
      expect(result.ir.metadata.sourceType).toBe('int');
      expect(result.ir.metadata.igcseType).toBe('INTEGER');
      expect(result.ir.metadata.isArray).toBe(false);
      expect(result.ir.metadata.igcseDeclaration).toBe('DECLARE count : INTEGER');
      
      expect(result.variableInfo.name).toBe('count');
      expect(result.variableInfo.type).toBe('INTEGER');
      expect(result.variableInfo.isArray).toBe(false);
      expect(result.warnings).toHaveLength(0);
    });

    test('transforms Java variable with initialization', () => {
      const result = transformer.transformJavaVariableDeclaration(
        'String',
        'name',
        'John',
        undefined,
        { line: 1, column: 1 }
      );

      expect(result.ir.metadata.hasInitializer).toBe(true);
      expect(result.ir.metadata.initialValue).toBe('John');
      expect(result.variableInfo.initialValue).toBe('John');
    });

    test('transforms Java array declaration', () => {
      const result = transformer.transformJavaVariableDeclaration(
        'int',
        'numbers',
        undefined,
        { isArray: true, arrayDimensions: [10] },
        { line: 1, column: 1 }
      );

      expect(result.ir.metadata.isArray).toBe(true);
      expect(result.ir.metadata.arrayDimensions).toEqual([10]);
      expect(result.ir.metadata.igcseDeclaration).toBe('DECLARE numbers : ARRAY[1:n] OF INTEGER');
      expect(result.variableInfo.isArray).toBe(true);
      expect(result.variableInfo.arrayDimensions).toEqual([10]);
    });

    test('transforms multi-dimensional Java array with warning', () => {
      const result = transformer.transformJavaVariableDeclaration(
        'String',
        'matrix',
        undefined,
        { isArray: true, arrayDimensions: [5, 10, 3] },
        { line: 1, column: 1 }
      );

      expect(result.ir.metadata.igcseDeclaration).toBe('DECLARE matrix : ARRAY[1:n] OF ARRAY[1:n] OF ARRAY[1:n] OF STRING');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Multi-dimensional array with 3 dimensions');
    });

    test('handles unknown Java type with warning', () => {
      const result = transformer.transformJavaVariableDeclaration(
        'CustomClass',
        'obj',
        undefined,
        undefined,
        { line: 1, column: 1 }
      );

      expect(result.ir.metadata.igcseType).toBe('STRING');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Unknown Java type');
    });

    test('handles array initialization with warning', () => {
      const result = transformer.transformJavaVariableDeclaration(
        'int',
        'arr',
        '{1, 2, 3}',
        { isArray: true, arrayDimensions: [3] },
        { line: 1, column: 1 }
      );

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Array initialization will require manual conversion');
    });

    test('converts all Java primitive types correctly', () => {
      const typeTests = [
        { java: 'int', igcse: 'INTEGER' },
        { java: 'String', igcse: 'STRING' },
        { java: 'boolean', igcse: 'BOOLEAN' },
        { java: 'double', igcse: 'REAL' },
        { java: 'float', igcse: 'REAL' },
        { java: 'char', igcse: 'CHAR' },
        { java: 'byte', igcse: 'INTEGER' },
        { java: 'short', igcse: 'INTEGER' },
        { java: 'long', igcse: 'INTEGER' }
      ];

      typeTests.forEach(({ java, igcse }) => {
        const result = transformer.transformJavaVariableDeclaration(java, 'testVar');
        expect(result.ir.metadata.igcseType).toBe(igcse);
      });
    });
  });

  describe('TypeScript variable declaration transformation', () => {
    test('transforms TypeScript variable with type annotation', () => {
      const result = transformer.transformTypeScriptVariableDeclaration(
        'count',
        'number',
        undefined,
        false,
        { line: 1, column: 1 }
      );

      expect(result.ir.type).toBe('declaration');
      expect(result.ir.kind).toBe('variable_declaration');
      expect(result.ir.metadata.language).toBe('typescript');
      expect(result.ir.metadata.variableName).toBe('count');
      expect(result.ir.metadata.sourceType).toBe('number');
      expect(result.ir.metadata.igcseType).toBe('REAL');
      expect(result.ir.metadata.igcseDeclaration).toBe('DECLARE count : REAL');
      
      expect(result.variableInfo.name).toBe('count');
      expect(result.variableInfo.type).toBe('REAL');
      expect(result.warnings).toHaveLength(0);
    });

    test('transforms TypeScript variable with initializer only', () => {
      const result = transformer.transformTypeScriptVariableDeclaration(
        'flag',
        undefined,
        'true',
        false,
        { line: 1, column: 1 }
      );

      expect(result.ir.metadata.igcseType).toBe('BOOLEAN');
      expect(result.ir.metadata.hasInitializer).toBe(true);
      expect(result.ir.metadata.initialValue).toBe('true');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Type inferred from initializer');
    });

    test('transforms TypeScript array type', () => {
      const result = transformer.transformTypeScriptVariableDeclaration(
        'items',
        'string[]',
        undefined,
        false,
        { line: 1, column: 1 }
      );

      expect(result.ir.metadata.isArray).toBe(true);
      expect(result.ir.metadata.igcseType).toBe('STRING');
      expect(result.ir.metadata.igcseDeclaration).toBe('DECLARE items : ARRAY[1:n] OF STRING');
    });

    test('transforms optional parameter with warning', () => {
      const result = transformer.transformTypeScriptVariableDeclaration(
        'optionalVar?',
        'string?',
        undefined,
        true,
        { line: 1, column: 1 }
      );

      expect(result.ir.metadata.variableName).toBe('optionalVar');
      expect(result.ir.metadata.originalName).toBe('optionalVar?');
      expect(result.ir.metadata.isOptional).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Optional parameter');
    });

    test('transforms union type with warning', () => {
      const result = transformer.transformTypeScriptVariableDeclaration(
        'unionVar',
        'string | number',
        undefined,
        false,
        { line: 1, column: 1 }
      );

      expect(result.ir.metadata.igcseType).toBe('STRING'); // Takes first type
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Union type');
    });

    test('transforms generic type with warning', () => {
      const result = transformer.transformTypeScriptVariableDeclaration(
        'genericVar',
        'Array<string>',
        undefined,
        false,
        { line: 1, column: 1 }
      );

      expect(result.ir.metadata.igcseType).toBe('STRING');
      expect(result.ir.metadata.isArray).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Generic type');
    });

    test('transforms function type with warning', () => {
      const result = transformer.transformTypeScriptVariableDeclaration(
        'funcVar',
        '(x: number) => string',
        undefined,
        false,
        { line: 1, column: 1 }
      );

      expect(result.ir.metadata.igcseType).toBe('STRING'); // Return type
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Function type');
    });

    test('handles dynamic types with warning', () => {
      const dynamicTypes = ['any', 'unknown', 'void'];

      dynamicTypes.forEach(type => {
        const result = transformer.transformTypeScriptVariableDeclaration(
          'dynamicVar',
          type,
          undefined,
          false,
          { line: 1, column: 1 }
        );

        expect(result.ir.metadata.igcseType).toBe('STRING');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]).toContain('Dynamic type');
      });
    });

    test('converts all TypeScript basic types correctly', () => {
      const typeTests = [
        { ts: 'number', igcse: 'REAL' },
        { ts: 'string', igcse: 'STRING' },
        { ts: 'boolean', igcse: 'BOOLEAN' },
        { ts: 'char', igcse: 'CHAR' },
        { ts: 'int', igcse: 'INTEGER' },
        { ts: 'integer', igcse: 'INTEGER' }
      ];

      typeTests.forEach(({ ts, igcse }) => {
        const result = transformer.transformTypeScriptVariableDeclaration('testVar', ts);
        expect(result.ir.metadata.igcseType).toBe(igcse);
      });
    });
  });

  describe('type inference from initializers', () => {
    test('infers boolean from true/false', () => {
      const trueResult = transformer.transformTypeScriptVariableDeclaration('flag1', undefined, 'true');
      const falseResult = transformer.transformTypeScriptVariableDeclaration('flag2', undefined, 'false');

      expect(trueResult.ir.metadata.igcseType).toBe('BOOLEAN');
      expect(falseResult.ir.metadata.igcseType).toBe('BOOLEAN');
    });

    test('infers string from quoted literals', () => {
      const doubleQuoteResult = transformer.transformTypeScriptVariableDeclaration('str1', undefined, '"hello"');
      const singleQuoteResult = transformer.transformTypeScriptVariableDeclaration('str2', undefined, "'world'");

      expect(doubleQuoteResult.ir.metadata.igcseType).toBe('STRING');
      expect(singleQuoteResult.ir.metadata.igcseType).toBe('STRING');
    });

    test('infers integer from whole numbers', () => {
      const result = transformer.transformTypeScriptVariableDeclaration('num', undefined, '42');
      expect(result.ir.metadata.igcseType).toBe('INTEGER');
    });

    test('infers real from decimal numbers', () => {
      const result = transformer.transformTypeScriptVariableDeclaration('pi', undefined, '3.14');
      expect(result.ir.metadata.igcseType).toBe('REAL');
    });

    test('defaults to string for unknown initializers', () => {
      const result = transformer.transformTypeScriptVariableDeclaration('unknown', undefined, 'someFunction()');
      expect(result.ir.metadata.igcseType).toBe('STRING');
    });
  });

  describe('static utility methods', () => {
    test('creates Java variable IR correctly', () => {
      const ir = VariableDeclarationTransformer.createJavaVariableIR(
        'testVar',
        'int',
        'INTEGER',
        false,
        [],
        '42',
        { line: 1, column: 1 }
      );

      expect(ir.type).toBe('declaration');
      expect(ir.kind).toBe('variable_declaration');
      expect(ir.metadata.language).toBe('java');
      expect(ir.metadata.variableName).toBe('testVar');
      expect(ir.metadata.sourceType).toBe('int');
      expect(ir.metadata.igcseType).toBe('INTEGER');
      expect(ir.metadata.hasInitializer).toBe(true);
      expect(ir.metadata.initialValue).toBe('42');
      expect(ir.sourceLocation).toEqual({ line: 1, column: 1 });
    });

    test('creates TypeScript variable IR correctly', () => {
      const ir = VariableDeclarationTransformer.createTypeScriptVariableIR(
        'testVar',
        'number',
        'REAL',
        true,
        false,
        '3.14',
        { line: 2, column: 5 }
      );

      expect(ir.type).toBe('declaration');
      expect(ir.kind).toBe('variable_declaration');
      expect(ir.metadata.language).toBe('typescript');
      expect(ir.metadata.variableName).toBe('testVar');
      expect(ir.metadata.sourceType).toBe('number');
      expect(ir.metadata.igcseType).toBe('REAL');
      expect(ir.metadata.isArray).toBe(true);
      expect(ir.metadata.isOptional).toBe(false);
      expect(ir.metadata.igcseDeclaration).toBe('DECLARE testVar : ARRAY[1:n] OF REAL');
      expect(ir.sourceLocation).toEqual({ line: 2, column: 5 });
    });
  });

  describe('scope information', () => {
    test('includes scope information in IR metadata', () => {
      // Declare some variables to change context
      baseTransformer.testDeclareVariable('var1', 'INTEGER');
      baseTransformer.testDeclareVariable('var2', 'STRING');

      const result = transformer.transformJavaVariableDeclaration('int', 'newVar');

      expect(result.ir.metadata.scopeInfo).toBeDefined();
      expect(result.ir.metadata.scopeInfo.scopeDepth).toBe(1);
      expect(result.ir.metadata.scopeInfo.totalVariables).toBeGreaterThan(0);
    });
  });

  describe('integration with base transformer', () => {
    test('declares variables in base transformer context', () => {
      const initialSnapshot = baseTransformer.testGetContextSnapshot();
      const initialCount = initialSnapshot.variableCount;

      transformer.transformJavaVariableDeclaration('int', 'newVar');

      const finalSnapshot = baseTransformer.testGetContextSnapshot();
      expect(finalSnapshot.variableCount).toBe(initialCount + 1);
    });

    test('handles complex type scenarios', () => {
      // Test with multiple complex scenarios
      const scenarios = [
        { type: 'List<String>', expected: 'STRING' },
        { type: 'Map<String, Integer>', expected: 'STRING' },
        { type: 'Optional<Boolean>', expected: 'STRING' }
      ];

      scenarios.forEach(({ type, expected }) => {
        const result = transformer.transformJavaVariableDeclaration(type, 'complexVar');
        expect(result.ir.metadata.igcseType).toBe(expected);
        expect(result.warnings.length).toBeGreaterThan(0);
      });
    });
  });
});