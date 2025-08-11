// End-to-end integration tests for complete Java and TypeScript code conversion
// Tests complete code examples and verifies IGCSE standards compliance

import { Java2IGCSEConverterImpl, ConversionOptions } from '../src/index';

describe('End-to-End Integration Tests', () => {
  let converter: Java2IGCSEConverterImpl;

  beforeEach(() => {
    converter = new Java2IGCSEConverterImpl();
  });

  describe('Complete Java Code Examples', () => {
    test('converts complete Java calculator class', () => {
      const javaCode = `
        public class Calculator {
          private int result;
          
          public Calculator() {
            this.result = 0;
          }
          
          public int add(int a, int b) {
            result = a + b;
            return result;
          }
          
          public void printResult() {
            System.out.println("Result: " + result);
          }
          
          public static void main(String[] args) {
            Calculator calc = new Calculator();
            int sum = calc.add(5, 3);
            calc.printResult();
          }
        }
      `;

      const result = converter.convertJava(javaCode);

      expect(result.success).toBe(true);
      
      // Verify IGCSE standards compliance
      expect(result.pseudocode).toContain('// Calculator class');
      expect(result.pseudocode).toContain('DECLARE result : INTEGER');
      expect(result.pseudocode).toContain('PROCEDURE Calculator()');
      expect(result.pseudocode).toContain('ENDPROCEDURE');
      expect(result.pseudocode).toContain('FUNCTION add(a : INTEGER, b : INTEGER) RETURNS INTEGER');
      expect(result.pseudocode).toContain('ENDFUNCTION');
      expect(result.pseudocode).toContain('PROCEDURE printResult()');
      expect(result.pseudocode).toContain('OUTPUT "Result: ", result');
      expect(result.pseudocode).toContain('// Static method');
      expect(result.pseudocode).toContain('PROCEDURE main(args : ARRAY[1:SIZE] OF STRING)');
      
      // Verify proper indentation (3 spaces as per IGCSE standard)
      const lines = result.pseudocode.split('\n');
      const indentedLines = lines.filter(line => line.startsWith('   '));
      expect(indentedLines.length).toBeGreaterThan(0);
      
      // Verify no Java-specific syntax remains in non-comment lines
      const nonCommentLines = result.pseudocode.split('\n').filter(line => !line.trim().startsWith('//'));
      const nonCommentCode = nonCommentLines.join('\n');
      expect(nonCommentCode).not.toContain('public');
      expect(nonCommentCode).not.toContain('private');
      expect(nonCommentCode).not.toContain('class');
      expect(result.pseudocode).not.toContain('System.out.println');
      expect(result.pseudocode).not.toContain('new');
    });

    test('converts Java array processing example', () => {
      const javaCode = `
        public class ArrayProcessor {
          public static int findMax(int[] numbers) {
            int max = numbers[0];
            for (int i = 1; i < numbers.length; i++) {
              if (numbers[i] > max) {
                max = numbers[i];
              }
            }
            return max;
          }
          
          public static void printArray(int[] arr) {
            for (int i = 0; i < arr.length; i++) {
              System.out.print(arr[i]);
              if (i < arr.length - 1) {
                System.out.print(", ");
              }
            }
            System.out.println();
          }
          
          public static void main(String[] args) {
            int[] numbers = {5, 2, 8, 1, 9, 3};
            int maximum = findMax(numbers);
            System.out.println("Array: ");
            printArray(numbers);
            System.out.println("Maximum: " + maximum);
          }
        }
      `;

      const result = converter.convertJava(javaCode);

      expect(result.success).toBe(true);
      
      // Verify IGCSE array syntax
      expect(result.pseudocode).toContain('ARRAY[1:SIZE] OF INTEGER');
      expect(result.pseudocode).toContain('DECLARE max : INTEGER ← numbers[1]');
      expect(result.pseudocode).toContain('FOR i ← 2 TO LENGTH(numbers)');
      expect(result.pseudocode).toContain('IF numbers[i] > max THEN');
      expect(result.pseudocode).toContain('max ← numbers[i]');
      expect(result.pseudocode).toContain('ENDIF');
      expect(result.pseudocode).toContain('NEXT i');
      expect(result.pseudocode).toContain('RETURN max');
      
      // Verify static method handling
      expect(result.pseudocode).toContain('// Static method');
      expect(result.pseudocode).toContain('FUNCTION findMax(numbers : ARRAY[1:SIZE] OF INTEGER) RETURNS INTEGER');
      expect(result.pseudocode).toContain('PROCEDURE printArray(arr : ARRAY[1:SIZE] OF INTEGER)');
      
      // Verify proper OUTPUT statements
      expect(result.pseudocode).toContain('OUTPUT arr[i]');
      expect(result.pseudocode).toContain('OUTPUT "Array: "');
      expect(result.pseudocode).toContain('OUTPUT "Maximum: ", maximum');
    });

    test('converts complex nested control structures in Java', () => {
      const javaCode = `
        public class NestedExample {
          public static void processMatrix(int[][] matrix) {
            for (int i = 0; i < matrix.length; i++) {
              for (int j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] > 0) {
                  if (matrix[i][j] % 2 == 0) {
                    System.out.println("Even positive: " + matrix[i][j]);
                  } else {
                    System.out.println("Odd positive: " + matrix[i][j]);
                  }
                } else if (matrix[i][j] < 0) {
                  System.out.println("Negative: " + matrix[i][j]);
                } else {
                  System.out.println("Zero found at [" + i + "][" + j + "]");
                }
              }
            }
          }
          
          public static void bubbleSort(int[] arr) {
            int n = arr.length;
            for (int i = 0; i < n - 1; i++) {
              for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                  int temp = arr[j];
                  arr[j] = arr[j + 1];
                  arr[j + 1] = temp;
                }
              }
            }
          }
        }
      `;

      const result = converter.convertJava(javaCode);

      expect(result.success).toBe(true);
      
      // Verify nested loop structure
      expect(result.pseudocode).toContain('FOR i ← 0 TO LENGTH(matrix) - 1');
      expect(result.pseudocode).toContain('FOR j ← 0 TO LENGTH(matrix[i]) - 1');
      expect(result.pseudocode).toContain('NEXT j');
      expect(result.pseudocode).toContain('NEXT i');
      
      // Verify nested if-else structure
      expect(result.pseudocode).toContain('IF matrix[i][j] > 0 THEN');
      expect(result.pseudocode).toContain('IF matrix[i][j] MOD 2 = 0 THEN');
      expect(result.pseudocode).toContain('ELSE IF matrix[i][j] < 0 THEN');
      expect(result.pseudocode).toContain('ELSE');
      expect(result.pseudocode).toContain('ENDIF');
      
      // Verify proper indentation for nested structures
      const lines = result.pseudocode.split('\n');
      const deeplyIndentedLines = lines.filter(line => line.startsWith('         ')); // 9+ spaces
      expect(deeplyIndentedLines.length).toBeGreaterThan(0);
      
      // Verify 2D array handling
      expect(result.pseudocode).toContain('ARRAY[1:ROWS, 1:COLS] OF INTEGER');
      expect(result.pseudocode).toContain('matrix[i][j]');
    });
  });

  describe('Complete TypeScript Code Examples', () => {
    test('converts complete TypeScript class with ES6+ features', () => {
      const tsCode = `
        interface User {
          id: number;
          name: string;
          email: string;
        }
        
        class UserManager {
          private users: User[] = [];
          
          constructor() {
            this.users = [];
          }
          
          addUser(user: User): void {
            this.users.push(user);
            console.log(\`User \${user.name} added successfully\`);
          }
          
          findUser(id: number): User | null {
            return this.users.find(user => user.id === id) || null;
          }
          
          getUserNames(): string[] {
            return this.users.map(user => user.name);
          }
          
          printAllUsers(): void {
            this.users.forEach((user, index) => {
              console.log(\`\${index + 1}. \${user.name} (\${user.email})\`);
            });
          }
        }
        
        const manager = new UserManager();
        manager.addUser({ id: 1, name: "John", email: "john@example.com" });
        manager.addUser({ id: 2, name: "Jane", email: "jane@example.com" });
        manager.printAllUsers();
      `;

      const result = converter.convertTypeScript(tsCode);

      expect(result.success).toBe(true);
      
      // Verify interface handling
      expect(result.pseudocode).toContain('// Interface: User');
      expect(result.pseudocode).toContain('// Properties: id (REAL), name (STRING), email (STRING)');
      
      // Verify class conversion
      expect(result.pseudocode).toContain('// UserManager class');
      expect(result.pseudocode).toContain('DECLARE users : ARRAY[1:SIZE] OF User');
      
      // Verify method conversions
      expect(result.pseudocode).toContain('PROCEDURE addUser(user : User)');
      expect(result.pseudocode).toContain('FUNCTION findUser(id : REAL) RETURNS User');
      expect(result.pseudocode).toContain('FUNCTION getUserNames() RETURNS ARRAY[1:SIZE] OF STRING');
      expect(result.pseudocode).toContain('PROCEDURE printAllUsers()');
      
      // Verify ES6+ feature handling
      expect(result.pseudocode).toContain('OUTPUT "User ", user.name, " added successfully"');
      expect(result.pseudocode).not.toContain('${'); // Template literals converted
      expect(result.pseudocode).not.toContain('`'); // Template literals converted
      
      // Verify arrow function conversion
      expect(result.pseudocode).toContain('// Arrow function converted to procedure');
      
      // Verify array method handling
      expect(result.pseudocode).toContain('// Array.find() equivalent');
      expect(result.pseudocode).toContain('// Array.map() equivalent');
      expect(result.pseudocode).toContain('// Array.forEach() equivalent');
    });

    test('converts TypeScript async/await and Promise handling', () => {
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
        processUsers(userIds).then(() => {
          console.log('All users processed');
        }).catch(error => {
          console.error('Processing failed:', error);
        });
      `;

      const result = converter.convertTypeScript(tsCode);

      expect(result.success).toBe(true);
      
      // Verify async/await conversion
      expect(result.pseudocode).toContain('// Async function - handles asynchronous operations');
      expect(result.pseudocode).toContain('FUNCTION fetchUserData(userId : REAL) RETURNS User');
      expect(result.pseudocode).toContain('PROCEDURE processUsers(userIds : ARRAY[1:SIZE] OF REAL)');
      
      // Verify try-catch conversion
      expect(result.pseudocode).toContain('// TRY block - attempt operation');
      expect(result.pseudocode).toContain('// CATCH block - handle errors');
      expect(result.pseudocode).toContain('// Error handling for fetch operation');
      
      // Verify Promise handling
      expect(result.pseudocode).toContain('// Promise.then() equivalent');
      expect(result.pseudocode).toContain('// Promise.catch() equivalent');
      
      // Verify for-of loop conversion
      expect(result.pseudocode).toContain('FOR id IN userIds');
      expect(result.pseudocode).toContain('NEXT id');
      
      // Verify template literal conversion
      expect(result.pseudocode).toContain('OUTPUT "Processing user: ", user.name');
      expect(result.pseudocode).toContain('OUTPUT "Failed to process user ", id');
    });

    test('converts TypeScript generics and advanced types', () => {
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
      
      // Verify generic type handling
      expect(result.pseudocode).toContain('// Generic interface: Repository<T>');
      expect(result.pseudocode).toContain('// Generic class: InMemoryRepository<T extends { id: number }>');
      expect(result.pseudocode).toContain('// Type parameter T represents any type with id property');
      
      // Verify interface implementation
      expect(result.pseudocode).toContain('// InMemoryRepository implements Repository');
      expect(result.pseudocode).toContain('DECLARE items : ARRAY[1:SIZE] OF T');
      
      // Verify method signatures without generics
      expect(result.pseudocode).toContain('PROCEDURE save(item : T)');
      expect(result.pseudocode).toContain('FUNCTION findById(id : REAL) RETURNS T');
      expect(result.pseudocode).toContain('FUNCTION findAll() RETURNS ARRAY[1:SIZE] OF T');
      
      // Verify union type handling
      expect(result.pseudocode).toContain('// Type alias: UserRole = "admin" | "user" | "guest"');
      expect(result.pseudocode).toContain('// Union type converted to STRING with constraints');
      
      // Verify spread operator handling
      expect(result.pseudocode).toContain('// Spread operator - creates copy of array');
      expect(result.pseudocode).toContain('RETURN COPY(items)');
    });
  });

  describe('IGCSE Standards Compliance Verification', () => {
    test('verifies all IGCSE keywords are used correctly', () => {
      const javaCode = `
        public class StandardsTest {
          public static void testAllConstructs() {
            // Variable declarations
            int count = 0;
            String message = "Hello";
            boolean flag = true;
            int[] numbers = {1, 2, 3, 4, 5};
            
            // If-else if-else
            if (count > 0) {
              System.out.println("Positive");
            } else if (count < 0) {
              System.out.println("Negative");
            } else {
              System.out.println("Zero");
            }
            
            // While loop
            while (count < 10) {
              count++;
            }
            
            // For loop
            for (int i = 0; i < numbers.length; i++) {
              System.out.println(numbers[i]);
            }
            
            // Switch statement
            switch (count) {
              case 1:
                System.out.println("One");
                break;
              case 2:
                System.out.println("Two");
                break;
              default:
                System.out.println("Other");
            }
          }
          
          public static int calculate(int a, int b) {
            return a + b;
          }
          
          public static void display(String text) {
            System.out.println(text);
          }
        }
      `;

      const result = converter.convertJava(javaCode);

      expect(result.success).toBe(true);
      
      // Verify all required IGCSE keywords are present
      const requiredKeywords = [
        'DECLARE', 'INTEGER', 'STRING', 'BOOLEAN', 'ARRAY',
        'IF', 'THEN', 'ELSE', 'ENDIF',
        'WHILE', 'DO', 'ENDWHILE',
        'FOR', 'TO', 'NEXT',
        'CASE', 'OF', 'OTHERWISE', 'ENDCASE',
        'PROCEDURE', 'ENDPROCEDURE',
        'FUNCTION', 'RETURNS', 'ENDFUNCTION',
        'OUTPUT', 'MOD'
      ];
      
      requiredKeywords.forEach(keyword => {
        expect(result.pseudocode).toContain(keyword);
      });
      
      // Verify IGCSE operators are used
      expect(result.pseudocode).toContain('←'); // Assignment
      expect(result.pseudocode).toContain('='); // Equality (not ==)
      expect(result.pseudocode).not.toContain('=='); // Java equality should be converted
      expect(result.pseudocode).not.toContain('!='); // Java inequality should be converted to <>
      
      // Verify proper indentation (3 spaces)
      const lines = result.pseudocode.split('\n');
      const indentedLines = lines.filter(line => line.match(/^   [^ ]/)); // Exactly 3 spaces
      expect(indentedLines.length).toBeGreaterThan(0);
    });

    test('verifies proper IGCSE array syntax', () => {
      const javaCode = `
        public class ArrayTest {
          public static void main(String[] args) {
            int[] oneDArray = new int[10];
            int[][] twoDArray = new int[5][3];
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
      
      // Verify IGCSE array declaration syntax
      expect(result.pseudocode).toContain('DECLARE oneDArray : ARRAY[1:10] OF INTEGER');
      expect(result.pseudocode).toContain('DECLARE twoDArray : ARRAY[1:5, 1:3] OF INTEGER');
      expect(result.pseudocode).toContain('DECLARE names : ARRAY[1:3] OF STRING');
      
      // Verify array initialization
      expect(result.pseudocode).toContain('names[1] ← "Alice"');
      expect(result.pseudocode).toContain('names[2] ← "Bob"');
      expect(result.pseudocode).toContain('names[3] ← "Charlie"');
      
      // Verify array access with 1-based indexing
      expect(result.pseudocode).toContain('oneDArray[i] ← (i - 1) * 2'); // Adjusted for 1-based indexing
      expect(result.pseudocode).toContain('twoDArray[i][j] ← (i - 1) + (j - 1)');
      
      // Verify enhanced for loop conversion
      expect(result.pseudocode).toContain('FOR value IN oneDArray');
      expect(result.pseudocode).toContain('OUTPUT value');
      expect(result.pseudocode).toContain('NEXT value');
    });

    test('verifies proper function vs procedure distinction', () => {
      const javaCode = `
        public class FunctionTest {
          // Functions (return values)
          public static int add(int a, int b) {
            return a + b;
          }
          
          public static String concatenate(String s1, String s2) {
            return s1 + s2;
          }
          
          public static boolean isEven(int number) {
            return number % 2 == 0;
          }
          
          // Procedures (no return values)
          public static void printMessage(String message) {
            System.out.println(message);
          }
          
          public static void incrementArray(int[] arr) {
            for (int i = 0; i < arr.length; i++) {
              arr[i]++;
            }
          }
          
          public static void main(String[] args) {
            int sum = add(5, 3);
            String result = concatenate("Hello", " World");
            boolean even = isEven(4);
            
            printMessage(result);
            
            int[] numbers = {1, 2, 3};
            incrementArray(numbers);
          }
        }
      `;

      const result = converter.convertJava(javaCode);

      expect(result.success).toBe(true);
      
      // Verify functions (with return values)
      expect(result.pseudocode).toContain('FUNCTION add(a : INTEGER, b : INTEGER) RETURNS INTEGER');
      expect(result.pseudocode).toContain('FUNCTION concatenate(s1 : STRING, s2 : STRING) RETURNS STRING');
      expect(result.pseudocode).toContain('FUNCTION isEven(number : INTEGER) RETURNS BOOLEAN');
      expect(result.pseudocode).toContain('RETURN a + b');
      expect(result.pseudocode).toContain('RETURN s1 & s2');
      expect(result.pseudocode).toContain('RETURN number MOD 2 = 0');
      expect(result.pseudocode).toContain('ENDFUNCTION');
      
      // Verify procedures (no return values)
      expect(result.pseudocode).toContain('PROCEDURE printMessage(message : STRING)');
      expect(result.pseudocode).toContain('PROCEDURE incrementArray(arr : ARRAY[1:SIZE] OF INTEGER)');
      expect(result.pseudocode).toContain('ENDPROCEDURE');
      
      // Verify function calls vs procedure calls
      expect(result.pseudocode).toContain('sum ← add(5, 3)');
      expect(result.pseudocode).toContain('result ← concatenate("Hello", " World")');
      expect(result.pseudocode).toContain('even ← isEven(4)');
      expect(result.pseudocode).toContain('CALL printMessage(result)');
      expect(result.pseudocode).toContain('CALL incrementArray(numbers)');
    });
  });

  describe('Complex Nested Scenarios', () => {
    test('handles deeply nested control structures', () => {
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
                      data[i][j][k] = data[i][j][k] / 2;
                      System.out.println("Reducing negative value: " + data[i][j][k]);
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
      
      // Verify 3D array handling
      expect(result.pseudocode).toContain('ARRAY[1:SIZE, 1:SIZE, 1:SIZE] OF INTEGER');
      
      // Verify triple nested loops
      expect(result.pseudocode).toContain('FOR i ← 1 TO LENGTH(data)');
      expect(result.pseudocode).toContain('FOR j ← 1 TO LENGTH(data[i])');
      expect(result.pseudocode).toContain('FOR k ← 1 TO LENGTH(data[i][j])');
      expect(result.pseudocode).toContain('NEXT k');
      expect(result.pseudocode).toContain('NEXT j');
      expect(result.pseudocode).toContain('NEXT i');
      
      // Verify deeply nested if statements
      expect(result.pseudocode).toContain('IF data[i][j][k] > 0 THEN');
      expect(result.pseudocode).toContain('IF data[i][j][k] MOD 2 = 0 THEN');
      expect(result.pseudocode).toContain('IF data[i][j][k] > 100 THEN');
      
      // Verify proper indentation for deep nesting (should have lines with 12+ spaces)
      const lines = result.pseudocode.split('\n');
      const deeplyIndentedLines = lines.filter(line => line.match(/^            /)); // 12+ spaces
      expect(deeplyIndentedLines.length).toBeGreaterThan(0);
      
      // Verify while loop within nested structure
      expect(result.pseudocode).toContain('WHILE data[i][j][k] < -10 DO');
      expect(result.pseudocode).toContain('ENDWHILE');
    });

    test('handles complex mixed control structures with multiple data types', () => {
      const tsCode = `
        interface Student {
          id: number;
          name: string;
          grades: number[];
          isActive: boolean;
        }
        
        class GradeProcessor {
          private students: Student[] = [];
          
          processGrades(): void {
            for (let i = 0; i < this.students.length; i++) {
              const student = this.students[i];
              
              if (student.isActive) {
                let totalGrades = 0;
                let gradeCount = 0;
                
                for (let j = 0; j < student.grades.length; j++) {
                  const grade = student.grades[j];
                  
                  if (grade >= 0 && grade <= 100) {
                    totalGrades += grade;
                    gradeCount++;
                    
                    switch (true) {
                      case grade >= 90:
                        console.log(\`\${student.name}: Excellent (\${grade})\`);
                        break;
                      case grade >= 80:
                        console.log(\`\${student.name}: Good (\${grade})\`);
                        break;
                      case grade >= 70:
                        console.log(\`\${student.name}: Satisfactory (\${grade})\`);
                        break;
                      case grade >= 60:
                        console.log(\`\${student.name}: Pass (\${grade})\`);
                        break;
                      default:
                        console.log(\`\${student.name}: Fail (\${grade})\`);
                    }
                  } else {
                    console.log(\`Invalid grade for \${student.name}: \${grade}\`);
                  }
                }
                
                if (gradeCount > 0) {
                  const average = totalGrades / gradeCount;
                  console.log(\`\${student.name} average: \${average.toFixed(2)}\`);
                  
                  if (average >= 70) {
                    console.log(\`\${student.name} passes the course\`);
                  } else {
                    console.log(\`\${student.name} needs improvement\`);
                  }
                }
              } else {
                console.log(\`\${student.name} is inactive - skipping\`);
              }
            }
          }
        }
      `;

      const result = converter.convertTypeScript(tsCode);

      expect(result.success).toBe(true);
      
      // Verify interface handling
      expect(result.pseudocode).toContain('// Interface: Student');
      expect(result.pseudocode).toContain('// Properties: id (REAL), name (STRING), grades (ARRAY[1:SIZE] OF REAL), isActive (BOOLEAN)');
      
      // Verify complex nested structure
      expect(result.pseudocode).toContain('FOR i ← 1 TO LENGTH(students)');
      expect(result.pseudocode).toContain('IF student.isActive = TRUE THEN');
      expect(result.pseudocode).toContain('FOR j ← 1 TO LENGTH(student.grades)');
      expect(result.pseudocode).toContain('IF grade >= 0 AND grade <= 100 THEN');
      
      // Verify switch statement conversion
      expect(result.pseudocode).toContain('CASE OF TRUE');
      expect(result.pseudocode).toContain('grade >= 90: OUTPUT student.name, ": Excellent (", grade, ")"');
      expect(result.pseudocode).toContain('grade >= 80: OUTPUT student.name, ": Good (", grade, ")"');
      expect(result.pseudocode).toContain('OTHERWISE: OUTPUT student.name, ": Fail (", grade, ")"');
      expect(result.pseudocode).toContain('ENDCASE');
      
      // Verify mathematical operations
      expect(result.pseudocode).toContain('average ← totalGrades / gradeCount');
      expect(result.pseudocode).toContain('// toFixed(2) equivalent - round to 2 decimal places');
      
      // Verify template literal conversion
      expect(result.pseudocode).toContain('OUTPUT student.name, " average: ", ROUND(average, 2)');
      expect(result.pseudocode).toContain('OUTPUT student.name, " passes the course"');
      expect(result.pseudocode).toContain('OUTPUT student.name, " needs improvement"');
    });
  });

  describe('Configuration Options Impact', () => {
    test('respects custom indentation settings', () => {
      const javaCode = `
        if (x > 0) {
          if (y > 0) {
            System.out.println("Both positive");
          }
        }
      `;

      const options: ConversionOptions = {
        indentSize: 2
      };

      const result = converter.convertJava(javaCode, options);

      expect(result.success).toBe(true);
      
      // Verify 2-space indentation
      const lines = result.pseudocode.split('\n');
      const indentedLines = lines.filter(line => line.match(/^  [^ ]/)); // Exactly 2 spaces
      expect(indentedLines.length).toBeGreaterThan(0);
      
      const doubleIndentedLines = lines.filter(line => line.match(/^    [^ ]/)); // Exactly 4 spaces
      expect(doubleIndentedLines.length).toBeGreaterThan(0);
    });

    test('handles comment inclusion options', () => {
      const javaCode = `
        public static void main(String[] args) {
          System.out.println("Hello World");
        }
      `;

      const withComments = converter.convertJava(javaCode, { includeComments: true });
      const withoutComments = converter.convertJava(javaCode, { includeComments: false });

      expect(withComments.success).toBe(true);
      expect(withoutComments.success).toBe(true);
      
      expect(withComments.pseudocode).toContain('// Static method');
      expect(withoutComments.pseudocode).not.toContain('// Static method');
    });

    test('handles strict mode differences', () => {
      const javaCode = `
        int x;  // Uninitialized variable
        System.out.println(x);
      `;

      const strictResult = converter.convertJava(javaCode, { strictMode: true });
      const lenientResult = converter.convertJava(javaCode, { strictMode: false });

      expect(strictResult.success).toBe(true);
      expect(lenientResult.success).toBe(true);
      
      // Strict mode should generate more warnings
      expect(strictResult.warnings.length).toBeGreaterThanOrEqual(lenientResult.warnings.length);
    });
  });
});