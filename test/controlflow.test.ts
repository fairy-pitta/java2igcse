import { describe, it, expect } from 'vitest';
import { JavaToPseudocodeConverter } from '../src/converter/JavaToPseudocodeConverter';

describe('Control Flow Conversion Tests', () => {
    const converter = new JavaToPseudocodeConverter();

    describe('Conditional Statement Tests', () => {
        it('Should correctly convert simple IF statement', () => {
            const java = `
                public class Test {
                    public void test() {
                        if (score >= 60) {
                            System.out.println("Pass");
                        }
                    }
                }`;
            const result = converter.convert(java);
            expect(result.code).toBe('IF score >= 60 THEN\n   OUTPUT "Pass"\nENDIF');
        });

        it('Should correctly convert IF-ELSE statement', () => {
            const java = `
                public class Test {
                    public void test() {
                        if (age >= 18) {
                            System.out.println("Adult");
                        } else {
                            System.out.println("Minor");
                        }
                    }
                }`;
            const result = converter.convert(java);
            expect(result.code).toBe('IF age >= 18 THEN\n   OUTPUT "Adult"\nELSE\n   OUTPUT "Minor"\nENDIF');
        });

        it('Should correctly convert nested IF statements', () => {
            const java = `
                public class Test {
                    public void test() {
                        if (score >= 90) {
                            if (attendance >= 80) {
                                System.out.println("Excellent");
                            }
                        }
                    }
                }`;
            const result = converter.convert(java);
            expect(result.code).toBe('IF score >= 90 THEN\n   IF attendance >= 80 THEN\n      OUTPUT "Excellent"\n   ENDIF\nENDIF');
        });

        it('Should correctly convert CASE statement', () => {
            const java = `
                public class Test {
                    public void test() {
                        switch (grade) {
                            case "A":
                                System.out.println("Excellent");
                                break;
                            case "B":
                                System.out.println("Good");
                                break;
                            default:
                                System.out.println("Fair");
                        }
                    }
                }`;
            const result = converter.convert(java);
            expect(result.code).toBe('CASE OF grade\n   "A": OUTPUT "Excellent"\n   "B": OUTPUT "Good"\n   OTHERWISE: OUTPUT "Fair"\nENDCASE');
        });
    });

    describe('Loop Structure Tests', () => {
        it('Should correctly convert FOR loop', () => {
            const java = `
                public class Test {
                    public void test() {
                        for (int i = 0; i < 5; i++) {
                            System.out.println(i);
                        }
                    }
                }`;
            const result = converter.convert(java);
            expect(result.code).toBe('FOR i ← 0 TO 4\n   OUTPUT i\nNEXT i');
        });

        it('Should correctly convert WHILE loop', () => {
            const java = `
                public class Test {
                    public void test() {
                        while (count > 0) {
                            System.out.println(count);
                            count--;
                        }
                    }
                }`;
            const result = converter.convert(java);
            expect(result.code).toBe('WHILE count > 0 DO\n   OUTPUT count\n   count ← count - 1\nENDWHILE');
        });

        it('Should correctly convert REPEAT-UNTIL loop', () => {
            const java = `
                public class Test {
                    public void test() {
                        do {
                            System.out.println("Attempt");
                            attempts++;
                        } while (attempts < maxAttempts);
                    }
                }`;
            const result = converter.convert(java);
            expect(result.code).toBe('REPEAT\n   OUTPUT "Attempt"\n   attempts ← attempts + 1\nUNTIL attempts >= maxAttempts');
        });

        it('Should correctly convert nested loops', () => {
            const java = `
                public class Test {
                    public void test() {
                        for (int i = 0; i < 3; i++) {
                            for (int j = 0; j < 3; j++) {
                                System.out.println(i + "," + j);
                            }
                        }
                    }
                }`;
            const result = converter.convert(java);
            expect(result.code).toBe('FOR i ← 0 TO 2\n   FOR j ← 0 TO 2\n      OUTPUT i, ",", j\n   NEXT j\nNEXT i');
        });
    });
});