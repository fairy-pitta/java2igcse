import { describe, it, expect } from 'vitest';
import { JavaParser } from 'src/parser/JavaParser';
describe('Parser - Declarations', () => {
    it('should parse a simple method declaration (procedure)', () => {
        const parser = new JavaParser();
        const ast = parser.parse('public void myMethod() {}');
        const methodDeclaration = ast.children?.[0];
        expect(methodDeclaration.type).toBe('MethodDeclaration');
        expect(methodDeclaration.name).toBe('myMethod');
        expect(methodDeclaration.returnType).toBe('void');
        expect(methodDeclaration.parameters).toEqual([]);
    });
    it('should parse a method declaration with parameters (function)', () => {
        const parser = new JavaParser();
        const ast = parser.parse('public int add(int a, int b) { return a + b; }');
        const methodDeclaration = ast.children?.[0];
        expect(methodDeclaration.type).toBe('MethodDeclaration');
        expect(methodDeclaration.name).toBe('add');
        expect(methodDeclaration.returnType).toBe('int');
        expect(methodDeclaration.parameters?.length).toBe(2);
        // More detailed parameter checks can be added here
    });
    it('should parse a class with a method', () => {
        const parser = new JavaParser();
        const ast = parser.parse('public class MyClass { public void myMethod() {} }');
        const classDeclaration = ast.children?.[0];
        expect(classDeclaration.type).toBe('ClassDeclaration');
        expect(classDeclaration.name).toBe('MyClass');
        const methodDeclaration = classDeclaration.body?.children?.[0];
        expect(methodDeclaration.type).toBe('MethodDeclaration');
    });
});
//# sourceMappingURL=declarations.test.js.map