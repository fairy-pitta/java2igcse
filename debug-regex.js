const testExpression = 'matrix[0][1]';
const arrayAccessPattern = /(\w+)(\[[^\]]+\])+/g;

console.log('Testing regex pattern on:', testExpression);

const matches = Array.from(testExpression.matchAll(arrayAccessPattern));
console.log('Matches found:', matches.length);

for (let i = 0; i < matches.length; i++) {
  const match = matches[i];
  console.log(`Match ${i}:`);
  console.log('  Full match:', match[0]);
  console.log('  Array name:', match[1]);
  console.log('  Index part:', match[2]);
  console.log('  Match index:', match.index);
}

// Test the inner index pattern
const indexPart = '[0][1]';
const indexPattern = /\[([^\]]+)\]/g;
const indexMatches = Array.from(indexPart.matchAll(indexPattern));

console.log('\nTesting index pattern on:', indexPart);
console.log('Index matches found:', indexMatches.length);

for (let i = 0; i < indexMatches.length; i++) {
  const match = indexMatches[i];
  console.log(`Index match ${i}:`);
  console.log('  Full match:', match[0]);
  console.log('  Index expression:', match[1]);
}