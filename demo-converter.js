// Demo script showing the Java2IGCSEConverter in action

const { Java2IGCSEConverterImpl } = require('./dist/index.js');

const converter = new Java2IGCSEConverterImpl();

console.log('=== Java2IGCSE Converter Demo ===\n');

// Demo 1: Simple Java variable declaration
console.log('1. Java Variable Declaration:');
const javaVar = 'int x = 5;';
console.log('Input:', javaVar);
const result1 = converter.convertJava(javaVar);
console.log('Output:', result1.pseudocode);
console.log('Success:', result1.success);
console.log('Warnings:', result1.warnings.length);
console.log();

// Demo 2: Java if statement
console.log('2. Java If Statement:');
const javaIf = `
if (x > 0) {
  System.out.println("positive");
}
`;
console.log('Input:', javaIf.trim());
const result2 = converter.convertJava(javaIf);
console.log('Output:');
console.log(result2.pseudocode);
console.log('Success:', result2.success);
console.log();

// Demo 3: TypeScript variable with type annotation
console.log('3. TypeScript Variable Declaration:');
const tsVar = 'let name: string = "John";';
console.log('Input:', tsVar);
const result3 = converter.convertTypeScript(tsVar);
console.log('Output:', result3.pseudocode);
console.log('Success:', result3.success);
console.log();

// Demo 4: Java method
console.log('4. Java Method:');
const javaMethod = `
public int add(int a, int b) {
  return a + b;
}
`;
console.log('Input:', javaMethod.trim());
const result4 = converter.convertJava(javaMethod);
console.log('Output:');
console.log(result4.pseudocode);
console.log('Success:', result4.success);
console.log();

// Demo 5: Configuration options
console.log('5. With Custom Configuration:');
const options = {
  indentSize: 2,
  includeComments: true
};
console.log('Options:', JSON.stringify(options, null, 2));
const javaWithOptions = `
if (x > 0) {
  System.out.println("positive");
}
`;
console.log('Input:', javaWithOptions.trim());
const result5 = converter.convertJava(javaWithOptions, options);
console.log('Output:');
console.log(result5.pseudocode);
console.log('Success:', result5.success);
console.log();

console.log('=== Demo Complete ===');