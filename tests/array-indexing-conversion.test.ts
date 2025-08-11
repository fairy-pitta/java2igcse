import { ArrayIndexingConverter, ArrayIndexContext } from '../src/utils/array-indexing-converter';

describe('Array Indexing Conversion', () => {
  describe('convertArrayAccess', () => {
    test('converts literal array indices from 0-based to 1-based', () => {
      const result = ArrayIndexingConverter.convertArrayAccess('arr[0]');
      
      expect(result.convertedExpression).toBe('arr[1]');
      expect(result.hasArrayAccess).toBe(true);
      expect(result.warnings).toContain('Array index 0 converted to 1 for 1-based indexing');
    });

    test('converts multiple array accesses in single expression', () => {
      const result = ArrayIndexingConverter.convertArrayAccess('arr[0] > arr[1]');
      
      expect(result.convertedExpression).toBe('arr[1] > arr[2]');
      expect(result.hasArrayAccess).toBe(true);
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[0]).toContain('Array index 0 converted to 1');
      expect(result.warnings[1]).toContain('Array index 1 converted to 2');
    });

    test('converts multi-dimensional array access', () => {
      const result = ArrayIndexingConverter.convertArrayAccess('matrix[0][1]');
      
      expect(result.convertedExpression).toBe('matrix[1][2]');
      expect(result.hasArrayAccess).toBe(true);
      expect(result.warnings).toHaveLength(2);
    });

    test('handles expressions without array access', () => {
      const result = ArrayIndexingConverter.convertArrayAccess('x + y');
      
      expect(result.convertedExpression).toBe('x + y');
      expect(result.hasArrayAccess).toBe(false);
      expect(result.warnings).toHaveLength(0);
    });

    test('handles variable array indices with context', () => {
      const context: ArrayIndexContext = {
        forLoopVariables: {
          'i': { start: 0, end: 'arr.length' }
        }
      };
      
      const result = ArrayIndexingConverter.convertArrayAccess('arr[i]', context);
      
      expect(result.convertedExpression).toBe('arr[i]');
      expect(result.hasArrayAccess).toBe(true);
      expect(result.warnings[0]).toContain('For loop variable i already converted to 1-based indexing');
    });
  });

  describe('convertForLoopBounds', () => {
    test('converts 0-based for loop to 1-based (array iteration)', () => {
      const result = ArrayIndexingConverter.convertForLoopBounds('i', '0', 'i < arr.length');
      
      expect(result.startValue).toBe('1');
      expect(result.endValue).toBe('LENGTH(arr)');
      expect(result.warnings).toContain('For loop start value converted from 0 to 1 for 1-based array indexing');
      expect(result.warnings).toContain('Array length \'arr.length\' converted to LENGTH(arr)');
    });

    test('converts 1-based for loop to 2-based (second element)', () => {
      const result = ArrayIndexingConverter.convertForLoopBounds('i', '1', 'i < arr.length');
      
      expect(result.startValue).toBe('2');
      expect(result.endValue).toBe('LENGTH(arr)');
      expect(result.warnings).toContain('For loop start value converted from 1 to 2 for 1-based array indexing');
      expect(result.warnings).toContain('Array length \'arr.length\' converted to LENGTH(arr)');
    });

    test('handles array.length in end condition', () => {
      const result = ArrayIndexingConverter.convertForLoopBounds('i', '0', 'i < numbers.length');
      
      expect(result.startValue).toBe('1');
      expect(result.endValue).toBe('LENGTH(numbers)');
      expect(result.warnings).toContain('Array length \'numbers.length\' converted to LENGTH(numbers)');
    });
  });

  describe('convertArrayAssignment', () => {
    test('converts array assignment with array access on both sides', () => {
      const result = ArrayIndexingConverter.convertArrayAssignment('arr[0]', 'arr[1]');
      
      expect(result.convertedExpression).toBe('arr[1] ← arr[2]');
      expect(result.hasArrayAccess).toBe(true);
      expect(result.warnings).toHaveLength(2);
    });

    test('converts simple variable assignment with array access', () => {
      const result = ArrayIndexingConverter.convertArrayAssignment('x', 'arr[0]');
      
      expect(result.convertedExpression).toBe('x ← arr[1]');
      expect(result.hasArrayAccess).toBe(true);
      expect(result.warnings).toContain('Array index 0 converted to 1 for 1-based indexing');
    });
  });

  describe('edge cases', () => {
    test('handles complex expressions with multiple array types', () => {
      const result = ArrayIndexingConverter.convertArrayAccess('matrix[0][1] + arr[2] - list[0]');
      
      expect(result.convertedExpression).toBe('matrix[1][2] + arr[3] - list[1]');
      expect(result.hasArrayAccess).toBe(true);
      expect(result.warnings).toHaveLength(4); // Two indices for matrix, one each for arr and list
    });

    test('preserves string literals containing bracket-like patterns', () => {
      const result = ArrayIndexingConverter.convertArrayAccess('arr[0] + "[test]"');
      
      expect(result.convertedExpression).toBe('arr[1] + "[test]"');
      expect(result.hasArrayAccess).toBe(true);
      expect(result.warnings).toHaveLength(1);
    });

    test('handles nested array access expressions (limitation documented)', () => {
      // Note: Nested array access with complex expressions is not fully supported
      // This is a known limitation - the regex cannot properly parse nested brackets
      const result = ArrayIndexingConverter.convertArrayAccess('arr[matrix[0][1]]');
      
      // Currently only partially converts due to regex limitations with nested brackets
      expect(result.convertedExpression).toBe('arr[matrix[0][2]]');
      expect(result.hasArrayAccess).toBe(true);
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[0]).toContain('may need manual review');
    });
  });
});