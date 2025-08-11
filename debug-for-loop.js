const { Java2IGCSEConverterImpl } = require('./dist/index.js');

const converter = new Java2IGCSEConverterImpl();

const javaCode = `
public class ForLoopTest {
  public static void test() {
    for (int i = 1; i < 5; i++) {
      System.out.println(i);
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