// Switch statement conversion tests for Java2IGCSEConverter
// Tests proper CASE/OF/OTHERWISE/ENDCASE structure

import { Java2IGCSEConverterImpl } from '../src/index';

describe('Switch Statement Conversion', () => {
  let converter: Java2IGCSEConverterImpl;

  beforeEach(() => {
    converter = new Java2IGCSEConverterImpl();
  });

  describe('Basic Switch Statement', () => {
    test('converts simple switch statement with multiple cases', () => {
      const input = `
        public class Test {
          public static void testSwitch() {
            int count = 0;
            switch (count) {
              case 1:
                System.out.println("One");
                break;
              case 2:
                System.out.println("Two");
                break;
              default:
                System.out.println("Other");
            }
          }
        }
      `;

      const result = converter.convertJava(input);
      
      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('CASE OF count');
      expect(result.pseudocode).toContain('1:');
      expect(result.pseudocode).toContain('OUTPUT "One"');
      expect(result.pseudocode).toContain('2:');
      expect(result.pseudocode).toContain('OUTPUT "Two"');
      expect(result.pseudocode).toContain('OTHERWISE:');
      expect(result.pseudocode).toContain('OUTPUT "Other"');
      expect(result.pseudocode).toContain('ENDCASE');
      
      // Verify that each case only contains its own statements
      const lines = result.pseudocode.split('\n');
      const caseOneIndex = lines.findIndex(line => line.includes('1:'));
      const caseTwoIndex = lines.findIndex(line => line.includes('2:'));
      const otherwiseIndex = lines.findIndex(line => line.includes('OTHERWISE:'));
      
      expect(caseOneIndex).toBeGreaterThan(-1);
      expect(caseTwoIndex).toBeGreaterThan(-1);
      expect(otherwiseIndex).toBeGreaterThan(-1);
      
      // Check that "One" appears only after case 1 and before case 2
      const oneIndex = lines.findIndex(line => line.includes('OUTPUT "One"'));
      const twoIndex = lines.findIndex(line => line.includes('OUTPUT "Two"'));
      const otherIndex = lines.findIndex(line => line.includes('OUTPUT "Other"'));
      
      expect(oneIndex).toBeGreaterThan(caseOneIndex);
      expect(oneIndex).toBeLessThan(caseTwoIndex);
      expect(twoIndex).toBeGreaterThan(caseTwoIndex);
      expect(twoIndex).toBeLessThan(otherwiseIndex);
      expect(otherIndex).toBeGreaterThan(otherwiseIndex);
    });

    test('converts switch statement without default case', () => {
      const input = `
        switch (grade) {
          case 'A':
            System.out.println("Excellent");
            break;
          case 'B':
            System.out.println("Good");
            break;
        }
      `;

      const result = converter.convertJava(input);
      
      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('CASE OF grade');
      expect(result.pseudocode).toContain("'A':");
      expect(result.pseudocode).toContain('OUTPUT "Excellent"');
      expect(result.pseudocode).toContain("'B':");
      expect(result.pseudocode).toContain('OUTPUT "Good"');
      expect(result.pseudocode).not.toContain('OTHERWISE:');
      expect(result.pseudocode).toContain('ENDCASE');
    });

    test('converts switch statement with multiple statements per case', () => {
      const input = `
        switch (option) {
          case 1:
            int x = 10;
            System.out.println("Option 1");
            x = x + 5;
            break;
          case 2:
            System.out.println("Option 2");
            System.out.println("Second line");
            break;
          default:
            System.out.println("Default option");
        }
      `;

      const result = converter.convertJava(input);
      
      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('CASE OF option');
      expect(result.pseudocode).toContain('1:');
      expect(result.pseudocode).toContain('DECLARE x : INTEGER ← 10');
      expect(result.pseudocode).toContain('OUTPUT "Option 1"');
      expect(result.pseudocode).toContain('x ← x + 5');
      expect(result.pseudocode).toContain('2:');
      expect(result.pseudocode).toContain('OUTPUT "Option 2"');
      expect(result.pseudocode).toContain('OUTPUT "Second line"');
      expect(result.pseudocode).toContain('OTHERWISE:');
      expect(result.pseudocode).toContain('OUTPUT "Default option"');
      expect(result.pseudocode).toContain('ENDCASE');
    });
  });

  describe('Switch Statement Edge Cases', () => {
    test('handles switch with fall-through behavior (no break)', () => {
      const input = `
        switch (value) {
          case 1:
            System.out.println("One");
          case 2:
            System.out.println("One or Two");
            break;
          default:
            System.out.println("Other");
        }
      `;

      const result = converter.convertJava(input);
      
      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('CASE OF value');
      expect(result.pseudocode).toContain('1:');
      expect(result.pseudocode).toContain('OUTPUT "One"');
      expect(result.pseudocode).toContain('2:');
      expect(result.pseudocode).toContain('OUTPUT "One or Two"');
      expect(result.pseudocode).toContain('OTHERWISE:');
      expect(result.pseudocode).toContain('OUTPUT "Other"');
      expect(result.pseudocode).toContain('ENDCASE');
      
      // Should include a warning about fall-through behavior
      expect(result.warnings.some(w => w.message.includes('fall-through') || w.message.includes('break'))).toBe(true);
    });

    test('handles switch with string cases', () => {
      const input = `
        switch (command) {
          case "start":
            System.out.println("Starting");
            break;
          case "stop":
            System.out.println("Stopping");
            break;
          default:
            System.out.println("Unknown command");
        }
      `;

      const result = converter.convertJava(input);
      
      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('CASE OF command');
      expect(result.pseudocode).toContain('"start":');
      expect(result.pseudocode).toContain('OUTPUT "Starting"');
      expect(result.pseudocode).toContain('"stop":');
      expect(result.pseudocode).toContain('OUTPUT "Stopping"');
      expect(result.pseudocode).toContain('OTHERWISE:');
      expect(result.pseudocode).toContain('OUTPUT "Unknown command"');
      expect(result.pseudocode).toContain('ENDCASE');
    });

    test('handles empty switch statement', () => {
      const input = `
        switch (value) {
        }
      `;

      const result = converter.convertJava(input);
      
      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('CASE OF value');
      expect(result.pseudocode).toContain('ENDCASE');
      expect(result.pseudocode).not.toContain('OTHERWISE:');
    });

    test('handles switch with only default case', () => {
      const input = `
        switch (value) {
          default:
            System.out.println("Default only");
        }
      `;

      const result = converter.convertJava(input);
      
      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('CASE OF value');
      expect(result.pseudocode).toContain('OTHERWISE:');
      expect(result.pseudocode).toContain('OUTPUT "Default only"');
      expect(result.pseudocode).toContain('ENDCASE');
    });
  });

  describe('TypeScript Switch Statement', () => {
    test('converts TypeScript switch statement', () => {
      const input = `
        function processGrade(grade: number): void {
          switch (grade) {
            case 90:
              console.log("A grade");
              break;
            case 80:
              console.log("B grade");
              break;
            default:
              console.log("Other grade");
          }
        }
      `;

      const result = converter.convertTypeScript(input);
      
      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('CASE OF grade');
      expect(result.pseudocode).toContain('90:');
      expect(result.pseudocode).toContain('OUTPUT "A grade"');
      expect(result.pseudocode).toContain('80:');
      expect(result.pseudocode).toContain('OUTPUT "B grade"');
      expect(result.pseudocode).toContain('OTHERWISE:');
      expect(result.pseudocode).toContain('OUTPUT "Other grade"');
      expect(result.pseudocode).toContain('ENDCASE');
    });

    test('converts TypeScript switch with boolean expression', () => {
      const input = `
        switch (true) {
          case grade >= 90:
            console.log("Excellent");
            break;
          case grade >= 80:
            console.log("Good");
            break;
          default:
            console.log("Needs improvement");
        }
      `;

      const result = converter.convertTypeScript(input);
      
      expect(result.success).toBe(true);
      expect(result.pseudocode).toContain('CASE OF TRUE');
      expect(result.pseudocode).toContain('grade >= 90:');
      expect(result.pseudocode).toContain('OUTPUT "Excellent"');
      expect(result.pseudocode).toContain('grade >= 80:');
      expect(result.pseudocode).toContain('OUTPUT "Good"');
      expect(result.pseudocode).toContain('OTHERWISE:');
      expect(result.pseudocode).toContain('OUTPUT "Needs improvement"');
      expect(result.pseudocode).toContain('ENDCASE');
    });
  });

  describe('IGCSE Compliance', () => {
    test('uses proper IGCSE keywords', () => {
      const input = `
        switch (status) {
          case 1:
            System.out.println("Active");
            break;
          default:
            System.out.println("Inactive");
        }
      `;

      const result = converter.convertJava(input);
      
      expect(result.success).toBe(true);
      
      // Check for proper IGCSE keywords
      expect(result.pseudocode).toContain('CASE OF');
      expect(result.pseudocode).toContain('OTHERWISE');
      expect(result.pseudocode).toContain('ENDCASE');
      expect(result.pseudocode).toContain('OUTPUT');
      
      // Should not contain Java-specific keywords
      expect(result.pseudocode).not.toContain('switch');
      expect(result.pseudocode).not.toContain('case');
      expect(result.pseudocode).not.toContain('default');
      expect(result.pseudocode).not.toContain('break');
      expect(result.pseudocode).not.toContain('System.out.println');
    });

    test('maintains proper indentation', () => {
      const input = `
        switch (level) {
          case 1:
            System.out.println("Beginner");
            break;
          case 2:
            System.out.println("Intermediate");
            break;
          default:
            System.out.println("Advanced");
        }
      `;

      const result = converter.convertJava(input);
      
      expect(result.success).toBe(true);
      
      const lines = result.pseudocode.split('\n');
      const caseOfLine = lines.find(line => line.includes('CASE OF'));
      const case1Line = lines.find(line => line.includes('1:'));
      const outputLine = lines.find(line => line.includes('OUTPUT "Beginner"'));
      const endcaseLine = lines.find(line => line.includes('ENDCASE'));
      
      expect(caseOfLine).toBeDefined();
      expect(case1Line).toBeDefined();
      expect(outputLine).toBeDefined();
      expect(endcaseLine).toBeDefined();
      
      // Check indentation levels (IGCSE standard: 3 spaces)
      const caseOfIndent = caseOfLine!.match(/^(\s*)/)?.[1]?.length || 0;
      const case1Indent = case1Line!.match(/^(\s*)/)?.[1]?.length || 0;
      const outputIndent = outputLine!.match(/^(\s*)/)?.[1]?.length || 0;
      const endcaseIndent = endcaseLine!.match(/^(\s*)/)?.[1]?.length || 0;
      
      expect(case1Indent).toBe(caseOfIndent + 3);
      expect(outputIndent).toBe(case1Indent + 3);
      expect(endcaseIndent).toBe(caseOfIndent);
    });
  });
});