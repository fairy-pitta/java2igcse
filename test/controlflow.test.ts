import { describe, it, expect, beforeEach } from 'vitest';
import { JavaToPseudocodeConverter } from '../src/converter/JavaToPseudocodeConverter';

describe('Control Flow Conversion', () => {
  let converter: JavaToPseudocodeConverter;

  beforeEach(() => {
    converter = new JavaToPseudocodeConverter();
  });

  describe('If-Then-Else Statements', () => {
    it('should convert simple if statement', () => {
      const javaCode = 'if (x > 0) { y = 1; }';
      const expected = 'IF x > 0 THEN\n   y ← 1\nENDIF';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert if-else statement', () => {
      const javaCode = 'if (x > 0) { y = 1; } else { y = 0; }';
      const expected = 'IF x > 0 THEN\n   y ← 1\nELSE\n   y ← 0\nENDIF';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert if-else if-else statement', () => {
      const javaCode = 'if (x > 0) { y = 1; } else if (x < 0) { y = -1; } else { y = 0; }';
      const expected = 'IF x > 0 THEN\n   y ← 1\nELSE IF x < 0 THEN\n   y ← -1\nELSE\n   y ← 0\nENDIF';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert nested if statements', () => {
      const javaCode = 'if (x > 0) { if (y > 0) { z = 1; } }';
      const expected = 'IF x > 0 THEN\n   IF y > 0 THEN\n      z ← 1\n   ENDIF\nENDIF';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });

  describe('Switch-Case Statements', () => {
    it('should convert simple switch statement', () => {
      const javaCode = `
        switch (grade) {
          case 'A':
            points = 4;
            break;
          case 'B':
            points = 3;
            break;
          default:
            points = 0;
        }
      `;
      const expected = 'CASE OF grade\n   "A": points ← 4\n   "B": points ← 3\n   OTHERWISE: points ← 0\nENDCASE';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert switch with multiple cases', () => {
      const javaCode = `
        switch (day) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            type = "weekday";
            break;
          case 6:
          case 7:
            type = "weekend";
            break;
        }
      `;
      const expected = 'CASE OF day\n   1, 2, 3, 4, 5: type ← "weekday"\n   6, 7: type ← "weekend"\nENDCASE';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });

  describe('For Loops', () => {
    it('should convert simple for loop', () => {
      const javaCode = 'for (int i = 0; i < 10; i++) { sum += i; }';
      const expected = 'FOR i ← 0 TO 9\n   sum ← sum + i\nENDFOR';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert for loop with step', () => {
      const javaCode = 'for (int i = 0; i < 20; i += 2) { sum += i; }';
      const expected = 'FOR i ← 0 TO 19 STEP 2\n   sum ← sum + i\nENDFOR';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert for loop with negative step', () => {
      const javaCode = 'for (int i = 10; i > 0; i--) { sum += i; }';
      const expected = 'FOR i ← 10 TO 1 STEP -1\n   sum ← sum + i\nENDFOR';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert enhanced for loop (for-each)', () => {
      const javaCode = 'for (int item : array) { sum += item; }';
      const expected = 'FOR EACH item IN array\n   sum ← sum + item\nENDFOR';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });

  describe('While Loops', () => {
    it('should convert simple while loop', () => {
      const javaCode = 'while (i < 10) { i++; }';
      const expected = 'WHILE i < 10\n   i ← i + 1\nENDWHILE';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert while loop with complex condition', () => {
      const javaCode = 'while (i < 10 && found == false) { i++; }';
      const expected = 'WHILE i < 10 AND found = FALSE\n   i ← i + 1\nENDWHILE';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert nested while loops', () => {
      const javaCode = 'while (i < 10) { while (j < 5) { j++; } i++; }';
      const expected = 'WHILE i < 10\n   WHILE j < 5\n      j ← j + 1\n   ENDWHILE\n   i ← i + 1\nENDWHILE';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });

  describe('Do-While Loops (Repeat-Until)', () => {
    it('should convert simple do-while loop', () => {
      const javaCode = 'do { i++; } while (i < 10);';
      const expected = 'REPEAT\n   i ← i + 1\nUNTIL i ≥ 10';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert do-while with complex condition', () => {
      const javaCode = 'do { sum += i; i++; } while (i < 10 && sum < 100);';
      const expected = 'REPEAT\n   sum ← sum + i\n   i ← i + 1\nUNTIL i ≥ 10 OR sum ≥ 100';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });

  describe('Break and Continue', () => {
    it('should convert break statement in loop', () => {
      const javaCode = 'for (int i = 0; i < 10; i++) { if (i == 5) break; sum += i; }';
      const expected = 'FOR i ← 0 TO 9\n   IF i = 5 THEN\n      EXIT FOR\n   ENDIF\n   sum ← sum + i\nENDFOR';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert continue statement in loop', () => {
      const javaCode = 'for (int i = 0; i < 10; i++) { if (i % 2 == 0) continue; sum += i; }';
      const expected = 'FOR i ← 0 TO 9\n   IF i MOD 2 = 0 THEN\n      NEXT FOR\n   ENDIF\n   sum ← sum + i\nENDFOR';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });

  describe('Complex Control Flow', () => {
    it('should convert nested control structures', () => {
      const javaCode = `
        for (int i = 0; i < 10; i++) {
          if (i % 2 == 0) {
            while (j < i) {
              j++;
            }
          } else {
            sum += i;
          }
        }
      `;
      const expected = 'FOR i ← 0 TO 9\n   IF i MOD 2 = 0 THEN\n      WHILE j < i\n         j ← j + 1\n      ENDWHILE\n   ELSE\n      sum ← sum + i\n   ENDIF\nENDFOR';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });

    it('should convert switch inside loop', () => {
      const javaCode = `
        for (int i = 0; i < 5; i++) {
          switch (i) {
            case 0:
              result = "zero";
              break;
            case 1:
              result = "one";
              break;
            default:
              result = "other";
          }
        }
      `;
      const expected = 'FOR i ← 0 TO 4\n   CASE OF i\n      0: result ← "zero"\n      1: result ← "one"\n      OTHERWISE: result ← "other"\n   ENDCASE\nENDFOR';
      const result = converter.convert(javaCode);
      expect(result.trim()).toBe(expected);
    });
  });
});