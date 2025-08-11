const { Java2IGCSEConverterImpl } = require('./dist/index.js');

const converter = new Java2IGCSEConverterImpl();

const testCases = [
  {
    name: "Basic array access with literal index",
    code: `
public class Test {
  public static void test() {
    int[] arr = {1, 2, 3};
    int first = arr[0];
    int second = arr[1];
  }
}`,
    expectedPatterns: [
      '← arr[1]',  // arr[0] becomes arr[1]
      '← arr[2]'   // arr[1] becomes arr[2]
    ]
  },
  {
    name: "For loop with 0-based indexing",
    code: `
public class Test {
  public static void test() {
    int[] arr = {1, 2, 3};
    for (int i = 0; i < arr.length; i++) {
      System.out.println(arr[i]);
    }
  }
}`,
    expectedPatterns: [
      'FOR i ← 1 TO LENGTH(arr)',  // 0-based loop becomes 1-based
      'OUTPUT arr[i]'              // arr[i] with converted loop variable
    ]
  },
  {
    name: "For loop with 1-based indexing (second element onwards)",
    code: `
public class Test {
  public static void test() {
    int[] arr = {1, 2, 3};
    for (int i = 1; i < arr.length; i++) {
      System.out.println(arr[i]);
    }
  }
}`,
    expectedPatterns: [
      'FOR i ← 2 TO LENGTH(arr)',  // 1-based loop becomes 2-based (second element)
      'OUTPUT arr[i]'              // arr[i] with converted loop variable
    ]
  },
  {
    name: "Multi-dimensional array access",
    code: `
public class Test {
  public static void test() {
    int[][] matrix = new int[3][3];
    matrix[0][0] = 1;
    matrix[1][2] = 5;
  }
}`,
    expectedPatterns: [
      'matrix[1][1] ← 1',  // matrix[0][0] becomes matrix[1][1]
      'matrix[2][3] ← 5'   // matrix[1][2] becomes matrix[2][3]
    ]
  },
  {
    name: "Array access in conditions",
    code: `
public class Test {
  public static void test() {
    int[] arr = {1, 2, 3};
    if (arr[0] > arr[1]) {
      System.out.println("First is greater");
    }
  }
}`,
    expectedPatterns: [
      'IF arr[1] > arr[2] THEN',  // arr[0] and arr[1] become arr[1] and arr[2]
      'OUTPUT "First is greater"'
    ]
  }
];

console.log('=== Array Indexing Conversion Test Suite ===\n');

for (const testCase of testCases) {
  console.log(`Testing: ${testCase.name}`);
  console.log('----------------------------------------');
  
  const result = converter.convertJava(testCase.code);
  
  if (!result.success) {
    console.log('❌ FAILED - Conversion failed');
    console.log('Errors:', result.warnings.filter(w => w.code.includes('ERROR')));
    continue;
  }
  
  let allPassed = true;
  for (const pattern of testCase.expectedPatterns) {
    if (result.pseudocode.includes(pattern)) {
      console.log(`✅ Found: ${pattern}`);
    } else {
      console.log(`❌ Missing: ${pattern}`);
      allPassed = false;
    }
  }
  
  if (!allPassed) {
    console.log('\nGenerated pseudocode:');
    console.log(result.pseudocode);
  }
  
  console.log(allPassed ? '✅ PASSED\n' : '❌ FAILED\n');
}

console.log('=== Test Suite Complete ===');