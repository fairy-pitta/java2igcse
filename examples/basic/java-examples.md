# Basic Java Examples

This file contains simple Java code examples and their IGCSE pseudocode conversions.

## Variable Declarations

### Example 1: Simple Variable Declaration

**Java Input:**
```java
int age = 25;
String name = "John";
boolean isStudent = true;
```

**IGCSE Output:**
```
DECLARE age : INTEGER ← 25
DECLARE name : STRING ← "John"
DECLARE isStudent : BOOLEAN ← TRUE
```

**Explanation:**
- Java primitive types are mapped to IGCSE types
- Assignment operator `=` becomes `←`
- Boolean values are converted to uppercase

### Example 2: Array Declaration

**Java Input:**
```java
int[] numbers = new int[5];
String[] names = {"Alice", "Bob", "Charlie"};
```

**IGCSE Output:**
```
DECLARE numbers : ARRAY[1:5] OF INTEGER
DECLARE names : ARRAY[1:3] OF STRING ← {"Alice", "Bob", "Charlie"}
```

**Explanation:**
- Java arrays use 0-based indexing, IGCSE uses 1-based
- Array size is determined from declaration or initialization

## Control Structures

### Example 3: Simple If Statement

**Java Input:**
```java
if (x > 0) {
    System.out.println("Positive");
}
```

**IGCSE Output:**
```
IF x > 0 THEN
   OUTPUT "Positive"
ENDIF
```

**Explanation:**
- Java `if` becomes `IF/THEN/ENDIF`
- `System.out.println()` becomes `OUTPUT`

### Example 4: If-Else Statement

**Java Input:**
```java
if (score >= 60) {
    System.out.println("Pass");
} else {
    System.out.println("Fail");
}
```

**IGCSE Output:**
```
IF score >= 60 THEN
   OUTPUT "Pass"
ELSE
   OUTPUT "Fail"
ENDIF
```

**Explanation:**
- Standard if-else conversion with proper IGCSE structure

### Example 5: If-Else If Chain

**Java Input:**
```java
if (grade >= 90) {
    System.out.println("A");
} else if (grade >= 80) {
    System.out.println("B");
} else if (grade >= 70) {
    System.out.println("C");
} else {
    System.out.println("F");
}
```

**IGCSE Output:**
```
IF grade >= 90 THEN
   OUTPUT "A"
ELSE IF grade >= 80 THEN
   OUTPUT "B"
ELSE IF grade >= 70 THEN
   OUTPUT "C"
ELSE
   OUTPUT "F"
ENDIF
```

**Explanation:**
- Multiple `else if` conditions are preserved in IGCSE format

## Loops

### Example 6: While Loop

**Java Input:**
```java
int i = 0;
while (i < 5) {
    System.out.println(i);
    i++;
}
```

**IGCSE Output:**
```
DECLARE i : INTEGER ← 0
WHILE i < 5 DO
   OUTPUT i
   i ← i + 1
ENDWHILE
```

**Explanation:**
- `while` becomes `WHILE/DO/ENDWHILE`
- `i++` becomes `i ← i + 1`

### Example 7: For Loop

**Java Input:**
```java
for (int i = 0; i < 10; i++) {
    System.out.println("Number: " + i);
}
```

**IGCSE Output:**
```
FOR i ← 0 TO 9
   OUTPUT "Number: " + i
NEXT i
```

**Explanation:**
- Java for loop becomes `FOR/TO/NEXT`
- Upper bound is adjusted (`i < 10` becomes `TO 9`)
- String concatenation with `+` is preserved

### Example 8: For Loop with Step

**Java Input:**
```java
for (int i = 0; i < 20; i += 2) {
    System.out.println(i);
}
```

**IGCSE Output:**
```
FOR i ← 0 TO 19 STEP 2
   OUTPUT i
NEXT i
```

**Explanation:**
- Step value is extracted from increment expression
- Upper bound adjusted for step increment

### Example 9: Do-While Loop

**Java Input:**
```java
int count = 0;
do {
    System.out.println("Count: " + count);
    count++;
} while (count < 3);
```

**IGCSE Output:**
```
DECLARE count : INTEGER ← 0
REPEAT
   OUTPUT "Count: " + count
   count ← count + 1
UNTIL count >= 3
```

**Explanation:**
- `do-while` becomes `REPEAT/UNTIL`
- Condition is inverted (`count < 3` becomes `count >= 3`)

## Methods

### Example 10: Void Method (Procedure)

**Java Input:**
```java
public void printMessage(String message) {
    System.out.println("Message: " + message);
}
```

**IGCSE Output:**
```
PROCEDURE printMessage(message : STRING)
   OUTPUT "Message: " + message
ENDPROCEDURE
```

**Explanation:**
- `void` methods become `PROCEDURE`
- Parameters include type annotations

### Example 11: Method with Return Value (Function)

**Java Input:**
```java
public int add(int a, int b) {
    return a + b;
}
```

**IGCSE Output:**
```
FUNCTION add(a : INTEGER, b : INTEGER) RETURNS INTEGER
   RETURN a + b
ENDFUNCTION
```

**Explanation:**
- Methods with return values become `FUNCTION`
- Return type is specified with `RETURNS`

### Example 12: Static Method

**Java Input:**
```java
public static void main(String[] args) {
    System.out.println("Hello World");
}
```

**IGCSE Output:**
```
// Static method
PROCEDURE main(args : ARRAY[1:SIZE] OF STRING)
   OUTPUT "Hello World"
ENDPROCEDURE
```

**Explanation:**
- Static methods include explanatory comment
- `String[] args` becomes array parameter

## Operators

### Example 13: Arithmetic Operators

**Java Input:**
```java
int a = 10;
int b = 3;
int sum = a + b;
int difference = a - b;
int product = a * b;
int quotient = a / b;
int remainder = a % b;
```

**IGCSE Output:**
```
DECLARE a : INTEGER ← 10
DECLARE b : INTEGER ← 3
DECLARE sum : INTEGER ← a + b
DECLARE difference : INTEGER ← a - b
DECLARE product : INTEGER ← a * b
DECLARE quotient : INTEGER ← a / b
DECLARE remainder : INTEGER ← a MOD b
```

**Explanation:**
- Most operators remain the same
- Modulo operator `%` becomes `MOD`

### Example 14: Comparison Operators

**Java Input:**
```java
boolean equal = (a == b);
boolean notEqual = (a != b);
boolean greater = (a > b);
boolean less = (a < b);
boolean greaterEqual = (a >= b);
boolean lessEqual = (a <= b);
```

**IGCSE Output:**
```
DECLARE equal : BOOLEAN ← (a = b)
DECLARE notEqual : BOOLEAN ← (a <> b)
DECLARE greater : BOOLEAN ← (a > b)
DECLARE less : BOOLEAN ← (a < b)
DECLARE greaterEqual : BOOLEAN ← (a >= b)
DECLARE lessEqual : BOOLEAN ← (a <= b)
```

**Explanation:**
- `==` becomes `=`
- `!=` becomes `<>`
- Other comparison operators remain the same

### Example 15: Logical Operators

**Java Input:**
```java
boolean result1 = (a > 0) && (b > 0);
boolean result2 = (a > 0) || (b > 0);
boolean result3 = !(a > 0);
```

**IGCSE Output:**
```
DECLARE result1 : BOOLEAN ← (a > 0) AND (b > 0)
DECLARE result2 : BOOLEAN ← (a > 0) OR (b > 0)
DECLARE result3 : BOOLEAN ← NOT (a > 0)
```

**Explanation:**
- `&&` becomes `AND`
- `||` becomes `OR`
- `!` becomes `NOT`

## String Operations

### Example 16: String Concatenation

**Java Input:**
```java
String firstName = "John";
String lastName = "Doe";
String fullName = firstName + " " + lastName;
System.out.println("Hello, " + fullName);
```

**IGCSE Output:**
```
DECLARE firstName : STRING ← "John"
DECLARE lastName : STRING ← "Doe"
DECLARE fullName : STRING ← firstName + " " + lastName
OUTPUT "Hello, " + fullName
```

**Explanation:**
- String concatenation with `+` is preserved in IGCSE

### Example 17: String Methods

**Java Input:**
```java
String text = "Hello World";
int length = text.length();
String upper = text.toUpperCase();
String sub = text.substring(0, 5);
```

**IGCSE Output:**
```
DECLARE text : STRING ← "Hello World"
DECLARE length : INTEGER ← LENGTH(text)
DECLARE upper : STRING ← UCASE(text)
DECLARE sub : STRING ← SUBSTRING(text, 1, 5)
```

**Explanation:**
- `length()` becomes `LENGTH()`
- `toUpperCase()` becomes `UCASE()`
- `substring()` becomes `SUBSTRING()` with 1-based indexing

## Array Operations

### Example 18: Array Access and Modification

**Java Input:**
```java
int[] numbers = {10, 20, 30, 40, 50};
int first = numbers[0];
numbers[1] = 25;
int length = numbers.length;
```

**IGCSE Output:**
```
DECLARE numbers : ARRAY[1:5] OF INTEGER ← {10, 20, 30, 40, 50}
DECLARE first : INTEGER ← numbers[1]
numbers[2] ← 25
DECLARE length : INTEGER ← 5
```

**Explanation:**
- Array indices converted from 0-based to 1-based
- `array.length` becomes literal size value

### Example 19: Array Iteration

**Java Input:**
```java
int[] scores = {85, 92, 78, 96, 88};
int total = 0;
for (int i = 0; i < scores.length; i++) {
    total += scores[i];
}
double average = total / scores.length;
```

**IGCSE Output:**
```
DECLARE scores : ARRAY[1:5] OF INTEGER ← {85, 92, 78, 96, 88}
DECLARE total : INTEGER ← 0
FOR i ← 1 TO 5
   total ← total + scores[i]
NEXT i
DECLARE average : REAL ← total / 5
```

**Explanation:**
- Loop bounds adjusted for 1-based array indexing
- Array length becomes literal value
- `+=` becomes explicit addition assignment

## Input Operations

### Example 20: Scanner Input

**Java Input:**
```java
Scanner scanner = new Scanner(System.in);
System.out.print("Enter your age: ");
int age = scanner.nextInt();
System.out.print("Enter your name: ");
String name = scanner.nextLine();
```

**IGCSE Output:**
```
OUTPUT "Enter your age: "
INPUT age
OUTPUT "Enter your name: "
INPUT name
```

**Explanation:**
- Scanner operations simplified to INPUT statements
- Variable declarations inferred from context
- Prompts preserved as OUTPUT statements