// Tests for Java String Operations Conversion

import { JavaASTTransformer } from '../src/transformers/java-transformer';
import { JavaASTNode } from '../src/index';

describe('Java String Operations', () => {
  let transformer: JavaASTTransformer;

  beforeEach(() => {
    transformer = new JavaASTTransformer();
  });

  describe('Java String Method Conversions', () => {
    test('converts string.length() to LENGTH(string)', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'length',
          objectName: 'myString',
          arguments: [],
          originalCall: 'myString.length()'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('string_method_converted');
      expect(result.result.metadata.igcseFunction).toBe('LENGTH');
      expect(result.result.metadata.igcseExpression).toBe('LENGTH(myString)');
      expect(result.result.metadata.returnType).toBe('INTEGER');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Java string method \'length\' converted to IGCSE string function');
    });

    test('converts string.charAt(index) to MID(string, index+1, 1)', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'charAt',
          objectName: 'text',
          arguments: ['3'],
          originalCall: 'text.charAt(3)'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseFunction).toBe('MID');
      expect(result.result.metadata.igcseExpression).toBe('MID(text, 3 + 1, 1)');
      expect(result.result.metadata.returnType).toBe('CHAR');
    });

    test('converts string.substring(start, end) to SUBSTRING(string, start+1, end-start)', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'substring',
          objectName: 'message',
          arguments: ['1', '5'],
          originalCall: 'message.substring(1, 5)'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseFunction).toBe('SUBSTRING');
      expect(result.result.metadata.igcseExpression).toBe('SUBSTRING(message, 1 + 1, 5 - 1)');
      expect(result.result.metadata.returnType).toBe('STRING');
    });

    test('converts string.substring(start) to SUBSTRING(string, start+1, LENGTH(string) - start)', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'substring',
          objectName: 'data',
          arguments: ['2'],
          originalCall: 'data.substring(2)'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('SUBSTRING(data, 2 + 1, LENGTH(data) - 2)');
    });

    test('converts string.indexOf(searchString) to FIND(string, searchString) - 1', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'indexOf',
          objectName: 'sentence',
          arguments: ['"world"'],
          originalCall: 'sentence.indexOf("world")'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseFunction).toBe('FIND');
      expect(result.result.metadata.igcseExpression).toBe('FIND(sentence, "world") - 1');
      expect(result.result.metadata.returnType).toBe('INTEGER');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].message).toContain('indexOf converted to FIND - result adjusted for 0-based indexing');
    });

    test('converts string.toLowerCase() to LCASE(string)', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'toLowerCase',
          objectName: 'name',
          arguments: [],
          originalCall: 'name.toLowerCase()'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseFunction).toBe('LCASE');
      expect(result.result.metadata.igcseExpression).toBe('LCASE(name)');
      expect(result.result.metadata.returnType).toBe('STRING');
    });

    test('converts string.toUpperCase() to UCASE(string)', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'toUpperCase',
          objectName: 'title',
          arguments: [],
          originalCall: 'title.toUpperCase()'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseFunction).toBe('UCASE');
      expect(result.result.metadata.igcseExpression).toBe('UCASE(title)');
    });

    test('converts string.concat(other) to string & other', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'concat',
          objectName: 'firstName',
          arguments: ['lastName'],
          originalCall: 'firstName.concat(lastName)'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseFunction).toBe('CONCATENATION');
      expect(result.result.metadata.igcseExpression).toBe('firstName & lastName');
      expect(result.result.metadata.returnType).toBe('STRING');
    });

    test('converts string.contains(searchString) to FIND(string, searchString) > 0', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'contains',
          objectName: 'text',
          arguments: ['"test"'],
          originalCall: 'text.contains("test")'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('FIND(text, "test") > 0');
      expect(result.result.metadata.returnType).toBe('BOOLEAN');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].message).toContain('contains converted to conditional expression using FIND');
    });

    test('converts string.startsWith(prefix) to LEFT(string, LENGTH(prefix)) = prefix', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'startsWith',
          objectName: 'filename',
          arguments: ['"temp"'],
          originalCall: 'filename.startsWith("temp")'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('LEFT(filename, LENGTH("temp")) = "temp"');
      expect(result.result.metadata.returnType).toBe('BOOLEAN');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].message).toContain('startsWith converted to conditional expression using LEFT');
    });

    test('converts string.endsWith(suffix) to RIGHT(string, LENGTH(suffix)) = suffix', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'endsWith',
          objectName: 'filename',
          arguments: ['".java"'],
          originalCall: 'filename.endsWith(".java")'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('RIGHT(filename, LENGTH(".java")) = ".java"');
      expect(result.result.metadata.returnType).toBe('BOOLEAN');
    });

    test('converts string.equals(other) to string = other', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'equals',
          objectName: 'password',
          arguments: ['"secret"'],
          originalCall: 'password.equals("secret")'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('password = "secret"');
      expect(result.result.metadata.returnType).toBe('BOOLEAN');
    });

    test('converts string.equalsIgnoreCase(other) to LCASE(string) = LCASE(other)', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'equalsIgnoreCase',
          objectName: 'input',
          arguments: ['"YES"'],
          originalCall: 'input.equalsIgnoreCase("YES")'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('LCASE(input) = LCASE("YES")');
      expect(result.result.metadata.returnType).toBe('BOOLEAN');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].message).toContain('equalsIgnoreCase converted using LCASE for case-insensitive comparison');
    });

    test('converts string.isEmpty() to LENGTH(string) = 0', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'isEmpty',
          objectName: 'value',
          arguments: [],
          originalCall: 'value.isEmpty()'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('LENGTH(value) = 0');
      expect(result.result.metadata.returnType).toBe('BOOLEAN');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].message).toContain('isEmpty converted to LENGTH comparison');
    });

    test('converts string.replace(search, replace) with warning', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'replace',
          objectName: 'text',
          arguments: ['"old"', '"new"'],
          originalCall: 'text.replace("old", "new")'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('REPLACE(text, "old", "new")');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].message).toContain('replace method converted to REPLACE function - may need manual implementation');
      expect(result.warnings[1].severity).toBe('warning');
    });

    test('converts string.replaceAll(search, replace) with warning', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'replaceAll',
          objectName: 'text',
          arguments: ['"\\\\s+"', '" "'],
          originalCall: 'text.replaceAll("\\\\s+", " ")'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('REPLACE(text, "\\\\s+", " ")');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].message).toContain('replaceAll method converted to REPLACE function - may need manual implementation');
    });

    test('converts string.split(delimiter) with warning', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'split',
          objectName: 'csv',
          arguments: ['","'],
          originalCall: 'csv.split(",")'
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

    test('converts string.trim() with warning', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'trim',
          objectName: 'input',
          arguments: [],
          originalCall: 'input.trim()'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('TRIM(input)');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].message).toContain('trim method converted to TRIM function - may need manual implementation');
      expect(result.warnings[1].severity).toBe('warning');
    });

    test('handles unsupported Java string methods with warning', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'compareTo',
          objectName: 'str1',
          arguments: ['str2'],
          originalCall: 'str1.compareTo(str2)'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('str1.compareTo(str2)');
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[1].message).toContain('Java string method \'compareTo\' has no direct IGCSE equivalent');
      expect(result.warnings[1].severity).toBe('warning');
    });
  });

  describe('Edge Cases', () => {
    test('handles string methods with no arguments', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'length',
          objectName: 'str',
          arguments: [],
          originalCall: 'str.length()'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('LENGTH(str)');
    });

    test('handles string methods with missing arguments', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'charAt',
          objectName: 'str',
          arguments: [], // Missing index argument
          originalCall: 'str.charAt()'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.igcseExpression).toBe('MID(str, 0 + 1, 1)'); // Uses default '0'
    });

    test('preserves non-string method calls', () => {
      const ast: JavaASTNode = {
        type: 'method_call',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          methodName: 'add',
          objectName: 'list',
          arguments: ['item'],
          originalCall: 'list.add(item)'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('method_call'); // Not converted to string method
      expect(result.result.metadata.methodName).toBe('add');
      expect(result.result.metadata.objectName).toBe('list');
    });
  });
});