# Troubleshooting Guide

This guide helps you resolve common issues when using java2igcse.

## Common Issues

### Installation Issues

#### Issue: `npm install java2igcse` fails
**Symptoms:**
- Package not found error
- Network timeout during installation
- Permission denied errors

**Solutions:**
1. **Check npm registry:**
   ```bash
   npm config get registry
   # Should return https://registry.npmjs.org/
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

3. **Use different installation method:**
   ```bash
   # Try with yarn
   yarn add java2igcse
   
   # Or install globally first
   npm install -g java2igcse
   ```

4. **Permission issues (Linux/Mac):**
   ```bash
   sudo npm install java2igcse
   # Or configure npm to use different directory
   npm config set prefix ~/.npm-global
   ```

### Conversion Issues

#### Issue: "Parse error" when converting valid code
**Symptoms:**
- `ConversionResult.success` is `false`
- Error message mentions parsing failure
- Code appears syntactically correct

**Solutions:**
1. **Check for unsupported syntax:**
   ```typescript
   // Problematic: Complex generics
   Map<String, List<Integer>> map = new HashMap<>();
   
   // Better: Simplified types
   Map map = new HashMap(); // Will generate warning but convert
   ```

2. **Validate input encoding:**
   ```typescript
   // Ensure string is properly encoded
   const sourceCode = Buffer.from(rawCode, 'utf8').toString();
   const result = converter.convertJava(sourceCode);
   ```

3. **Break down complex code:**
   ```typescript
   // Instead of converting entire class at once
   const classCode = `public class Example { ... }`;
   
   // Convert methods individually
   const methodCode = `public void method() { ... }`;
   const result = converter.convertJava(methodCode);
   ```

#### Issue: Output pseudocode is incorrect or malformed
**Symptoms:**
- Pseudocode doesn't follow IGCSE standards
- Missing keywords or incorrect syntax
- Indentation problems

**Solutions:**
1. **Check conversion options:**
   ```typescript
   const options: ConversionOptions = {
     indentSize: 3,        // IGCSE standard
     includeComments: true, // Helpful for complex conversions
     strictMode: true      // Enforce IGCSE compliance
   };
   ```

2. **Review warnings:**
   ```typescript
   const result = converter.convertJava(sourceCode);
   if (result.warnings.length > 0) {
     result.warnings.forEach(warning => {
       console.log(`Warning: ${warning.message}`);
       if (warning.line) {
         console.log(`  at line ${warning.line}`);
       }
     });
   }
   ```

3. **Validate against IGCSE standards:**
   ```typescript
   // Check that output uses correct keywords
   const pseudocode = result.pseudocode;
   
   // Should contain IGCSE keywords
   const hasIGCSEKeywords = /\b(IF|THEN|ENDIF|WHILE|ENDWHILE|FOR|NEXT|PROCEDURE|ENDPROCEDURE)\b/.test(pseudocode);
   ```

#### Issue: "Unsupported feature" warnings
**Symptoms:**
- Conversion succeeds but with many warnings
- Some code sections missing from output
- Warning codes like `UNSUPPORTED_FEATURE`

**Solutions:**
1. **Review unsupported features:**
   ```typescript
   // These features generate warnings:
   
   // Generics - simplified to base types
   List<String> list = new ArrayList<String>();
   // Becomes: DECLARE list : ARRAY[1:SIZE] OF STRING
   
   // Lambda expressions - converted to named functions
   list.forEach(item -> System.out.println(item));
   // Becomes: PROCEDURE forEach_callback(item : STRING) ...
   
   // Exception handling - converted to conditional checks
   try { ... } catch (Exception e) { ... }
   // Becomes: // Exception handling converted to conditional checks
   ```

2. **Use alternative approaches:**
   ```typescript
   // Instead of complex inheritance
   class Dog extends Animal implements Runnable { ... }
   
   // Use simpler structure
   class Dog {
     // Methods from Animal and Runnable copied here
   }
   ```

3. **Enable strict mode for better compliance:**
   ```typescript
   const result = converter.convertJava(sourceCode, { strictMode: true });
   ```

### Performance Issues

#### Issue: Conversion takes too long
**Symptoms:**
- Conversion hangs or takes more than 30 seconds
- High memory usage
- Browser becomes unresponsive

**Solutions:**
1. **Break down large files:**
   ```typescript
   // Instead of converting entire file
   const largeFile = fs.readFileSync('LargeClass.java', 'utf8');
   
   // Split into smaller chunks
   const methods = extractMethods(largeFile);
   const results = methods.map(method => converter.convertJava(method));
   ```

2. **Optimize code structure:**
   ```typescript
   // Avoid deeply nested structures
   // This is problematic:
   for (int i = 0; i < 10; i++) {
     for (int j = 0; j < 10; j++) {
       for (int k = 0; k < 10; k++) {
         for (int l = 0; l < 10; l++) {
           // Very deep nesting
         }
       }
     }
   }
   
   // Better: Extract to separate methods
   public void processData() {
     for (int i = 0; i < 10; i++) {
       processRow(i);
     }
   }
   ```

3. **Monitor memory usage:**
   ```typescript
   const startMemory = process.memoryUsage();
   const result = converter.convertJava(sourceCode);
   const endMemory = process.memoryUsage();
   
   console.log(`Memory used: ${endMemory.heapUsed - startMemory.heapUsed} bytes`);
   ```

### Type Conversion Issues

#### Issue: Incorrect type mappings
**Symptoms:**
- Java `int` becomes `REAL` instead of `INTEGER`
- TypeScript `number` mapping is inconsistent
- Array types not converted properly

**Solutions:**
1. **Use custom mappings:**
   ```typescript
   const options: ConversionOptions = {
     customMappings: {
       'int': 'INTEGER',
       'double': 'REAL',
       'String': 'STRING',
       'ArrayList': 'ARRAY'
     }
   };
   ```

2. **Check type inference:**
   ```typescript
   // Be explicit about types
   // Instead of:
   var x = 5; // Type inferred, might be wrong
   
   // Use:
   int x = 5; // Explicit type
   ```

3. **Validate array conversions:**
   ```typescript
   // Java arrays
   int[] numbers = new int[10];
   // Should become: DECLARE numbers : ARRAY[1:10] OF INTEGER
   
   // TypeScript arrays
   const numbers: number[] = new Array(10);
   // Should become: DECLARE numbers : ARRAY[1:10] OF REAL
   ```

## Error Codes Reference

### Parse Errors
- **PARSE_ERROR**: Syntax error in source code
- **INVALID_INPUT**: Input is null, undefined, or not a string
- **ENCODING_ERROR**: Character encoding issues

### Conversion Errors
- **TRANSFORM_ERROR**: Failed to convert AST to intermediate representation
- **UNSUPPORTED_FEATURE**: Language feature not supported in IGCSE pseudocode
- **TYPE_CONVERSION_ERROR**: Unable to map source type to IGCSE type

### Generation Errors
- **GENERATION_ERROR**: Failed to generate pseudocode from intermediate representation
- **FORMATTING_ERROR**: Error in output formatting

### Runtime Errors
- **UNEXPECTED_ERROR**: Unexpected error during conversion
- **MEMORY_ERROR**: Out of memory during conversion
- **TIMEOUT_ERROR**: Conversion took too long

## Debugging Tips

### Enable Verbose Logging
```typescript
// Create converter with debug options
const converter = new Java2IGCSEConverterImpl();

// Convert with detailed options
const result = converter.convertJava(sourceCode, {
  includeComments: true,  // Include all explanatory comments
  strictMode: false       // Allow more lenient conversion
});

// Examine all warnings
result.warnings.forEach((warning, index) => {
  console.log(`Warning ${index + 1}:`);
  console.log(`  Code: ${warning.code}`);
  console.log(`  Message: ${warning.message}`);
  console.log(`  Location: Line ${warning.line}, Column ${warning.column}`);
  console.log(`  Severity: ${warning.severity}`);
});
```

### Validate Input
```typescript
function validateSourceCode(sourceCode: string): boolean {
  // Check basic requirements
  if (!sourceCode || typeof sourceCode !== 'string') {
    console.error('Invalid source code: must be a non-empty string');
    return false;
  }
  
  // Check for common problematic patterns
  const problematicPatterns = [
    /\u0000/,           // Null characters
    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/, // Control characters
  ];
  
  for (const pattern of problematicPatterns) {
    if (pattern.test(sourceCode)) {
      console.error('Source code contains problematic characters');
      return false;
    }
  }
  
  return true;
}

// Use validation before conversion
if (validateSourceCode(sourceCode)) {
  const result = converter.convertJava(sourceCode);
}
```

### Test with Minimal Examples
```typescript
// Start with simple code to isolate issues
const simpleTest = `
int x = 5;
if (x > 0) {
    System.out.println("positive");
}
`;

const result = converter.convertJava(simpleTest);
console.log('Simple test result:', result.success);

// Gradually add complexity
const complexTest = `
public class Example {
    public static void main(String[] args) {
        ${simpleTest}
    }
}
`;
```

## Getting Help

### Before Reporting Issues
1. **Check this troubleshooting guide**
2. **Review the API documentation**
3. **Test with minimal code examples**
4. **Check for similar issues in the repository**

### When Reporting Issues
Include the following information:
- **Version of java2igcse**
- **Node.js version**
- **Operating system**
- **Complete source code that causes the issue**
- **Expected output**
- **Actual output**
- **Full error messages and stack traces**
- **Conversion options used**

### Example Issue Report
```
**Environment:**
- java2igcse version: 1.0.0
- Node.js version: 18.17.0
- OS: macOS 13.4

**Problem:**
Converting Java for-loop produces incorrect IGCSE pseudocode

**Source Code:**
```java
for (int i = 0; i < 10; i += 2) {
    System.out.println(i);
}
```

**Expected Output:**
```
FOR i ← 0 TO 9 STEP 2
   OUTPUT i
NEXT i
```

**Actual Output:**
```
FOR i ← 0 TO 10
   OUTPUT i
NEXT i
```

**Options Used:**
```typescript
{ indentSize: 3, includeComments: true, strictMode: true }
```
```

### Community Resources
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Comprehensive API and usage guides
- **Examples**: Sample code and conversion examples

## FAQ

### Q: Why does my Java code convert differently than expected?
A: IGCSE pseudocode has different conventions than Java. The converter follows IGCSE standards, which may differ from Java syntax. Check the conversion warnings for explanations.

### Q: Can I convert entire Java projects?
A: The library is designed for individual code snippets or single files. For entire projects, convert files individually and combine the results.

### Q: Why are some TypeScript features not supported?
A: IGCSE pseudocode is designed for educational purposes and doesn't include advanced programming concepts like generics, decorators, or complex type systems.

### Q: How can I improve conversion accuracy?
A: Use simpler code structures, avoid advanced language features, and enable strict mode for better IGCSE compliance.

### Q: Is the converter suitable for production use?
A: The converter is designed for educational purposes. While it's stable, always review the generated pseudocode for accuracy before using in educational materials.