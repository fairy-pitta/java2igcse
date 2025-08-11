# java2igcse Examples Index

This comprehensive collection of examples demonstrates how java2igcse converts Java and TypeScript code to IGCSE pseudocode format.

## Quick Navigation

### 📚 Basic Examples
Perfect for getting started with the library.

- **[Java Examples](basic/java-examples.md)** - Simple Java constructs and their IGCSE conversions
  - Variable declarations and types
  - Control structures (if/else, loops)
  - Methods and functions
  - Arrays and basic operations
  - String operations

- **[TypeScript Examples](basic/typescript-examples.md)** - Simple TypeScript constructs and their IGCSE conversions
  - Type annotations and inference
  - Functions and arrow functions
  - ES6+ features
  - Object operations

### 🚀 Advanced Examples
Complex scenarios and nested structures.

- **[Control Structures](advanced/control-structures.md)** - Complex control flow patterns
  - Nested if statements and loops
  - Switch/case statements
  - Complex loop variations
  - Error handling in control structures

- **[Functions and Procedures](advanced/functions-procedures.md)** - Method conversion examples
  - Function vs procedure distinction
  - Parameter handling
  - Return types and values
  - Static methods and overloading

- **[Object-Oriented Features](advanced/object-oriented.md)** - Classes, inheritance, and OOP concepts
  - Class structure conversion
  - Inheritance handling
  - Static members
  - Access modifiers

### 🌍 Real-World Examples
Practical algorithms and complete programs.

- **[Educational Algorithms](real-world/algorithms.md)** - Common programming algorithms
  - Sorting algorithms (bubble sort, selection sort)
  - Search algorithms (binary search, linear search)
  - Mathematical algorithms (GCD, Fibonacci)
  - String processing algorithms

- **[Data Structures](real-world/data-structures.md)** - Arrays, lists, and basic data structures
  - Array operations and manipulation
  - List implementations
  - Stack and queue operations
  - Basic tree structures

- **[Complete Programs](real-world/complete-programs.md)** - Full program examples
  - Calculator applications
  - Text processing utilities
  - Simple games
  - File processing examples

### ⚠️ Edge Cases and Limitations
Understanding what the converter can and cannot handle.

- **[Unsupported Features](edge-cases/unsupported-features.md)** - Features that generate warnings
  - Java generics and collections
  - Exception handling
  - Lambda expressions and streams
  - TypeScript advanced types
  - Decorators and metadata
  - Module systems

- **[Complex Conversions](edge-cases/complex-conversions.md)** - Challenging conversion scenarios
  - Deeply nested structures
  - Complex expressions
  - Multiple inheritance
  - Circular dependencies

- **[Error Handling](edge-cases/error-handling.md)** - Error scenarios and solutions
  - Parse errors
  - Conversion failures
  - Performance issues
  - Memory limitations

## Interactive Demo

Try the interactive demo to experiment with conversions:

```bash
node examples/demo-interactive.js
```

This script provides:
- Pre-loaded examples for quick testing
- Custom code input
- Step-by-step conversion process
- Detailed result analysis

## Example Categories by Difficulty

### 🟢 Beginner (Start Here)
- [Basic Java Variables](basic/java-examples.md#variable-declarations)
- [Simple If Statements](basic/java-examples.md#control-structures)
- [Basic TypeScript Functions](basic/typescript-examples.md#functions)

### 🟡 Intermediate
- [Nested Loops](advanced/control-structures.md#nested-control-structures)
- [Method Overloading](advanced/functions-procedures.md)
- [Array Processing](real-world/algorithms.md#sorting-algorithms)

### 🔴 Advanced
- [Complex Inheritance](advanced/object-oriented.md)
- [Algorithm Implementations](real-world/algorithms.md)
- [Unsupported Feature Handling](edge-cases/unsupported-features.md)

## Example Usage Patterns

### Pattern 1: Simple Conversion
```typescript
import { Java2IGCSEConverterImpl } from 'java2igcse';

const converter = new Java2IGCSEConverterImpl();
const result = converter.convertJava('int x = 5;');
console.log(result.pseudocode); // DECLARE x : INTEGER ← 5
```

### Pattern 2: With Options
```typescript
const options = {
  indentSize: 4,
  includeComments: true,
  strictMode: true
};

const result = converter.convertJava(javaCode, options);
```

### Pattern 3: Error Handling
```typescript
const result = converter.convertJava(javaCode);

if (result.success) {
  console.log('Pseudocode:', result.pseudocode);
  
  if (result.warnings.length > 0) {
    console.log('Warnings:');
    result.warnings.forEach(w => console.log(`- ${w.message}`));
  }
} else {
  console.error('Conversion failed');
}
```

## IGCSE Pseudocode Standards Reference

All examples follow official IGCSE pseudocode standards:

### Keywords
- `BEGIN`/`END` - Program blocks
- `IF`/`THEN`/`ELSE`/`ENDIF` - Conditionals
- `WHILE`/`DO`/`ENDWHILE` - While loops
- `FOR`/`TO`/`NEXT` - For loops
- `REPEAT`/`UNTIL` - Do-while loops
- `PROCEDURE`/`ENDPROCEDURE` - Void methods
- `FUNCTION`/`ENDFUNCTION`/`RETURNS` - Functions
- `DECLARE` - Variable declarations
- `INPUT`/`OUTPUT` - I/O operations

### Operators
- `←` - Assignment
- `=` - Equality comparison
- `<>` - Inequality comparison
- `AND`, `OR`, `NOT` - Logical operators
- `MOD` - Modulo operation

### Data Types
- `INTEGER` - Whole numbers
- `REAL` - Decimal numbers
- `STRING` - Text
- `CHAR` - Single characters
- `BOOLEAN` - True/false values
- `ARRAY[start:end] OF TYPE` - Arrays

## Testing Your Understanding

After reviewing the examples, test your understanding:

1. **Convert Simple Code**: Try converting basic Java/TypeScript snippets
2. **Identify Patterns**: Look for common conversion patterns
3. **Handle Warnings**: Practice dealing with unsupported features
4. **Compare Results**: Check your manual conversions against the tool

## Contributing Examples

To contribute new examples:

1. Follow the existing format with clear input/output sections
2. Include explanations for conversion decisions
3. Add appropriate difficulty level indicators
4. Test examples with the actual converter
5. Document any warnings or special considerations

## Example File Structure

Each example file follows this structure:

```markdown
# Title

Brief description of what this file covers.

## Category Name

### Example N: Descriptive Title

**Language Input:**
```language
// Source code here
```

**IGCSE Output:**
```
// Converted pseudocode here
```

**Explanation:**
- Key conversion points
- Why certain decisions were made
- Any warnings or limitations

**Notes:**
- Additional considerations
- Related examples
- Best practices
```

## Getting Help

If you need help understanding any examples:

1. Check the [API Documentation](../docs/API.md)
2. Review the [Troubleshooting Guide](../docs/TROUBLESHOOTING.md)
3. Try the interactive demo for hands-on experimentation
4. Look at similar examples in different categories

## Quick Reference

| Java Construct | TypeScript Construct | IGCSE Pseudocode |
|----------------|---------------------|------------------|
| `int x = 5;` | `let x: number = 5;` | `DECLARE x : INTEGER ← 5` |
| `if (x > 0) { ... }` | `if (x > 0) { ... }` | `IF x > 0 THEN ... ENDIF` |
| `for (int i = 0; i < 10; i++)` | `for (let i = 0; i < 10; i++)` | `FOR i ← 0 TO 9 ... NEXT i` |
| `public void method()` | `function method(): void` | `PROCEDURE method() ... ENDPROCEDURE` |
| `public int add(int a, int b)` | `function add(a: number, b: number): number` | `FUNCTION add(a : INTEGER, b : INTEGER) RETURNS INTEGER` |

Happy learning with java2igcse! 🎓