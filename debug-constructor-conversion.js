// Debug script to test constructor conversion
const { Java2IGCSEConverterImpl } = require('./dist/index.js');

const converter = new Java2IGCSEConverterImpl();

const javaCode = `
public class Test {
  private int result;
  
  public Test() {
    result = 0;
  }
  
  public int add(int a, int b) {
    result = a + b;
    return result;
  }
}
`;

console.log('=== Java Code ===');
console.log(javaCode);

console.log('\n=== Conversion Result ===');
const result = converter.convertJava(javaCode);
console.log('Success:', result.success);
console.log('Pseudocode:');
console.log(result.pseudocode);

if (result.warnings.length > 0) {
  console.log('\n=== Warnings ===');
  result.warnings.forEach(warning => {
    console.log(`- ${warning.message}`);
  });
}