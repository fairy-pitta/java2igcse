# Basic TypeScript Examples

This file contains simple TypeScript code examples and their IGCSE pseudocode conversions.

## Variable Declarations

### Example 1: Type Annotations

**TypeScript Input:**
```typescript
let age: number = 25;
let name: string = "Alice";
let isActive: boolean = true;
let score: number = 95.5;
```

**IGCSE Output:**
```
DECLARE age : INTEGER ← 25
DECLARE name : STRING ← "Alice"
DECLARE isActive : BOOLEAN ← TRUE
DECLARE score : REAL ← 95.5
```

**Explanation:**
- `number` type maps to `INTEGER` for whole numbers, `REAL` for decimals
- `string` becomes `STRING`
- `boolean` becomes `BOOLEAN` with uppercase values

### Example 2: Type Inference

**TypeScript Input:**
```typescript
let count = 10;        // inferred as number
let message = "Hello"; // inferred as string
let flag = false;      // inferred as boolean
```

**IGCSE Output:**
```
DECLARE count : INTEGER ← 10
DECLARE message : STRING ← "Hello"
DECLARE flag : BOOLEAN ← FALSE
```

**Explanation:**
- Types are inferred from initial values
- Conversion follows the same rules as explicit types

### Example 3: Const and Let

**TypeScript Input:**
```typescript
const PI = 3.14159;
let radius = 5;
let area = PI * radius * radius;
```

**IGCSE Output:**
```
DECLARE PI : REAL ← 3.14159
DECLARE radius : INTEGER ← 5
DECLARE area : REAL ← PI * radius * radius
```

**Explanation:**
- Both `const` and `let` become `DECLARE` statements
- Constant nature is not explicitly preserved in IGCSE

## Arrays

### Example 4: Array Type Annotations

**TypeScript Input:**
```typescript
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Alice", "Bob", "Charlie"];
let flags: boolean[] = [true, false, true];
```

**IGCSE Output:**
```
DECLARE numbers : ARRAY[1:5] OF INTEGER ← [1, 2, 3, 4, 5]
DECLARE names : ARRAY[1:3] OF STRING ← ["Alice", "Bob", "Charlie"]
DECLARE flags : ARRAY[1:3] OF BOOLEAN ← [TRUE, FALSE, TRUE]
```

**Explanation:**
- Array syntax `type[]` becomes `ARRAY[1:size] OF type`
- Array literals are preserved with type conversion

### Example 5: Array Constructor

**TypeScript Input:**
```typescript
let scores: number[] = new Array(10);
let items: string[] = new Array("a", "b", "c");
```

**IGCSE Output:**
```
DECLARE scores : ARRAY[1:10] OF INTEGER
DECLARE items : ARRAY[1:3] OF STRING ← ["a", "b", "c"]
```

**Explanation:**
- `new Array(size)` creates uninitialized array
- `new Array(items...)` creates initialized array

## Functions

### Example 6: Function Declaration

**TypeScript Input:**
```typescript
function greet(name: string): string {
    return "Hello, " + name;
}
```

**IGCSE Output:**
```
FUNCTION greet(name : STRING) RETURNS STRING
   RETURN "Hello, " + name
ENDFUNCTION
```

**Explanation:**
- Functions with return values become `FUNCTION`
- Parameter and return types are preserved

### Example 7: Void Function

**TypeScript Input:**
```typescript
function printMessage(message: string): void {
    console.log(message);
}
```

**IGCSE Output:**
```
PROCEDURE printMessage(message : STRING)
   OUTPUT message
ENDPROCEDURE
```

**Explanation:**
- `void` functions become `PROCEDURE`
- `console.log()` becomes `OUTPUT`

### Example 8: Arrow Functions

**TypeScript Input:**
```typescript
const add = (a: number, b: number): number => {
    return a + b;
};

const multiply = (x: number, y: number): number => x * y;
```

**IGCSE Output:**
```
FUNCTION add(a : INTEGER, b : INTEGER) RETURNS INTEGER
   RETURN a + b
ENDFUNCTION

FUNCTION multiply(x : INTEGER, y : INTEGER) RETURNS INTEGER
   RETURN x * y
ENDFUNCTION
```

**Explanation:**
- Arrow functions are converted to named functions
- Both block and expression forms are supported

### Example 9: Optional Parameters

**TypeScript Input:**
```typescript
function createUser(name: string, age?: number): string {
    if (age !== undefined) {
        return `${name} is ${age} years old`;
    }
    return `User: ${name}`;
}
```

**IGCSE Output:**
```
FUNCTION createUser(name : STRING, age : INTEGER) RETURNS STRING
   // Optional parameter: age
   IF age <> UNDEFINED THEN
      RETURN name + " is " + age + " years old"
   ENDIF
   RETURN "User: " + name
ENDFUNCTION
```

**Explanation:**
- Optional parameters become regular parameters with comments
- Template literals are converted to string concatenation

## Control Structures

### Example 10: If Statement with Type Guards

**TypeScript Input:**
```typescript
function processValue(value: number | string): void {
    if (typeof value === "number") {
        console.log("Number: " + value);
    } else {
        console.log("String: " + value);
    }
}
```

**IGCSE Output:**
```
PROCEDURE processValue(value : STRING)
   // Union type parameter: number | string
   IF typeof value = "number" THEN
      OUTPUT "Number: " + value
   ELSE
      OUTPUT "String: " + value
   ENDIF
ENDPROCEDURE
```

**Explanation:**
- Union types are simplified with comments
- Type guards are preserved as conditional checks

### Example 11: For-Of Loop

**TypeScript Input:**
```typescript
const fruits: string[] = ["apple", "banana", "orange"];
for (const fruit of fruits) {
    console.log(fruit);
}
```

**IGCSE Output:**
```
DECLARE fruits : ARRAY[1:3] OF STRING ← ["apple", "banana", "orange"]
FOR i ← 1 TO 3
   DECLARE fruit : STRING ← fruits[i]
   OUTPUT fruit
NEXT i
```

**Explanation:**
- `for-of` loops are converted to traditional `FOR` loops
- Loop variable is created to access array elements

### Example 12: While Loop

**TypeScript Input:**
```typescript
let count: number = 0;
while (count < 5) {
    console.log(`Count: ${count}`);
    count++;
}
```

**IGCSE Output:**
```
DECLARE count : INTEGER ← 0
WHILE count < 5 DO
   OUTPUT "Count: " + count
   count ← count + 1
ENDWHILE
```

**Explanation:**
- Template literals become string concatenation
- Increment operator becomes explicit assignment

## ES6+ Features

### Example 13: Template Literals

**TypeScript Input:**
```typescript
const name: string = "John";
const age: number = 30;
const message: string = `Hello, my name is ${name} and I am ${age} years old.`;
```

**IGCSE Output:**
```
DECLARE name : STRING ← "John"
DECLARE age : INTEGER ← 30
DECLARE message : STRING ← "Hello, my name is " + name + " and I am " + age + " years old."
```

**Explanation:**
- Template literals are converted to string concatenation
- Expressions within `${}` are preserved

### Example 14: Destructuring Assignment

**TypeScript Input:**
```typescript
const person = { name: "Alice", age: 25 };
const { name, age } = person;

const numbers: number[] = [1, 2, 3];
const [first, second] = numbers;
```

**IGCSE Output:**
```
DECLARE person : OBJECT ← { name: "Alice", age: 25 }
// Destructuring assignment
DECLARE name : STRING ← person.name
DECLARE age : INTEGER ← person.age

DECLARE numbers : ARRAY[1:3] OF INTEGER ← [1, 2, 3]
// Array destructuring
DECLARE first : INTEGER ← numbers[1]
DECLARE second : INTEGER ← numbers[2]
```

**Explanation:**
- Destructuring is converted to individual assignments
- Comments explain the original destructuring intent

### Example 15: Default Parameters

**TypeScript Input:**
```typescript
function greetUser(name: string, greeting: string = "Hello"): string {
    return `${greeting}, ${name}!`;
}
```

**IGCSE Output:**
```
FUNCTION greetUser(name : STRING, greeting : STRING) RETURNS STRING
   // Default parameter: greeting = "Hello"
   IF greeting = UNDEFINED THEN
      greeting ← "Hello"
   ENDIF
   RETURN greeting + ", " + name + "!"
ENDFUNCTION
```

**Explanation:**
- Default parameters are handled with conditional assignment
- Comments indicate the default value

## Object Operations

### Example 16: Object Literals

**TypeScript Input:**
```typescript
interface Person {
    name: string;
    age: number;
}

const person: Person = {
    name: "Bob",
    age: 28
};

console.log(person.name);
console.log(person.age);
```

**IGCSE Output:**
```
// Interface: Person
DECLARE person : OBJECT ← {
   name: "Bob",
   age: 28
}

OUTPUT person.name
OUTPUT person.age
```

**Explanation:**
- Interfaces are converted to comments
- Object literals are preserved with property access

### Example 17: Object Methods

**TypeScript Input:**
```typescript
const calculator = {
    add: function(a: number, b: number): number {
        return a + b;
    },
    
    multiply: (x: number, y: number): number => x * y
};

const sum = calculator.add(5, 3);
const product = calculator.multiply(4, 6);
```

**IGCSE Output:**
```
// Object with methods
FUNCTION calculator_add(a : INTEGER, b : INTEGER) RETURNS INTEGER
   RETURN a + b
ENDFUNCTION

FUNCTION calculator_multiply(x : INTEGER, y : INTEGER) RETURNS INTEGER
   RETURN x * y
ENDFUNCTION

DECLARE sum : INTEGER ← calculator_add(5, 3)
DECLARE product : INTEGER ← calculator_multiply(4, 6)
```

**Explanation:**
- Object methods are extracted as separate functions
- Method calls are converted to function calls

## Type Conversions

### Example 18: Explicit Type Conversions

**TypeScript Input:**
```typescript
const numStr: string = "123";
const num: number = parseInt(numStr);
const floatStr: string = "45.67";
const floatNum: number = parseFloat(floatStr);
const boolStr: string = String(true);
```

**IGCSE Output:**
```
DECLARE numStr : STRING ← "123"
DECLARE num : INTEGER ← INT(numStr)
DECLARE floatStr : STRING ← "45.67"
DECLARE floatNum : REAL ← REAL(floatStr)
DECLARE boolStr : STRING ← STRING(TRUE)
```

**Explanation:**
- `parseInt()` becomes `INT()`
- `parseFloat()` becomes `REAL()`
- `String()` becomes `STRING()`

### Example 19: String Operations

**TypeScript Input:**
```typescript
const text: string = "Hello World";
const length: number = text.length;
const upper: string = text.toUpperCase();
const lower: string = text.toLowerCase();
const substr: string = text.substring(0, 5);
const char: string = text.charAt(1);
```

**IGCSE Output:**
```
DECLARE text : STRING ← "Hello World"
DECLARE length : INTEGER ← LENGTH(text)
DECLARE upper : STRING ← UCASE(text)
DECLARE lower : STRING ← LCASE(text)
DECLARE substr : STRING ← SUBSTRING(text, 1, 5)
DECLARE char : STRING ← MID(text, 2, 1)
```

**Explanation:**
- String methods are converted to IGCSE string functions
- Index parameters are adjusted for 1-based indexing

## Error Handling

### Example 20: Try-Catch (Simplified)

**TypeScript Input:**
```typescript
function divide(a: number, b: number): number {
    try {
        if (b === 0) {
            throw new Error("Division by zero");
        }
        return a / b;
    } catch (error) {
        console.log("Error: " + error.message);
        return 0;
    }
}
```

**IGCSE Output:**
```
FUNCTION divide(a : INTEGER, b : INTEGER) RETURNS INTEGER
   // Exception handling converted to conditional checks
   IF b = 0 THEN
      OUTPUT "Error: Division by zero"
      RETURN 0
   ENDIF
   RETURN a / b
ENDFUNCTION
```

**Explanation:**
- Try-catch blocks are converted to conditional error checking
- Error conditions are handled with IF statements
- Comments explain the original exception handling intent