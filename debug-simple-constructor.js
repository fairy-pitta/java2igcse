// Debug script to test simple constructor
const { JavaParser } = require('./dist/parsers/java-parser.js');

const parser = new JavaParser();

const javaCode = `
public class Test {
  public Test() {
    int x = 5;
  }
}
`;

console.log('=== Java Code ===');
console.log(javaCode);

console.log('\n=== Parse Result ===');
const result = parser.parse(javaCode);
console.log('Success:', result.success);

if (result.errors.length > 0) {
  console.log('\n=== Errors ===');
  result.errors.forEach(error => {
    console.log(`- ${error.message} at line ${error.line}, column ${error.column}`);
  });
}

console.log('\n=== AST (Constructor part) ===');
const classDecl = result.ast.children[0];
const classBody = classDecl.children[1];
const constructor = classBody.children.find(child => child.type === 'method_declaration');
if (constructor) {
  console.log('Constructor metadata:', constructor.metadata);
  console.log('Constructor body:', JSON.stringify(constructor.children[constructor.children.length - 1], null, 2));
}