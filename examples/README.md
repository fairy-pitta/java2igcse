# java2igcse Examples

This directory contains comprehensive examples demonstrating the conversion of Java and TypeScript code to IGCSE pseudocode format.

## Example Categories

### Basic Examples
- [Basic Java Examples](basic/java-examples.md) - Simple Java constructs
- [Basic TypeScript Examples](basic/typescript-examples.md) - Simple TypeScript constructs

### Advanced Examples
- [Control Structures](advanced/control-structures.md) - Complex if/else, loops, nested structures
- [Functions and Procedures](advanced/functions-procedures.md) - Method conversion examples
- [Object-Oriented Features](advanced/object-oriented.md) - Classes, inheritance, static members

### Real-World Examples
- [Educational Algorithms](real-world/algorithms.md) - Common programming algorithms
- [Data Structures](real-world/data-structures.md) - Arrays, lists, basic data structures
- [Complete Programs](real-world/complete-programs.md) - Full program examples

### Edge Cases and Limitations
- [Unsupported Features](edge-cases/unsupported-features.md) - Features that generate warnings
- [Complex Conversions](edge-cases/complex-conversions.md) - Challenging conversion scenarios
- [Error Handling](edge-cases/error-handling.md) - Error scenarios and solutions

## How to Use These Examples

Each example file contains:
1. **Source Code**: The original Java or TypeScript code
2. **Expected Output**: The IGCSE pseudocode result
3. **Explanation**: Why the conversion works this way
4. **Notes**: Any warnings or special considerations

## Running Examples

You can test these examples using the library:

```typescript
import { Java2IGCSEConverterImpl } from 'java2igcse';
import fs from 'fs';

const converter = new Java2IGCSEConverterImpl();

// Load example code
const javaCode = fs.readFileSync('examples/basic/simple-if.java', 'utf8');

// Convert and display result
const result = converter.convertJava(javaCode);
console.log('Converted pseudocode:');
console.log(result.pseudocode);

if (result.warnings.length > 0) {
  console.log('\nWarnings:');
  result.warnings.forEach(warning => {
    console.log(`- ${warning.message}`);
  });
}
```

## Interactive Examples

For interactive testing, you can use the provided demo script:

```bash
node demo-converter.js examples/basic/simple-if.java
```

This will show the conversion process step by step.