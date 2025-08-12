// Tests for TypeScript AST Transformer

import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';
import { TypeScriptASTNode } from '../src/index';

describe('TypeScriptASTTransformer', () => {
  let transformer: TypeScriptASTTransformer;

  beforeEach(() => {
    transformer = new TypeScriptASTTransformer();
  });

  describe('basic transformation', () => {
    test('transforms empty program', () => {
      const ast: TypeScriptASTNode = {
        type: 'program',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.type).toBe('program');
      expect(result.result.kind).toBe('typescript_program');
      expect(result.result.children).toHaveLength(0);
      expect(result.result.metadata.language).toBe('typescript');
    });
  });

  describe('variable declaration transformation', () => {
    test('transforms variable declaration with type annotation', () => {
      const ast: TypeScriptASTNode = {
        type: 'variable_declaration',
        value: 'count',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          hasTypeAnnotation: true,
          typeAnnotation: 'number',
          hasInitializer: false
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.type).toBe('declaration');
      expect(result.result.kind).toBe('variable_declaration');
      expect(result.result.metadata.variableName).toBe('count');
      expect(result.result.metadata.sourceType).toBe('number');
      expect(result.result.metadata.igcseType).toBe('REAL');
      expect(result.result.metadata.igcseDeclaration).toBe('DECLARE count : REAL');
    });

    test('transforms variable declaration with initializer', () => {
      const ast: TypeScriptASTNode = {
        type: 'variable_declaration',
        value: 'name',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          hasTypeAnnotation: false,
          hasInitializer: true,
          initializer: '"John"'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseType).toBe('STRING');
      expect(result.result.metadata.hasInitializer).toBe(true);
      expect(result.result.metadata.initialValue).toBe('"John"');
    });

    test('transforms array type declaration', () => {
      const ast: TypeScriptASTNode = {
        type: 'variable_declaration',
        value: 'numbers',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          hasTypeAnnotation: true,
          typeAnnotation: 'number[]',
          hasInitializer: false
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.isArray).toBe(true);
      expect(result.result.metadata.igcseType).toBe('REAL');
      expect(result.result.metadata.igcseDeclaration).toBe('DECLARE numbers : ARRAY[1:n] OF REAL');
    });

    test('transforms optional parameter with warning', () => {
      const ast: TypeScriptASTNode = {
        type: 'variable_declaration',
        value: 'optionalVar?',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          hasTypeAnnotation: true,
          typeAnnotation: 'string?',
          hasInitializer: false
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.variableName).toBe('optionalVar');
      expect(result.result.metadata.isOptional).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Optional parameter');
    });
  });

  describe('function declaration transformation', () => {
    test('transforms function declaration', () => {
      const ast: TypeScriptASTNode = {
        type: 'function_declaration',
        value: 'calculateSum',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          parameters: [
            { name: 'a', type: 'number', optional: false },
            { name: 'b', type: 'number', optional: false }
          ],
          returnType: 'number',
          isAsync: false
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.type).toBe('function_declaration');
      expect(result.result.kind).toBe('function_declaration');
      expect(result.result.metadata.functionName).toBe('calculateSum');
      expect(result.result.metadata.isProcedure).toBe(false);
      expect(result.result.metadata.returnType).toBe('REAL');
      expect(result.result.metadata.parameters).toHaveLength(2);
      expect(result.result.metadata.igcseDeclaration).toBe('FUNCTION calculateSum(a : REAL, b : REAL) RETURNS REAL');
    });

    test('transforms procedure (void function)', () => {
      const ast: TypeScriptASTNode = {
        type: 'function_declaration',
        value: 'printMessage',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          parameters: [
            { name: 'message', type: 'string', optional: false }
          ],
          returnType: 'void',
          isAsync: false
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('procedure_declaration');
      expect(result.result.metadata.isProcedure).toBe(true);
      expect(result.result.metadata.igcseDeclaration).toBe('PROCEDURE printMessage(message : STRING)');
    });

    test('transforms async function with warning', () => {
      const ast: TypeScriptASTNode = {
        type: 'function_declaration',
        value: 'fetchData',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          parameters: [],
          returnType: 'Promise<string>',
          isAsync: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings.some(w => w.message.includes('Async function'))).toBe(true);
      expect(result.warnings.some(w => w.message.includes('Promise<string>'))).toBe(true);
    });
  });

  describe('arrow function transformation', () => {
    test('transforms arrow function', () => {
      const ast: TypeScriptASTNode = {
        type: 'arrow_function',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          parameters: [
            { name: 'x', type: 'number', optional: false }
          ],
          returnType: 'number'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('arrow_function_converted');
      expect(result.result.metadata.isArrowFunction).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Arrow function converted');
    });
  });

  describe('type conversion', () => {
    test('converts basic TypeScript types', () => {
      const types = [
        { ts: 'number', igcse: 'REAL' },
        { ts: 'string', igcse: 'STRING' },
        { ts: 'boolean', igcse: 'BOOLEAN' },
        { ts: 'char', igcse: 'CHAR' },
        { ts: 'int', igcse: 'INTEGER' }
      ];

      types.forEach(({ ts, igcse }) => {
        const ast: TypeScriptASTNode = {
          type: 'variable_declaration',
          value: 'testVar',
          children: [],
          location: { line: 1, column: 1 },
          metadata: {
            hasTypeAnnotation: true,
            typeAnnotation: ts,
            hasInitializer: false
          }
        };

        const result = transformer.transform(ast);
        expect(result.result.metadata.igcseType).toBe(igcse);
      });
    });

    test('converts union types with warning', () => {
      const ast: TypeScriptASTNode = {
        type: 'variable_declaration',
        value: 'unionVar',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          hasTypeAnnotation: true,
          typeAnnotation: 'string | number',
          hasInitializer: false
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseType).toBe('STRING'); // Takes first type
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Union type');
    });

    test('converts generic types with warning', () => {
      const ast: TypeScriptASTNode = {
        type: 'variable_declaration',
        value: 'genericVar',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          hasTypeAnnotation: true,
          typeAnnotation: 'Array<string>',
          hasInitializer: false
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseType).toBe('ARRAY[1:SIZE] OF STRING');
      expect(result.result.metadata.isArray).toBe(false); // Already handled in the type conversion
    });

    test('converts function types with warning', () => {
      const ast: TypeScriptASTNode = {
        type: 'variable_declaration',
        value: 'funcVar',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          hasTypeAnnotation: true,
          typeAnnotation: '(x: number) => string',
          hasInitializer: false
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseType).toBe('STRING'); // Return type
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Function type');
    });

    test('handles any/unknown types with warning', () => {
      const dynamicTypes = ['any', 'unknown', 'void'];

      dynamicTypes.forEach(type => {
        const ast: TypeScriptASTNode = {
          type: 'variable_declaration',
          value: 'dynamicVar',
          children: [],
          location: { line: 1, column: 1 },
          metadata: {
            hasTypeAnnotation: true,
            typeAnnotation: type,
            hasInitializer: false
          }
        };

        const result = transformer.transform(ast);
        expect(result.result.metadata.igcseType).toBe('STRING');
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('Dynamic type');
      });
    });
  });

  describe('type inference from initializers', () => {
    test('infers boolean type from initializer', () => {
      const ast: TypeScriptASTNode = {
        type: 'variable_declaration',
        value: 'flag',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          hasTypeAnnotation: false,
          hasInitializer: true,
          initializer: 'true'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseType).toBe('BOOLEAN');
    });

    test('infers string type from initializer', () => {
      const ast: TypeScriptASTNode = {
        type: 'variable_declaration',
        value: 'text',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          hasTypeAnnotation: false,
          hasInitializer: true,
          initializer: '"hello"'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseType).toBe('STRING');
    });

    test('infers integer type from initializer', () => {
      const ast: TypeScriptASTNode = {
        type: 'variable_declaration',
        value: 'count',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          hasTypeAnnotation: false,
          hasInitializer: true,
          initializer: '42'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseType).toBe('INTEGER');
    });

    test('infers real type from initializer', () => {
      const ast: TypeScriptASTNode = {
        type: 'variable_declaration',
        value: 'pi',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          hasTypeAnnotation: false,
          hasInitializer: true,
          initializer: '3.14'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseType).toBe('REAL');
    });
  });

  describe('control structure transformation', () => {
    test('transforms if statement', () => {
      const ast: TypeScriptASTNode = {
        type: 'if_statement',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.type).toBe('control_structure');
      expect(result.result.kind).toBe('if_statement');
      expect(result.result.metadata.controlType).toBe('conditional');
    });

    test('transforms while statement', () => {
      const ast: TypeScriptASTNode = {
        type: 'while_statement',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.type).toBe('control_structure');
      expect(result.result.kind).toBe('while_loop');
    });

    test('transforms for statement', () => {
      const ast: TypeScriptASTNode = {
        type: 'for_statement',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.type).toBe('control_structure');
      expect(result.result.kind).toBe('for_loop');
    });
  });

  describe('expression transformation', () => {
    test('transforms call expression', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.type).toBe('expression');
      expect(result.result.kind).toBe('call_expression');
    });

    test('transforms binary expression', () => {
      const ast: TypeScriptASTNode = {
        type: 'binary_expression',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.type).toBe('expression');
      expect(result.result.kind).toBe('binary_expression');
    });

    test('transforms unary expression', () => {
      const ast: TypeScriptASTNode = {
        type: 'unary_expression',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.type).toBe('expression');
      expect(result.result.kind).toBe('unary_expression');
    });
  });

  describe('literal transformation', () => {
    test('transforms string literal', () => {
      const ast: TypeScriptASTNode = {
        type: 'literal',
        value: 'hello',
        children: [],
        location: { line: 1, column: 1 },
        metadata: { literalType: 'string' }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseType).toBe('STRING');
      expect(result.result.metadata.igcseValue).toBe('"hello"');
    });

    test('transforms boolean literal', () => {
      const ast: TypeScriptASTNode = {
        type: 'literal',
        value: 'true',
        children: [],
        location: { line: 1, column: 1 },
        metadata: { literalType: 'boolean' }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseType).toBe('BOOLEAN');
      expect(result.result.metadata.igcseValue).toBe('TRUE');
    });
  });

  describe('unsupported features', () => {
    test('handles unsupported AST node types', () => {
      const ast: TypeScriptASTNode = {
        type: 'unsupported_feature',
        value: 'some value',
        children: [],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('unsupported');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Unsupported TypeScript AST node type');
    });
  });

  describe('scope management', () => {
    test('manages block scope correctly', () => {
      const ast: TypeScriptASTNode = {
        type: 'block',
        children: [
          {
            type: 'variable_declaration',
            value: 'blockVar',
            children: [],
            location: { line: 2, column: 1 },
            metadata: {
              hasTypeAnnotation: true,
              typeAnnotation: 'number',
              hasInitializer: false
            }
          }
        ],
        location: { line: 1, column: 1 }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('block');
      expect(result.result.children).toHaveLength(1);
    });
  });
});