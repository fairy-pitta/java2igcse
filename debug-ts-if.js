// Debug script to check TypeScript if statement

const { TypeScriptParser } = require('./dist/parsers/typescript-parser.js');

const parser = new TypeScriptParser();

console.log('=== Debug TypeScript If ===\n');

// Test TypeScript if statement
console.log('1. TypeScript If Statement:');
const tsCode = `
if (x > 0) {
  console.log("positive");
}
`;
console.log('Input:', tsCode.trim());
const result = parser.parse(tsCode);
console.log('Success:', result.success);
console.log('Errors:', result.errors);
console.log('AST:', JSON.stringify(result.ast, null, 2));
console.log();

console.log('=== Debug Complete ===');