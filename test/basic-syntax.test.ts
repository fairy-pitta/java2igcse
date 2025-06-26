import { describe, it, expect, beforeEach } from 'vitest';
import { JavaToPseudocodeConverter } from 'src/converter/JavaToPseudocodeConverter';
import { ASTNode } from 'src/types/ast';

describe('Basic Syntax Conversion', () => {
  let converter: JavaToPseudocodeConverter;

  beforeEach(() => {
    converter = new JavaToPseudocodeConverter();
  });

  describe('Variable Declarations', () => {
    it('should convert int variable declaration', () => {
      const javaCode = 'int x = 5;';
      const expected = 'DECLARE x : INTEGER\nx ← 5';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert string variable declaration', () => {
      const javaCode = 'String name = "John";';
      const expected = 'DECLARE name : STRING\nname ← "John"';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert boolean variable declaration', () => {
      const javaCode = 'boolean flag = true;';
      const expected = 'DECLARE flag : BOOLEAN\nflag ← TRUE';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert double variable declaration', () => {
      const javaCode = 'double price = 19.99;';
      const expected = 'DECLARE price : REAL\nprice ← 19.99';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert variable declaration without initialization', () => {
      const javaCode = 'int count;';
      const expected = 'DECLARE count : INTEGER';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });

  describe('Assignment Statements', () => {
    it('should convert simple assignment', () => {
      const javaCode = 'x = 10;';
      const expected = 'x ← 10';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert string assignment', () => {
      const javaCode = 'name = "Alice";';
      const expected = 'name ← "Alice"';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert boolean assignment', () => {
      const javaCode = 'isValid = false;';
      const expected = 'isValid ← FALSE';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });

  describe('Arithmetic Operations', () => {
    it('should convert addition', () => {
      const javaCode = 'result = a + b;';
      const expected = 'result ← a + b';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert subtraction', () => {
      const javaCode = 'result = a - b;';
      const expected = 'result ← a - b';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert multiplication', () => {
      const javaCode = 'result = a * b;';
      const expected = 'result ← a * b';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert division', () => {
      const javaCode = 'result = a / b;';
      const expected = 'result ← a / b';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert modulo operation', () => {
      const javaCode = 'result = a % b;';
      const expected = 'result ← a MOD b';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert integer division', () => {
      const javaCode = 'result = a / b; // integer division';
      const expected = 'result ← a DIV b';
      const result = converter.convertWithHint(javaCode, { integerDivision: true });
      expect(result.trim()).toBe(expected);
    });
  });

  describe('Logical Operations', () => {
    it('should convert logical AND', () => {
      const javaCode = 'result = a && b;';
      const expected = 'result ← a AND b';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert logical OR', () => {
      const javaCode = 'result = a || b;';
      const expected = 'result ← a OR b';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert logical NOT', () => {
      const javaCode = 'result = !flag;';
      const expected = 'result ← NOT flag';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });

  describe('Comparison Operations', () => {
    it('should convert equality', () => {
      const javaCode = 'result = a == b;';
      const expected = 'result ← a = b';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert inequality', () => {
      const javaCode = 'result = a != b;';
      const expected = 'result ← a ≠ b';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert less than', () => {
      const javaCode = 'result = a < b;';
      const expected = 'result ← a < b';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert greater than', () => {
      const javaCode = 'result = a > b;';
      const expected = 'result ← a > b';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert less than or equal', () => {
      const javaCode = 'result = a <= b;';
      const expected = 'result ← a ≤ b';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert greater than or equal', () => {
      const javaCode = 'result = a >= b;';
      const expected = 'result ← a ≥ b';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });

  describe('Input/Output Operations', () => {
    it('should convert System.out.println', () => {
      const javaCode = 'System.out.println("Hello World");';
      const expected = 'OUTPUT "Hello World"';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert System.out.print', () => {
      const javaCode = 'System.out.print("Hello");';
      const expected = 'OUTPUT "Hello"';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert variable output', () => {
      const javaCode = 'System.out.println(name);';
      const expected = 'OUTPUT name';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert concatenated output', () => {
      const javaCode = 'System.out.println("Hello " + name);';
      const expected = 'OUTPUT "Hello " & name';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert Scanner input', () => {
      const javaCode = 'int x = scanner.nextInt();';
      const expected = 'DECLARE x : INTEGER\nINPUT x';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert String input', () => {
      const javaCode = 'String name = scanner.nextLine();';
      const expected = 'DECLARE name : STRING\nINPUT name';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });

  describe('String Operations', () => {
    it('should convert string concatenation', () => {
      const javaCode = 'result = firstName + lastName;';
      const expected = 'result ← firstName & lastName';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert string concatenation with literal', () => {
      const javaCode = 'message = "Hello " + name + "!";';
      const expected = 'message ← "Hello " & name & "!"';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });

  describe('Constants', () => {
    it('should convert final variable as constant', () => {
      const javaCode = 'final double PI = 3.14159;';
      const expected = 'CONSTANT PI = 3.14159';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert static final as constant', () => {
      const javaCode = 'static final int MAX_SIZE = 100;';
      const expected = 'CONSTANT MAX_SIZE = 100';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });
});