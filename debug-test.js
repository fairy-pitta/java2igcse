// Debug script to check what's happening with the failing tests

const { Java2IGCSEConverterImpl } = require('./dist/index.js');

const converter = new Java2IGCSEConverterImpl();

console.log('=== Debug Failed Tests ===\n');

// Test 1: Java while loop
console.log('1. Java While Loop Test:');
const javaWhile = `
        while (i < 10) {
          i++;
        }
      `;
console.log('Input:', javaWhile.trim());
const result1 = converter.convertJava(javaWhile);
console.log('Success:', result1.success);
console.log('Pseudocode:', result1.pseudocode);
console.log('Warnings:', result1.warnings);
console.log();

// Test 2: Java method declaration
console.log('2. Java Method Declaration Test:');
const javaMethod = `
        public int add(int a, int b) {
          return a + b;
        }
      `;
console.log('Input:', javaMethod.trim());
const result2 = converter.convertJava(javaMethod);
console.log('Success:', result2.success);
console.log('Pseudocode:', result2.pseudocode);
console.log('Warnings:', result2.warnings);
console.log();

// Test 3: TypeScript if statement
console.log('3. TypeScript If Statement Test:');
const tsIf = `
        if (x > 0) {
          console.log("positive");
        }
      `;
console.log('Input:', tsIf.trim());
const result3 = converter.convertTypeScript(tsIf);
console.log('Success:', result3.success);
console.log('Pseudocode:', result3.pseudocode);
console.log('Warnings:', result3.warnings);
console.log();

// Test 4: Configuration options
console.log('4. Configuration Options Test:');
const options = {
  includeComments: false
};
const javaStatic = 'public static int x = 5;';
console.log('Input:', javaStatic);
console.log('Options:', JSON.stringify(options));
const result4 = converter.convertJava(javaStatic, options);
console.log('Success:', result4.success);
console.log('Pseudocode:', result4.pseudocode);
console.log('Warnings:', result4.warnings);
console.log();

console.log('=== Debug Complete ===');