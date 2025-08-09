// Tests for Java variable declaration parsing and conversion
import { TypeConverter } from '../src/converters/type-converter';

describe('Variable Declaration Conversion', () => {
  let parser: any;

  beforeEach(async () => {
    const JavaParser = (await import('../src/parsers/java-parser')).default;
    parser = new JavaParser();
  });

  describe('TypeConverter', () => {
    test('should convert basic Java types to IGCSE types', () => {
      expect(TypeConverter.convertJavaType('int').igcseType).toBe('INTEGER');
      expect(TypeConverter.convertJavaType('String').igcseType).toBe('STRING');
      expect(TypeConverter.convertJavaType('boolean').igcseType).toBe('BOOLEAN');
      expect(TypeConverter.convertJavaType('double').igcseType).toBe('REAL');
      expect(TypeConverter.convertJavaType('float').igcseType).toBe('REAL');
      expect(TypeConverter.convertJavaType('char').igcseType).toBe('CHAR');
    });

    test('should handle array types', () => {
      const result = TypeConverter.convertJavaType('int', true, [10]);
      expect(result.igcseType).toBe('INTEGER');
      expect(result.isArray).toBe(true);
      expect(result.arrayDimensions).toEqual([10]);
    });

    test('should generate IGCSE array declarations', () => {
      expect(TypeConverter.generateIGCSEArrayDeclaration('INTEGER', [10]))
        .toBe('ARRAY[1:10] OF INTEGER');
      
      expect(TypeConverter.generateIGCSEArrayDeclaration('STRING', [5, 3]))
        .toBe('ARRAY[1:5] OF ARRAY[1:3] OF STRING');
    });

    test('should convert variable declarations', () => {
      const result = TypeConverter.convertVariableDeclaration('x', 'int', false, [], '5');
      expect(result.declaration).toBe('DECLARE x : INTEGER\nx ← 5');
    });

    test('should convert array variable declarations', () => {
      const result = TypeConverter.convertVariableDeclaration('numbers', 'int', true, [10]);
      expect(result.declaration).toBe('DECLARE numbers : ARRAY[1:10] OF INTEGER');
    });

    test('should convert literal values', () => {
      expect(TypeConverter.convertLiteralValue('true', 'BOOLEAN')).toBe('TRUE');
      expect(TypeConverter.convertLiteralValue('false', 'BOOLEAN')).toBe('FALSE');
      expect(TypeConverter.convertLiteralValue('hello', 'STRING')).toBe('"hello"');
      expect(TypeConverter.convertLiteralValue('a', 'CHAR')).toBe('a');
    });
  });

  describe('JavaParser Variable Declaration Extraction', () => {
    test('should extract simple variable declaration', () => {
      const result = parser.parse('int x = 5;');
      expect(result.success).toBe(true);
      
      const declarations = parser.extractVariableDeclarations(result.ast);
      expect(declarations).toHaveLength(1);
      
      const decl = declarations[0];
      expect(decl.name).toBe('x');
      expect(decl.javaType).toBe('int');
      expect(decl.initialValue).toBe('5');
      expect(decl.igcseDeclaration).toBe('DECLARE x : INTEGER\nx ← 5');
    });

    test('should extract variable declaration without initialization', () => {
      const result = parser.parse('String name;');
      expect(result.success).toBe(true);
      
      const declarations = parser.extractVariableDeclarations(result.ast);
      expect(declarations).toHaveLength(1);
      
      const decl = declarations[0];
      expect(decl.name).toBe('name');
      expect(decl.javaType).toBe('String');
      expect(decl.initialValue).toBeUndefined();
      expect(decl.igcseDeclaration).toBe('DECLARE name : STRING');
    });

    test('should extract array variable declarations', () => {
      const result = parser.parse('int[] numbers;');
      expect(result.success).toBe(true);
      
      const declarations = parser.extractVariableDeclarations(result.ast);
      expect(declarations).toHaveLength(1);
      
      const decl = declarations[0];
      expect(decl.name).toBe('numbers');
      expect(decl.javaType).toBe('int');
      expect(decl.isArray).toBe(true);
      expect(decl.igcseDeclaration).toBe('DECLARE numbers : ARRAY[1:n] OF INTEGER');
    });

    test('should extract multiple variable declarations', () => {
      const result = parser.parse(`
        int x = 10;
        String name = "test";
        boolean flag = true;
      `);
      expect(result.success).toBe(true);
      
      const declarations = parser.extractVariableDeclarations(result.ast);
      expect(declarations).toHaveLength(3);
      
      expect(declarations[0].igcseDeclaration).toBe('DECLARE x : INTEGER\nx ← 10');
      expect(declarations[1].igcseDeclaration).toBe('DECLARE name : STRING\nname ← "test"');
      expect(declarations[2].igcseDeclaration).toBe('DECLARE flag : BOOLEAN\nflag ← TRUE');
    });

    test('should handle different data types', () => {
      const testCases = [
        { java: 'double price = 19.99;', expected: 'DECLARE price : REAL\nprice ← 19.99' },
        { java: 'char grade = "A";', expected: 'DECLARE grade : CHAR\ngrade ← \'A\'' },
        { java: 'float temperature = 36.5;', expected: 'DECLARE temperature : REAL\ntemperature ← 36.5' }
      ];

      testCases.forEach(({ java, expected }) => {
        const result = parser.parse(java);
        expect(result.success).toBe(true);
        
        const declarations = parser.extractVariableDeclarations(result.ast);
        expect(declarations).toHaveLength(1);
        expect(declarations[0].igcseDeclaration).toBe(expected);
      });
    });

    test('should handle multi-dimensional arrays', () => {
      const result = parser.parse('int[][] matrix;');
      expect(result.success).toBe(true);
      
      const declarations = parser.extractVariableDeclarations(result.ast);
      expect(declarations).toHaveLength(1);
      
      const decl = declarations[0];
      expect(decl.isArray).toBe(true);
      expect(decl.arrayDimensions).toHaveLength(2);
      expect(decl.igcseDeclaration).toBe('DECLARE matrix : ARRAY[1:n] OF ARRAY[1:n] OF INTEGER');
    });
  });
});