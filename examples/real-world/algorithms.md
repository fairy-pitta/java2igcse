# Real-World Algorithm Examples

This file contains common programming algorithms converted from Java and TypeScript to IGCSE pseudocode.

## Sorting Algorithms

### Example 1: Bubble Sort

**Java Input:**
```java
public class BubbleSort {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        boolean swapped;
        
        for (int i = 0; i < n - 1; i++) {
            swapped = false;
            
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    // Swap elements
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            
            // If no swapping occurred, array is sorted
            if (!swapped) {
                break;
            }
        }
    }
    
    public static void printArray(int[] arr) {
        for (int i = 0; i < arr.length; i++) {
            System.out.print(arr[i] + " ");
        }
        System.out.println();
    }
}
```

**IGCSE Output:**
```
// Static method
PROCEDURE bubbleSort(arr : ARRAY[1:SIZE] OF INTEGER)
   DECLARE n : INTEGER ← SIZE
   DECLARE swapped : BOOLEAN
   
   FOR i ← 1 TO n - 1
      swapped ← FALSE
      
      FOR j ← 1 TO n - i
         IF arr[j] > arr[j + 1] THEN
            // Swap elements
            DECLARE temp : INTEGER ← arr[j]
            arr[j] ← arr[j + 1]
            arr[j + 1] ← temp
            swapped ← TRUE
         ENDIF
      NEXT j
      
      // If no swapping occurred, array is sorted
      IF NOT swapped THEN
         // Break loop - array is sorted
         i ← n
      ENDIF
   NEXT i
ENDPROCEDURE

// Static method
PROCEDURE printArray(arr : ARRAY[1:SIZE] OF INTEGER)
   FOR i ← 1 TO SIZE
      OUTPUT arr[i] + " "
   NEXT i
   OUTPUT ""
ENDPROCEDURE
```

**Explanation:**
- Array indices converted from 0-based to 1-based
- Break statement simulated by setting loop variable to end condition
- Static methods marked with comments
- Array length becomes SIZE constant

### Example 2: Selection Sort

**TypeScript Input:**
```typescript
function selectionSort(arr: number[]): number[] {
    const sortedArray = [...arr]; // Create a copy
    const n = sortedArray.length;
    
    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        
        // Find the minimum element in remaining unsorted array
        for (let j = i + 1; j < n; j++) {
            if (sortedArray[j] < sortedArray[minIndex]) {
                minIndex = j;
            }
        }
        
        // Swap the found minimum element with the first element
        if (minIndex !== i) {
            const temp = sortedArray[i];
            sortedArray[i] = sortedArray[minIndex];
            sortedArray[minIndex] = temp;
            
            console.log(`Step ${i + 1}: [${sortedArray.join(', ')}]`);
        }
    }
    
    return sortedArray;
}
```

**IGCSE Output:**
```
FUNCTION selectionSort(arr : ARRAY[1:SIZE] OF INTEGER) RETURNS ARRAY[1:SIZE] OF INTEGER
   // Create a copy using spread operator
   DECLARE sortedArray : ARRAY[1:SIZE] OF INTEGER
   FOR copyIndex ← 1 TO SIZE
      sortedArray[copyIndex] ← arr[copyIndex]
   NEXT copyIndex
   
   DECLARE n : INTEGER ← SIZE
   
   FOR i ← 1 TO n - 1
      DECLARE minIndex : INTEGER ← i
      
      // Find the minimum element in remaining unsorted array
      FOR j ← i + 1 TO n
         IF sortedArray[j] < sortedArray[minIndex] THEN
            minIndex ← j
         ENDIF
      NEXT j
      
      // Swap the found minimum element with the first element
      IF minIndex <> i THEN
         DECLARE temp : INTEGER ← sortedArray[i]
         sortedArray[i] ← sortedArray[minIndex]
         sortedArray[minIndex] ← temp
         
         OUTPUT "Step " + i + ": [" + JOIN(sortedArray, ", ") + "]"
      ENDIF
   NEXT i
   
   RETURN sortedArray
ENDFUNCTION
```

**Explanation:**
- Spread operator converted to explicit array copying loop
- Template literals become string concatenation
- Array join method becomes JOIN function
- Inequality operator `!==` becomes `<>`

## Search Algorithms

### Example 3: Binary Search

**Java Input:**
```java
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1; // Element not found
    }
    
    public static void demonstrateBinarySearch() {
        int[] sortedArray = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
        int target = 7;
        
        System.out.println("Array: " + Arrays.toString(sortedArray));
        System.out.println("Searching for: " + target);
        
        int result = binarySearch(sortedArray, target);
        
        if (result != -1) {
            System.out.println("Element found at index: " + result);
        } else {
            System.out.println("Element not found");
        }
    }
}
```

**IGCSE Output:**
```
// Static method
FUNCTION binarySearch(arr : ARRAY[1:SIZE] OF INTEGER, target : INTEGER) RETURNS INTEGER
   DECLARE left : INTEGER ← 1
   DECLARE right : INTEGER ← SIZE
   
   WHILE left <= right DO
      DECLARE mid : INTEGER ← left + (right - left) / 2
      
      IF arr[mid] = target THEN
         RETURN mid
      ELSE IF arr[mid] < target THEN
         left ← mid + 1
      ELSE
         right ← mid - 1
      ENDIF
   ENDWHILE
   
   RETURN -1 // Element not found
ENDFUNCTION

// Static method
PROCEDURE demonstrateBinarySearch()
   DECLARE sortedArray : ARRAY[1:10] OF INTEGER ← {1, 3, 5, 7, 9, 11, 13, 15, 17, 19}
   DECLARE target : INTEGER ← 7
   
   OUTPUT "Array: " + ARRAY_TO_STRING(sortedArray)
   OUTPUT "Searching for: " + target
   
   DECLARE result : INTEGER ← binarySearch(sortedArray, target)
   
   IF result <> -1 THEN
      OUTPUT "Element found at index: " + result
   ELSE
      OUTPUT "Element not found"
   ENDIF
ENDPROCEDURE
```

**Explanation:**
- Array bounds adjusted for 1-based indexing
- `Arrays.toString()` becomes `ARRAY_TO_STRING()` function
- Equality operator `==` becomes `=`
- Comments preserved for clarity

### Example 4: Linear Search with Statistics

**TypeScript Input:**
```typescript
interface SearchResult {
    found: boolean;
    index: number;
    comparisons: number;
}

function linearSearchWithStats(arr: number[], target: number): SearchResult {
    let comparisons = 0;
    
    for (let i = 0; i < arr.length; i++) {
        comparisons++;
        
        if (arr[i] === target) {
            return {
                found: true,
                index: i,
                comparisons: comparisons
            };
        }
    }
    
    return {
        found: false,
        index: -1,
        comparisons: comparisons
    };
}

function searchDemo(): void {
    const numbers: number[] = [64, 34, 25, 12, 22, 11, 90];
    const searchTargets: number[] = [25, 99, 11];
    
    console.log(`Array: [${numbers.join(', ')}]`);
    
    for (const target of searchTargets) {
        const result = linearSearchWithStats(numbers, target);
        
        console.log(`\nSearching for ${target}:`);
        console.log(`Found: ${result.found}`);
        
        if (result.found) {
            console.log(`Index: ${result.index}`);
        }
        
        console.log(`Comparisons: ${result.comparisons}`);
    }
}
```

**IGCSE Output:**
```
// Interface: SearchResult
FUNCTION linearSearchWithStats(arr : ARRAY[1:SIZE] OF INTEGER, target : INTEGER) RETURNS OBJECT
   DECLARE comparisons : INTEGER ← 0
   
   FOR i ← 1 TO SIZE
      comparisons ← comparisons + 1
      
      IF arr[i] = target THEN
         RETURN {
            found: TRUE,
            index: i,
            comparisons: comparisons
         }
      ENDIF
   NEXT i
   
   RETURN {
      found: FALSE,
      index: -1,
      comparisons: comparisons
   }
ENDFUNCTION

PROCEDURE searchDemo()
   DECLARE numbers : ARRAY[1:7] OF INTEGER ← {64, 34, 25, 12, 22, 11, 90}
   DECLARE searchTargets : ARRAY[1:3] OF INTEGER ← {25, 99, 11}
   
   OUTPUT "Array: [" + JOIN(numbers, ", ") + "]"
   
   FOR targetIndex ← 1 TO 3
      DECLARE target : INTEGER ← searchTargets[targetIndex]
      DECLARE result : OBJECT ← linearSearchWithStats(numbers, target)
      
      OUTPUT ""
      OUTPUT "Searching for " + target + ":"
      OUTPUT "Found: " + result.found
      
      IF result.found THEN
         OUTPUT "Index: " + result.index
      ENDIF
      
      OUTPUT "Comparisons: " + result.comparisons
   NEXT targetIndex
ENDPROCEDURE
```

**Explanation:**
- Interface converted to comment and return type becomes OBJECT
- For-of loop converted to traditional FOR loop with index
- Object literals preserved in return statements
- Template literals become string concatenation

## Mathematical Algorithms

### Example 5: Greatest Common Divisor (Euclidean Algorithm)

**Java Input:**
```java
public class MathAlgorithms {
    public static int gcd(int a, int b) {
        System.out.println("Computing GCD of " + a + " and " + b);
        
        while (b != 0) {
            System.out.println("Step: " + a + " mod " + b + " = " + (a % b));
            int temp = b;
            b = a % b;
            a = temp;
        }
        
        System.out.println("GCD result: " + a);
        return a;
    }
    
    public static int lcm(int a, int b) {
        int gcdValue = gcd(a, b);
        int result = (a * b) / gcdValue;
        System.out.println("LCM of " + a + " and " + b + " is: " + result);
        return result;
    }
    
    public static void demonstrateGcdLcm() {
        int num1 = 48;
        int num2 = 18;
        
        System.out.println("Numbers: " + num1 + " and " + num2);
        
        int gcdResult = gcd(num1, num2);
        int lcmResult = lcm(num1, num2);
        
        System.out.println("Final results:");
        System.out.println("GCD: " + gcdResult);
        System.out.println("LCM: " + lcmResult);
    }
}
```

**IGCSE Output:**
```
// Static method
FUNCTION gcd(a : INTEGER, b : INTEGER) RETURNS INTEGER
   OUTPUT "Computing GCD of " + a + " and " + b
   
   WHILE b <> 0 DO
      OUTPUT "Step: " + a + " mod " + b + " = " + (a MOD b)
      DECLARE temp : INTEGER ← b
      b ← a MOD b
      a ← temp
   ENDWHILE
   
   OUTPUT "GCD result: " + a
   RETURN a
ENDFUNCTION

// Static method
FUNCTION lcm(a : INTEGER, b : INTEGER) RETURNS INTEGER
   DECLARE gcdValue : INTEGER ← gcd(a, b)
   DECLARE result : INTEGER ← (a * b) / gcdValue
   OUTPUT "LCM of " + a + " and " + b + " is: " + result
   RETURN result
ENDFUNCTION

// Static method
PROCEDURE demonstrateGcdLcm()
   DECLARE num1 : INTEGER ← 48
   DECLARE num2 : INTEGER ← 18
   
   OUTPUT "Numbers: " + num1 + " and " + num2
   
   DECLARE gcdResult : INTEGER ← gcd(num1, num2)
   DECLARE lcmResult : INTEGER ← lcm(num1, num2)
   
   OUTPUT "Final results:"
   OUTPUT "GCD: " + gcdResult
   OUTPUT "LCM: " + lcmResult
ENDPROCEDURE
```

**Explanation:**
- Modulo operator `%` becomes `MOD`
- Inequality `!=` becomes `<>`
- Algorithm steps preserved with detailed output

### Example 6: Fibonacci Sequence (Iterative and Recursive)

**TypeScript Input:**
```typescript
class FibonacciCalculator {
    // Iterative approach
    static fibonacciIterative(n: number): number {
        if (n <= 1) return n;
        
        let prev = 0;
        let curr = 1;
        
        console.log(`F(0) = ${prev}`);
        console.log(`F(1) = ${curr}`);
        
        for (let i = 2; i <= n; i++) {
            const next = prev + curr;
            console.log(`F(${i}) = ${prev} + ${curr} = ${next}`);
            prev = curr;
            curr = next;
        }
        
        return curr;
    }
    
    // Recursive approach
    static fibonacciRecursive(n: number): number {
        console.log(`Computing F(${n})`);
        
        if (n <= 1) {
            console.log(`Base case: F(${n}) = ${n}`);
            return n;
        }
        
        const result = this.fibonacciRecursive(n - 1) + this.fibonacciRecursive(n - 2);
        console.log(`F(${n}) = F(${n-1}) + F(${n-2}) = ${result}`);
        return result;
    }
    
    static compareMethods(n: number): void {
        console.log(`Computing Fibonacci(${n}) using both methods:\n`);
        
        console.log("=== Iterative Method ===");
        const startTime1 = Date.now();
        const result1 = this.fibonacciIterative(n);
        const endTime1 = Date.now();
        
        console.log(`\n=== Recursive Method ===`);
        const startTime2 = Date.now();
        const result2 = this.fibonacciRecursive(n);
        const endTime2 = Date.now();
        
        console.log(`\n=== Results ===`);
        console.log(`Iterative result: ${result1} (${endTime1 - startTime1}ms)`);
        console.log(`Recursive result: ${result2} (${endTime2 - startTime2}ms)`);
    }
}
```

**IGCSE Output:**
```
// Class: FibonacciCalculator

// Static method
FUNCTION fibonacciIterative(n : INTEGER) RETURNS INTEGER
   IF n <= 1 THEN
      RETURN n
   ENDIF
   
   DECLARE prev : INTEGER ← 0
   DECLARE curr : INTEGER ← 1
   
   OUTPUT "F(0) = " + prev
   OUTPUT "F(1) = " + curr
   
   FOR i ← 2 TO n
      DECLARE next : INTEGER ← prev + curr
      OUTPUT "F(" + i + ") = " + prev + " + " + curr + " = " + next
      prev ← curr
      curr ← next
   NEXT i
   
   RETURN curr
ENDFUNCTION

// Static method
FUNCTION fibonacciRecursive(n : INTEGER) RETURNS INTEGER
   OUTPUT "Computing F(" + n + ")"
   
   IF n <= 1 THEN
      OUTPUT "Base case: F(" + n + ") = " + n
      RETURN n
   ENDIF
   
   DECLARE result : INTEGER ← fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2)
   OUTPUT "F(" + n + ") = F(" + (n-1) + ") + F(" + (n-2) + ") = " + result
   RETURN result
ENDFUNCTION

// Static method
PROCEDURE compareMethods(n : INTEGER)
   OUTPUT "Computing Fibonacci(" + n + ") using both methods:"
   OUTPUT ""
   
   OUTPUT "=== Iterative Method ==="
   DECLARE startTime1 : INTEGER ← CURRENT_TIME()
   DECLARE result1 : INTEGER ← fibonacciIterative(n)
   DECLARE endTime1 : INTEGER ← CURRENT_TIME()
   
   OUTPUT ""
   OUTPUT "=== Recursive Method ==="
   DECLARE startTime2 : INTEGER ← CURRENT_TIME()
   DECLARE result2 : INTEGER ← fibonacciRecursive(n)
   DECLARE endTime2 : INTEGER ← CURRENT_TIME()
   
   OUTPUT ""
   OUTPUT "=== Results ==="
   OUTPUT "Iterative result: " + result1 + " (" + (endTime1 - startTime1) + "ms)"
   OUTPUT "Recursive result: " + result2 + " (" + (endTime2 - startTime2) + "ms)"
ENDPROCEDURE
```

**Explanation:**
- Class converted to comments with static method indicators
- `Date.now()` becomes `CURRENT_TIME()` function
- Template literals converted to string concatenation
- `this.` references removed for static method calls
- Recursive function calls preserved

## String Processing Algorithms

### Example 7: String Pattern Matching

**Java Input:**
```java
public class StringAlgorithms {
    public static int[] findAllOccurrences(String text, String pattern) {
        List<Integer> positions = new ArrayList<>();
        int textLength = text.length();
        int patternLength = pattern.length();
        
        for (int i = 0; i <= textLength - patternLength; i++) {
            boolean match = true;
            
            for (int j = 0; j < patternLength; j++) {
                if (text.charAt(i + j) != pattern.charAt(j)) {
                    match = false;
                    break;
                }
            }
            
            if (match) {
                positions.add(i);
                System.out.println("Pattern found at position: " + i);
            }
        }
        
        return positions.stream().mapToInt(Integer::intValue).toArray();
    }
    
    public static void demonstratePatternMatching() {
        String text = "ABABCABABA";
        String pattern = "ABA";
        
        System.out.println("Text: " + text);
        System.out.println("Pattern: " + pattern);
        System.out.println("Searching for pattern...");
        
        int[] positions = findAllOccurrences(text, pattern);
        
        System.out.println("Pattern found " + positions.length + " times");
        System.out.print("Positions: ");
        for (int pos : positions) {
            System.out.print(pos + " ");
        }
        System.out.println();
    }
}
```

**IGCSE Output:**
```
// Static method
FUNCTION findAllOccurrences(text : STRING, pattern : STRING) RETURNS ARRAY[1:SIZE] OF INTEGER
   DECLARE positions : ARRAY[1:SIZE] OF INTEGER
   DECLARE positionCount : INTEGER ← 0
   DECLARE textLength : INTEGER ← LENGTH(text)
   DECLARE patternLength : INTEGER ← LENGTH(pattern)
   
   FOR i ← 1 TO textLength - patternLength + 1
      DECLARE match : BOOLEAN ← TRUE
      
      FOR j ← 1 TO patternLength
         IF MID(text, i + j - 1, 1) <> MID(pattern, j, 1) THEN
            match ← FALSE
            // Break inner loop
            j ← patternLength + 1
         ENDIF
      NEXT j
      
      IF match THEN
         positionCount ← positionCount + 1
         positions[positionCount] ← i
         OUTPUT "Pattern found at position: " + i
      ENDIF
   NEXT i
   
   RETURN positions
ENDFUNCTION

// Static method
PROCEDURE demonstratePatternMatching()
   DECLARE text : STRING ← "ABABCABABA"
   DECLARE pattern : STRING ← "ABA"
   
   OUTPUT "Text: " + text
   OUTPUT "Pattern: " + pattern
   OUTPUT "Searching for pattern..."
   
   DECLARE positions : ARRAY[1:SIZE] OF INTEGER ← findAllOccurrences(text, pattern)
   
   OUTPUT "Pattern found " + COUNT_NON_ZERO(positions) + " times"
   OUTPUT "Positions: "
   FOR i ← 1 TO SIZE
      IF positions[i] <> 0 THEN
         OUTPUT positions[i] + " "
      ENDIF
   NEXT i
   OUTPUT ""
ENDPROCEDURE
```

**Explanation:**
- `ArrayList` converted to fixed-size array with counter
- `charAt()` becomes `MID()` function with 1-character length
- Enhanced for loop converted to traditional FOR with condition check
- Stream operations simplified to array processing
- Break statement simulated by manipulating loop variable