const { Java2IGCSEConverterImpl } = require('./dist/index.js');

const converter = new Java2IGCSEConverterImpl();

const javaCode = `
public class Test {
  public void method() {
    int x = 5;
    // Missing closing brace
`;

console.log('Testing malformed Java code...');
const result = converter.convertJava(javaCode);
console.log('Success:', result.success);
console.log('Warnings count:', result.warnings.length);
console.log('Pseudocode preview:', result.pseudocode.substring(0, 200));
console.log('First few warnings:', result.warnings.slice(0, 3));