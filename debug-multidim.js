const { ArrayIndexingConverter } = require('./dist/utils/array-indexing-converter.js');

const testExpression = 'matrix[0][1]';

console.log('=== Testing multi-dimensional array access ===');
console.log('Input expression:', testExpression);

const result = ArrayIndexingConverter.convertArrayAccess(testExpression);

console.log('Output expression:', result.convertedExpression);
console.log('Has array access:', result.hasArrayAccess);
console.log('Warnings:', result.warnings);

console.log('\n=== Expected: matrix[1][2] ===');
console.log('Actual matches expected:', result.convertedExpression === 'matrix[1][2]');