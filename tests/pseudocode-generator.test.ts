// Tests for IGCSE Pseudocode Generator

import { IGCSEPseudocodeGenerator } from '../src/generators/pseudocode-generator';
import { IntermediateRepresentation, ConversionOptions } from '../src/index';

describe('IGCSEPseudocodeGenerator', () => {
  let generator: IGCSEPseudocodeGenerator;

  beforeEach(() => {
    generator = new IGCSEPseudocodeGenerator();
  });

  describe('Variable Declaration Generation', () => {
    test('generates simple variable declaration', () => {
      const ir: IntermediateRepresentation = {
        type: 'declaration',
        kind: 'variable_declaration',
        children: [],
        metadata: {
          variableName: 'count',
          igcseType: 'INTEGER',
          hasInitializer: false,
          isArray: false
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('DECLARE count : INTEGER');
    });

    test('generates variable declaration with initializer', () => {
      const ir: IntermediateRepresentation = {
        type: 'declaration',
        kind: 'variable_declaration',
        children: [],
        metadata: {
          variableName: 'name',
          igcseType: 'STRING',
          hasInitializer: true,
          initialValue: 'John',
          isArray: false
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('DECLARE name : STRING ← "John"');
    });

    test('generates array declaration', () => {
      const ir: IntermediateRepresentation = {
        type: 'declaration',
        kind: 'variable_declaration',
        children: [],
        metadata: {
          variableName: 'numbers',
          igcseType: 'INTEGER',
          hasInitializer: false,
          isArray: true,
          arrayDimensions: [10]
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('DECLARE numbers : ARRAY[1:10] OF INTEGER');
    });

    test('generates multi-dimensional array declaration', () => {
      const ir: IntermediateRepresentation = {
        type: 'declaration',
        kind: 'variable_declaration',
        children: [],
        metadata: {
          variableName: 'matrix',
          igcseType: 'REAL',
          hasInitializer: false,
          isArray: true,
          arrayDimensions: [5, 10]
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('DECLARE matrix : ARRAY[1:5] OF ARRAY[1:10] OF REAL');
    });

    test('generates array declaration without specified dimensions', () => {
      const ir: IntermediateRepresentation = {
        type: 'declaration',
        kind: 'variable_declaration',
        children: [],
        metadata: {
          variableName: 'items',
          igcseType: 'STRING',
          hasInitializer: false,
          isArray: true
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('DECLARE items : ARRAY[1:n] OF STRING');
    });

    test('handles array initialization with warning', () => {
      const ir: IntermediateRepresentation = {
        type: 'declaration',
        kind: 'variable_declaration',
        children: [],
        metadata: {
          variableName: 'arr',
          igcseType: 'INTEGER',
          hasInitializer: true,
          initialValue: '{1, 2, 3}',
          isArray: true,
          arrayDimensions: [3]
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('DECLARE arr : ARRAY[1:3] OF INTEGER // Initialize with: {1, 2, 3}');
      
      const warnings = generator.getWarnings();
      expect(warnings).toHaveLength(1);
      expect(warnings[0].code).toBe('ARRAY_INITIALIZATION');
    });

    test('handles missing variable metadata', () => {
      const ir: IntermediateRepresentation = {
        type: 'declaration',
        kind: 'variable_declaration',
        children: [],
        metadata: {}
      };

      const result = generator.generate(ir);
      expect(result).toBe('// Invalid variable declaration');
      
      const warnings = generator.getWarnings();
      expect(warnings).toHaveLength(1);
      expect(warnings[0].code).toBe('MISSING_METADATA');
    });
  });

  describe('Output Statement Generation', () => {
    test('generates simple output statement', () => {
      const ir: IntermediateRepresentation = {
        type: 'statement',
        kind: 'output_statement',
        children: [],
        metadata: {
          expressions: ['Hello World']
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('OUTPUT "Hello World"');
    });

    test('generates output with multiple expressions', () => {
      const ir: IntermediateRepresentation = {
        type: 'statement',
        kind: 'output_statement',
        children: [],
        metadata: {
          expressions: ['"Hello"', 'name', '"!"']
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('OUTPUT "Hello", name, "!"');
    });

    test('generates empty output statement', () => {
      const ir: IntermediateRepresentation = {
        type: 'statement',
        kind: 'output_statement',
        children: [],
        metadata: {
          expressions: []
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('OUTPUT ""');
    });

    test('handles string literals correctly', () => {
      const ir: IntermediateRepresentation = {
        type: 'statement',
        kind: 'output_statement',
        children: [],
        metadata: {
          expressions: ['"Already quoted"', 'Not quoted']
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('OUTPUT "Already quoted", "Not quoted"');
    });
  });

  describe('Function Declaration Generation', () => {
    test('generates procedure declaration', () => {
      const ir: IntermediateRepresentation = {
        type: 'function_declaration',
        kind: 'procedure',
        children: [
          {
            type: 'statement',
            kind: 'output_statement',
            children: [],
            metadata: {
              expressions: ['Hello']
            }
          }
        ],
        metadata: {
          functionName: 'sayHello',
          parameters: [],
          isProcedure: true
        }
      };

      const result = generator.generate(ir);
      const expected = [
        'PROCEDURE sayHello()',
        '    OUTPUT "Hello"',
        'ENDPROCEDURE'
      ].join('\n');
      
      expect(result).toBe(expected);
    });

    test('generates function declaration with return type', () => {
      const ir: IntermediateRepresentation = {
        type: 'function_declaration',
        kind: 'function',
        children: [
          {
            type: 'statement',
            kind: 'return_statement',
            children: [],
            metadata: {
              expression: 'a + b'
            }
          }
        ],
        metadata: {
          functionName: 'add',
          parameters: [
            { name: 'a', type: 'INTEGER', isArray: false },
            { name: 'b', type: 'INTEGER', isArray: false }
          ],
          returnType: 'INTEGER',
          isProcedure: false
        }
      };

      const result = generator.generate(ir);
      const expected = [
        'FUNCTION add(a : INTEGER, b : INTEGER) RETURNS INTEGER',
        '    RETURN a + b',
        'ENDFUNCTION'
      ].join('\n');
      
      expect(result).toBe(expected);
    });

    test('generates static method with comment', () => {
      const ir: IntermediateRepresentation = {
        type: 'function_declaration',
        kind: 'procedure',
        children: [],
        metadata: {
          functionName: 'main',
          parameters: [],
          isProcedure: true,
          isStatic: true
        }
      };

      const result = generator.generate(ir);
      const expected = [
        '// Static method',
        'PROCEDURE main()',
        'ENDPROCEDURE'
      ].join('\n');
      
      expect(result).toBe(expected);
    });

    test('generates function with array parameters', () => {
      const ir: IntermediateRepresentation = {
        type: 'function_declaration',
        kind: 'procedure',
        children: [],
        metadata: {
          functionName: 'processArray',
          parameters: [
            { name: 'arr', type: 'INTEGER', isArray: true },
            { name: 'size', type: 'INTEGER', isArray: false }
          ],
          isProcedure: true
        }
      };

      const result = generator.generate(ir);
      const expected = [
        'PROCEDURE processArray(arr : ARRAY[1:n] OF INTEGER, size : INTEGER)',
        'ENDPROCEDURE'
      ].join('\n');
      
      expect(result).toBe(expected);
    });

    test('handles missing function name', () => {
      const ir: IntermediateRepresentation = {
        type: 'function_declaration',
        kind: 'procedure',
        children: [],
        metadata: {
          parameters: [],
          isProcedure: true
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('// Invalid function declaration');
      
      const warnings = generator.getWarnings();
      expect(warnings).toHaveLength(1);
      expect(warnings[0].code).toBe('MISSING_FUNCTION_NAME');
    });
  });

  describe('Control Structure Generation', () => {
    test('generates if statement', () => {
      const ir: IntermediateRepresentation = {
        type: 'control_structure',
        kind: 'if_statement',
        children: [
          {
            type: 'statement',
            kind: 'output_statement',
            children: [],
            metadata: {
              expressions: ['Positive']
            }
          }
        ],
        metadata: {
          condition: 'x > 0'
        }
      };

      const result = generator.generate(ir);
      const expected = [
        'IF x > 0 THEN',
        '    OUTPUT "Positive"',
        'ENDIF'
      ].join('\n');
      
      expect(result).toBe(expected);
    });

    test('generates while loop', () => {
      const ir: IntermediateRepresentation = {
        type: 'control_structure',
        kind: 'while_loop',
        children: [
          {
            type: 'statement',
            kind: 'assignment_statement',
            children: [],
            metadata: {
              variable: 'i',
              expression: 'i + 1'
            }
          }
        ],
        metadata: {
          condition: 'i < 10'
        }
      };

      const result = generator.generate(ir);
      const expected = [
        'WHILE i < 10 DO',
        '    i ← i + 1',
        'ENDWHILE'
      ].join('\n');
      
      expect(result).toBe(expected);
    });

    test('generates for loop', () => {
      const ir: IntermediateRepresentation = {
        type: 'control_structure',
        kind: 'for_loop',
        children: [
          {
            type: 'statement',
            kind: 'output_statement',
            children: [],
            metadata: {
              expressions: ['i']
            }
          }
        ],
        metadata: {
          variable: 'i',
          startValue: '1',
          endValue: '10'
        }
      };

      const result = generator.generate(ir);
      const expected = [
        'FOR i ← 1 TO 10',
        '    OUTPUT i',
        'NEXT i'
      ].join('\n');
      
      expect(result).toBe(expected);
    });

    test('generates for loop with step', () => {
      const ir: IntermediateRepresentation = {
        type: 'control_structure',
        kind: 'for_loop',
        children: [],
        metadata: {
          variable: 'i',
          startValue: '0',
          endValue: '10',
          stepValue: '2'
        }
      };

      const result = generator.generate(ir);
      const expected = [
        'FOR i ← 0 TO 10 STEP 2',
        'NEXT i'
      ].join('\n');
      
      expect(result).toBe(expected);
    });

    test('handles missing control structure condition', () => {
      const ir: IntermediateRepresentation = {
        type: 'control_structure',
        kind: 'if_statement',
        children: [],
        metadata: {}
      };

      const result = generator.generate(ir);
      expect(result).toBe('// Invalid if statement');
      
      const warnings = generator.getWarnings();
      expect(warnings).toHaveLength(1);
      expect(warnings[0].code).toBe('MISSING_IF_CONDITION');
    });
  });

  describe('Assignment and Expression Generation', () => {
    test('generates assignment statement', () => {
      const ir: IntermediateRepresentation = {
        type: 'assignment',
        kind: 'assignment_statement',
        children: [],
        metadata: {
          variable: 'result',
          expression: 'a + b * c'
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('result ← a + b * c');
    });

    test('generates binary operation', () => {
      const ir: IntermediateRepresentation = {
        type: 'binary_operation',
        kind: 'arithmetic',
        children: [],
        metadata: {
          left: 'a',
          operator: '+',
          right: 'b'
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('a + b');
    });

    test('converts operators to IGCSE format', () => {
      const operatorTests = [
        { input: '==', expected: '=' },
        { input: '!=', expected: '<>' },
        { input: '&&', expected: 'AND' },
        { input: '||', expected: 'OR' },
        { input: '%', expected: 'MOD' }
      ];

      operatorTests.forEach(({ input, expected }) => {
        const ir: IntermediateRepresentation = {
          type: 'binary_operation',
          kind: 'comparison',
          children: [],
          metadata: {
            left: 'a',
            operator: input,
            right: 'b'
          }
        };

        const result = generator.generate(ir);
        expect(result).toBe(`a ${expected} b`);
      });
    });

    test('generates unary operation', () => {
      const ir: IntermediateRepresentation = {
        type: 'unary_operation',
        kind: 'logical',
        children: [],
        metadata: {
          operator: '!',
          operand: 'flag'
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('NOTflag');
    });
  });

  describe('Method Call Generation', () => {
    test('generates procedure call', () => {
      const ir: IntermediateRepresentation = {
        type: 'method_call',
        kind: 'procedure_call',
        children: [],
        metadata: {
          methodName: 'printMessage',
          arguments: ['"Hello"', 'name'],
          isProcedureCall: true
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('CALL printMessage("Hello", name)');
    });

    test('generates function call', () => {
      const ir: IntermediateRepresentation = {
        type: 'method_call',
        kind: 'function_call',
        children: [],
        metadata: {
          methodName: 'calculate',
          arguments: ['x', 'y'],
          isProcedureCall: false
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('calculate(x, y)');
    });

    test('handles missing method name', () => {
      const ir: IntermediateRepresentation = {
        type: 'method_call',
        kind: 'procedure_call',
        children: [],
        metadata: {
          arguments: [],
          isProcedureCall: true
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('// Invalid method call');
      
      const warnings = generator.getWarnings();
      expect(warnings).toHaveLength(1);
      expect(warnings[0].code).toBe('MISSING_METHOD_NAME');
    });
  });

  describe('Literal Generation', () => {
    test('generates string literal', () => {
      const ir: IntermediateRepresentation = {
        type: 'literal',
        kind: 'string',
        children: [],
        metadata: {
          value: 'Hello World',
          type: 'STRING'
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('"Hello World"');
    });

    test('generates already quoted string literal', () => {
      const ir: IntermediateRepresentation = {
        type: 'literal',
        kind: 'string',
        children: [],
        metadata: {
          value: '"Already quoted"',
          type: 'STRING'
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('"Already quoted"');
    });

    test('generates character literal', () => {
      const ir: IntermediateRepresentation = {
        type: 'literal',
        kind: 'char',
        children: [],
        metadata: {
          value: 'A',
          type: 'CHAR'
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe("'A'");
    });

    test('generates boolean literal', () => {
      const ir: IntermediateRepresentation = {
        type: 'literal',
        kind: 'boolean',
        children: [],
        metadata: {
          value: true,
          type: 'BOOLEAN'
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('TRUE');
    });

    test('generates numeric literal', () => {
      const ir: IntermediateRepresentation = {
        type: 'literal',
        kind: 'number',
        children: [],
        metadata: {
          value: 42,
          type: 'INTEGER'
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('42');
    });
  });

  describe('Program Structure Generation', () => {
    test('generates complete program', () => {
      const ir: IntermediateRepresentation = {
        type: 'program',
        kind: 'main_program',
        children: [
          {
            type: 'declaration',
            kind: 'variable_declaration',
            children: [],
            metadata: {
              variableName: 'count',
              igcseType: 'INTEGER',
              hasInitializer: true,
              initialValue: '0',
              isArray: false
            }
          },
          {
            type: 'statement',
            kind: 'output_statement',
            children: [],
            metadata: {
              expressions: ['Count is:', 'count']
            }
          }
        ],
        metadata: {}
      };

      const result = generator.generate(ir);
      const expected = [
        'DECLARE count : INTEGER ← 0',
        'OUTPUT "Count is:", count'
      ].join('\n');
      
      expect(result).toBe(expected);
    });

    test('generates program with comment', () => {
      const ir: IntermediateRepresentation = {
        type: 'program',
        kind: 'main_program',
        children: [],
        metadata: {
          comment: 'Simple test program'
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('// Simple test program');
    });
  });

  describe('Formatting and Options', () => {
    test('respects custom indentation size', () => {
      const options: ConversionOptions = {
        indentSize: 2
      };
      
      generator = new IGCSEPseudocodeGenerator(options);
      
      const ir: IntermediateRepresentation = {
        type: 'control_structure',
        kind: 'if_statement',
        children: [
          {
            type: 'statement',
            kind: 'output_statement',
            children: [],
            metadata: {
              expressions: ['Test']
            }
          }
        ],
        metadata: {
          condition: 'true'
        }
      };

      const result = generator.generate(ir);
      const expected = [
        'IF true THEN',
        '  OUTPUT "Test"',
        'ENDIF'
      ].join('\n');
      
      expect(result).toBe(expected);
    });

    test('handles comments option disabled', () => {
      const options: ConversionOptions = {
        includeComments: false
      };
      
      generator = new IGCSEPseudocodeGenerator(options);
      
      const ir: IntermediateRepresentation = {
        type: 'function_declaration',
        kind: 'procedure',
        children: [],
        metadata: {
          functionName: 'test',
          parameters: [],
          isProcedure: true,
          isStatic: true
        }
      };

      const result = generator.generate(ir);
      const expected = [
        'PROCEDURE test()',
        'ENDPROCEDURE'
      ].join('\n');
      
      expect(result).toBe(expected);
    });

    test('handles line length warnings', () => {
      const longLine = 'a'.repeat(100);
      
      const formattingOptions = {
        indentSize: 4,
        indentChar: ' ',
        lineEnding: '\n',
        maxLineLength: 80
      };

      const result = generator.formatOutput(longLine, formattingOptions);
      expect(result).toBe(longLine);
      
      const warnings = generator.getWarnings();
      expect(warnings.some(w => w.code === 'LINE_TOO_LONG')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('handles unknown node types', () => {
      const ir: IntermediateRepresentation = {
        type: 'unknown' as any,
        kind: 'unknown_kind',
        children: [],
        metadata: {}
      };

      const result = generator.generate(ir);
      expect(result).toBe('// Unknown node type: unknown');
      
      const warnings = generator.getWarnings();
      expect(warnings).toHaveLength(1);
      expect(warnings[0].code).toBe('UNKNOWN_NODE_TYPE');
    });

    test('handles unknown control structures', () => {
      const ir: IntermediateRepresentation = {
        type: 'control_structure',
        kind: 'unknown_control',
        children: [],
        metadata: {}
      };

      const result = generator.generate(ir);
      expect(result).toBe('// Unknown control structure: unknown_control');
      
      const warnings = generator.getWarnings();
      expect(warnings).toHaveLength(1);
      expect(warnings[0].code).toBe('UNKNOWN_CONTROL_STRUCTURE');
    });

    test('handles generation errors gracefully', () => {
      // Create an IR that will cause an error during generation
      const ir: IntermediateRepresentation = {
        type: 'declaration',
        kind: 'variable_declaration',
        children: [],
        metadata: {
          // Missing required metadata will cause an error
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('// Invalid variable declaration');
      
      const warnings = generator.getWarnings();
      expect(warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Input Statement Generation', () => {
    test('generates simple input statement', () => {
      const ir: IntermediateRepresentation = {
        type: 'statement',
        kind: 'input_statement',
        children: [],
        metadata: {
          variable: 'name'
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('INPUT name');
    });

    test('generates input statement with prompt', () => {
      const ir: IntermediateRepresentation = {
        type: 'statement',
        kind: 'input_statement',
        children: [],
        metadata: {
          variable: 'age',
          prompt: 'Enter your age'
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('INPUT "Enter your age", age');
    });

    test('handles missing input variable', () => {
      const ir: IntermediateRepresentation = {
        type: 'statement',
        kind: 'input_statement',
        children: [],
        metadata: {}
      };

      const result = generator.generate(ir);
      expect(result).toBe('// Invalid input statement');
      
      const warnings = generator.getWarnings();
      expect(warnings).toHaveLength(1);
      expect(warnings[0].code).toBe('MISSING_INPUT_VARIABLE');
    });
  });

  describe('Return Statement Generation', () => {
    test('generates return statement with expression', () => {
      const ir: IntermediateRepresentation = {
        type: 'statement',
        kind: 'return_statement',
        children: [],
        metadata: {
          expression: 'result'
        }
      };

      const result = generator.generate(ir);
      expect(result).toBe('RETURN result');
    });

    test('generates empty return statement', () => {
      const ir: IntermediateRepresentation = {
        type: 'statement',
        kind: 'return_statement',
        children: [],
        metadata: {}
      };

      const result = generator.generate(ir);
      expect(result).toBe('RETURN');
    });
  });
});