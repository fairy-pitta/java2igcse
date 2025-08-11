# java2igcse

Convert Java and TypeScript code to IGCSE pseudocode format.

## Description

java2igcse is an npm library designed for educators to convert Java and TypeScript source code into IGCSE (International General Certificate of Secondary Education) compliant pseudocode. This tool helps translate actual code into standardized pseudocode format that follows IGCSE curriculum guidelines, making it easier to teach programming concepts using familiar pseudocode syntax.

## Installation

```bash
npm install java2igcse
```

## Quick Start

```typescript
import { Java2IGCSEConverterImpl } from 'java2igcse';

const converter = new Java2IGCSEConverterImpl();

// Convert Java code
const javaCode = `
public class Calculator {
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        int result = add(5, 3);
        System.out.println("Result: " + result);
    }
}
`;

const result = converter.convertJava(javaCode);
console.log(result.pseudocode);
```

**Output:**
```
// Static method
FUNCTION add(a : INTEGER, b : INTEGER) RETURNS INTEGER
   RETURN a + b
ENDFUNCTION

// Static method
PROCEDURE main(args : ARRAY[1:SIZE] OF STRING)
   DECLARE result : INTEGER ← add(5, 3)
   OUTPUT "Result: " + result
ENDPROCEDURE
```

## Features

### Language Support
- **Java**: Classes, methods, control structures, arrays, inheritance
- **TypeScript**: Functions, type annotations, ES6+ features, interfaces

### IGCSE Compliance
- Follows official IGCSE pseudocode standards
- Uses correct keywords (IF/THEN/ENDIF, WHILE/ENDWHILE, FOR/NEXT, etc.)
- Proper variable declarations with DECLARE statements
- Correct operator mappings (← for assignment, = for equality, etc.)

### Advanced Features
- **Error Handling**: Graceful handling of unsupported features
- **Warnings System**: Detailed warnings for complex conversions
- **Customizable Options**: Indentation, comments, strict mode
- **Performance Optimized**: Handles large code files efficiently

## Comprehensive Examples

### Java Examples

#### Control Structures
```java
// Input: Java if-else chain
if (score >= 90) {
    System.out.println("Grade A");
} else if (score >= 80) {
    System.out.println("Grade B");
} else {
    System.out.println("Grade C");
}

// Output: IGCSE pseudocode
IF score >= 90 THEN
   OUTPUT "Grade A"
ELSE IF score >= 80 THEN
   OUTPUT "Grade B"
ELSE
   OUTPUT "Grade C"
ENDIF
```

#### Loops
```java
// Input: Java for loop
for (int i = 1; i <= 10; i++) {
    System.out.println("Number: " + i);
}

// Output: IGCSE pseudocode
FOR i ← 1 TO 10
   OUTPUT "Number: " + i
NEXT i
```

#### Arrays
```java
// Input: Java array operations
int[] numbers = {1, 2, 3, 4, 5};
for (int i = 0; i < numbers.length; i++) {
    numbers[i] = numbers[i] * 2;
}

// Output: IGCSE pseudocode
DECLARE numbers : ARRAY[1:5] OF INTEGER ← {1, 2, 3, 4, 5}
FOR i ← 1 TO 5
   numbers[i] ← numbers[i] * 2
NEXT i
```

### TypeScript Examples

#### Functions with Type Annotations
```typescript
// Input: TypeScript function
function calculateArea(width: number, height: number): number {
    return width * height;
}

// Output: IGCSE pseudocode
FUNCTION calculateArea(width : REAL, height : REAL) RETURNS REAL
   RETURN width * height
ENDFUNCTION
```

#### ES6+ Features
```typescript
// Input: Arrow function and template literals
const greet = (name: string): string => {
    return `Hello, ${name}!`;
};

// Output: IGCSE pseudocode
FUNCTION greet(name : STRING) RETURNS STRING
   RETURN "Hello, " + name + "!"
ENDFUNCTION
```

## Configuration Options

```typescript
import { Java2IGCSEConverterImpl, ConversionOptions } from 'java2igcse';

const converter = new Java2IGCSEConverterImpl();

const options: ConversionOptions = {
  indentSize: 4,           // Number of spaces for indentation (default: 3)
  includeComments: true,   // Include explanatory comments (default: true)
  strictMode: false,       // Enforce strict IGCSE compliance (default: false)
  customMappings: {        // Custom type mappings
    'ArrayList': 'ARRAY',
    'HashMap': 'DICTIONARY'
  }
};

const result = converter.convertJava(sourceCode, options);
```

## Error Handling

```typescript
const result = converter.convertJava(sourceCode);

if (result.success) {
  console.log('Conversion successful!');
  console.log(result.pseudocode);
  
  // Handle warnings
  if (result.warnings.length > 0) {
    console.log('Warnings:');
    result.warnings.forEach(warning => {
      console.warn(`${warning.code}: ${warning.message}`);
    });
  }
} else {
  console.error('Conversion failed');
  result.warnings.forEach(warning => {
    console.error(`Error: ${warning.message}`);
  });
}
```

## Supported Language Features

### Java
- ✅ Control structures (if/else, while, for, do-while)
- ✅ Methods and functions (void → PROCEDURE, return type → FUNCTION)
- ✅ Variable declarations and arrays
- ✅ Classes and inheritance (converted with explanatory comments)
- ✅ Static methods and variables
- ✅ Basic object-oriented features
- ⚠️ Generics (simplified with warnings)
- ⚠️ Exception handling (converted to conditional checks)

### TypeScript
- ✅ Functions and arrow functions
- ✅ Type annotations
- ✅ Control structures
- ✅ ES6+ features (destructuring, template literals)
- ✅ Arrays and basic data structures
- ⚠️ Interfaces (converted to comments)
- ⚠️ Generics (simplified with warnings)
- ⚠️ Decorators (ignored with warnings)

## Documentation

- **[API Documentation](docs/API.md)** - Complete API reference
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute to the project
- **[IGCSE Standards](docs/igcse-psuedocode-rule.md)** - IGCSE pseudocode rules and standards

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Clean build artifacts
npm run clean
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details on:
- Setting up the development environment
- Code style guidelines
- Testing requirements
- Submitting pull requests

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- IGCSE pseudocode standards from Cambridge International Examinations
- TypeScript compiler API for parsing support
- Java parser library for Java syntax analysis