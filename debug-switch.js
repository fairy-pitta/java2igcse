const { Java2IGCSEConverterImpl } = require('./dist/index');

const converter = new Java2IGCSEConverterImpl();

const javaCode = `
public class Test {
  public static void testSwitch() {
    int count = 0;
    switch (count) {
      case 1:
        System.out.println("One");
        break;
      case 2:
        System.out.println("Two");
        break;
      default:
        System.out.println("Other");
    }
  }
}
`;

const result = converter.convertJava(javaCode);

console.log('Success:', result.success);
console.log('Pseudocode:');
console.log(result.pseudocode);
console.log('\nWarnings:');
result.warnings.forEach((warning, i) => {
  console.log(`${i + 1}. ${warning.message}`);
});