// Tests for Output Statement Conversion (System.out.println and console.log)

import { JavaASTTransformer } from '../src/transformers/java-transformer';
import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';
import { IGCSEPseudocodeGenerator } from '../src/generators/pseudocode-generator';
import { JavaASTNode, TypeScriptASTNode } from '../src/index';

describe('Output Statement Conversion', () => {
  let javaTransformer: JavaASTTransformer;
  let typescriptTransformer: TypeScriptASTTransformer;
  let generator: IGCSEPseudocodeGenerator;

  beforeEach(() => {
    javaTransformer = new JavaASTTransformer();
    typescriptTransformer = new TypeScriptASTTransformer();
    generator = new IGCSEPseudocodeGenerator();
  });

  describe('Java System.out.println conversion', () => {
    test('converts simple System.out.println with string literal', () => {
      const javaAST: JavaASTNode = {
        type: 'method_call',
        children: [],
        value: 'System.out.println("Hello World")',
        metadata: {
          methodName: 'println',
          objectName: 'System.out',
          arguments: ['"Hello World"']
        }
      };

      const result = javaTransformer.transform(javaAST);
      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('output_statement');
      expect(result.result.metadata.expressions).toEqual(['"Hello World"']);
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('OUTPUT "Hello World"');
    });

    test('converts System.out.println with variable', () => {
      const javaAST: JavaASTNode = {
        type: 'method_call',
        children: [],
        value: 'System.out.println(name)',
        metadata: {
          methodName: 'println',
          objectName: 'System.out',
          arguments: ['name']
        }
      };

      const result = javaTransformer.transform(javaAST);
      expect(result.success).toBe(true);
      expect(result.result.metadata.expressions).toEqual(['name']);
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('OUTPUT name');
    });

    test('converts System.out.println with string concatenation', () => {
      const javaAST: JavaASTNode = {
        type: 'method_call',
        children: [],
        value: 'System.out.println("Hello " + name + "!")',
        metadata: {
          methodName: 'println',
          objectName: 'System.out',
          arguments: ['"Hello " + name + "!"']
        }
      };

      const result = javaTransformer.transform(javaAST);
      expect(result.success).toBe(true);
      expect(result.result.metadata.expressions).toEqual(['"Hello "', 'name', '"!"']);
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('OUTPUT "Hello ", name, "!"');
    });

    test('converts System.out.print (without ln)', () => {
      const javaAST: JavaASTNode = {
        type: 'method_call',
        children: [],
        value: 'System.out.print("Test")',
        metadata: {
          methodName: 'print',
          objectName: 'System.out',
          arguments: ['"Test"']
        }
      };

      const result = javaTransformer.transform(javaAST);
      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('output_statement');
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('OUTPUT "Test"');
    });

    test('converts empty System.out.println', () => {
      const javaAST: JavaASTNode = {
        type: 'method_call',
        children: [],
        value: 'System.out.println()',
        metadata: {
          methodName: 'println',
          objectName: 'System.out',
          arguments: []
        }
      };

      const result = javaTransformer.transform(javaAST);
      expect(result.success).toBe(true);
      expect(result.result.metadata.expressions).toEqual(['""']);
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('OUTPUT ""');
    });

    test('handles expression statement wrapper', () => {
      const javaAST: JavaASTNode = {
        type: 'expression_statement',
        children: [
          {
            type: 'method_call',
            children: [],
            value: 'System.out.println("Test")',
            metadata: {
              methodName: 'println',
              objectName: 'System.out',
              arguments: ['"Test"']
            }
          }
        ],
        value: 'System.out.println("Test");'
      };

      const result = javaTransformer.transform(javaAST);
      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('output_statement');
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('OUTPUT "Test"');
    });
  });

  describe('TypeScript console.log conversion', () => {
    test('converts simple console.log with string literal', () => {
      const tsAST: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        value: 'console.log("Hello World")',
        metadata: {
          methodName: 'log',
          objectName: 'console',
          arguments: ['"Hello World"']
        }
      };

      const result = typescriptTransformer.transform(tsAST);
      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('output_statement');
      expect(result.result.metadata.expressions).toEqual(['"Hello World"']);
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('OUTPUT "Hello World"');
    });

    test('converts console.log with variable', () => {
      const tsAST: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        value: 'console.log(name)',
        metadata: {
          methodName: 'log',
          objectName: 'console',
          arguments: ['name']
        }
      };

      const result = typescriptTransformer.transform(tsAST);
      expect(result.success).toBe(true);
      expect(result.result.metadata.expressions).toEqual(['name']);
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('OUTPUT name');
    });

    test('converts console.log with single quotes to double quotes', () => {
      const tsAST: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        value: "console.log('Hello World')",
        metadata: {
          methodName: 'log',
          objectName: 'console',
          arguments: ["'Hello World'"]
        }
      };

      const result = typescriptTransformer.transform(tsAST);
      expect(result.success).toBe(true);
      expect(result.result.metadata.expressions).toEqual(['"Hello World"']);
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('OUTPUT "Hello World"');
    });

    test('converts console.log with template literal', () => {
      const tsAST: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        value: 'console.log(`Hello World`)',
        metadata: {
          methodName: 'log',
          objectName: 'console',
          arguments: ['`Hello World`']
        }
      };

      const result = typescriptTransformer.transform(tsAST);
      expect(result.success).toBe(true);
      expect(result.result.metadata.expressions).toEqual(['"Hello World"']);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Template literal converted');
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('OUTPUT "Hello World"');
    });

    test('converts console.log with string concatenation', () => {
      const tsAST: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        value: 'console.log("Hello " + name + "!")',
        metadata: {
          methodName: 'log',
          objectName: 'console',
          arguments: ['"Hello " + name + "!"']
        }
      };

      const result = typescriptTransformer.transform(tsAST);
      expect(result.success).toBe(true);
      expect(result.result.metadata.expressions).toEqual(['"Hello "', 'name', '"!"']);
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('OUTPUT "Hello ", name, "!"');
    });

    test('converts console.error and console.warn', () => {
      const errorAST: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        value: 'console.error("Error message")',
        metadata: {
          methodName: 'error',
          objectName: 'console',
          arguments: ['"Error message"']
        }
      };

      const warnAST: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        value: 'console.warn("Warning message")',
        metadata: {
          methodName: 'warn',
          objectName: 'console',
          arguments: ['"Warning message"']
        }
      };

      const errorResult = typescriptTransformer.transform(errorAST);
      const warnResult = typescriptTransformer.transform(warnAST);

      expect(errorResult.result.kind).toBe('output_statement');
      expect(warnResult.result.kind).toBe('output_statement');
      
      expect(generator.generate(errorResult.result)).toBe('OUTPUT "Error message"');
      expect(generator.generate(warnResult.result)).toBe('OUTPUT "Warning message"');
    });

    test('converts empty console.log', () => {
      const tsAST: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        value: 'console.log()',
        metadata: {
          methodName: 'log',
          objectName: 'console',
          arguments: []
        }
      };

      const result = typescriptTransformer.transform(tsAST);
      expect(result.success).toBe(true);
      expect(result.result.metadata.expressions).toEqual(['""']);
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('OUTPUT ""');
    });
  });

  describe('Generic method call handling', () => {
    test('handles non-output Java method calls', () => {
      const javaAST: JavaASTNode = {
        type: 'method_call',
        children: [],
        value: 'obj.someMethod(arg1, arg2)',
        metadata: {
          methodName: 'someMethod',
          objectName: 'obj',
          arguments: ['arg1', 'arg2']
        }
      };

      const result = javaTransformer.transform(javaAST);
      expect(result.success).toBe(true);
      expect(result.result.type).toBe('method_call');
      expect(result.result.metadata.methodName).toBe('someMethod');
      expect(result.result.metadata.objectName).toBe('obj');
      expect(result.result.metadata.arguments).toEqual(['arg1', 'arg2']);
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('CALL someMethod(arg1, arg2)');
    });

    test('handles non-output TypeScript method calls', () => {
      const tsAST: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        value: 'obj.someMethod(arg1, arg2)',
        metadata: {
          methodName: 'someMethod',
          objectName: 'obj',
          arguments: ['arg1', 'arg2']
        }
      };

      const result = typescriptTransformer.transform(tsAST);
      expect(result.success).toBe(true);
      expect(result.result.type).toBe('method_call');
      expect(result.result.metadata.methodName).toBe('someMethod');
      expect(result.result.metadata.objectName).toBe('obj');
      expect(result.result.metadata.arguments).toEqual(['arg1', 'arg2']);
      
      const pseudocode = generator.generate(result.result);
      expect(pseudocode).toBe('CALL someMethod(arg1, arg2)');
    });
  });

  describe('Integration tests', () => {
    test('converts complete Java program with output statements', () => {
      const javaProgram: JavaASTNode = {
        type: 'program',
        children: [
          {
            type: 'variable_declaration',
            children: [
              {
                type: 'type',
                children: [],
                value: 'String'
              },
              {
                type: 'identifier',
                children: [],
                value: 'message'
              },
              {
                type: 'literal',
                children: [],
                value: 'Hello',
                metadata: { literalType: 'string' }
              }
            ],
            value: 'String message = "Hello";'
          },
          {
            type: 'expression_statement',
            children: [
              {
                type: 'method_call',
                children: [],
                value: 'System.out.println(message)',
                metadata: {
                  methodName: 'println',
                  objectName: 'System.out',
                  arguments: ['message']
                }
              }
            ],
            value: 'System.out.println(message);'
          }
        ],
        value: 'program'
      };

      const result = javaTransformer.transform(javaProgram);
      expect(result.success).toBe(true);
      
      const pseudocode = generator.generate(result.result);
      const expectedLines = [
        'DECLARE message : STRING ← "Hello"',
        'OUTPUT message'
      ];
      
      expect(pseudocode).toBe(expectedLines.join('\n'));
    });

    test('converts complete TypeScript program with output statements', () => {
      const tsProgram: TypeScriptASTNode = {
        type: 'program',
        children: [
          {
            type: 'variable_statement',
            children: [
              {
                type: 'variable_declaration',
                children: [],
                value: 'message',
                metadata: {
                  hasTypeAnnotation: true,
                  typeAnnotation: 'string',
                  hasInitializer: true,
                  initializer: '"Hello"'
                }
              }
            ],
            value: 'const message: string = "Hello";'
          },
          {
            type: 'expression_statement',
            children: [
              {
                type: 'call_expression',
                children: [],
                value: 'console.log(message)',
                metadata: {
                  methodName: 'log',
                  objectName: 'console',
                  arguments: ['message']
                }
              }
            ],
            value: 'console.log(message);'
          }
        ],
        value: 'program'
      };

      const result = typescriptTransformer.transform(tsProgram);
      expect(result.success).toBe(true);
      
      const pseudocode = generator.generate(result.result);
      const expectedLines = [
        'DECLARE message : STRING ← "Hello"',
        'OUTPUT message'
      ];
      
      expect(pseudocode).toBe(expectedLines.join('\n'));
    });
  });
});