const { Java2IGCSEConverterImpl } = require('./dist/index');

const converter = new Java2IGCSEConverterImpl();

const javaCode = `
public class ArrayTest {
  public static void main(String[] args) {
    int[] oneDArray = new int[10];
    int[][] twoDArray = new int[5][3];
    String[] names = {"Alice", "Bob", "Charlie"};
    
    // Initialize arrays
    for (int i = 0; i < oneDArray.length; i++) {
      oneDArray[i] = i * 2;
    }
    
    for (int i = 0; i < twoDArray.length; i++) {
      for (int j = 0; j < twoDArray[i].length; j++) {
        twoDArray[i][j] = i + j;
      }
    }
    
    // Print arrays
    for (int value : oneDArray) {
      System.out.println(value);
    }
  }
}
`;

const result = converter.convertJava(javaCode);

console.log('Success:', result.success);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);
console.log('Pseudocode:', result.pseudocode);