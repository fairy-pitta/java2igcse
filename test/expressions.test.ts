import { describe, it, expect } from 'vitest';
import { JavaParser } from '../src/parser/JavaParser';
import { JavaToPseudocodeConverter } from '../src/converter/JavaToPseudocodeConverter';

describe('Expression Conversion Tests', () => {
    const converter = new JavaToPseudocodeConverter();

    describe('Arithmetic Expression Tests', () => {
        it('Should correctly convert basic arithmetic expression', () => {
            const java = 'int result = 10 + 20 * 30;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE result : INTEGER\nresult ← 10 + 20 * 30');
        });

        it('Should correctly convert compound arithmetic expression', () => {
            const java = 'double result = (a + b) * (c - d) / e;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE result : REAL\nresult ← (a + b) * (c - d) / e');
        });

        it('Should correctly convert modulo operation', () => {
            const java = 'int remainder = total % divisor;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE remainder : INTEGER\nremainder ← total MOD divisor');
        });

        it('Should correctly convert increment and decrement operations', () => {
            const java = 'count++; total--;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('count ← count + 1\ntotal ← total - 1');
        });
    });

    describe('Logical Expression Tests', () => {
        it('Should correctly convert basic logical expression', () => {
            const java = 'boolean result = x > 0 && y < 100;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE result : BOOLEAN\nresult ← x > 0 AND y < 100');
        });

        it('Should correctly convert compound logical expression', () => {
            const java = 'boolean valid = (age >= 18 && hasLicense) || isSpecialCase;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE valid : BOOLEAN\nvalid ← (age >= 18 AND hasLicense) OR isSpecialCase');
        });

        it('Should correctly convert expressions with negation', () => {
            const java = 'boolean result = !(a == b) && !isFinished;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE result : BOOLEAN\nresult ← NOT(a = b) AND NOT isFinished');
        });

        it('Should correctly convert equality and inequality operators', () => {
            const java = 'boolean result = (x != y) && (a == b);';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE result : BOOLEAN\nresult ← (x <> y) AND (a = b)');
        });
    });

    describe('Operator Precedence Tests', () => {
        it('Should correctly handle arithmetic operator precedence', () => {
            const java = 'int result = (a + b) * c - (d / e);';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE result : INTEGER\nresult ← (a + b) * c - (d / e)');
        });

        it('Should correctly handle logical operator precedence', () => {
            const java = 'boolean result = (x > y || y > z) && (a == b);';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE result : BOOLEAN\nresult ← (x > y OR y > z) AND (a = b)');
        });

        it('Should correctly handle complex expression precedence', () => {
            const java = 'boolean valid = ((a + b) * c > (d - e) / f) && !(x || y);';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE valid : BOOLEAN\nvalid ← ((a + b) * c > (d - e) / f) AND NOT(x OR y)');
        });

        it('Should correctly handle mixed arithmetic and logical operators', () => {
            const java = 'boolean result = (x + y > z * w) && (a / b <= c - d);';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE result : BOOLEAN\nresult ← (x + y > z * w) AND (a / b <= c - d)');
        });
    });

    describe('String Expression Tests', () => {
        it('Should correctly convert string concatenation', () => {
            const java = 'String message = "Hello, " + name + "!";';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE message : STRING\nmessage ← "Hello, " & name & "!"');
        });

        it('Should correctly convert string and number concatenation', () => {
            const java = 'String result = "Score: " + score + " points";';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE result : STRING\nresult ← "Score: " & score & " points"');
        });

        it('Should correctly convert string concatenation with multiple types', () => {
            const java = 'String info = name + " is " + age + " years old and has score " + score;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE info : STRING\ninfo ← name & " is " & age & " years old and has score " & score');
        });

        it('Should correctly handle empty string concatenation', () => {
            const java = 'String padded = "" + value + "";';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE padded : STRING\npadded ← "" & value & ""');
        });
    });
});