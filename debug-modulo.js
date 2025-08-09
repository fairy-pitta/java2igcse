// Debug script to check modulo operator conversion

const { Java2IGCSEConverterImpl } = require('./dist/index.js');

const converter = new Java2IGCSEConverterImpl();

console.log('=== Debug Modulo Operator ===\n');

// Test modulo in if statement
console.log('1. Modulo in If Statement:');
const javaCode = `
for (int i = 0; i < 10; i++) {
  if (i % 2 == 0) {
    System.out.println("Even: " + i);
  } else {
    System.out.println("Odd: " + i);
  }
}
`;
console.log('Input:', javaCode.trim());
const result = converter.convertJava(javaCode);
console.log('Success:', result.success);
console.log('Pseudocode:');
console.log(result.pseudocode);
console.log('Warnings:', result.warnings.length);
console.log();

console.log('=== Debug Complete ===');