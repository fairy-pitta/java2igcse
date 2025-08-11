const { Java2IGCSEConverterImpl } = require('./dist/index.js');

const converter = new Java2IGCSEConverterImpl();

const javaCode = `
public class ArrayTest {
  public static int findMax(int[] numbers) {
    int max = numbers[0];
    for (int i = 1; i < numbers.length; i++) {
      if (numbers[i] > max) {
        max = numbers[i];
      }
    }
    return max;
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
console.log('Contains "numbers[0]":', result.pseudocode.includes('numbers[0]'));
console.log('Contains "numbers[1]":', result.pseudocode.includes('numbers[1]'));
console.log('Contains "max ← numbers[0]":', result.pseudocode.includes('max ← numbers[0]'));
console.log('Contains "max ← numbers[1]":', result.pseudocode.includes('max ← numbers[1]'));