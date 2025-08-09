/**
 * Simple test for JavaParser
 */

describe('Simple JavaParser Test', () => {
  test('should import JavaParser successfully', async () => {
    const JavaParser = (await import('../src/parsers/java-parser')).default;
    expect(JavaParser).toBeDefined();
    
    const parser = new JavaParser();
    expect(parser).toBeDefined();
    expect(typeof parser.parse).toBe('function');
    expect(typeof parser.validate).toBe('function');
  });

  test('should parse simple Java code', async () => {
    const JavaParser = (await import('../src/parsers/java-parser')).default;
    const parser = new JavaParser();
    
    const result = parser.parse('int x = 5;');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
    expect(result.ast.type).toBe('program');
  });
});