// Tests for TypeScript ES6+ Features Conversion

import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';
import { TypeScriptParser } from '../src/parsers/typescript-parser';
import { TypeScriptASTNode } from '../src/index';

describe('TypeScript ES6+ Features', () => {
  let transformer: TypeScriptASTTransformer;
  let parser: TypeScriptParser;

  beforeEach(() => {
    transformer = new TypeScriptASTTransformer();
    parser = new TypeScriptParser();
  });

  describe('Arrow Functions', () => {
    test('converts simple arrow function to named procedure', () => {
      const ast: TypeScriptASTNode = {
        type: 'arrow_function',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          parameters: [
            { name: 'x', type: 'number', optional: false }
          ],
          returnType: 'void',
          isArrowFunction: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('arrow_function_converted');
      expect(result.result.metadata.isArrowFunction).toBe(true);
      expect(result.result.metadata.isProcedure).toBe(true);
      expect(result.result.metadata.parameters).toHaveLength(1);
      expect(result.result.metadata.parameters[0].name).toBe('x');
      expect(result.result.metadata.parameters[0].type).toBe('REAL');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Arrow function converted to named procedure');
    });

    test('converts arrow function with return type to named function', () => {
      const ast: TypeScriptASTNode = {
        type: 'arrow_function',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          parameters: [
            { name: 'a', type: 'number', optional: false },
            { name: 'b', type: 'number', optional: false }
          ],
          returnType: 'number',
          isArrowFunction: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('arrow_function_converted');
      expect(result.result.metadata.isProcedure).toBe(false);
      expect(result.result.metadata.returnType).toBe('REAL');
      expect(result.result.metadata.igcseDeclaration).toContain('FUNCTION');
      expect(result.result.metadata.igcseDeclaration).toContain('RETURNS REAL');
    });

    test('converts arrow function with no parameters', () => {
      const ast: TypeScriptASTNode = {
        type: 'arrow_function',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          parameters: [],
          returnType: 'string',
          isArrowFunction: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.parameters).toHaveLength(0);
      expect(result.result.metadata.igcseDeclaration).toMatch(/FUNCTION \w+\(\) RETURNS STRING/);
    });

    test('converts arrow function with optional parameters', () => {
      const ast: TypeScriptASTNode = {
        type: 'arrow_function',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          parameters: [
            { name: 'x', type: 'number', optional: false },
            { name: 'y', type: 'string', optional: true }
          ],
          returnType: 'boolean',
          isArrowFunction: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.parameters).toHaveLength(2);
      expect(result.result.metadata.parameters[0].isOptional).toBe(false);
      expect(result.result.metadata.parameters[1].isOptional).toBe(true);
      expect(result.result.metadata.parameters[1].name).toBe('y');
    });
  });

  describe('Template Literals', () => {
    test('converts simple template literal to string', () => {
      const ast: TypeScriptASTNode = {
        type: 'template_literal',
        value: '`Hello World`',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          literalType: 'template',
          expressions: [],
          templateParts: ['Hello World'],
          hasExpressions: false
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('template_literal_converted');
      expect(result.result.metadata.concatenatedString).toBe('"Hello World"');
      expect(result.result.metadata.parts).toEqual(['"Hello World"']);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Template literal converted to string concatenation');
    });

    test('converts template literal with expressions to string concatenation', () => {
      const ast: TypeScriptASTNode = {
        type: 'template_literal',
        value: '`Hello ${name}!`',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          literalType: 'template',
          expressions: ['name'],
          templateParts: ['Hello ', '!'],
          hasExpressions: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('template_literal_converted');
      expect(result.result.metadata.expressions).toEqual(['name']);
      expect(result.result.metadata.parts).toEqual(['"Hello "', 'name', '"!"']);
      expect(result.result.metadata.concatenatedString).toBe('"Hello " & name & "!"');
      expect(result.result.metadata.igcseExpression).toBe('"Hello " & name & "!"');
    });

    test('converts template literal with multiple expressions', () => {
      const ast: TypeScriptASTNode = {
        type: 'template_literal',
        value: '`${greeting} ${name}, you are ${age} years old`',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          literalType: 'template',
          expressions: ['greeting', 'name', 'age'],
          templateParts: ['', ' ', ', you are ', ' years old'],
          hasExpressions: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.expressions).toEqual(['greeting', 'name', 'age']);
      expect(result.result.metadata.parts).toEqual(['""', 'greeting', '" "', 'name', '", you are "', 'age', '" years old"']);
      expect(result.result.metadata.concatenatedString).toBe('"" & greeting & " " & name & ", you are " & age & " years old"');
    });
  });

  describe('Destructuring Assignments', () => {
    test('converts object destructuring to individual assignments', () => {
      const ast: TypeScriptASTNode = {
        type: 'destructuring_assignment',
        value: '{name, age}',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          destructuringType: 'object',
          pattern: {
            properties: [
              { key: 'name', name: 'name', value: 'name' },
              { key: 'age', name: 'age', value: 'age' }
            ]
          },
          source: 'person'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('destructuring_converted');
      expect(result.result.metadata.destructuringType).toBe('object');
      expect(result.result.metadata.assignmentCount).toBe(2);
      expect(result.result.children).toHaveLength(2);
      
      // Check first assignment
      expect(result.result.children[0].kind).toBe('assignment_statement');
      expect(result.result.children[0].metadata.variable).toBe('name');
      expect(result.result.children[0].metadata.expression).toBe('person.name');
      expect(result.result.children[0].metadata.igcseAssignment).toBe('name ← person.name');
      
      // Check second assignment
      expect(result.result.children[1].kind).toBe('assignment_statement');
      expect(result.result.children[1].metadata.variable).toBe('age');
      expect(result.result.children[1].metadata.expression).toBe('person.age');
      expect(result.result.children[1].metadata.igcseAssignment).toBe('age ← person.age');
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Destructuring assignment converted to individual variable assignments');
    });

    test('converts object destructuring with renamed properties', () => {
      const ast: TypeScriptASTNode = {
        type: 'destructuring_assignment',
        value: '{name: fullName, age: years}',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          destructuringType: 'object',
          pattern: {
            properties: [
              { key: 'name', name: 'fullName', value: 'name' },
              { key: 'age', name: 'years', value: 'age' }
            ]
          },
          source: 'person'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.children).toHaveLength(2);
      expect(result.result.children[0].metadata.variable).toBe('fullName');
      expect(result.result.children[0].metadata.expression).toBe('person.name');
      expect(result.result.children[1].metadata.variable).toBe('years');
      expect(result.result.children[1].metadata.expression).toBe('person.age');
    });

    test('converts array destructuring to individual assignments', () => {
      const ast: TypeScriptASTNode = {
        type: 'destructuring_assignment',
        value: '[first, second]',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          destructuringType: 'array',
          pattern: {
            elements: ['first', 'second']
          },
          source: 'numbers'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('destructuring_converted');
      expect(result.result.metadata.destructuringType).toBe('array');
      expect(result.result.metadata.assignmentCount).toBe(2);
      expect(result.result.children).toHaveLength(2);
      
      // Check first assignment (IGCSE uses 1-based indexing)
      expect(result.result.children[0].metadata.variable).toBe('first');
      expect(result.result.children[0].metadata.expression).toBe('numbers[1]');
      expect(result.result.children[0].metadata.igcseAssignment).toBe('first ← numbers[1]');
      
      // Check second assignment
      expect(result.result.children[1].metadata.variable).toBe('second');
      expect(result.result.children[1].metadata.expression).toBe('numbers[2]');
      expect(result.result.children[1].metadata.igcseAssignment).toBe('second ← numbers[2]');
    });

    test('converts array destructuring with gaps', () => {
      const ast: TypeScriptASTNode = {
        type: 'destructuring_assignment',
        value: '[first, , third]',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          destructuringType: 'array',
          pattern: {
            elements: ['first', null, 'third']
          },
          source: 'values'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.children).toHaveLength(2); // Only non-null elements
      expect(result.result.children[0].metadata.variable).toBe('first');
      expect(result.result.children[0].metadata.expression).toBe('values[1]');
      expect(result.result.children[1].metadata.variable).toBe('third');
      expect(result.result.children[1].metadata.expression).toBe('values[3]'); // Skip index 2
    });
  });

  describe('Object Destructuring', () => {
    test('converts object destructuring pattern', () => {
      const ast: TypeScriptASTNode = {
        type: 'object_destructuring',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          destructuringType: 'object',
          pattern: {
            properties: [
              { key: 'x', name: 'x', value: 'x' },
              { key: 'y', name: 'y', value: 'y' }
            ]
          },
          source: 'point'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('destructuring_converted');
      expect(result.result.metadata.destructuringType).toBe('object');
      expect(result.result.children).toHaveLength(2);
    });
  });

  describe('Array Destructuring', () => {
    test('converts array destructuring pattern', () => {
      const ast: TypeScriptASTNode = {
        type: 'array_destructuring',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          destructuringType: 'array',
          pattern: {
            elements: ['a', 'b', 'c']
          },
          source: 'items'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.kind).toBe('destructuring_converted');
      expect(result.result.metadata.destructuringType).toBe('array');
      expect(result.result.children).toHaveLength(3);
    });
  });

  describe('Integration with Parser', () => {
    test('parses and transforms arrow function from source code', () => {
      const sourceCode = 'const add = (a: number, b: number): number => a + b;';
      const parseResult = parser.parse(sourceCode);
      
      expect(parseResult.success).toBe(true);
      
      // Find the arrow function in the AST
      let arrowFunction: TypeScriptASTNode | null = null;
      const findArrowFunction = (node: TypeScriptASTNode) => {
        if (node.type === 'arrow_function') {
          arrowFunction = node;
          return;
        }
        node.children?.forEach(findArrowFunction);
      };
      
      findArrowFunction(parseResult.ast);
      expect(arrowFunction).not.toBeNull();
      
      if (arrowFunction) {
        const result = transformer.transform(arrowFunction);
        expect(result.success).toBe(true);
        expect(result.result.metadata.isArrowFunction).toBe(true);
        expect(result.warnings[0].message).toContain('Arrow function converted');
      }
    });

    test('parses and transforms template literal from source code', () => {
      const sourceCode = 'const message = `Hello ${name}!`;';
      const parseResult = parser.parse(sourceCode);
      
      expect(parseResult.success).toBe(true);
      
      // Find template literal in the AST
      let templateLiteral: TypeScriptASTNode | null = null;
      const findTemplateLiteral = (node: TypeScriptASTNode) => {
        if (node.type === 'template_literal') {
          templateLiteral = node;
          return;
        }
        node.children?.forEach(findTemplateLiteral);
      };
      
      findTemplateLiteral(parseResult.ast);
      expect(templateLiteral).not.toBeNull();
      
      if (templateLiteral) {
        const result = transformer.transform(templateLiteral);
        expect(result.success).toBe(true);
        expect(result.result.kind).toBe('template_literal_converted');
        expect(result.warnings[0].message).toContain('Template literal converted');
      }
    });
  });

  describe('Edge Cases', () => {
    test('handles arrow function with complex parameter types', () => {
      const ast: TypeScriptASTNode = {
        type: 'arrow_function',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          parameters: [
            { name: 'items', type: 'Array<string>', optional: false },
            { name: 'callback', type: '(item: string) => boolean', optional: true }
          ],
          returnType: 'string[]',
          isArrowFunction: true
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.parameters[0].type).toBe('STRING');
      expect(result.result.metadata.parameters[0].isArray).toBe(false); // Array detection happens in variable transformer
      expect(result.result.metadata.parameters[1].type).toBe('BOOLEAN'); // Function return type
      expect(result.result.metadata.parameters[1].isOptional).toBe(true);
      expect(result.result.metadata.returnType).toBe('STRING');
    });

    test('handles empty template literal', () => {
      const ast: TypeScriptASTNode = {
        type: 'template_literal',
        value: '``',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          literalType: 'template',
          expressions: [],
          templateParts: [''],
          hasExpressions: false
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.concatenatedString).toBe('""');
    });

    test('handles destructuring with no properties', () => {
      const ast: TypeScriptASTNode = {
        type: 'destructuring_assignment',
        value: '{}',
        children: [],
        location: { line: 1, column: 1 },
        metadata: {
          destructuringType: 'object',
          pattern: {
            properties: []
          },
          source: 'obj'
        }
      };

      const result = transformer.transform(ast);

      expect(result.success).toBe(true);
      expect(result.result.metadata.assignmentCount).toBe(0);
      expect(result.result.children).toHaveLength(0);
    });
  });
});