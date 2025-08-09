// Tests for static method and variable conversion (Task 10.1)

import { JavaParser } from '../src/parsers/java-parser';
import { TypeScriptParser } from '../src/parsers/typescript-parser';
import { JavaASTTransformer } from '../src/transformers/java-transformer';
import { TypeScriptASTTransformer } from '../src/transformers/typescript-transformer';
import { IGCSEPseudocodeGenerator } from '../src/generators/pseudocode-generator';

describe('Static Member Conversion', () => {
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

  describe('Java Static Methods', () => {
    test('converts static void method to procedure with comment', () => {
      const input = 'public static void main(String[] args) { System.out.println("Hello"); }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const methodDecl = findNodeByKind(transformResult.result, 'procedure_declaration');
      expect(methodDecl).toBeDefined();
      expect(methodDecl?.metadata?.isStatic).toBe(true);
      expect(methodDecl?.metadata?.isProcedure).toBe(true);
      expect(methodDecl?.metadata?.methodName).toBe('main');
      
      // Check that a warning was generated for static method
      expect(transformResult.warnings).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('Static method'),
          code: 'FEATURE_CONVERSION'
        })
      );
    });

    test('converts static method with return type to function with comment', () => {
      const input = 'public static int calculate(int x, int y) { return x + y; }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      
      expect(transformResult.success).toBe(true);
      
      const methodDecl = findNodeByKind(transformResult.result, 'function_declaration');
      expect(methodDecl).toBeDefined();
      expect(methodDecl?.metadata?.isStatic).toBe(true);
      expect(methodDecl?.metadata?.isProcedure).toBe(false);
      expect(methodDecl?.metadata?.methodName).toBe('calculate');
      expect(methodDecl?.metadata?.igcseReturnType).toBe('INTEGER');
    });
  });

  describe('Pseudocode Generation', () => {
    test('generates static method comment in pseudocode', () => {
      const input = 'public static void main(String[] args) { System.out.println("Hello World"); }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Static method');
      expect(pseudocode).toContain('PROCEDURE main');
      expect(pseudocode).toContain('OUTPUT "Hello World"');
      expect(pseudocode).toContain('ENDPROCEDURE');
    });

    test('generates static function comment in pseudocode', () => {
      const input = 'public static int calculate(int x) { return x * 2; }';
      const parseResult = javaParser.parse(input);
      const transformResult = javaTransformer.transform(parseResult.ast);
      const pseudocode = generator.generate(transformResult.result);
      
      expect(pseudocode).toContain('// Static method');
      expect(pseudocode).toContain('FUNCTION calculate');
      expect(pseudocode).toContain('RETURNS INTEGER');
      expect(pseudocode).toContain('ENDFUNCTION');
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