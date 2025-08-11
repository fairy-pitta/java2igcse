# Advanced Control Structures

This file demonstrates complex control structure conversions from Java and TypeScript to IGCSE pseudocode.

## Nested Control Structures

### Example 1: Nested If Statements

**Java Input:**
```java
public void checkGrade(int score, boolean isBonus) {
    if (score >= 0 && score <= 100) {
        if (isBonus) {
            score += 5;
            if (score > 100) {
                score = 100;
            }
        }
        
        if (score >= 90) {
            System.out.println("Grade: A");
        } else if (score >= 80) {
            System.out.println("Grade: B");
        } else if (score >= 70) {
            System.out.println("Grade: C");
        } else if (score >= 60) {
            System.out.println("Grade: D");
        } else {
            System.out.println("Grade: F");
        }
    } else {
        System.out.println("Invalid score");
    }
}
```

**IGCSE Output:**
```
PROCEDURE checkGrade(score : INTEGER, isBonus : BOOLEAN)
   IF score >= 0 AND score <= 100 THEN
      IF isBonus THEN
         score ← score + 5
         IF score > 100 THEN
            score ← 100
         ENDIF
      ENDIF
      
      IF score >= 90 THEN
         OUTPUT "Grade: A"
      ELSE IF score >= 80 THEN
         OUTPUT "Grade: B"
      ELSE IF score >= 70 THEN
         OUTPUT "Grade: C"
      ELSE IF score >= 60 THEN
         OUTPUT "Grade: D"
      ELSE
         OUTPUT "Grade: F"
      ENDIF
   ELSE
      OUTPUT "Invalid score"
   ENDIF
ENDPROCEDURE
```

**Explanation:**
- Multiple levels of nesting are preserved
- Logical operators (`&&`) become `AND`
- Proper indentation maintains structure clarity

### Example 2: Complex Loop Nesting

**Java Input:**
```java
public void printMultiplicationTable(int size) {
    for (int i = 1; i <= size; i++) {
        for (int j = 1; j <= size; j++) {
            int product = i * j;
            if (product < 10) {
                System.out.print("  " + product);
            } else if (product < 100) {
                System.out.print(" " + product);
            } else {
                System.out.print(product);
            }
            
            if (j < size) {
                System.out.print(" |");
            }
        }
        System.out.println();
        
        if (i < size) {
            for (int k = 1; k <= size; k++) {
                System.out.print("----");
                if (k < size) {
                    System.out.print("+");
                }
            }
            System.out.println();
        }
    }
}
```

**IGCSE Output:**
```
PROCEDURE printMultiplicationTable(size : INTEGER)
   FOR i ← 1 TO size
      FOR j ← 1 TO size
         DECLARE product : INTEGER ← i * j
         IF product < 10 THEN
            OUTPUT "  " + product
         ELSE IF product < 100 THEN
            OUTPUT " " + product
         ELSE
            OUTPUT product
         ENDIF
         
         IF j < size THEN
            OUTPUT " |"
         ENDIF
      NEXT j
      OUTPUT ""
      
      IF i < size THEN
         FOR k ← 1 TO size
            OUTPUT "----"
            IF k < size THEN
               OUTPUT "+"
            ENDIF
         NEXT k
         OUTPUT ""
      ENDIF
   NEXT i
ENDPROCEDURE
```

**Explanation:**
- Triple-nested loops with proper NEXT variable associations
- Complex conditional formatting logic preserved
- Multiple output statements for formatting

## Switch/Case Statements

### Example 3: Java Switch Statement

**Java Input:**
```java
public void processCommand(char command, int value) {
    switch (command) {
        case 'A':
        case 'a':
            System.out.println("Adding: " + value);
            break;
        case 'S':
        case 's':
            System.out.println("Subtracting: " + value);
            break;
        case 'M':
        case 'm':
            System.out.println("Multiplying by: " + value);
            break;
        case 'D':
        case 'd':
            if (value != 0) {
                System.out.println("Dividing by: " + value);
            } else {
                System.out.println("Cannot divide by zero");
            }
            break;
        default:
            System.out.println("Unknown command: " + command);
            break;
    }
}
```

**IGCSE Output:**
```
PROCEDURE processCommand(command : CHAR, value : INTEGER)
   CASE OF command
      'A', 'a': OUTPUT "Adding: " + value
      'S', 's': OUTPUT "Subtracting: " + value
      'M', 'm': OUTPUT "Multiplying by: " + value
      'D', 'd': 
         IF value <> 0 THEN
            OUTPUT "Dividing by: " + value
         ELSE
            OUTPUT "Cannot divide by zero"
         ENDIF
      OTHERWISE: OUTPUT "Unknown command: " + command
   ENDCASE
ENDPROCEDURE
```

**Explanation:**
- Multiple case labels are combined with commas
- Complex case logic with nested conditions
- `default` becomes `OTHERWISE`

## Loop Variations

### Example 4: Do-While with Complex Condition

**Java Input:**
```java
public void gameLoop() {
    Scanner scanner = new Scanner(System.in);
    int lives = 3;
    int score = 0;
    boolean gameWon = false;
    
    do {
        System.out.println("Lives: " + lives + ", Score: " + score);
        System.out.print("Enter command (p=play, q=quit): ");
        char command = scanner.next().charAt(0);
        
        if (command == 'p' || command == 'P') {
            int points = playRound();
            if (points > 0) {
                score += points;
                if (score >= 100) {
                    gameWon = true;
                    System.out.println("You won!");
                }
            } else {
                lives--;
                if (lives <= 0) {
                    System.out.println("Game Over!");
                }
            }
        } else if (command == 'q' || command == 'Q') {
            System.out.println("Thanks for playing!");
            break;
        } else {
            System.out.println("Invalid command");
        }
        
    } while (lives > 0 && !gameWon);
}
```

**IGCSE Output:**
```
PROCEDURE gameLoop()
   DECLARE lives : INTEGER ← 3
   DECLARE score : INTEGER ← 0
   DECLARE gameWon : BOOLEAN ← FALSE
   
   REPEAT
      OUTPUT "Lives: " + lives + ", Score: " + score
      OUTPUT "Enter command (p=play, q=quit): "
      INPUT command
      
      IF command = 'p' OR command = 'P' THEN
         DECLARE points : INTEGER ← playRound()
         IF points > 0 THEN
            score ← score + points
            IF score >= 100 THEN
               gameWon ← TRUE
               OUTPUT "You won!"
            ENDIF
         ELSE
            lives ← lives - 1
            IF lives <= 0 THEN
               OUTPUT "Game Over!"
            ENDIF
         ENDIF
      ELSE IF command = 'q' OR command = 'Q' THEN
         OUTPUT "Thanks for playing!"
         // Break statement - exit loop
         lives ← 0
         gameWon ← TRUE
      ELSE
         OUTPUT "Invalid command"
      ENDIF
      
   UNTIL lives <= 0 OR gameWon
ENDPROCEDURE
```

**Explanation:**
- `do-while` becomes `REPEAT/UNTIL`
- Complex loop condition with logical operators
- `break` statement simulated by modifying loop conditions
- Scanner input simplified to INPUT statements

### Example 5: Enhanced For Loop (Java)

**Java Input:**
```java
public void processArray(int[] numbers) {
    int sum = 0;
    int count = 0;
    
    for (int num : numbers) {
        if (num > 0) {
            sum += num;
            count++;
            System.out.println("Added: " + num + ", Running sum: " + sum);
        } else if (num < 0) {
            System.out.println("Skipped negative: " + num);
        } else {
            System.out.println("Skipped zero");
        }
    }
    
    if (count > 0) {
        double average = (double) sum / count;
        System.out.println("Average of positive numbers: " + average);
    } else {
        System.out.println("No positive numbers found");
    }
}
```

**IGCSE Output:**
```
PROCEDURE processArray(numbers : ARRAY[1:SIZE] OF INTEGER)
   DECLARE sum : INTEGER ← 0
   DECLARE count : INTEGER ← 0
   
   FOR i ← 1 TO SIZE
      DECLARE num : INTEGER ← numbers[i]
      IF num > 0 THEN
         sum ← sum + num
         count ← count + 1
         OUTPUT "Added: " + num + ", Running sum: " + sum
      ELSE IF num < 0 THEN
         OUTPUT "Skipped negative: " + num
      ELSE
         OUTPUT "Skipped zero"
      ENDIF
   NEXT i
   
   IF count > 0 THEN
      DECLARE average : REAL ← sum / count
      OUTPUT "Average of positive numbers: " + average
   ELSE
      OUTPUT "No positive numbers found"
   ENDIF
ENDPROCEDURE
```

**Explanation:**
- Enhanced for loop converted to traditional FOR loop
- Loop variable created to access array elements
- Type casting handled automatically in division

## TypeScript Advanced Control Structures

### Example 6: TypeScript Switch with Type Guards

**TypeScript Input:**
```typescript
function processInput(input: string | number | boolean): string {
    switch (typeof input) {
        case 'string':
            if (input.length > 10) {
                return `Long string: ${input.substring(0, 10)}...`;
            } else {
                return `String: ${input}`;
            }
        
        case 'number':
            if (input > 0) {
                return `Positive number: ${input}`;
            } else if (input < 0) {
                return `Negative number: ${input}`;
            } else {
                return `Zero`;
            }
        
        case 'boolean':
            return input ? 'True value' : 'False value';
        
        default:
            return 'Unknown type';
    }
}
```

**IGCSE Output:**
```
FUNCTION processInput(input : STRING) RETURNS STRING
   // Union type parameter: string | number | boolean
   CASE OF typeof input
      "string":
         IF LENGTH(input) > 10 THEN
            RETURN "Long string: " + SUBSTRING(input, 1, 10) + "..."
         ELSE
            RETURN "String: " + input
         ENDIF
      
      "number":
         IF input > 0 THEN
            RETURN "Positive number: " + input
         ELSE IF input < 0 THEN
            RETURN "Negative number: " + input
         ELSE
            RETURN "Zero"
         ENDIF
      
      "boolean":
         IF input THEN
            RETURN "True value"
         ELSE
            RETURN "False value"
         ENDIF
      
      OTHERWISE:
         RETURN "Unknown type"
   ENDCASE
ENDFUNCTION
```

**Explanation:**
- Union types simplified with comments
- Type guards preserved in switch cases
- Ternary operator converted to IF/ELSE
- Template literals become string concatenation

### Example 7: Complex Loop with Break and Continue

**TypeScript Input:**
```typescript
function findPrimes(limit: number): number[] {
    const primes: number[] = [];
    
    outerLoop: for (let candidate = 2; candidate <= limit; candidate++) {
        // Check if candidate is prime
        for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
            if (candidate % divisor === 0) {
                continue outerLoop; // Not prime, try next candidate
            }
        }
        
        // If we get here, candidate is prime
        primes.push(candidate);
        
        // Stop if we found enough primes
        if (primes.length >= 10) {
            break outerLoop;
        }
    }
    
    return primes;
}
```

**IGCSE Output:**
```
FUNCTION findPrimes(limit : INTEGER) RETURNS ARRAY[1:SIZE] OF INTEGER
   DECLARE primes : ARRAY[1:SIZE] OF INTEGER
   DECLARE primeCount : INTEGER ← 0
   
   FOR candidate ← 2 TO limit
      DECLARE isPrime : BOOLEAN ← TRUE
      
      FOR divisor ← 2 TO INT(SQRT(candidate))
         IF candidate MOD divisor = 0 THEN
            isPrime ← FALSE
            // Continue outer loop - candidate is not prime
         ENDIF
      NEXT divisor
      
      IF isPrime THEN
         primeCount ← primeCount + 1
         primes[primeCount] ← candidate
         
         IF primeCount >= 10 THEN
            // Break outer loop - found enough primes
            candidate ← limit + 1
         ENDIF
      ENDIF
   NEXT candidate
   
   RETURN primes
ENDFUNCTION
```

**Explanation:**
- Labeled break/continue converted to flag variables and condition manipulation
- Array push operation converted to indexed assignment
- Square root operation using SQRT function
- Dynamic array sizing handled with counter variable

## Error Handling in Control Structures

### Example 8: Try-Catch in Loops

**TypeScript Input:**
```typescript
function processFiles(filenames: string[]): void {
    let successCount = 0;
    let errorCount = 0;
    
    for (const filename of filenames) {
        try {
            console.log(`Processing: ${filename}`);
            
            if (filename.length === 0) {
                throw new Error("Empty filename");
            }
            
            if (!filename.endsWith('.txt')) {
                throw new Error("Invalid file extension");
            }
            
            // Simulate file processing
            const content = readFile(filename);
            if (content.length > 1000) {
                console.log(`Large file: ${filename} (${content.length} chars)`);
            }
            
            successCount++;
            console.log(`Success: ${filename}`);
            
        } catch (error) {
            errorCount++;
            console.log(`Error processing ${filename}: ${error.message}`);
            
            if (errorCount > 5) {
                console.log("Too many errors, stopping");
                break;
            }
        }
    }
    
    console.log(`Processed: ${successCount} success, ${errorCount} errors`);
}
```

**IGCSE Output:**
```
PROCEDURE processFiles(filenames : ARRAY[1:SIZE] OF STRING)
   DECLARE successCount : INTEGER ← 0
   DECLARE errorCount : INTEGER ← 0
   
   FOR i ← 1 TO SIZE
      DECLARE filename : STRING ← filenames[i]
      DECLARE hasError : BOOLEAN ← FALSE
      DECLARE errorMessage : STRING ← ""
      
      OUTPUT "Processing: " + filename
      
      // Exception handling converted to conditional checks
      IF LENGTH(filename) = 0 THEN
         hasError ← TRUE
         errorMessage ← "Empty filename"
      ELSE IF NOT ENDSWITH(filename, ".txt") THEN
         hasError ← TRUE
         errorMessage ← "Invalid file extension"
      ENDIF
      
      IF NOT hasError THEN
         DECLARE content : STRING ← readFile(filename)
         IF LENGTH(content) > 1000 THEN
            OUTPUT "Large file: " + filename + " (" + LENGTH(content) + " chars)"
         ENDIF
         
         successCount ← successCount + 1
         OUTPUT "Success: " + filename
      ELSE
         errorCount ← errorCount + 1
         OUTPUT "Error processing " + filename + ": " + errorMessage
         
         IF errorCount > 5 THEN
            OUTPUT "Too many errors, stopping"
            // Break loop
            i ← SIZE + 1
         ENDIF
      ENDIF
   NEXT i
   
   OUTPUT "Processed: " + successCount + " success, " + errorCount + " errors"
ENDPROCEDURE
```

**Explanation:**
- Try-catch blocks converted to conditional error checking
- Error objects simulated with boolean flags and message strings
- Break statement implemented by manipulating loop variable
- String methods converted to IGCSE equivalents (ENDSWITH, LENGTH)