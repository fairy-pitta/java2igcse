const { ArrayIndexingConverter } = require('./dist/utils/array-indexing-converter.js');

const testExpression = 'arr[matrix[0][1]]';

console.log('=== Testing nested array access ===');
console.log('Input expression:', testExpression);

const result = ArrayIndexingConverter.convertArrayAccess(testExpression);

console.log('Output expression:', result.convertedExpression);
console.log('Has array access:', result.hasArrayAccess);
console.log('Warnings:', result.warnings);

// Test the regex pattern directly
const arrayAccessPattern = /(\w+(?:\[[^\]]+\])+)/g;
const matches = Array.from(testExpression.matchAll(arrayAccessPattern));

console.log('\n=== Regex matches ===');
for (let i = 0; i < matches.length; i++) {
  console.log(`Match ${i}: "${matches[i][0]}" at position ${matches[i].index}`);
}