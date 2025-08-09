// Tests for class structure conversion (Task 10.3)

import { JavaParser } from '../src/parsers/java-parser';
import { TypeScriptParser } from '../src/parsers/typescript-parser';
import { JavaASTTransformer } from '../src/transformers/java-transformer';
import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';
import { IGCSEPseudocodeGenerator } from '../src/generators/pseudocode-generator';

describe('Class Structure Conversion', () => {
  let javaParser: JavaParser;
  let typescriptParser: TypeScriptParser;
  let javaTransformer: JavaASTTransformer;
  let typescriptTransformer: TypeScriptASTTransformer;
  let generator: IGCSEPseudocodeGenerator;

  beforeEach(() => {
    javaParser = new JavaParser();
    typescriptParser = new TypeScriptParser();
    javaTransformer = new JavaASTTransformer();
    typescriptTransformer = new TypeScriptASTTransformer();
    generator = new IGCSEPseudocodeGenerator();
  });

  describe('Java Class Conversion', () => {
    test('converts simple class to procedural equivalent', () => {
      const input = `
        class Person {
          private String name;
          private int age;
          
          public Person(String name, int age) {
            this.name = name;
            this.age = age;
          }
          
          public void greet() {
            System.out.println("Hello, I'm " + name);
          }
        }
      `;
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const classDecl = findNodeByKind(transformResult.result, 'class_converted');
      expect(classDecl).toBeDefined();
      expect(classDecl?.metadata?.className).toBe('Person');
    });

    test('generates procedural pseudocode for class', () => {
      const input = `
        class Person {
          private String name;
          
          public Person(String name) {
            this.name = name;
          }
          
          public void greet() {
            System.out.println("Hello, I'm " + name);
          }
        }
      `;
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Person');
      expect(pseudocode).toContain('CALL public Person'); // Constructor
      expect(pseudocode).toContain('PROCEDURE greet');
    });
  });

  describe('TypeScript Class Conversion', () => {
    test('converts TypeScript class to procedural equivalent', () => {
      const input = `
        class Person {
          private name: string;
          private age: number;
          
          constructor(name: string, age: number) {
            this.name = name;
            this.age = age;
          }
          
          greet(): void {
            console.log("Hello, I'm " + this.name);
          }
        }
      `;
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const classDecl = findNodeByKind(transformResult.result, 'class_converted');
      expect(classDecl).toBeDefined();
      expect(classDecl?.metadata?.className).toBe('Person');
    });

    test('generates procedural pseudocode for TypeScript class', () => {
      const input = `
        class Person {
          private name: string;
          
          constructor(name: string) {
            this.name = name;
          }
          
          greet(): void {
            console.log("Hello, I'm " + this.name);
          }
        }
      `;
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Person');
      expect(pseudocode).toContain('DECLARE name : STRING'); // Property declaration
      expect(pseudocode).toContain('PROCEDURE greet');
    });
  });
});

// Helper function to find nodes by kind in the IR tree
function findNodeByKind(node: any, kind: string): any {
  if (node.kind === kind) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByKind(child, kind);
      if (found) {
        return found;
      }
    }
  }
  
  return null;
}