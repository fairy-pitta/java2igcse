import { describe, it, expect } from 'vitest';
import { JavaParser } from '../src/parser/JavaParser';
import { JavaToPseudocodeConverter } from '../src/converter/JavaToPseudocodeConverter';

describe('Basic Syntax Conversion Tests', () => {
    const converter = new JavaToPseudocodeConverter();

    describe('Variable Declaration Tests', () => {
        it('Should correctly convert integer variable declaration', () => {
            const java = 'int number = 42;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE number : INTEGER\nnumber ← 42');
        });

        it('Should correctly convert string variable declaration', () => {
            const java = 'String text = "Hello";';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE text : STRING\ntext ← "Hello"');
        });

        it('Should correctly convert boolean variable declaration', () => {
            const java = 'boolean flag = true;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE flag : BOOLEAN\nflag ← TRUE');
        });

        it('Should correctly convert real number variable declaration', () => {
            const java = 'double pi = 3.14;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE pi : REAL\npi ← 3.14');
        });
    });

    describe('Array Declaration Tests', () => {
        it('Should correctly convert one-dimensional array declaration', () => {
            const java = 'int[] numbers = new int[5];';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE numbers : ARRAY[1:5] OF INTEGER');
        });

        it('Should correctly convert two-dimensional array declaration', () => {
            const java = 'int[][] matrix = new int[3][4];';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE matrix : ARRAY[1:3, 1:4] OF INTEGER');
        });

        it('Should correctly convert array initialization', () => {
            const java = 'int[] scores = {90, 85, 95};';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE scores : ARRAY[1:3] OF INTEGER\nscores[1] ← 90\nscores[2] ← 85\nscores[3] ← 95');
        });
    });

    describe('Operator Tests', () => {
        it('Should correctly convert arithmetic operators', () => {
            const java = 'int result = a + b * c - d / e;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE result : INTEGER\nresult ← a + b * c - d / e');
        });

        it('Should correctly convert comparison operators', () => {
            const java = 'boolean result = x >= y && z < w;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE result : BOOLEAN\nresult ← x >= y AND z < w');
        });

        it('Should correctly convert logical operators', () => {
            const java = 'boolean result = !flag1 || (flag2 && flag3);';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE result : BOOLEAN\nresult ← NOT flag1 OR (flag2 AND flag3)');
        });
    });

    describe('Input/Output Tests', () => {
        it('Should correctly convert standard output', () => {
            const java = 'System.out.println("Hello, World!");';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('OUTPUT "Hello, World!"');
        });

        it('Should correctly convert standard input', () => {
            const java = 'Scanner scanner = new Scanner(System.in); int input = scanner.nextInt();';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('DECLARE input : INTEGER\nINPUT input');
        });

        it('Should correctly convert formatted output', () => {
            const java = 'System.out.printf("Score: %d", score);';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('OUTPUT "Score: ", score');
        });
    });
});