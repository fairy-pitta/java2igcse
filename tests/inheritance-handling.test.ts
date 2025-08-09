// Tests for class inheritance handling (Task 10.2)

import { JavaParser } from '../src/parsers/java-parser';
import { TypeScriptParser } from '../src/parsers/typescript-parser';
import { JavaASTTransformer } from '../src/transformers/java-transformer';
import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';
import { IGCSEPseudocodeGenerator } from '../src/generators/pseudocode-generator';

describe('Class Inheritance Handling', () => {
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

  describe('Java Inheritance', () => {
    test('identifies inheritance relationships', () => {
      const input = 'class Dog extends Animal { public void bark() { System.out.println("Woof"); } }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      // Check for inheritance handling
      const classDecl = findNodeByKind(transformResult.result, 'class_converted');
      if (classDecl) {
        expect(classDecl.metadata?.heritage).toContain('Animal');
        expect(classDecl.metadata?.className).toBe('Dog');
      }
    });

    test('generates inheritance comments in pseudocode', () => {
      const input = 'class Dog extends Animal { public void bark() { System.out.println("Woof"); } }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Dog inherits from Animal');
      expect(pseudocode).toContain('PROCEDURE bark');
      expect(pseudocode).toContain('OUTPUT "Woof"');
    });
  });

  describe('TypeScript Inheritance', () => {
    test('identifies class inheritance', () => {
      const input = 'class Dog extends Animal { bark(): void { console.log("Woof"); } }';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const classDecl = findNodeByKind(transformResult.result, 'class_converted');
      if (classDecl) {
        expect(classDecl.metadata?.heritage).toContain('extends Animal');
        expect(classDecl.metadata?.className).toBe('Dog');
      }
    });

    test('handles interface implementation', () => {
      const input = 'class Dog implements Mammal { bark(): void { console.log("Woof"); } }';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const classDecl = findNodeByKind(transformResult.result, 'class_converted');
      if (classDecl) {
        expect(classDecl.metadata?.heritage).toContain('implements Mammal');
      }
    });

    test('generates inheritance comments in pseudocode', () => {
      const input = 'class Dog extends Animal { bark(): void { console.log("Woof"); } }';
      const parseResult = typescriptParser.parse(input);
      const transformResult = typescriptTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Dog extends extends Animal');
      expect(pseudocode).toContain('PROCEDURE bark');
      expect(pseudocode).toContain('OUTPUT "Woof"');
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