// Test for Java constructor conversion to IGCSE procedures
import { Java2IGCSEConverterImpl } from '../src/index';

describe('Java Constructor Conversion', () => {
  let converter: Java2IGCSEConverterImpl;

  beforeEach(() => {
    converter = new Java2IGCSEConverterImpl();
  });

  test('converts simple constructor to PROCEDURE', () => {
    const javaCode = `
      public class Test {
        public Test() {
          int x = 5;
        }
      }
    `;

    const result = converter.convertJava(javaCode);

    expect(result.success).toBe(true);
    expect(result.pseudocode).toContain('PROCEDURE Test()');
    expect(result.pseudocode).toContain('ENDPROCEDURE');
    expect(result.pseudocode).not.toContain('CALL');
  });

  test('converts constructor with parameters to PROCEDURE', () => {
    const javaCode = `
      public class Calculator {
        private int value;
        
        public Calculator(int initialValue) {
          value = initialValue;
        }
      }
    `;

    const result = converter.convertJava(javaCode);

    expect(result.success).toBe(true);
    expect(result.pseudocode).toContain('PROCEDURE Calculator(initialValue : INTEGER)');
    expect(result.pseudocode).toContain('ENDPROCEDURE');
    expect(result.pseudocode).toContain('value ← initialValue');
  });

  test('converts constructor with this.field assignment', () => {
    const javaCode = `
      public class Calculator {
        private int result;
        
        public Calculator() {
          this.result = 0;
        }
      }
    `;

    const result = converter.convertJava(javaCode);

    expect(result.success).toBe(true);
    expect(result.pseudocode).toContain('PROCEDURE Calculator()');
    expect(result.pseudocode).toContain('this.result ← 0');
    expect(result.pseudocode).toContain('ENDPROCEDURE');
  });

  test('distinguishes constructor from regular method', () => {
    const javaCode = `
      public class Test {
        public Test() {
          // Constructor
        }
        
        public void testMethod() {
          // Regular method
        }
        
        public int getValue() {
          return 42;
        }
      }
    `;

    const result = converter.convertJava(javaCode);

    expect(result.success).toBe(true);
    expect(result.pseudocode).toContain('PROCEDURE Test()');
    expect(result.pseudocode).toContain('PROCEDURE testMethod()');
    expect(result.pseudocode).toContain('FUNCTION getValue() RETURNS INTEGER');
    
    // Count ENDPROCEDURE and ENDFUNCTION
    const endProcedureCount = (result.pseudocode.match(/ENDPROCEDURE/g) || []).length;
    const endFunctionCount = (result.pseudocode.match(/ENDFUNCTION/g) || []).length;
    expect(endProcedureCount).toBe(2); // Constructor + testMethod
    expect(endFunctionCount).toBe(1);  // getValue
  });
});