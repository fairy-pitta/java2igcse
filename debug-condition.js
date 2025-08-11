const { Java2IGCSEConverterImpl } = require('./dist/index.js');

const converter = new Java2IGCSEConverterImpl();

const javaCode = `
public class Test {
  public static void test() {
    int[] arr = {1, 2, 3};
    if (arr[0] > arr[1]) {
      System.out.println("First is greater");
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
console.log('Contains "IF arr[1] > arr[2] THEN":', result.pseudocode.includes('IF arr[1] > arr[2] THEN'));
console.log('Contains "IF arr[2] > arr[1] THEN":', result.pseudocode.includes('IF arr[2] > arr[1] THEN'));