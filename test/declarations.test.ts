import { describe, it, expect } from 'vitest';
import { JavaParser } from '../src/parser/JavaParser';
import { JavaToPseudocodeConverter } from '../src/converter/JavaToPseudocodeConverter';

describe('Declaration Syntax Conversion Tests', () => {
    const converter = new JavaToPseudocodeConverter();

    describe('Method Declaration Tests', () => {
        it('Should correctly convert method declaration without parameters', () => {
            const java = `
                void displayMessage() {
                    System.out.println("Hello");
                }`;
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('PROCEDURE displayMessage\n   OUTPUT "Hello"\nENDPROCEDURE');
        });

        it('Should correctly convert method declaration with parameters', () => {
            const java = `
                int calculateSum(int a, int b) {
                    return a + b;
                }`;
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('FUNCTION calculateSum(a : INTEGER, b : INTEGER) RETURNS INTEGER\n   RETURN a + b\nENDFUNCTION');
        });

        it('Should correctly convert method declaration with multiple parameter types', () => {
            const java = `
                void processData(String name, int age, boolean isStudent) {
                    System.out.println(name + " is " + age);
                }`;
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('PROCEDURE processData(name : STRING, age : INTEGER, isStudent : BOOLEAN)\n   OUTPUT name, " is ", age\nENDPROCEDURE');
        });
    });

    describe('Class Declaration Tests', () => {
        it('Should correctly convert class declaration with fields', () => {
            const java = `
                class Student {
                    private String name;
                    private int age;
                }`;
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('CLASS Student\n   PRIVATE name : STRING\n   PRIVATE age : INTEGER\nENDCLASS');
        });

        it('Should correctly convert class declaration with methods', () => {
            const java = `
                class Calculator {
                    public int add(int x, int y) {
                        return x + y;
                    }
                }`;
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('CLASS Calculator\n   PUBLIC FUNCTION add(x : INTEGER, y : INTEGER) RETURNS INTEGER\n      RETURN x + y\n   ENDFUNCTION\nENDCLASS');
        });

        it('Should correctly convert class declaration with constructor', () => {
            const java = `
                class Person {
                    private String name;
                    public Person(String name) {
                        this.name = name;
                    }
                }`;
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('CLASS Person\n   PRIVATE name : STRING\n   PUBLIC PROCEDURE NEW(name : STRING)\n      this.name ← name\n   ENDPROCEDURE\nENDCLASS');
        });

        it('Should correctly convert class declaration with combined fields and methods', () => {
            const java = `
                class BankAccount {
                    private double balance;
                    
                    public void deposit(double amount) {
                        balance += amount;
                    }
                    
                    public double getBalance() {
                        return balance;
                    }
                }`;
            const pseudocode = converter.convert(java);
            expect(pseudocode).toBe('CLASS BankAccount\n   PRIVATE balance : REAL\n   \n   PUBLIC PROCEDURE deposit(amount : REAL)\n      balance ← balance + amount\n   ENDPROCEDURE\n   \n   PUBLIC FUNCTION getBalance() RETURNS REAL\n      RETURN balance\n   ENDFUNCTION\nENDCLASS');
        });
    });
});