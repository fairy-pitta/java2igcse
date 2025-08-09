// Debug script to check configuration options

const { Java2IGCSEConverterImpl } = require('./dist/index.js');

const converter = new Java2IGCSEConverterImpl();

console.log('=== Debug Configuration ===\n');

// Test includeComments: false
console.log('1. includeComments: false');
const options = { includeComments: false };
const javaCode = 'public static int x = 5;';
console.log('Input:', javaCode);
console.log('Options:', JSON.stringify(options));
const result = converter.convertJava(javaCode, options);
console.log('Success:', result.success);
console.log('Pseudocode length:', result.pseudocode.length);
console.log('Pseudocode:', JSON.stringify(result.pseudocode));
console.log('Warnings:', result.warnings);
console.log();

// Test includeComments: true
console.log('2. includeComments: true');
const options2 = { includeComments: true };
const result2 = converter.convertJava(javaCode, options2);
console.log('Success:', result2.success);
console.log('Pseudocode length:', result2.pseudocode.length);
console.log('Pseudocode:', JSON.stringify(result2.pseudocode));
console.log('Warnings:', result2.warnings);
console.log();

// Test simple variable without static
console.log('3. Simple variable (no static)');
const simpleCode = 'int x = 5;';
console.log('Input:', simpleCode);
const result3 = converter.convertJava(simpleCode, options);
console.log('Success:', result3.success);
console.log('Pseudocode:', JSON.stringify(result3.pseudocode));
console.log();

console.log('=== Debug Complete ===');