import { describe, it, expect } from 'vitest';
import { JavaParser } from 'src/parser/JavaParser';
import { ASTNode } from 'src/types/ast';

describe('Parser - Control Flow', () => {
  it('should parse a nested if-else statement', () => {
    const parser = new JavaParser();
    const ast = parser.parse('if (a) { if (b) { x = 1; } else { x = 2; } }');
    const ifStatement = ast.children?.[0] as ASTNode;

    expect(ifStatement.type).toBe('IfStatement');
    const nestedIf = (ifStatement.thenBranch as ASTNode)?.children?.[0] as ASTNode;
    expect(nestedIf.type).toBe('IfStatement');
    expect(nestedIf.condition?.type).toBe('Identifier');
    expect(nestedIf.condition?.name).toBe('b');
    expect(nestedIf.thenBranch).toBeDefined();
    expect(nestedIf.elseBranch).toBeDefined();
  });

  it('should parse an if-else if-else statement', () => {
    const parser = new JavaParser();
    const ast = parser.parse('if (a) { x = 1; } else if (b) { x = 2; } else { x = 3; }');
    const ifStatement = ast.children?.[0] as ASTNode;

    expect(ifStatement.type).toBe('IfStatement');
    expect(ifStatement.elseBranch?.type).toBe('IfStatement');
  });

  it('should parse a for loop with a complex condition', () => {
    const parser = new JavaParser();
    const ast = parser.parse('for (int i = 0; i < 10 && ok; i++) {}');
    const forStatement = ast.children?.[0] as ASTNode;

    expect(forStatement.type).toBe('ForStatement');
    const condition = forStatement.condition as ASTNode;
    expect(condition.type).toBe('BinaryExpression');
    expect(condition.operator).toBe('&&');
  });
});