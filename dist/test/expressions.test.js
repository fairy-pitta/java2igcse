import { describe, it, expect } from 'vitest';
import { JavaParser } from 'src/parser/JavaParser';
describe('Parser - Expressions', () => {
    it('should parse simple arithmetic expressions', () => {
        const parser = new JavaParser();
        const ast = parser.parse('int result = a + b * c;');
        const varDeclaration = ast.children?.[0];
        const expression = varDeclaration.initializer;
        expect(expression.type).toBe('BinaryExpression');
        expect(expression.operator).toBe('+');
        expect(expression.left?.type).toBe('Identifier');
        expect(expression.left?.name).toBe('a');
        const right = expression.right;
        expect(right.type).toBe('BinaryExpression');
        expect(right.operator).toBe('*');
        expect(right.left?.name).toBe('b');
        expect(right.right?.name).toBe('c');
    });
    it('should handle parentheses to override precedence', () => {
        const parser = new JavaParser();
        const ast = parser.parse('int result = (a + b) * c;');
        const varDeclaration = ast.children?.[0];
        const expression = varDeclaration.initializer;
        expect(expression.type).toBe('BinaryExpression');
        expect(expression.operator).toBe('*');
        expect(expression.right?.name).toBe('c');
        const left = expression.left;
        expect(left.type).toBe('BinaryExpression');
        expect(left.operator).toBe('+');
        expect(left.left?.name).toBe('a');
        expect(left.right?.name).toBe('b');
    });
});
//# sourceMappingURL=expressions.test.js.map