// Debug script to check while loop AST structure

const { JavaParser } = require('./dist/parsers/java-parser.js');
const { JavaASTTransformer } = require('./dist/transformers/java-transformer.js');
const { IGCSEPseudocodeGenerator } = require('./dist/generators/pseudocode-generator.js');

console.log('=== Debug While Loop AST ===\n');

const parser = new JavaParser();
const transformer = new JavaASTTransformer();
const generator = new IGCSEPseudocodeGenerator();

const whileCode = `while (i < 10) {
  i++;
}`;

console.log('1. Parse:');
const parseResult = parser.parse(whileCode);
console.log('AST:', JSON.stringify(parseResult.ast, null, 2));

console.log('\n2. Transform:');
const transformResult = transformer.transform(parseResult.ast);
console.log('IR:', JSON.stringify(transformResult.result, null, 2));

console.log('\n3. Generate:');
const pseudocode = generator.generate(transformResult.result);
console.log('Pseudocode:', JSON.stringify(pseudocode));

console.log('\n=== Debug Complete ===');