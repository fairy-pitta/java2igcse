const { ArrayIndexingConverter } = require('./dist/utils/array-indexing-converter.js');

const testExpression = 'arr[0] > arr[1]';

console.log('=== Testing ArrayIndexingConverter directly ===');
console.log('Input expression:', testExpression);

const result = ArrayIndexingConverter.convertArrayAccess(testExpression);

console.log('Output expression:', result.convertedExpression);
console.log('Has array access:', result.hasArrayAccess);
console.log('Warnings:', result.warnings);

console.log('\n=== Expected: arr[1] > arr[2] ===');
console.log('Actual matches expected:', result.convertedExpression === 'arr[1] > arr[2]');