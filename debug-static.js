// Debug script to check static variable parsing

const { JavaParser } = require('./dist/parsers/java-parser.js');

const parser = new JavaParser();

console.log('=== Debug Static Variable ===\n');

// Test static variable
console.log('1. Static Variable:');
const staticCode = 'public static int x = 5;';
console.log('Input:', staticCode);
const result1 = parser.parse(staticCode);
console.log('Success:', result1.success);
console.log('Errors:', result1.errors);
console.log('AST:', JSON.stringify(result1.ast, null, 2));
console.log();

// Test simple variable
console.log('2. Simple Variable:');
const simpleCode = 'int x = 5;';
console.log('Input:', simpleCode);
const result2 = parser.parse(simpleCode);
console.log('Success:', result2.success);
console.log('Errors:', result2.errors);
console.log('AST:', JSON.stringify(result2.ast, null, 2));
console.log();

console.log('=== Debug Complete ===');