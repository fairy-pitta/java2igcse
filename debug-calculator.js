const { Java2IGCSEConverterImpl } = require('./dist/index');

const converter = new Java2IGCSEConverterImpl();

const javaCode = `
public class Calculator {
  private int result;
  
  public Calculator() {
    this.result = 0;
  }
  
  public int add(int a, int b) {
    result = a + b;
    return result;
  }
  
  public void printResult() {
    System.out.println("Result: " + result);
  }
  
  public static void main(String[] args) {
    Calculator calc = new Calculator();
    int sum = calc.add(5, 3);
    calc.printResult();
  }
}
`;

// First, let's check the parser directly
const { JavaParser } = require('./dist/parsers/java-parser');

const parser = new JavaParser();
const parseResult = parser.parse(javaCode);

console.log('Parse Success:', parseResult.success);
console.log('Parse Errors:', parseResult.errors.length);
console.log('AST Structure:');
console.log(JSON.stringify(parseResult.ast, null, 2));

console.log('\n=== CONVERSION RESULT ===');
const result = converter.convertJava(javaCode);

console.log('Success:', result.success);
console.log('Warnings count:', result.warnings.length);
console.log('Pseudocode:');
console.log(result.pseudocode);