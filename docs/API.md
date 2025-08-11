# java2igcse API Documentation

## Overview

java2igcse is a TypeScript/JavaScript library that converts Java and TypeScript source code into IGCSE (International General Certificate of Secondary Education) compliant pseudocode. This library is designed for educators who need to translate actual programming code into standardized pseudocode format for educational purposes.

## Installation

```bash
npm install java2igcse
```

## Quick Start

```typescript
import { Java2IGCSEConverterImpl } from 'java2igcse';

const converter = new Java2IGCSEConverterImpl();

// Convert Java code
const javaResult = converter.convertJava(`
public class Example {
    public static void main(String[] args) {
        int x = 5;
        if (x > 0) {
            System.out.println("Positive number");
        }
    }
}
`);

console.log(javaResult.pseudocode);
// Output:
// // Static method
// PROCEDURE main(args : ARRAY[1:SIZE] OF STRING)
//    DECLARE x : INTEGER ← 5
//    IF x > 0 THEN
//       OUTPUT "Positive number"
//    ENDIF
// ENDPROCEDURE

// Convert TypeScript code
const tsResult = converter.convertTypeScript(`
function calculateSum(a: number, b: number): number {
    return a + b;
}
`);

console.log(tsResult.pseudocode);
// Output:
// FUNCTION calculateSum(a : REAL, b : REAL) RETURNS REAL
//    RETURN a + b
// ENDFUNCTION
```

## Core API

### Java2IGCSEConverterImpl Class

The main class that provides conversion functionality.

#### Constructor

```typescript
constructor()
```

Creates a new instance of the converter. Components are initialized lazily when conversion methods are called.

#### Methods

##### convertJava(sourceCode, options?)

Converts Java source code to IGCSE pseudocode.

**Parameters:**
- `sourceCode` (string): The Java source code to convert
- `options` (ConversionOptions, optional): Configuration options for the conversion

**Returns:** `ConversionResult`

**Example:**
```typescript
const result = converter.convertJava(`
int[] numbers = {1, 2, 3, 4, 5};
for (int i = 0; i < numbers.length; i++) {
    System.out.println(numbers[i]);
}
`);
```

##### convertTypeScript(sourceCode, options?)

Converts TypeScript source code to IGCSE pseudocode.

**Parameters:**
- `sourceCode` (string): The TypeScript source code to convert
- `options` (ConversionOptions, optional): Configuration options for the conversion

**Returns:** `ConversionResult`

**Example:**
```typescript
const result = converter.convertTypeScript(`
const numbers: number[] = [1, 2, 3, 4, 5];
for (let i = 0; i < numbers.length; i++) {
    console.log(numbers[i]);
}
`);
```

##### convertCode(sourceCode, language, options?)

Generic conversion method that accepts a language parameter.

**Parameters:**
- `sourceCode` (string): The source code to convert
- `language` ('java' | 'typescript'): The source language
- `options` (ConversionOptions, optional): Configuration options for the conversion

**Returns:** `ConversionResult`

**Example:**
```typescript
const result = converter.convertCode(sourceCode, 'java', { indentSize: 4 });
```

## Type Definitions

### ConversionOptions

Configuration options for customizing the conversion process.

```typescript
interface ConversionOptions {
  indentSize?: number;        // Number of spaces for indentation (default: 3)
  includeComments?: boolean;  // Include explanatory comments (default: true)
  strictMode?: boolean;       // Enable strict IGCSE compliance (default: false)
  customMappings?: Record<string, string>; // Custom type/keyword mappings
}
```

**Properties:**
- `indentSize`: Controls the number of spaces used for indentation in the output pseudocode. IGCSE standard recommends 3 spaces.
- `includeComments`: When true, includes explanatory comments for complex conversions (e.g., static methods, inheritance).
- `strictMode`: When true, enforces stricter IGCSE compliance and may reject certain constructs.
- `customMappings`: Allows custom mapping of types or keywords for specialized use cases.

### ConversionResult

The result object returned by all conversion methods.

```typescript
interface ConversionResult {
  pseudocode: string;           // The converted IGCSE pseudocode
  warnings: Warning[];         // Array of warnings encountered during conversion
  success: boolean;            // Whether the conversion was successful
  metadata: ConversionMetadata; // Additional information about the conversion
}
```

### ConversionMetadata

Additional information about the conversion process.

```typescript
interface ConversionMetadata {
  sourceLanguage: 'java' | 'typescript'; // The source language that was converted
  conversionTime: number;                 // Time taken for conversion in milliseconds
  linesProcessed: number;                 // Number of lines in the source code
  featuresUsed: string[];                 // List of language features detected
}
```

### Warning

Information about warnings encountered during conversion.

```typescript
interface Warning {
  message: string;              // Human-readable warning message
  line?: number;               // Line number where the warning occurred
  column?: number;             // Column number where the warning occurred
  code: string;                // Warning code for programmatic handling
  severity: 'warning' | 'info'; // Severity level of the warning
}
```

## Advanced Usage

### Custom Configuration

```typescript
const options: ConversionOptions = {
  indentSize: 4,
  includeComments: true,
  strictMode: true,
  customMappings: {
    'ArrayList': 'ARRAY',
    'HashMap': 'DICTIONARY'
  }
};

const result = converter.convertJava(sourceCode, options);
```

### Error Handling

```typescript
const result = converter.convertJava(sourceCode);

if (!result.success) {
  console.error('Conversion failed');
  result.warnings.forEach(warning => {
    console.warn(`${warning.code}: ${warning.message}`);
    if (warning.line) {
      console.warn(`  at line ${warning.line}`);
    }
  });
} else {
  console.log('Conversion successful');
  console.log(result.pseudocode);
  
  // Handle warnings
  if (result.warnings.length > 0) {
    console.log('Warnings:');
    result.warnings.forEach(warning => {
      console.warn(`  ${warning.message}`);
    });
  }
}
```

### Working with Metadata

```typescript
const result = converter.convertJava(sourceCode);

console.log(`Conversion took ${result.metadata.conversionTime}ms`);
console.log(`Processed ${result.metadata.linesProcessed} lines`);
console.log(`Features used: ${result.metadata.featuresUsed.join(', ')}`);
```

## Supported Language Features

### Java Features

#### Control Structures
- `if`, `else if`, `else` statements → `IF/THEN/ELSE IF/ELSE/ENDIF`
- `while` loops → `WHILE/DO/ENDWHILE`
- `for` loops → `FOR/TO/NEXT`
- `do-while` loops → `REPEAT/UNTIL`
- `switch/case` statements → `CASE OF/ENDCASE`

#### Data Types and Variables
- `int`, `double`, `float` → `INTEGER`, `REAL`
- `String` → `STRING`
- `char` → `CHAR`
- `boolean` → `BOOLEAN`
- Arrays → `ARRAY[1:SIZE] OF TYPE`

#### Methods and Functions
- `void` methods → `PROCEDURE`
- Methods with return values → `FUNCTION`
- Static methods → `PROCEDURE`/`FUNCTION` with comment
- Method parameters → Proper parameter syntax

#### Object-Oriented Features
- Classes → Procedural equivalents with comments
- Inheritance → Comments explaining relationships
- Static members → Comments indicating static nature

### TypeScript Features

#### Type Annotations
- `number` → `REAL` or `INTEGER`
- `string` → `STRING`
- `boolean` → `BOOLEAN`
- Array types → `ARRAY[1:SIZE] OF TYPE`

#### ES6+ Features
- Arrow functions → Named procedures/functions
- Template literals → String concatenation
- Destructuring → Individual variable assignments
- `const`/`let` → `DECLARE` statements

#### Functions
- Function declarations → `FUNCTION`/`PROCEDURE`
- Function expressions → `FUNCTION`/`PROCEDURE`
- Optional parameters → Standard parameters with comments

## IGCSE Pseudocode Standards

The library follows official IGCSE pseudocode standards:

### Keywords
- `BEGIN`/`END` for program blocks
- `IF`/`THEN`/`ELSE`/`ENDIF` for conditionals
- `WHILE`/`DO`/`ENDWHILE` for while loops
- `FOR`/`TO`/`NEXT` for for loops
- `REPEAT`/`UNTIL` for do-while loops
- `PROCEDURE`/`ENDPROCEDURE` for void methods
- `FUNCTION`/`ENDFUNCTION`/`RETURNS` for functions
- `DECLARE` for variable declarations
- `INPUT`/`OUTPUT` for I/O operations

### Operators
- `←` for assignment
- `=` for equality comparison
- `<>` for inequality comparison
- `AND`, `OR`, `NOT` for logical operations
- `MOD` for modulo operation

### Data Types
- `INTEGER` for whole numbers
- `REAL` for decimal numbers
- `STRING` for text
- `CHAR` for single characters
- `BOOLEAN` for true/false values
- `ARRAY[start:end] OF TYPE` for arrays

## Common Warning Codes

| Code | Description | Solution |
|------|-------------|----------|
| `UNSUPPORTED_FEATURE` | Feature not supported in IGCSE pseudocode | Use alternative approach or manual conversion |
| `TYPE_CONVERSION_WARNING` | Automatic type conversion applied | Verify the converted type is appropriate |
| `COMPLEX_EXPRESSION` | Expression simplified for pseudocode | Review the conversion for accuracy |
| `STATIC_MEMBER` | Static member converted with comment | Understand that static nature is preserved in comments |
| `INHERITANCE_SIMPLIFIED` | Inheritance relationship simplified | Check comments for inheritance information |

## Performance Considerations

- The library processes code synchronously
- Large files (>1000 lines) may take several seconds to process
- Memory usage scales with code complexity and nesting depth
- Consider breaking very large files into smaller chunks

## Limitations

### Unsupported Features
- Generic types (converted to base types with warnings)
- Lambda expressions (converted to named functions)
- Complex inheritance hierarchies (simplified with comments)
- Exception handling (converted to conditional checks)
- Annotations/decorators (ignored with warnings)

### Known Issues
- Very deeply nested structures may cause performance issues
- Some complex expressions may be over-simplified
- Unicode characters in strings may not display correctly in all environments

## Migration Guide

### From Version 0.x to 1.x
- Import path changed from `java2igcse` to `java2igcse/Java2IGCSEConverterImpl`
- `ConversionOptions.indentSize` default changed from 2 to 3 spaces
- Warning structure updated with additional fields

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this project.

## License

MIT License - see [LICENSE](LICENSE) file for details.