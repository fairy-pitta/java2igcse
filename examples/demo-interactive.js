#!/usr/bin/env node

/**
 * Interactive Demo for java2igcse
 * 
 * This script provides an interactive way to test the java2igcse converter
 * with various examples and see the conversion process step by step.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Import the converter (adjust path as needed)
let Java2IGCSEConverterImpl;
try {
  Java2IGCSEConverterImpl = require('../dist/index.js').Java2IGCSEConverterImpl;
} catch (error) {
  console.error('Error: Could not load java2igcse. Make sure to run "npm run build" first.');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const converter = new Java2IGCSEConverterImpl();

// Example code snippets
const examples = {
  java: {
    'simple-if': `
if (x > 0) {
    System.out.println("Positive number");
}`,
    'for-loop': `
for (int i = 0; i < 10; i++) {
    System.out.println("Number: " + i);
}`,
    'method': `
public int add(int a, int b) {
    return a + b;
}`,
    'array': `
int[] numbers = {1, 2, 3, 4, 5};
for (int i = 0; i < numbers.length; i++) {
    System.out.println(numbers[i]);
}`,
    'class': `
public class Calculator {
    public static int multiply(int a, int b) {
        return a * b;
    }
}`
  },
  typescript: {
    'simple-if': `
if (x > 0) {
    console.log("Positive number");
}`,
    'function': `
function greet(name: string): string {
    return "Hello, " + name;
}`,
    'arrow-function': `
const add = (a: number, b: number): number => {
    return a + b;
};`,
    'array': `
const numbers: number[] = [1, 2, 3, 4, 5];
for (const num of numbers) {
    console.log(num);
}`,
    'template-literal': `
const name = "Alice";
const age = 30;
const message = \`Hello, my name is \${name} and I am \${age} years old.\`;`
  }
};

function displayMenu() {
  console.log('\n=== java2igcse Interactive Demo ===');
  console.log('1. Convert Java code');
  console.log('2. Convert TypeScript code');
  console.log('3. Load example from file');
  console.log('4. Show available examples');
  console.log('5. Enter custom code');
  console.log('6. Show conversion options');
  console.log('7. Exit');
  console.log('=====================================');
}

function displayExamples(language) {
  console.log(`\nAvailable ${language} examples:`);
  const exampleKeys = Object.keys(examples[language]);
  exampleKeys.forEach((key, index) => {
    console.log(`${index + 1}. ${key}`);
  });
  return exampleKeys;
}

function displayConversionResult(result, language) {
  console.log(`\n=== Conversion Result (${language}) ===`);
  
  if (result.success) {
    console.log('✅ Conversion successful!');
    console.log('\n--- IGCSE Pseudocode ---');
    console.log(result.pseudocode);
    
    if (result.warnings.length > 0) {
      console.log('\n--- Warnings ---');
      result.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.code}] ${warning.message}`);
        if (warning.line) {
          console.log(`   at line ${warning.line}`);
        }
      });
    }
    
    console.log('\n--- Metadata ---');
    console.log(`Source Language: ${result.metadata.sourceLanguage}`);
    console.log(`Conversion Time: ${result.metadata.conversionTime}ms`);
    console.log(`Lines Processed: ${result.metadata.linesProcessed}`);
    console.log(`Features Used: ${result.metadata.featuresUsed.join(', ')}`);
    
  } else {
    console.log('❌ Conversion failed!');
    console.log('\n--- Errors ---');
    result.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. [${warning.code}] ${warning.message}`);
      if (warning.line) {
        console.log(`   at line ${warning.line}`);
      }
    });
  }
  
  console.log('=====================================');
}

function convertCode(code, language) {
  console.log(`\n--- Input ${language} Code ---`);
  console.log(code);
  
  const result = language === 'java' 
    ? converter.convertJava(code)
    : converter.convertTypeScript(code);
    
  displayConversionResult(result, language);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function loadExampleFile(filename) {
  try {
    const filePath = path.join(__dirname, filename);
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.log(`Error loading file: ${error.message}`);
    return null;
  }
}

async function handleJavaConversion() {
  const exampleKeys = displayExamples('java');
  const choice = await askQuestion('\nSelect example (number) or press Enter to skip: ');
  
  if (choice && !isNaN(choice)) {
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < exampleKeys.length) {
      const exampleKey = exampleKeys[index];
      const code = examples.java[exampleKey];
      convertCode(code, 'java');
    } else {
      console.log('Invalid selection.');
    }
  }
}

async function handleTypeScriptConversion() {
  const exampleKeys = displayExamples('typescript');
  const choice = await askQuestion('\nSelect example (number) or press Enter to skip: ');
  
  if (choice && !isNaN(choice)) {
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < exampleKeys.length) {
      const exampleKey = exampleKeys[index];
      const code = examples.typescript[exampleKey];
      convertCode(code, 'typescript');
    } else {
      console.log('Invalid selection.');
    }
  }
}

async function handleFileLoad() {
  const filename = await askQuestion('Enter filename (relative to examples directory): ');
  const code = loadExampleFile(filename);
  
  if (code) {
    const language = await askQuestion('Is this Java or TypeScript? (java/typescript): ');
    if (language === 'java' || language === 'typescript') {
      convertCode(code, language);
    } else {
      console.log('Invalid language. Please specify "java" or "typescript".');
    }
  }
}

async function handleCustomCode() {
  const language = await askQuestion('Enter language (java/typescript): ');
  
  if (language !== 'java' && language !== 'typescript') {
    console.log('Invalid language. Please specify "java" or "typescript".');
    return;
  }
  
  console.log('\nEnter your code (press Ctrl+D when finished):');
  
  let code = '';
  const customRl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    customRl.on('line', (line) => {
      code += line + '\n';
    });
    
    customRl.on('close', () => {
      if (code.trim()) {
        convertCode(code, language);
      } else {
        console.log('No code entered.');
      }
      resolve();
    });
  });
}

function showConversionOptions() {
  console.log('\n=== Conversion Options ===');
  console.log('The converter supports the following options:');
  console.log('');
  console.log('• indentSize (number): Number of spaces for indentation (default: 3)');
  console.log('• includeComments (boolean): Include explanatory comments (default: true)');
  console.log('• strictMode (boolean): Enforce strict IGCSE compliance (default: false)');
  console.log('• customMappings (object): Custom type/keyword mappings');
  console.log('');
  console.log('Example usage:');
  console.log('const options = {');
  console.log('  indentSize: 4,');
  console.log('  includeComments: true,');
  console.log('  strictMode: true');
  console.log('};');
  console.log('const result = converter.convertJava(code, options);');
  console.log('=============================');
}

async function main() {
  console.log('Welcome to the java2igcse Interactive Demo!');
  console.log('This tool converts Java and TypeScript code to IGCSE pseudocode format.');
  
  while (true) {
    displayMenu();
    const choice = await askQuestion('\nEnter your choice (1-7): ');
    
    switch (choice) {
      case '1':
        await handleJavaConversion();
        break;
      case '2':
        await handleTypeScriptConversion();
        break;
      case '3':
        await handleFileLoad();
        break;
      case '4':
        console.log('\n=== Available Examples ===');
        displayExamples('java');
        displayExamples('typescript');
        break;
      case '5':
        await handleCustomCode();
        break;
      case '6':
        showConversionOptions();
        break;
      case '7':
        console.log('Thank you for using java2igcse! Goodbye!');
        rl.close();
        return;
      default:
        console.log('Invalid choice. Please enter a number between 1 and 7.');
    }
    
    await askQuestion('\nPress Enter to continue...');
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nGoodbye!');
  rl.close();
  process.exit(0);
});

// Start the interactive demo
main().catch((error) => {
  console.error('An error occurred:', error);
  rl.close();
  process.exit(1);
});