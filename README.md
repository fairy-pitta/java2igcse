# java2igcse

Convert Java and TypeScript code to IGCSE pseudocode format.

## Description

java2igcse is an npm library designed for educators to convert Java and TypeScript source code into IGCSE (International General Certificate of Secondary Education) compliant pseudocode. This tool helps translate actual code into standardized pseudocode format that follows IGCSE curriculum guidelines.

## Installation

```bash
npm install java2igcse
```

## Usage

```typescript
import { Java2IGCSEConverter } from 'java2igcse';

const converter = new Java2IGCSEConverter();

// Convert Java code
const javaCode = `
if (x > 0) {
    System.out.println("positive");
}
`;
const result = converter.convertJava(javaCode);
console.log(result.pseudocode);
// Output: IF x > 0 THEN
//             OUTPUT "positive"
//         ENDIF

// Convert TypeScript code
const tsCode = `
if (x > 0) {
    console.log("positive");
}
`;
const tsResult = converter.convertTypeScript(tsCode);
console.log(tsResult.pseudocode);
```

## Features

- Convert Java code to IGCSE pseudocode
- Convert TypeScript code to IGCSE pseudocode
- Support for control structures (if/else, loops, functions)
- Proper variable declaration conversion
- IGCSE-compliant syntax and formatting

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

# Lint code
npm run lint

# Format code
npm run format
```

## License

MIT