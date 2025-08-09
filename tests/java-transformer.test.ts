// Tests for Java AST Transformer

import { JavaASTTransformer } from '../src/transformers/java-transformer';
import { JavaASTNode } from '../src/index';

describe('JavaASTTransformer', () => {
  let transformer: JavaASTTransformer;

  beforeEach(() => {
    transformer = new JavaASTTransformer();
  });

  describe('basic transformation', () => {
    test('transforms empty program', () => {
      const ast: JavaASTNode = {
        type: 'program',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.type).toBe('program');
      expect(result.result.kind).toBe('java_program');
      expect(result.result.children).toHaveLength(0);
      expect(result.result.metadata.language).toBe('java');
    });

    test('transforms program with statements', () => {
      const variableDecl: JavaASTNode = {
        type: 'variable_declaration',
        children: [
          { type: 'type', value: 'int', children: [], location: { line: 1, column: 1 } },
          { type: 'identifier', value: 'x', children: [], location: { line: 1, column: 5 } }
        ],
        location: { line: 1, column: 1 }
      };

      const ast: JavaASTNode = {
        type: 'program',
        children: [variableDecl],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.children).toHaveLength(1);
      expect(result.result.children[0].type).toBe('declaration');
      expect(result.result.children[0].kind).toBe('variable_declaration');
    });
  });

  describe('variable declaration transformation', () => {
    test('transforms simple variable declaration', () => {
      const ast: JavaASTNode = {
        type: 'variable_declaration',
        children: [
          { type: 'type', value: 'int', children: [], location: { line: 1, column: 1 } },
          { type: 'identifier', value: 'count', children: [], location: { line: 1, column: 5 } }
        ],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.type).toBe('declaration');
      expect(result.result.kind).toBe('variable_declaration');
      expect(result.result.metadata.variableName).toBe('count');
      expect(result.result.metadata.sourceType).toBe('int');
      expect(result.result.metadata.igcseType).toBe('INTEGER');
      expect(result.result.metadata.isArray).toBe(false);
      expect(result.result.metadata.igcseDeclaration).toBe('DECLARE count : INTEGER');
    });

    test('transforms variable declaration with initialization', () => {
      const ast: JavaASTNode = {
        type: 'variable_declaration',
        children: [
          { type: 'type', value: 'String', children: [], location: { line: 1, column: 1 } },
          { type: 'identifier', value: 'name', children: [], location: { line: 1, column: 8 } },
          { 
            type: 'literal', 
            value: 'John', 
            children: [], 
            location: { line: 1, column: 15 },
            metadata: { literalType: 'string' }
          }
        ],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.variableName).toBe('name');
      expect(result.result.metadata.igcseType).toBe('STRING');
      expect(result.result.metadata.hasInitializer).toBe(true);
      expect(result.result.metadata.initialValue).toBe('John');
      expect(result.result.children).toHaveLength(3);
    });

    test('transforms array variable declaration', () => {
      const ast: JavaASTNode = {
        type: 'variable_declaration',
        children: [
          { 
            type: 'type', 
            value: 'int', 
            children: [], 
            location: { line: 1, column: 1 },
            metadata: { isArray: true, arrayDimensions: [0] }
          },
          { type: 'identifier', value: 'numbers', children: [], location: { line: 1, column: 5 } }
        ],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.isArray).toBe(true);
      expect(result.result.metadata.arrayDimensions).toEqual([0]);
      expect(result.result.metadata.igcseDeclaration).toBe('DECLARE numbers : ARRAY[1:n] OF INTEGER');
    });

    test('transforms multi-dimensional array declaration', () => {
      const ast: JavaASTNode = {
        type: 'variable_declaration',
        children: [
          { 
            type: 'type', 
            value: 'String', 
            children: [], 
            location: { line: 1, column: 1 },
            metadata: { isArray: true, arrayDimensions: [0, 0] }
          },
          { type: 'identifier', value: 'matrix', children: [], location: { line: 1, column: 8 } }
        ],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.isArray).toBe(true);
      expect(result.result.metadata.arrayDimensions).toEqual([0, 0]);
      expect(result.result.metadata.igcseDeclaration).toBe('DECLARE matrix : ARRAY[1:n] OF ARRAY[1:n] OF STRING');
    });

    test('handles incomplete variable declaration', () => {
      const ast: JavaASTNode = {
        type: 'variable_declaration',
        children: [
          { type: 'type', value: 'int', children: [], location: { line: 1, column: 1 } }
          // Missing identifier
        ],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('invalid_variable_declaration');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toBe('Incomplete variable declaration');
    });
  });

  describe('type transformation', () => {
    test('transforms basic Java types', () => {
      const types = [
        { java: 'int', igcse: 'INTEGER' },
        { java: 'String', igcse: 'STRING' },
        { java: 'boolean', igcse: 'BOOLEAN' },
        { java: 'double', igcse: 'REAL' },
        { java: 'float', igcse: 'REAL' },
        { java: 'char', igcse: 'CHAR' }
      ];

      types.forEach(({ java, igcse }) => {
        const ast: JavaASTNode = {
          type: 'type',
          value: java,
          children: [],
          location: { line: 1, column: 1 }
        };

        const result = transformer.transform(ast);

        expect(result.success).toBe(true);
        expect(result.result.metadata.javaType).toBe(java);
        expect(result.result.metadata.igcseType).toBe(igcse);
      });
    });

    test('handles unknown types with warning', () => {
      const ast: JavaASTNode = {
        type: 'type',
        value: 'CustomClass',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseType).toBe('STRING');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('CustomClass');
    });
  });

  describe('literal transformation', () => {
    test('transforms number literals', () => {
      const intLiteral: JavaASTNode = {
        type: 'literal',
        value: '42',
        children: [],
        location: { line: 1, column: 1 },
        metadata: { literalType: 'number' }
      };

      const result = transformer.transform(intLiteral);

      expect(result.success).toBe(true);
      expect(result.result.metadata.originalValue).toBe('42');
      expect(result.result.metadata.igcseValue).toBe('42');
      expect(result.result.metadata.igcseType).toBe('INTEGER');
    });

    test('transforms floating point literals', () => {
      const floatLiteral: JavaASTNode = {
        type: 'literal',
        value: '3.14',
        children: [],
        location: { line: 1, column: 1 },
        metadata: { literalType: 'number' }
      };

      const result = transformer.transform(floatLiteral);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseType).toBe('REAL');
      expect(result.result.metadata.igcseValue).toBe('3.14');
    });

    test('transforms string literals', () => {
      const stringLiteral: JavaASTNode = {
        type: 'literal',
        value: 'Hello',
        children: [],
        location: { line: 1, column: 1 },
        metadata: { literalType: 'string' }
      };

      const result = transformer.transform(stringLiteral);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseType).toBe('STRING');
      expect(result.result.metadata.igcseValue).toBe('"Hello"');
    });

    test('transforms boolean literals', () => {
      const trueLiteral: JavaASTNode = {
        type: 'literal',
        value: 'true',
        children: [],
        location: { line: 1, column: 1 },
        metadata: { literalType: 'boolean' }
      };

      const falseLiteral: JavaASTNode = {
        type: 'literal',
        value: 'false',
        children: [],
        location: { line: 1, column: 1 },
        metadata: { literalType: 'boolean' }
      };

      const trueResult = transformer.transform(trueLiteral);
      const falseResult = transformer.transform(falseLiteral);

      expect(trueResult.result.metadata.igcseValue).toBe('TRUE');
      expect(falseResult.result.metadata.igcseValue).toBe('FALSE');
      expect(trueResult.result.metadata.igcseType).toBe('BOOLEAN');
      expect(falseResult.result.metadata.igcseType).toBe('BOOLEAN');
    });

    test('handles unknown literal types with warning', () => {
      const unknownLiteral: JavaASTNode = {
        type: 'literal',
        value: 'something',
        children: [],
        location: { line: 1, column: 1 },
        metadata: { literalType: 'unknown' }
      };

      const result = transformer.transform(unknownLiteral);

      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Unknown literal type');
    });
  });

  describe('identifier transformation', () => {
    test('transforms simple identifier', () => {
      const ast: JavaASTNode = {
        type: 'identifier',
        value: 'myVariable',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.type).toBe('identifier');
      expect(result.result.metadata.name).toBe('myVariable');
      expect(result.result.metadata.isVariable).toBe(false); // Not declared yet
      expect(result.result.metadata.isFunction).toBe(false);
    });
  });

  describe('array and new expression transformation', () => {
    test('transforms array literal', () => {
      const ast: JavaASTNode = {
        type: 'array_literal',
        value: '{1, 2, 3}',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('array_literal');
      expect(result.result.metadata.originalValue).toBe('{1, 2, 3}');
      expect(result.result.metadata.literalType).toBe('array');
    });

    test('transforms new expression', () => {
      const ast: JavaASTNode = {
        type: 'new_expression',
        value: 'new int[10]',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('new_expression');
      expect(result.result.metadata.originalExpression).toBe('new int[10]');
      expect(result.result.metadata.isArrayInstantiation).toBe(true);
      expect(result.result.metadata.requiresComment).toBe(true);
    });
  });

  describe('unsupported features', () => {
    test('handles unsupported AST node types', () => {
      const ast: JavaASTNode = {
        type: 'unsupported_feature',
        value: 'some value',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('unsupported');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Unsupported Java AST node type');
      expect(result.warnings[0].code).toBe('UNSUPPORTED_FEATURE');
    });
  });

  describe('error handling', () => {
    test('handles transformation errors gracefully', () => {
      // Create a custom transformer that throws an error
      class ErrorJavaTransformer extends JavaASTTransformer {
        transform(ast: JavaASTNode) {
          try {
            throw new Error('Test error');
          } catch (error) {
            return this.handleTransformError(error as Error);
          }
        }
      }

      const errorTransformer = new ErrorJavaTransformer();
      const ast: JavaASTNode = {
        type: 'program',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = errorTransformer.transform(ast);

      expect(result.success).toBe(false);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Test error');
    });
  });

  describe('integration with context', () => {
    test('declares variables in context during transformation', () => {
      const ast: JavaASTNode = {
        type: 'program',
        children: [
          {
            type: 'variable_declaration',
            children: [
              { type: 'type', value: 'int', children: [], location: { line: 1, column: 1 } },
              { type: 'identifier', value: 'x', children: [], location: { line: 1, column: 5 } }
            ],
            location: { line: 1, column: 1 }
          },
          {
            type: 'identifier',
            value: 'x',
            children: [],
            location: { line: 2, column: 1 }
          }
        ],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      
      // The second identifier should now recognize 'x' as a declared variable
      const identifierNode = result.result.children[1];
      expect(identifierNode.metadata.isVariable).toBe(true);
      expect(identifierNode.metadata.variableInfo).toBeDefined();
      expect(identifierNode.metadata.variableInfo.name).toBe('x');
      expect(identifierNode.metadata.variableInfo.type).toBe('INTEGER');
    });
  });
});