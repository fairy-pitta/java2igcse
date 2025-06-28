
import { describe, it, expect } from 'vitest';
import { JavaParser } from '../src/parser/JavaParser';

describe('Parser - Error Handling', () => {
  it('should throw an error for an incomplete statement', () => {
    const parser = new JavaParser();
    expect(() => parser.parse('int x =')).toThrow();
  });

  it('should throw an error for mismatched parentheses', () => {
    const parser = new JavaParser();
    expect(() => parser.parse('if (a > b { x = 1; }')).toThrow();
  });
});
