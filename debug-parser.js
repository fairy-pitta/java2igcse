// Debug script to check parser behavior

const { JavaParser } = require('./dist/parsers/java-parser.js');

const parser = new JavaParser();

console.log('=== Debug Parser ===\n');

// Test simple while loop
console.log('1. Simple While Loop:');
const whileCode = `while (i < 10) {
  i++;
}`;
console.log('Input:', whileCode);
const result1 = parser.parse(whileCode);
console.log('Success:', result1.success);
console.log('Errors:', result1.errors);
console.log('AST:', JSON.stringify(result1.ast, null, 2));
console.log();

// Test method declaration
console.log('2. Method Declaration:');
const methodCode = `public int add(int a, int b) {
  return a + b;
}`;
console.log('Input:', methodCode);
const result2 = parser.parse(methodCode);
console.log('Success:', result2.success);
console.log('Errors:', result2.errors);
console.log('AST:', JSON.stringify(result2.ast, null, 2));
console.log();

console.log('=== Debug Complete ===');