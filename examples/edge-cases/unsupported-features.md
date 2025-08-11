# Unsupported Features and Limitations

This file demonstrates how java2igcse handles unsupported language features and the warnings they generate.

## Java Unsupported Features

### Example 1: Generics

**Java Input:**
```java
import java.util.*;

public class GenericExample<T> {
    private List<T> items;
    private Map<String, T> itemMap;
    
    public GenericExample() {
        this.items = new ArrayList<T>();
        this.itemMap = new HashMap<String, T>();
    }
    
    public void addItem(String key, T item) {
        items.add(item);
        itemMap.put(key, item);
    }
    
    public T getItem(String key) {
        return itemMap.get(key);
    }
    
    public List<T> getAllItems() {
        return new ArrayList<T>(items);
    }
}
```

**IGCSE Output:**
```
// Generic class: GenericExample<T> - generics simplified
// Import statements converted to comments

DECLARE items : ARRAY[1:SIZE] OF OBJECT
DECLARE itemMap : ARRAY[1:SIZE] OF OBJECT

PROCEDURE GenericExample()
   // Constructor - generics removed
   items ← NEW_ARRAY(SIZE)
   itemMap ← NEW_DICTIONARY()
ENDPROCEDURE

PROCEDURE addItem(key : STRING, item : OBJECT)
   // Generic parameter T becomes OBJECT
   ADD_TO_ARRAY(items, item)
   PUT_IN_MAP(itemMap, key, item)
ENDPROCEDURE

FUNCTION getItem(key : STRING) RETURNS OBJECT
   // Generic return type T becomes OBJECT
   RETURN GET_FROM_MAP(itemMap, key)
ENDFUNCTION

FUNCTION getAllItems() RETURNS ARRAY[1:SIZE] OF OBJECT
   // Generic List<T> becomes ARRAY OF OBJECT
   RETURN COPY_ARRAY(items)
ENDFUNCTION
```

**Warnings Generated:**
- `UNSUPPORTED_FEATURE`: Generic types simplified to OBJECT type
- `TYPE_CONVERSION_WARNING`: List and Map converted to simplified data structures
- `COMPLEX_EXPRESSION`: Generic constructors simplified

**Explanation:**
- Generic type parameters (`<T>`) are removed
- All generic types become `OBJECT`
- Collection operations are simplified to basic array/map operations

### Example 2: Exception Handling

**Java Input:**
```java
public class FileProcessor {
    public void processFile(String filename) throws IOException {
        FileReader reader = null;
        
        try {
            reader = new FileReader(filename);
            BufferedReader buffered = new BufferedReader(reader);
            String line;
            
            while ((line = buffered.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    throw new IllegalArgumentException("Empty line found");
                }
                processLine(line);
            }
            
        } catch (FileNotFoundException e) {
            System.err.println("File not found: " + filename);
            throw new IOException("Cannot process missing file", e);
            
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid data: " + e.getMessage());
            
        } catch (IOException e) {
            System.err.println("IO Error: " + e.getMessage());
            throw e;
            
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    System.err.println("Error closing file: " + e.getMessage());
                }
            }
        }
    }
    
    private void processLine(String line) {
        System.out.println("Processing: " + line);
    }
}
```

**IGCSE Output:**
```
PROCEDURE processFile(filename : STRING)
   // Exception handling converted to conditional checks
   // throws IOException - exception declaration removed
   DECLARE reader : OBJECT ← NULL
   DECLARE hasError : BOOLEAN ← FALSE
   DECLARE errorMessage : STRING ← ""
   
   // Try block converted to conditional error checking
   IF FILE_EXISTS(filename) THEN
      reader ← OPEN_FILE(filename)
      DECLARE line : STRING
      
      WHILE NOT END_OF_FILE(reader) DO
         line ← READ_LINE(reader)
         IF line <> NULL THEN
            IF TRIM(line) = "" THEN
               // IllegalArgumentException converted to error flag
               hasError ← TRUE
               errorMessage ← "Empty line found"
            ELSE
               processLine(line)
            ENDIF
         ENDIF
      ENDWHILE
   ELSE
      // FileNotFoundException converted to conditional check
      OUTPUT "File not found: " + filename
      hasError ← TRUE
      errorMessage ← "Cannot process missing file"
   ENDIF
   
   // Exception handling converted to conditional checks
   IF hasError THEN
      OUTPUT "Invalid data: " + errorMessage
   ENDIF
   
   // Finally block converted to cleanup code
   IF reader <> NULL THEN
      CLOSE_FILE(reader)
      // Nested try-catch in finally simplified
   ENDIF
ENDPROCEDURE

PROCEDURE processLine(line : STRING)
   OUTPUT "Processing: " + line
ENDPROCEDURE
```

**Warnings Generated:**
- `UNSUPPORTED_FEATURE`: Exception handling converted to conditional checks
- `COMPLEX_EXPRESSION`: Try-catch-finally blocks simplified
- `TYPE_CONVERSION_WARNING`: File I/O operations simplified

**Explanation:**
- Try-catch blocks become conditional error checking
- Exceptions become boolean flags and error messages
- Finally blocks become cleanup code at the end
- Checked exceptions in method signatures are removed

### Example 3: Lambda Expressions and Streams

**Java Input:**
```java
import java.util.*;
import java.util.stream.*;

public class StreamExample {
    public void processNumbers(List<Integer> numbers) {
        // Filter even numbers and double them
        List<Integer> processed = numbers.stream()
            .filter(n -> n % 2 == 0)
            .map(n -> n * 2)
            .sorted()
            .collect(Collectors.toList());
        
        // Print results
        processed.forEach(System.out::println);
        
        // Calculate statistics
        OptionalDouble average = numbers.stream()
            .mapToInt(Integer::intValue)
            .average();
        
        if (average.isPresent()) {
            System.out.println("Average: " + average.getAsDouble());
        }
        
        // Group by even/odd
        Map<Boolean, List<Integer>> grouped = numbers.stream()
            .collect(Collectors.groupingBy(n -> n % 2 == 0));
        
        System.out.println("Even numbers: " + grouped.get(true));
        System.out.println("Odd numbers: " + grouped.get(false));
    }
}
```

**IGCSE Output:**
```
PROCEDURE processNumbers(numbers : ARRAY[1:SIZE] OF INTEGER)
   // Stream operations converted to traditional loops
   DECLARE processed : ARRAY[1:SIZE] OF INTEGER
   DECLARE processedCount : INTEGER ← 0
   
   // Filter even numbers and double them
   FOR i ← 1 TO SIZE
      IF numbers[i] MOD 2 = 0 THEN
         processedCount ← processedCount + 1
         processed[processedCount] ← numbers[i] * 2
      ENDIF
   NEXT i
   
   // Sort the processed array
   SORT_ARRAY(processed, processedCount)
   
   // Print results - forEach converted to loop
   FOR i ← 1 TO processedCount
      OUTPUT processed[i]
   NEXT i
   
   // Calculate statistics - stream operations converted to loop
   DECLARE sum : INTEGER ← 0
   DECLARE count : INTEGER ← 0
   FOR i ← 1 TO SIZE
      sum ← sum + numbers[i]
      count ← count + 1
   NEXT i
   
   IF count > 0 THEN
      DECLARE average : REAL ← sum / count
      OUTPUT "Average: " + average
   ENDIF
   
   // Group by even/odd - stream grouping converted to separate arrays
   DECLARE evenNumbers : ARRAY[1:SIZE] OF INTEGER
   DECLARE oddNumbers : ARRAY[1:SIZE] OF INTEGER
   DECLARE evenCount : INTEGER ← 0
   DECLARE oddCount : INTEGER ← 0
   
   FOR i ← 1 TO SIZE
      IF numbers[i] MOD 2 = 0 THEN
         evenCount ← evenCount + 1
         evenNumbers[evenCount] ← numbers[i]
      ELSE
         oddCount ← oddCount + 1
         oddNumbers[oddCount] ← numbers[i]
      ENDIF
   NEXT i
   
   OUTPUT "Even numbers: " + ARRAY_TO_STRING(evenNumbers, evenCount)
   OUTPUT "Odd numbers: " + ARRAY_TO_STRING(oddNumbers, oddCount)
ENDPROCEDURE
```

**Warnings Generated:**
- `UNSUPPORTED_FEATURE`: Lambda expressions converted to traditional loops
- `UNSUPPORTED_FEATURE`: Stream operations converted to iterative processing
- `COMPLEX_EXPRESSION`: Method references simplified to explicit calls
- `TYPE_CONVERSION_WARNING`: Optional types converted to conditional checks

**Explanation:**
- Lambda expressions become traditional loops with conditions
- Stream operations are converted to explicit iteration
- Method references become explicit method calls
- Optional types become conditional null checks

## TypeScript Unsupported Features

### Example 4: Advanced Type System

**TypeScript Input:**
```typescript
// Union and intersection types
type StringOrNumber = string | number;
type PersonWithId = Person & { id: number };

// Generic constraints
interface Repository<T extends { id: number }> {
    findById(id: number): T | undefined;
    save(entity: T): void;
}

// Conditional types
type ApiResponse<T> = T extends string 
    ? { message: T } 
    : { data: T };

// Mapped types
type Partial<T> = {
    [P in keyof T]?: T[P];
};

class UserRepository implements Repository<User> {
    private users: User[] = [];
    
    findById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }
    
    save(entity: User): void {
        const existingIndex = this.users.findIndex(u => u.id === entity.id);
        if (existingIndex >= 0) {
            this.users[existingIndex] = entity;
        } else {
            this.users.push(entity);
        }
    }
    
    // Using advanced types
    updatePartial(id: number, updates: Partial<User>): void {
        const user = this.findById(id);
        if (user) {
            Object.assign(user, updates);
        }
    }
}
```

**IGCSE Output:**
```
// Union type: StringOrNumber = string | number - simplified to OBJECT
// Intersection type: PersonWithId - simplified to OBJECT
// Interface: Repository<T> - generics removed
// Conditional type: ApiResponse<T> - simplified to OBJECT
// Mapped type: Partial<T> - simplified to OBJECT

// Class: UserRepository implements Repository<User>
DECLARE users : ARRAY[1:SIZE] OF OBJECT

FUNCTION findById(id : INTEGER) RETURNS OBJECT
   // Union return type User | undefined becomes OBJECT
   FOR i ← 1 TO SIZE
      IF users[i].id = id THEN
         RETURN users[i]
      ENDIF
   NEXT i
   RETURN NULL
ENDFUNCTION

PROCEDURE save(entity : OBJECT)
   // Generic parameter T becomes OBJECT
   DECLARE existingIndex : INTEGER ← -1
   
   FOR i ← 1 TO SIZE
      IF users[i].id = entity.id THEN
         existingIndex ← i
         // Break loop
         i ← SIZE + 1
      ENDIF
   NEXT i
   
   IF existingIndex >= 0 THEN
      users[existingIndex] ← entity
   ELSE
      ADD_TO_ARRAY(users, entity)
   ENDIF
ENDPROCEDURE

PROCEDURE updatePartial(id : INTEGER, updates : OBJECT)
   // Partial<User> type becomes OBJECT
   DECLARE user : OBJECT ← findById(id)
   IF user <> NULL THEN
      // Object.assign converted to property copying
      MERGE_OBJECTS(user, updates)
   ENDIF
ENDPROCEDURE
```

**Warnings Generated:**
- `UNSUPPORTED_FEATURE`: Advanced type system features simplified
- `TYPE_CONVERSION_WARNING`: Union and intersection types become OBJECT
- `COMPLEX_EXPRESSION`: Generic constraints removed
- `UNSUPPORTED_FEATURE`: Conditional and mapped types simplified

**Explanation:**
- All advanced types become `OBJECT`
- Generic constraints are removed
- Type aliases become comments
- Complex type operations are simplified

### Example 5: Decorators and Metadata

**TypeScript Input:**
```typescript
// Decorator functions
function Component(config: { selector: string }) {
    return function<T extends new(...args: any[]) => any>(constructor: T) {
        return class extends constructor {
            selector = config.selector;
        };
    };
}

function Injectable() {
    return function<T extends new(...args: any[]) => any>(constructor: T) {
        Reflect.defineMetadata('injectable', true, constructor);
        return constructor;
    };
}

function Inject(token: string) {
    return function(target: any, propertyKey: string | symbol, parameterIndex: number) {
        const existingTokens = Reflect.getMetadata('inject-tokens', target) || [];
        existingTokens[parameterIndex] = token;
        Reflect.defineMetadata('inject-tokens', existingTokens, target);
    };
}

// Using decorators
@Component({ selector: 'user-list' })
@Injectable()
class UserListComponent {
    constructor(
        @Inject('UserService') private userService: UserService,
        @Inject('Logger') private logger: Logger
    ) {}
    
    async loadUsers(): Promise<User[]> {
        try {
            this.logger.info('Loading users...');
            const users = await this.userService.getAll();
            this.logger.info(`Loaded ${users.length} users`);
            return users;
        } catch (error) {
            this.logger.error('Failed to load users', error);
            throw error;
        }
    }
}
```

**IGCSE Output:**
```
// Decorator functions converted to comments
// @Component decorator - metadata ignored
// @Injectable decorator - metadata ignored

// Class: UserListComponent
// Decorator: @Component({ selector: 'user-list' })
// Decorator: @Injectable()

DECLARE userService : OBJECT
DECLARE logger : OBJECT

PROCEDURE UserListComponent(userService : OBJECT, logger : OBJECT)
   // Constructor with dependency injection - decorators ignored
   // @Inject('UserService') - injection metadata ignored
   // @Inject('Logger') - injection metadata ignored
   this.userService ← userService
   this.logger ← logger
ENDPROCEDURE

FUNCTION loadUsers() RETURNS ARRAY[1:SIZE] OF OBJECT
   // async/Promise return type simplified to synchronous
   DECLARE hasError : BOOLEAN ← FALSE
   DECLARE errorMessage : STRING ← ""
   
   // Try-catch converted to error handling
   logger.info("Loading users...")
   
   DECLARE users : ARRAY[1:SIZE] OF OBJECT ← userService.getAll()
   // await keyword removed - async operation becomes synchronous
   
   IF NOT hasError THEN
      logger.info("Loaded " + LENGTH(users) + " users")
      RETURN users
   ELSE
      logger.error("Failed to load users", errorMessage)
      // throw error converted to return empty array
      RETURN EMPTY_ARRAY()
   ENDIF
ENDFUNCTION
```

**Warnings Generated:**
- `UNSUPPORTED_FEATURE`: Decorators ignored and converted to comments
- `UNSUPPORTED_FEATURE`: Metadata reflection operations removed
- `COMPLEX_EXPRESSION`: Async/await converted to synchronous operations
- `TYPE_CONVERSION_WARNING`: Promise types simplified

**Explanation:**
- Decorators become comments indicating their original purpose
- Metadata operations are removed
- Dependency injection becomes regular constructor parameters
- Async operations become synchronous

### Example 6: Module System and Imports

**TypeScript Input:**
```typescript
// External module imports
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, filter, debounceTime } from 'rxjs/operators';
import * as _ from 'lodash';
import { Component, OnInit, OnDestroy } from '@angular/core';

// Default import
import axios from 'axios';

// Dynamic import
async function loadModule() {
    const { default: moment } = await import('moment');
    return moment();
}

// Re-exports
export { UserService } from './user.service';
export * from './types';

// Module with complex exports
export class DataService implements OnInit, OnDestroy {
    private dataSubject = new BehaviorSubject<any[]>([]);
    public data$ = this.dataSubject.asObservable();
    
    constructor() {
        this.initializeData();
    }
    
    ngOnInit(): void {
        this.data$.pipe(
            filter(data => data.length > 0),
            map(data => _.groupBy(data, 'category')),
            debounceTime(300)
        ).subscribe(groupedData => {
            console.log('Data updated:', groupedData);
        });
    }
    
    async fetchData(): Promise<any[]> {
        try {
            const response = await axios.get('/api/data');
            this.dataSubject.next(response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch data:', error);
            return [];
        }
    }
    
    ngOnDestroy(): void {
        this.dataSubject.complete();
    }
    
    private initializeData(): void {
        this.fetchData();
    }
}
```

**IGCSE Output:**
```
// Import statements converted to comments
// import { Observable, Subject, BehaviorSubject } from 'rxjs' - external dependency
// import { map, filter, debounceTime } from 'rxjs/operators' - external dependency
// import * as _ from 'lodash' - external dependency
// import { Component, OnInit, OnDestroy } from '@angular/core' - external dependency
// import axios from 'axios' - external dependency

// Dynamic import converted to comment
// async function loadModule() - dynamic imports not supported

// Re-exports converted to comments
// export { UserService } from './user.service' - module export
// export * from './types' - module export

// Class: DataService implements OnInit, OnDestroy
DECLARE dataSubject : OBJECT
DECLARE data : ARRAY[1:SIZE] OF OBJECT

PROCEDURE DataService()
   // Constructor - Observable/Subject simplified
   dataSubject ← NEW_BEHAVIOR_SUBJECT()
   data ← OBSERVABLE_FROM(dataSubject)
   initializeData()
ENDPROCEDURE

PROCEDURE ngOnInit()
   // RxJS operators converted to simple data processing
   // Reactive programming simplified to procedural
   DECLARE filteredData : ARRAY[1:SIZE] OF OBJECT
   
   // pipe operations converted to sequential processing
   filteredData ← FILTER_ARRAY(data, "length > 0")
   DECLARE groupedData : OBJECT ← GROUP_BY(filteredData, "category")
   
   // debounceTime and subscribe simplified
   OUTPUT "Data updated: " + groupedData
ENDPROCEDURE

FUNCTION fetchData() RETURNS ARRAY[1:SIZE] OF OBJECT
   // async/await and HTTP requests simplified
   DECLARE hasError : BOOLEAN ← FALSE
   DECLARE responseData : ARRAY[1:SIZE] OF OBJECT
   
   // axios.get converted to generic HTTP call
   responseData ← HTTP_GET("/api/data")
   
   IF NOT hasError THEN
      // BehaviorSubject.next simplified
      UPDATE_SUBJECT(dataSubject, responseData)
      RETURN responseData
   ELSE
      OUTPUT "Failed to fetch data: " + errorMessage
      RETURN EMPTY_ARRAY()
   ENDIF
ENDFUNCTION

PROCEDURE ngOnDestroy()
   // Observable cleanup simplified
   COMPLETE_SUBJECT(dataSubject)
ENDPROCEDURE

PROCEDURE initializeData()
   fetchData()
ENDPROCEDURE
```

**Warnings Generated:**
- `UNSUPPORTED_FEATURE`: Module imports/exports converted to comments
- `UNSUPPORTED_FEATURE`: Reactive programming (RxJS) simplified to procedural code
- `COMPLEX_EXPRESSION`: HTTP requests and async operations simplified
- `UNSUPPORTED_FEATURE`: Dynamic imports not supported
- `TYPE_CONVERSION_WARNING`: Observable types simplified to arrays

**Explanation:**
- All import/export statements become comments
- External dependencies are noted but not processed
- Reactive programming patterns are simplified to procedural code
- HTTP operations become generic function calls
- Module boundaries are lost in conversion

## Common Patterns for Handling Unsupported Features

### Pattern 1: Simplification with Comments
```typescript
// Original: Complex generic with constraints
function processData<T extends Serializable & Comparable>(data: T[]): ProcessedData<T>

// Converted: Simplified with explanatory comment
// Generic function with constraints: T extends Serializable & Comparable
FUNCTION processData(data : ARRAY[1:SIZE] OF OBJECT) RETURNS OBJECT
```

### Pattern 2: Feature Removal with Warnings
```java
// Original: Lambda with complex stream operations
list.stream().filter(x -> x.isValid()).map(x -> x.transform()).collect(toList())

// Converted: Traditional loop with warning
// Stream operations converted to traditional iteration
FOR i ← 1 TO SIZE
   IF list[i].isValid() THEN
      result[resultCount] ← list[i].transform()
      resultCount ← resultCount + 1
   ENDIF
NEXT i
```

### Pattern 3: Conditional Conversion
```typescript
// Original: Optional chaining and nullish coalescing
const value = obj?.property?.nested ?? defaultValue;

// Converted: Explicit null checks
IF obj <> NULL AND obj.property <> NULL THEN
   value ← obj.property.nested
ELSE
   value ← defaultValue
ENDIF
```

These examples demonstrate how java2igcse handles unsupported features by:
1. Converting complex constructs to simpler equivalents
2. Adding explanatory comments for lost functionality
3. Generating appropriate warnings
4. Maintaining the core logic while simplifying the implementation