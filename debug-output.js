const { Java2IGCSEConverterImpl } = require('./dist/index.js');

const converter = new Java2IGCSEConverterImpl();

const javaCode = `
public class OutputTest {
  public static void test() {
    int[] arr = {1, 2, 3};
    for (int i = 0; i < arr.length; i++) {
      System.out.print(arr[i]);
    }
  }
}
`;

console.log('=== Java Code ===');
console.log(javaCode);

console.log('\n=== Conversion Result ===');
const result = converter.convertJava(javaCode);

console.log('Success:', result.success);
console.log('Warnings:', result.warnings.length);

if (result.warnings.length > 0) {
  console.log('\n=== Warnings ===');
  result.warnings.forEach((warning, index) => {
    console.log(`${index + 1}. ${warning.message} (${warning.code})`);
  });
}

console.log('\n=== Generated Pseudocode ===');
console.log(result.pseudocode);

console.log('\n=== Looking for specific patterns ===');
console.log('Contains "OUTPUT arr[i]":', result.pseudocode.includes('OUTPUT arr[i]'));
console.log('Contains "OUTPUT \\"arr[i]\\"":', result.pseudocode.includes('OUTPUT "arr[i]"'));