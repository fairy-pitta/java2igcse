// Tests for Base AST Transformer

import { BaseASTTransformer } from '../src/transformers/base-transformer';
import {
  IntermediateRepresentation,
  TransformResult,
  ConversionOptions,
  IRNodeType,
  IGCSEType
} from '../src/index';

// Mock implementation for testing
class MockASTTransformer extends BaseASTTransformer<any> {
  transform(ast: any): TransformResult<IntermediateRepresentation> {
    try {
      const result = this.createIRNode('program', 'test_program');
      return this.createTransformResult(result);
    } catch (error) {
      return this.handleTransformError(error as Error);
    }
  }

  // Expose protected methods for testing
  public testCreateIRNode(
    type: IRNodeType,
    kind: string,
    children: IntermediateRepresentation[] = [],
    metadata: Record<string, any> = {},
    sourceLocation?: { line: number; column: number }
  ): IntermediateRepresentation {
    return this.createIRNode(type, kind, children, metadata, sourceLocation);
  }

  public testAddWarning(message: string, code: string, severity: 'warning' | 'info' = 'warning'): void {
    this.addWarning(message, code, severity);
  }

  public testEnterScope(scopeType: 'global' | 'function' | 'block' | 'class'): void {
    this.enterScope(scopeType);
  }

  public testExitScope(): void {
    this.exitScope();
  }

  public testDeclareVariable(
    name: string,
    type: IGCSEType,
    isArray: boolean = false,
    arrayDimensions?: number[]
  ): void {
    this.declareVariable(name, type, isArray, arrayDimensions);
  }

  public testDeclareFunction(
    name: string,
    parameters: Array<{ name: string; type: IGCSEType; isArray?: boolean; isOptional?: boolean }>,
    returnType?: IGCSEType
  ): void {
    this.declareFunction(name, parameters, returnType);
  }

  public testLookupVariable(name: string) {
    return this.lookupVariable(name);
  }

  public testLookupFunction(name: string) {
    return this.lookupFunction(name);
  }

  public testConvertTypeToIGCSE(sourceType: string): IGCSEType {
    return this.convertTypeToIGCSE(sourceType);
  }

  public testGetContextSnapshot() {
    return this.getContextSnapshot();
  }

  public getWarnings() {
    return this.warnings;
  }
}

describe('BaseASTTransformer', () => {
  let transformer: MockASTTransformer;

  beforeEach(() => {
    transformer = new MockASTTransformer();
  });

  describe('constructor and initialization', () => {
    test('creates transformer with default options', () => {
      const transformer = new MockASTTransformer();
      const snapshot = transformer.testGetContextSnapshot();
      
      expect(snapshot.scopeDepth).toBe(1); // Global scope
      expect(snapshot.variableCount).toBe(0);
      expect(snapshot.functionCount).toBe(0);
      expect(snapshot.indentLevel).toBe(0);
    });

    test('creates transformer with custom options', () => {
      const options: ConversionOptions = {
        indentSize: 2,
        includeComments: false,
        strictMode: true,
        customMappings: { 'custom': 'CUSTOM' }
      };
      
      const transformer = new MockASTTransformer(options);
      expect(transformer).toBeDefined();
    });
  });

  describe('IR node creation', () => {
    test('creates basic IR node', () => {
      const node = transformer.testCreateIRNode('program', 'test_program');
      
      expect(node.type).toBe('program');
      expect(node.kind).toBe('test_program');
      expect(node.children).toEqual([]);
      expect(node.metadata).toEqual({});
      expect(node.sourceLocation).toBeUndefined();
    });

    test('creates IR node with children and metadata', () => {
      const child = transformer.testCreateIRNode('statement', 'child_statement');
      const metadata = { test: 'value' };
      const sourceLocation = { line: 1, column: 1 };
      
      const node = transformer.testCreateIRNode(
        'program',
        'test_program',
        [child],
        metadata,
        sourceLocation
      );
      
      expect(node.children).toHaveLength(1);
      expect(node.children[0]).toBe(child);
      expect(node.metadata).toBe(metadata);
      expect(node.sourceLocation).toBe(sourceLocation);
    });
  });

  describe('warning management', () => {
    test('adds warnings correctly', () => {
      transformer.testAddWarning('Test warning', 'TEST_CODE');
      
      const warnings = transformer.getWarnings();
      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toBe('Test warning');
      expect(warnings[0].code).toBe('TEST_CODE');
      expect(warnings[0].severity).toBe('warning');
    });

    test('adds multiple warnings', () => {
      transformer.testAddWarning('Warning 1', 'CODE1');
      transformer.testAddWarning('Warning 2', 'CODE2', 'info');
      
      const warnings = transformer.getWarnings();
      expect(warnings).toHaveLength(2);
      expect(warnings[1].severity).toBe('info');
    });
  });

  describe('scope management', () => {
    test('enters and exits scopes correctly', () => {
      const initialSnapshot = transformer.testGetContextSnapshot();
      expect(initialSnapshot.scopeDepth).toBe(1);
      
      transformer.testEnterScope('function');
      const functionSnapshot = transformer.testGetContextSnapshot();
      expect(functionSnapshot.scopeDepth).toBe(2);
      
      transformer.testEnterScope('block');
      const blockSnapshot = transformer.testGetContextSnapshot();
      expect(blockSnapshot.scopeDepth).toBe(3);
      
      transformer.testExitScope();
      const afterExitSnapshot = transformer.testGetContextSnapshot();
      expect(afterExitSnapshot.scopeDepth).toBe(2);
      
      transformer.testExitScope();
      const finalSnapshot = transformer.testGetContextSnapshot();
      expect(finalSnapshot.scopeDepth).toBe(1);
    });

    test('handles exit scope at global level gracefully', () => {
      const initialSnapshot = transformer.testGetContextSnapshot();
      expect(initialSnapshot.scopeDepth).toBe(1);
      
      transformer.testExitScope(); // Should not crash
      const afterExitSnapshot = transformer.testGetContextSnapshot();
      expect(afterExitSnapshot.scopeDepth).toBe(1); // Should remain at global
    });
  });

  describe('variable declaration and lookup', () => {
    test('declares and looks up variables in same scope', () => {
      transformer.testDeclareVariable('testVar', 'INTEGER');
      
      const variable = transformer.testLookupVariable('testVar');
      expect(variable).toBeDefined();
      expect(variable!.name).toBe('testVar');
      expect(variable!.type).toBe('INTEGER');
      expect(variable!.isArray).toBe(false);
    });

    test('declares array variables correctly', () => {
      transformer.testDeclareVariable('testArray', 'STRING', true, [10]);
      
      const variable = transformer.testLookupVariable('testArray');
      expect(variable).toBeDefined();
      expect(variable!.isArray).toBe(true);
      expect(variable!.arrayDimensions).toEqual([10]);
    });

    test('looks up variables in parent scopes', () => {
      transformer.testDeclareVariable('globalVar', 'STRING');
      
      transformer.testEnterScope('function');
      transformer.testDeclareVariable('functionVar', 'INTEGER');
      
      transformer.testEnterScope('block');
      
      // Should find both variables
      const globalVar = transformer.testLookupVariable('globalVar');
      const functionVar = transformer.testLookupVariable('functionVar');
      
      expect(globalVar).toBeDefined();
      expect(functionVar).toBeDefined();
      expect(globalVar!.type).toBe('STRING');
      expect(functionVar!.type).toBe('INTEGER');
    });

    test('returns undefined for non-existent variables', () => {
      const variable = transformer.testLookupVariable('nonExistent');
      expect(variable).toBeUndefined();
    });
  });

  describe('function declaration and lookup', () => {
    test('declares and looks up functions', () => {
      const parameters = [
        { name: 'param1', type: 'INTEGER' as IGCSEType },
        { name: 'param2', type: 'STRING' as IGCSEType }
      ];
      
      transformer.testDeclareFunction('testFunc', parameters, 'BOOLEAN');
      
      const func = transformer.testLookupFunction('testFunc');
      expect(func).toBeDefined();
      expect(func!.name).toBe('testFunc');
      expect(func!.parameters).toHaveLength(2);
      expect(func!.returnType).toBe('BOOLEAN');
      expect(func!.isProcedure).toBe(false);
    });

    test('declares procedures (functions without return type)', () => {
      transformer.testDeclareFunction('testProc', []);
      
      const func = transformer.testLookupFunction('testProc');
      expect(func).toBeDefined();
      expect(func!.isProcedure).toBe(true);
      expect(func!.returnType).toBeUndefined();
    });

    test('looks up functions in parent scopes', () => {
      transformer.testDeclareFunction('globalFunc', []);
      
      transformer.testEnterScope('function');
      const func = transformer.testLookupFunction('globalFunc');
      
      expect(func).toBeDefined();
      expect(func!.name).toBe('globalFunc');
    });
  });

  describe('type conversion', () => {
    test('converts basic types correctly', () => {
      expect(transformer.testConvertTypeToIGCSE('int')).toBe('INTEGER');
      expect(transformer.testConvertTypeToIGCSE('integer')).toBe('INTEGER');
      expect(transformer.testConvertTypeToIGCSE('double')).toBe('REAL');
      expect(transformer.testConvertTypeToIGCSE('float')).toBe('REAL');
      expect(transformer.testConvertTypeToIGCSE('number')).toBe('REAL');
      expect(transformer.testConvertTypeToIGCSE('string')).toBe('STRING');
      expect(transformer.testConvertTypeToIGCSE('char')).toBe('CHAR');
      expect(transformer.testConvertTypeToIGCSE('character')).toBe('CHAR');
      expect(transformer.testConvertTypeToIGCSE('bool')).toBe('BOOLEAN');
      expect(transformer.testConvertTypeToIGCSE('boolean')).toBe('BOOLEAN');
    });

    test('handles unknown types with warning', () => {
      const result = transformer.testConvertTypeToIGCSE('UnknownType');
      
      expect(result).toBe('STRING');
      const warnings = transformer.getWarnings();
      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toContain('UnknownType');
      expect(warnings[0].code).toBe('TYPE_CONVERSION_FALLBACK');
    });

    test('handles case insensitive type conversion', () => {
      expect(transformer.testConvertTypeToIGCSE('INT')).toBe('INTEGER');
      expect(transformer.testConvertTypeToIGCSE('String')).toBe('STRING');
      expect(transformer.testConvertTypeToIGCSE('BOOLEAN')).toBe('BOOLEAN');
    });
  });

  describe('transform method', () => {
    test('successful transformation returns correct result', () => {
      const result = transformer.transform({});
      
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result.type).toBe('program');
      expect(result.result.kind).toBe('test_program');
      expect(result.warnings).toEqual([]);
    });

    test('includes warnings in transform result', () => {
      transformer.testAddWarning('Test warning', 'TEST_CODE');
      const result = transformer.transform({});
      
      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toBe('Test warning');
    });
  });

  describe('context snapshot', () => {
    test('provides accurate context information', () => {
      transformer.testDeclareVariable('var1', 'INTEGER');
      transformer.testDeclareVariable('var2', 'STRING');
      transformer.testDeclareFunction('func1', []);
      
      transformer.testEnterScope('function');
      transformer.testEnterScope('block');
      
      const snapshot = transformer.testGetContextSnapshot();
      
      expect(snapshot.scopeDepth).toBe(3);
      expect(snapshot.variableCount).toBe(2);
      expect(snapshot.functionCount).toBe(1);
      expect(snapshot.indentLevel).toBe(0);
    });
  });
});