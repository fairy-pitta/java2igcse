# IGCSE Pseudocode Rules and Standards

## Overview

This document defines the pseudocode standards used in IGCSE Computer Science curriculum. All code conversions must adhere to these rules to ensure consistency with examination requirements.

## Basic Structure

### Program Structure
```
BEGIN
    // Program statements
END
```

### Comments
```
// Single line comment
/* Multi-line comment */
```

## Variable Declarations

### Basic Variables
```
DECLARE variable_name : DATA_TYPE
DECLARE variable_name : DATA_TYPE ← initial_value
```

### Data Types
- `INTEGER` - Whole numbers
- `REAL` - Decimal numbers  
- `STRING` - Text values
- `CHAR` - Single character
- `BOOLEAN` - True/False values
- `DATE` - Date values

### Arrays
```
DECLARE array_name : ARRAY[1:size] OF DATA_TYPE
DECLARE matrix : ARRAY[1:rows, 1:cols] OF DATA_TYPE
```

## Control Structures

### Selection (If Statements)

#### Simple If
```
IF condition THEN
    statements
ENDIF
```

#### If-Else
```
IF condition THEN
    statements
ELSE
    statements
ENDIF
```

#### If-Else If-Else
```
IF condition1 THEN
    statements
ELSE IF condition2 THEN
    statements
ELSE IF condition3 THEN
    statements
ELSE
    statements
ENDIF
```

### Case/Switch Statements
```
CASE OF variable
    value1: statements
    value2: statements
    value3: statements
    OTHERWISE: statements
ENDCASE
```

## Iteration (Loops)

### While Loop
```
WHILE condition DO
    statements
ENDWHILE
```

### Repeat-Until Loop
```
REPEAT
    statements
UNTIL condition
```

### For Loop (Count-controlled)
```
FOR variable ← start_value TO end_value
    statements
NEXT variable
```

### For Loop with Step
```
FOR variable ← start_value TO end_value STEP step_value
    statements
NEXT variable
```

## Procedures and Functions

### Procedures (No Return Value)
```
PROCEDURE procedure_name(parameter1 : TYPE, parameter2 : TYPE)
    statements
ENDPROCEDURE
```

### Functions (With Return Value)
```
FUNCTION function_name(parameter1 : TYPE, parameter2 : TYPE) RETURNS TYPE
    statements
    RETURN value
ENDFUNCTION
```

### Calling Procedures and Functions
```
CALL procedure_name(arguments)
variable ← function_name(arguments)
```

## Input/Output

### Input
```
INPUT variable
INPUT "prompt", variable
```

### Output
```
OUTPUT expression
OUTPUT "text", variable
```

## Operators

### Arithmetic Operators
- `+` Addition
- `-` Subtraction  
- `*` Multiplication
- `/` Division
- `MOD` Modulus (remainder)
- `DIV` Integer division

### Comparison Operators
- `=` Equal to
- `<>` Not equal to
- `<` Less than
- `>` Greater than
- `<=` Less than or equal to
- `>=` Greater than or equal to

### Logical Operators
- `AND` Logical AND
- `OR` Logical OR
- `NOT` Logical NOT

### Assignment
```
variable ← expression
```

## String Operations

### String Functions
- `LENGTH(string)` - Returns length of string
- `SUBSTRING(string, start, length)` - Extract substring
- `LEFT(string, length)` - Extract from left
- `RIGHT(string, length)` - Extract from right
- `MID(string, start, length)` - Extract from middle

### String Concatenation
```
result ← string1 & string2
```

## File Operations

### File Handling
```
OPENFILE filename FOR READ/WRITE/APPEND
READFILE filename, variable
WRITEFILE filename, data
CLOSEFILE filename
```

## Error Handling

### Try-Catch Equivalent
```
// Use comments to indicate error handling
// TRY equivalent - attempt operation
// CATCH equivalent - handle errors
```

## Object-Oriented Concepts

Since IGCSE pseudocode is primarily procedural, object-oriented concepts should be converted as follows:

### Classes
```
// Class: ClassName
// Properties: property1, property2
// Methods: method1(), method2()

PROCEDURE ClassName_method1(object_reference : ClassName)
    // Method implementation
ENDPROCEDURE
```

### Inheritance
```
// ChildClass inherits from ParentClass
// Additional properties: child_property
// Overridden methods: method_name()
```

### Static Methods
```
// Static method - belongs to class, not instance
PROCEDURE ClassName_static_method()
    // Implementation
ENDPROCEDURE
```

## Formatting Rules

### Indentation
- Use 4 spaces for each level of indentation
- Maintain consistent indentation throughout

### Naming Conventions
- Use descriptive variable names
- Use snake_case for variables and procedures
- Use UPPER_CASE for constants

### Line Structure
- One statement per line
- Keep lines reasonably short (under 80 characters when possible)
- Use blank lines to separate logical sections

## Special Considerations for Code Conversion

### Java/TypeScript to IGCSE Mapping

1. **Method Overloading**: Convert to separate procedures with descriptive names
2. **Exception Handling**: Convert to conditional checks with comments
3. **Complex Data Structures**: Simplify to arrays or explain with comments
4. **Lambda Functions**: Convert to named procedures
5. **Generics**: Remove type parameters, use comments to explain
6. **Access Modifiers**: Use comments to indicate visibility

### Unsupported Features

Features that cannot be directly converted should be handled with:
- Comments explaining the original concept
- Simplified procedural equivalent where possible
- Warning messages in conversion output