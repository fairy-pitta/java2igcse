// Tests for Java Parser
import JavaParser from '../src/parsers/java-parser';

describe('JavaParser', () => {
  let parser: JavaParser;

  beforeEach(() => {
    parser = new JavaParser();
  });

  describe('Basic parsing', () => {
    test('should parse simple variable declaration', () => {
      const result = parser.parse('int x = 5;');
      
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.ast.type).toBe('program');
      expect(result.ast.children).toHaveLength(1);
      
      const varDecl = result.ast.children[0];
      expect(varDecl.type).toBe('variable_declaration');
      expect(varDecl.children).toHaveLength(3); // type, identifier, value
    });

    test('should parse variable declaration without initialization', () => {
      const result = parser.parse('String name;');
      
      expect(result.success).toBe(true);
      expect(result.ast.children).toHaveLength(1);
      
      const varDecl = result.ast.children[0];
      expect(varDecl.type).toBe('variable_declaration');
      expect(varDecl.children).toHaveLength(2); // type, identifier only
    });

    test('should parse multiple variable declarations', () => {
      const result = parser.parse(`
        int x = 10;
        String name = "test";
        boolean flag = true;
      `);
      
      expect(result.success).toBe(true);
      expect(result.ast.children).toHaveLength(3);
    });
  });

  describe('Type parsing', () => {
    test('should parse basic types', () => {
      const types = ['int', 'String', 'boolean', 'double', 'float', 'char'];
      
      types.forEach(type => {
        const result = parser.parse(`${type} var;`);
        expect(result.success).toBe(true);
        
        const varDecl = result.ast.children[0];
        const typeNode = varDecl.children[0];
        expect(typeNode.type).toBe('type');
        expect(typeNode.value).toBe(type);
      });
    });

    test('should parse array types', () => {
      const result = parser.parse('int[] numbers;');
      
      expect(result.success).toBe(true);
      const varDecl = result.ast.children[0];
      const typeNode = varDecl.children[0];
      
      expect(typeNode.type).toBe('type');
      expect(typeNode.value).toBe('int');
      expect(typeNode.metadata?.isArray).toBe(true);
    });

    test('should parse multi-dimensional arrays', () => {
      const result = parser.parse('int[][] matrix;');
      
      expect(result.success).toBe(true);
      const varDecl = result.ast.children[0];
      const typeNode = varDecl.children[0];
      
      expect(typeNode.metadata?.isArray).toBe(true);
      expect(typeNode.metadata?.arrayDimensions).toHaveLength(2);
    });
  });

  describe('Literal parsing', () => {
    test('should parse number literals', () => {
      const result = parser.parse('int x = 42;');
      
      expect(result.success).toBe(true);
      const varDecl = result.ast.children[0];
      const literal = varDecl.children[2];
      
      expect(literal.type).toBe('literal');
      expect(literal.value).toBe('42');
      expect(literal.metadata?.literalType).toBe('number');
    });

    test('should parse string literals', () => {
      const result = parser.parse('String text = "hello world";');
      
      expect(result.success).toBe(true);
      const varDecl = result.ast.children[0];
      const literal = varDecl.children[2];
      
      expect(literal.type).toBe('literal');
      expect(literal.value).toBe('hello world');
      expect(literal.metadata?.literalType).toBe('string');
    });

    test('should parse boolean literals', () => {
      const trueResult = parser.parse('boolean flag = true;');
      const falseResult = parser.parse('boolean flag = false;');
      
      expect(trueResult.success).toBe(true);
      expect(falseResult.success).toBe(true);
      
      const trueLiteral = trueResult.ast.children[0].children[2];
      const falseLiteral = falseResult.ast.children[0].children[2];
      
      expect(trueLiteral.value).toBe('true');
      expect(falseLiteral.value).toBe('false');
      expect(trueLiteral.metadata?.literalType).toBe('boolean');
    });
  });

  describe('Error handling', () => {
    test('should handle syntax errors gracefully', () => {
      const result = parser.parse('int x =;'); // missing value
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle unterminated strings', () => {
      const result = parser.parse('String text = "unterminated;');
      
      expect(result.success).toBe(false);
      expect(result.errors.some((e: any) => e.message.includes('Unterminated string'))).toBe(true);
    });
  });

  describe('Validation', () => {
    test('should validate correct Java syntax', () => {
      const result = parser.validate('int x = 5;');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should provide warnings for features that need conversion', () => {
      const result = parser.validate('System.out.println("test");');
      
      expect(result.warnings.some((w: any) => w.message.includes('OUTPUT statement'))).toBe(true);
    });
  });
});