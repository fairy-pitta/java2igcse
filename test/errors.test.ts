import { describe, it, expect } from 'vitest';
import { JavaToPseudocodeConverter } from '../src/converter/JavaToPseudocodeConverter';

describe('Basic Syntax Tests', () => {
    const converter = new JavaToPseudocodeConverter();

    describe('Variable Declaration Tests', () => {
        it('Should convert integer variable declaration', () => {
            const java = 'int x = 42;';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('x ← 42');
        });

        it('Should convert string variable declaration', () => {
            const java = 'String text = "Hello";';
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('text ← "Hello"');
        });
    });

    describe('Method Declaration Tests', () => {
        it('Should convert simple method', () => {
            const java = `
                void greet() {
                    System.out.println("Hello");
                }`;
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('PROCEDURE greet\n   OUTPUT "Hello"\nENDPROCEDURE');
        });
    });

    describe('Class Declaration Tests', () => {
        it('Should convert simple class', () => {
            const java = `
                class Person {
                    private String name;
                    
                    public void setName(String newName) {
                        name = newName;
                    }
                }`;
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('CLASS Person\n   PRIVATE name : STRING\n   \n   PUBLIC PROCEDURE setName(newName : STRING)\n      name ← newName\n   ENDPROCEDURE\nENDCLASS');
        });
    });
});