// Tests for TypeScript String Operations Conversion

import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';
import { TypeScriptParser } from '../src/parsers/typescript-parser';
import { TypeScriptASTNode } from '../src/index';

describe('TypeScript String Operations', () => {
  let transformer: TypeScriptASTTransformer;
  let parser: TypeScriptParser;

  beforeEach(() => {
    transformer = new TypeScriptASTTransformer();
    parser = new TypeScriptParser();
  });

  describe('String Method Conversions', () => {
    test('converts string.length to LENGTH(string)', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'length',
          objectName: 'myString',
          arguments: [],
          originalCall: 'myString.length',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('string_method_converted');
      expect(result.result.metadata.igcseFunction).toBe('LENGTH');
      expect(result.result.metadata.igcseExpression).toBe('LENGTH(myString)');
      expect(result.result.metadata.returnType).toBe('INTEGER');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('String method \'length\' converted to IGCSE string function');
    });

    test('converts string.charAt(index) to MID(string, index+1, 1)', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'charAt',
          objectName: 'text',
          arguments: ['5'],
          originalCall: 'text.charAt(5)',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseFunction).toBe('MID');
      expect(result.result.metadata.igcseExpression).toBe('MID(text, 5 + 1, 1)');
      expect(result.result.metadata.returnType).toBe('CHAR');
    });

    test('converts string.substring(start, end) to SUBSTRING(string, start+1, end-start)', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'substring',
          objectName: 'message',
          arguments: ['2', '8'],
          originalCall: 'message.substring(2, 8)',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseFunction).toBe('SUBSTRING');
      expect(result.result.metadata.igcseExpression).toBe('SUBSTRING(message, 2 + 1, 8 - 2)');
      expect(result.result.metadata.returnType).toBe('STRING');
    });

    test('converts string.substring(start) to SUBSTRING(string, start+1, LENGTH(string) - start)', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'substring',
          objectName: 'data',
          arguments: ['3'],
          originalCall: 'data.substring(3)',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('SUBSTRING(data, 3 + 1, LENGTH(data) - 3)');
    });

    test('converts string.indexOf(searchString) to FIND(string, searchString) - 1', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'indexOf',
          objectName: 'sentence',
          arguments: ['"hello"'],
          originalCall: 'sentence.indexOf("hello")',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseFunction).toBe('FIND');
      expect(result.result.metadata.igcseExpression).toBe('FIND(sentence, "hello") - 1');
      expect(result.result.metadata.returnType).toBe('INTEGER');
      expect(result.warnings).toHaveLength(2); // Method conversion + index adjustment warning
      expect(result.warnings[1].message).toContain('indexOf converted to FIND - result adjusted for 0-based indexing');
    });

    test('converts string.toLowerCase() to LCASE(string)', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'toLowerCase',
          objectName: 'name',
          arguments: [],
          originalCall: 'name.toLowerCase()',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseFunction).toBe('LCASE');
      expect(result.result.metadata.igcseExpression).toBe('LCASE(name)');
      expect(result.result.metadata.returnType).toBe('STRING');
    });

    test('converts string.toUpperCase() to UCASE(string)', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'toUpperCase',
          objectName: 'title',
          arguments: [],
          originalCall: 'title.toUpperCase()',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseFunction).toBe('UCASE');
      expect(result.result.metadata.igcseExpression).toBe('UCASE(title)');
    });

    test('converts string.concat(other) to string & other', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'concat',
          objectName: 'firstName',
          arguments: ['lastName'],
          originalCall: 'firstName.concat(lastName)',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseFunction).toBe('CONCATENATION');
      expect(result.result.metadata.igcseExpression).toBe('firstName & lastName');
      expect(result.result.metadata.returnType).toBe('STRING');
    });

    test('converts string.includes(searchString) to FIND(string, searchString) > 0', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'includes',
          objectName: 'text',
          arguments: ['"test"'],
          originalCall: 'text.includes("test")',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('FIND(text, "test") > 0');
      expect(result.result.metadata.returnType).toBe('BOOLEAN');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].message).toContain('includes converted to conditional expression');
    });

    test('converts string.startsWith(prefix) to LEFT(string, LENGTH(prefix)) = prefix', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'startsWith',
          objectName: 'filename',
          arguments: ['"temp"'],
          originalCall: 'filename.startsWith("temp")',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('LEFT(filename, LENGTH("temp")) = "temp"');
      expect(result.result.metadata.returnType).toBe('BOOLEAN');
    });

    test('converts string.endsWith(suffix) to RIGHT(string, LENGTH(suffix)) = suffix', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'endsWith',
          objectName: 'filename',
          arguments: ['".txt"'],
          originalCall: 'filename.endsWith(".txt")',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('RIGHT(filename, LENGTH(".txt")) = ".txt"');
      expect(result.result.metadata.returnType).toBe('BOOLEAN');
    });

    test('converts string.replace(search, replace) with warning', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'replace',
          objectName: 'text',
          arguments: ['"old"', '"new"'],
          originalCall: 'text.replace("old", "new")',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('REPLACE(text, "old", "new")');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].message).toContain('replace method converted to REPLACE function - may need manual implementation');
      expect(result.warnings[1].severity).toBe('warning');
    });

    test('converts string.split(delimiter) with warning', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'split',
          objectName: 'csv',
          arguments: ['","'],
          originalCall: 'csv.split(",")',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('SPLIT(csv, ",")');
      expect(result.result.metadata.returnType).toBe('STRING');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].message).toContain('split method converted to SPLIT function - returns array');
      expect(result.warnings[1].severity).toBe('warning');
    });

    test('handles unsupported string methods with warning', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'padStart',
          objectName: 'str',
          arguments: ['10', '"0"'],
          originalCall: 'str.padStart(10, "0")',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('str.padStart(10, "0")');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].message).toContain('String method \'padStart\' has no direct IGCSE equivalent');
      expect(result.warnings[1].severity).toBe('warning');
    });
  });

  describe('Binary Expression Conversions', () => {
    test('converts == to =', () => {
      const ast: TypeScriptASTNode = {
        type: 'binary_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          operator: '==',
          left: 'name',
          right: '"John"'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.originalOperator).toBe('==');
      expect(result.result.metadata.igcseOperator).toBe('=');
      expect(result.result.metadata.igcseExpression).toBe('name = "John"');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Operator \'==\' converted to \'=\'');
    });

    test('converts != to <>', () => {
      const ast: TypeScriptASTNode = {
        type: 'binary_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          operator: '!=',
          left: 'status',
          right: '"active"'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseOperator).toBe('<>');
      expect(result.result.metadata.igcseExpression).toBe('status <> "active"');
    });

    test('converts && to AND', () => {
      const ast: TypeScriptASTNode = {
        type: 'binary_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          operator: '&&',
          left: 'isValid',
          right: 'isActive'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseOperator).toBe('AND');
      expect(result.result.metadata.igcseExpression).toBe('isValid AND isActive');
    });

    test('converts || to OR', () => {
      const ast: TypeScriptASTNode = {
        type: 'binary_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          operator: '||',
          left: 'isEmpty',
          right: 'isNull'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseOperator).toBe('OR');
      expect(result.result.metadata.igcseExpression).toBe('isEmpty OR isNull');
    });

    test('converts % to MOD', () => {
      const ast: TypeScriptASTNode = {
        type: 'binary_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          operator: '%',
          left: 'number',
          right: '2'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseOperator).toBe('MOD');
      expect(result.result.metadata.igcseExpression).toBe('number MOD 2');
    });

    test('preserves + operator (could be addition or string concatenation)', () => {
      const ast: TypeScriptASTNode = {
        type: 'binary_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          operator: '+',
          left: 'a',
          right: 'b'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseOperator).toBe('+');
      expect(result.result.metadata.igcseExpression).toBe('a + b');
      expect(result.warnings).toHaveLength(0); // No warning since operator didn't change
    });

    test('preserves other operators unchanged', () => {
      const operators = ['<', '>', '<=', '>=', '-', '*', '/'];
      
      operators.forEach(op => {
        const ast: TypeScriptASTNode = {
          type: 'binary_expression',
          children: [],
          location: { line: 1, column: 1 },
          metadata: {
            operator: op,
            left: 'x',
            right: 'y'
          }
        };

        const result = transformer.transform(ast);
        expect(result.success).toBe(true);
        expect(result.result.metadata.igcseOperator).toBe(op);
        expect(result.result.metadata.igcseExpression).toBe(`x ${op} y`);
        expect(result.warnings).toHaveLength(0);
      });
    });
  });

  describe('Integration Tests', () => {
    test('handles complex string operations in expressions', () => {
      // Test a more complex scenario with nested string operations
      const ast: TypeScriptASTNode = {
        type: 'binary_expression',
        children: [
          {
            type: 'call_expression',
            children: [],
            location: { line: 1, column: 1 },
            metadata: {
              methodName: 'length',
              objectName: 'name',
              arguments: [],
              isMethodCall: true
            }
          },
          {
            type: 'literal',
            value: '5',
            children: [],
            location: { line: 1, column: 15 },
            metadata: { literalType: 'number' }
          }
        ],
        location: { line: 1, column: 1 },
        metadata: {
          operator: '>',
          left: 'name.length',
          right: '5'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.children).toHaveLength(2);
      expect(result.result.children[0].kind).toBe('string_method_converted');
      expect(result.result.children[0].metadata.igcseExpression).toBe('LENGTH(name)');
    });
  });

  describe('Edge Cases', () => {
    test('handles string methods with no arguments', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'trim',
          objectName: 'input',
          arguments: [],
          originalCall: 'input.trim()',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('TRIM(input)');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].severity).toBe('warning');
    });

    test('handles string methods with missing arguments', () => {
      const ast: TypeScriptASTNode = {
        type: 'call_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'charAt',
          objectName: 'str',
          arguments: [], // Missing index argument
          originalCall: 'str.charAt()',
          isMethodCall: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('MID(str, 0 + 1, 1)'); // Uses default '0'
    });

    test('handles binary expressions with missing metadata', () => {
      const ast: TypeScriptASTNode = {
        type: 'binary_expression',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {} // Missing operator metadata
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('undefined undefined undefined');
    });
  });
});