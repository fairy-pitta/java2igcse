// Test for complex parsing scenarios and error recovery
import { Java2IGCSEConverterImpl } from '../src/index';

describe('Complex Parsing Scenarios', () => {
  let converter: Java2IGCSEConverterImpl;

  beforeEach(() => {
    converter = new Java2IGCSEConverterImpl();
  });

  describe('Error Recovery', () => {
    test('handles malformed Java code with missing braces', () => {
      const javaCode = `
        public class Test {
          public void method() {
            int x = 5;
            // Missing closing brace
      `;

      const result = converter.convertJava(javaCode);

      // Should not fail completely, but produce partial result
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.pseudocode).toContain('PROCEDURE method()');
    });

    test('handles complex nested structures', () => {
      const javaCode = `
        public class DeepNesting {
          public static void processData(int[][][] data) {
            for (int i = 0; i < data.length; i++) {
              for (int j = 0; j < data[i].length; j++) {
                for (int k = 0; k < data[i][j].length; k++) {
                  if (data[i][j][k] > 0) {
                    if (data[i][j][k] % 2 == 0) {
                      if (data[i][j][k] > 100) {
                        System.out.println("Large even positive: " + data[i][j][k]);
                      } else {
                        System.out.println("Small even positive: " + data[i][j][k]);
                      }
                    } else {
                      if (data[i][j][k] > 100) {
                        System.out.println("Large odd positive: " + data[i][j][k]);
                      } else {
                        System.out.println("Small odd positive: " + data[i][j][k]);
                      }
                    }
                  } else if (data[i][j][k] < 0) {
                    while (data[i][j][k] < -10) {
                      System.out.println("Reducing negative value: " + data[i][j][k]);
                      data[i][j][k]++;
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const result = converter.convertJava(javaCode);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('FOR i');
      expect(result.pseudocode).toContain('FOR j');
      expect(result.pseudocode).toContain('FOR k');
      expect(result.pseudocode).toContain('NEXT k');
      expect(result.pseudocode).toContain('NEXT j');
      expect(result.pseudocode).toContain('NEXT i');
    });

    test('handles TypeScript with complex generics', () => {
      const tsCode = `
        interface Repository<T> {
          save(item: T): void;
          findById(id: number): T | undefined;
          findAll(): T[];
        }

        class InMemoryRepository<T extends { id: number }> implements Repository<T> {
          private items: T[] = [];

          save(item: T): void {
            const existingIndex = this.items.findIndex(i => i.id === item.id);
            if (existingIndex >= 0) {
              this.items[existingIndex] = item;
            } else {
              this.items.push(item);
            }
          }

          findById(id: number): T | undefined {
            return this.items.find(item => item.id === id);
          }

          findAll(): T[] {
            return [...this.items];
          }
        }

        type UserRole = 'admin' | 'user' | 'guest';

        interface ExtendedUser {
          id: number;
          name: string;
          role: UserRole;
          permissions: string[];
        }

        const userRepo = new InMemoryRepository<ExtendedUser>();
        userRepo.save({
          id: 1,
          name: "Admin User",
          role: "admin",
          permissions: ["read", "write", "delete"]
        });
      `;

      const result = converter.convertTypeScript(tsCode);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('// Generic interface: Repository<T>');
      expect(result.pseudocode).toContain('// Generic class: InMemoryRepository<T extends { id: number }>');
    });

    test('handles async/await patterns', () => {
      const tsCode = `
        async function fetchUserData(userId: number): Promise<User> {
          try {
            const response = await fetch(\`/api/users/\${userId}\`);
            const userData = await response.json();
            return userData;
          } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
          }
        }

        async function processUsers(userIds: number[]): Promise<void> {
          for (const id of userIds) {
            try {
              const user = await fetchUserData(id);
              console.log(\`Processing user: \${user.name}\`);
            } catch (error) {
              console.log(\`Failed to process user \${id}\`);
            }
          }
        }

        const userIds = [1, 2, 3, 4, 5];
        processUsers(userIds).catch(error => {
          console.error('Processing failed:', error);
        });
      `;

      const result = converter.convertTypeScript(tsCode);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('// Async function - handles asynchronous operations');
      expect(result.pseudocode).toContain('FUNCTION fetchUserData');
      expect(result.pseudocode).toContain('PROCEDURE processUsers');
    });

    test('handles multi-dimensional arrays', () => {
      const javaCode = `
        public class ArrayTest {
          public static void main(String[] args) {
            int[] oneDArray = new int[10];
            int[][] twoDArray = new int[5][3];
            int[][][] threeDArray = new int[2][3][4];
            String[] names = {"Alice", "Bob", "Charlie"};
            
            // Initialize arrays
            for (int i = 0; i < oneDArray.length; i++) {
              oneDArray[i] = i * 2;
            }
            
            for (int i = 0; i < twoDArray.length; i++) {
              for (int j = 0; j < twoDArray[i].length; j++) {
                twoDArray[i][j] = i + j;
              }
            }
            
            // Print arrays
            for (int value : oneDArray) {
              System.out.println(value);
            }
          }
        }
      `;

      const result = converter.convertJava(javaCode);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('DECLARE oneDArray : ARRAY[1:10] OF INTEGER');
      expect(result.pseudocode).toContain('DECLARE twoDArray : ARRAY[1:5, 1:3] OF INTEGER');
      expect(result.pseudocode).toContain('DECLARE threeDArray : ARRAY[1:2, 1:3, 1:4] OF INTEGER');
    });

    test('handles constructor vs method distinction', () => {
      const javaCode = `
        public class Calculator {
          private int result;
          
          public Calculator() {
            this.result = 0;
          }
          
          public Calculator(int initialValue) {
            this.result = initialValue;
          }
          
          public void add(int value) {
            this.result += value;
          }
          
          public int getResult() {
            return this.result;
          }
        }
      `;

      const result = converter.convertJava(javaCode);

      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('PROCEDURE Calculator()');
      expect(result.pseudocode).toContain('PROCEDURE Calculator(initialValue : INTEGER)');
      expect(result.pseudocode).toContain('PROCEDURE add(value : INTEGER)');
      expect(result.pseudocode).toContain('FUNCTION getResult() RETURNS INTEGER');
    });
  });

  describe('Warning Generation', () => {
    test('generates appropriate warnings for complex structures', () => {
      const javaCode = `
        public class ComplexClass {
          public static void deeplyNestedMethod() {
            for (int i = 0; i < 10; i++) {
              for (int j = 0; j < 10; j++) {
                for (int k = 0; k < 10; k++) {
                  for (int l = 0; l < 10; l++) {
                    System.out.println("Deep nesting");
                  }
                }
              }
            }
          }
        }
      `;

      const result = converter.convertJava(javaCode);

      expect(result.success).toBe(true);
      expect(result.warnings.some(w => w.code === 'DEEP_NESTING')).toBe(true);
    });

    test('generates warnings for unsupported features', () => {
      const javaCode = `
        import java.util.*;
        
        public class UnsupportedFeatures {
          public void methodWithTryCatch() {
            try {
              int x = 10 / 0;
            } catch (ArithmeticException e) {
              System.out.println("Error: " + e.getMessage());
            }
          }
        }
      `;

      const result = converter.convertJava(javaCode);

      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.message.includes('import'))).toBe(true);
      expect(result.warnings.some(w => w.message.includes('try-catch'))).toBe(true);
    });
  });
});