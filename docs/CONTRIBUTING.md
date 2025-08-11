# Contributing to java2igcse

Thank you for your interest in contributing to java2igcse! This guide will help you get started with contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Code Style Guidelines](#code-style-guidelines)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please be respectful, inclusive, and professional in all interactions.

### Expected Behavior
- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior
- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing private information without permission
- Any conduct that would be inappropriate in a professional setting

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm 8.x or higher
- Git
- TypeScript knowledge
- Understanding of Java and/or TypeScript syntax
- Familiarity with IGCSE pseudocode standards

### First-Time Contributors
1. **Read the documentation**: Familiarize yourself with the API and IGCSE pseudocode standards
2. **Look for "good first issue" labels**: These are beginner-friendly issues
3. **Join discussions**: Participate in issue discussions to understand the project better
4. **Start small**: Begin with documentation improvements or small bug fixes

## Development Setup

### 1. Fork and Clone
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/java2igcse.git
cd java2igcse

# Add upstream remote
git remote add upstream https://github.com/fairy-pitta/java2igcse.git
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Setup
```bash
# Run tests to ensure everything works
npm test

# Build the project
npm run build

# Run linting
npm run lint
```

### 4. Development Commands
```bash
# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Format code
npm run format

# Fix linting issues
npm run lint:fix

# Clean build artifacts
npm run clean
```

## Project Structure

```
java2igcse/
├── src/                    # Source code
│   ├── converters/         # Type conversion utilities
│   ├── generators/         # Pseudocode generation
│   ├── parsers/           # Language parsers (Java, TypeScript)
│   ├── transformers/      # AST transformation logic
│   ├── validators/        # Input validation
│   ├── errors.ts          # Error definitions
│   └── index.ts           # Main API exports
├── tests/                 # Test files
│   ├── *.test.ts          # Unit and integration tests
│   └── setup.test.ts      # Test configuration
├── docs/                  # Documentation
│   ├── API.md             # API documentation
│   ├── TROUBLESHOOTING.md # Troubleshooting guide
│   └── igcse-psuedocode-rule.md # IGCSE standards
├── dist/                  # Built files (generated)
├── .kiro/                 # Kiro spec files
└── package.json           # Project configuration
```

### Key Components

#### Parsers (`src/parsers/`)
- **JavaParser**: Parses Java source code into AST
- **TypeScriptParser**: Parses TypeScript source code into AST
- **ArrayParser**: Handles array-specific parsing logic

#### Transformers (`src/transformers/`)
- **BaseASTTransformer**: Common transformation logic
- **JavaASTTransformer**: Java-specific AST transformations
- **TypeScriptASTTransformer**: TypeScript-specific AST transformations
- **VariableDeclarationTransformer**: Handles variable declarations

#### Generators (`src/generators/`)
- **IGCSEPseudocodeGenerator**: Generates IGCSE-compliant pseudocode

#### Validators (`src/validators/`)
- **InputValidator**: Validates source code input

## Development Workflow

### 1. Choose an Issue
- Look for issues labeled `good first issue`, `bug`, or `enhancement`
- Comment on the issue to indicate you're working on it
- Ask questions if the requirements are unclear

### 2. Create a Branch
```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/issue-number-description
```

### 3. Make Changes
- Follow the [Test-Driven Development](#test-driven-development) approach
- Write tests first, then implement the feature
- Ensure all tests pass
- Follow code style guidelines

### 4. Test Your Changes
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/your-test.test.ts

# Run tests with coverage
npm run test:coverage

# Test with different Node.js versions if possible
```

### 5. Commit Changes
```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add support for switch statements

- Add parsing logic for switch/case statements
- Implement conversion to CASE OF/ENDCASE format
- Add comprehensive tests for switch statement conversion
- Update documentation with switch statement examples

Fixes #123"
```

#### Commit Message Format
Use conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for test additions/changes
- `refactor:` for code refactoring
- `style:` for formatting changes
- `chore:` for maintenance tasks

## Testing Guidelines

### Test-Driven Development
This project follows strict TDD principles:

1. **Write failing tests first**
2. **Implement minimal code to make tests pass**
3. **Refactor while keeping tests green**
4. **Commit only when all tests pass**

### Test Structure
```typescript
describe('Feature Name', () => {
  describe('when condition', () => {
    it('should behave as expected', () => {
      // Arrange
      const input = 'test input';
      const expected = 'expected output';
      
      // Act
      const result = converter.convertJava(input);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.pseudocode).toBe(expected);
    });
  });
});
```

### Test Categories

#### Unit Tests
Test individual components in isolation:
```typescript
// Test parser functionality
describe('JavaParser', () => {
  it('should parse variable declarations', () => {
    const parser = new JavaParser();
    const result = parser.parse('int x = 5;');
    expect(result.success).toBe(true);
  });
});
```

#### Integration Tests
Test component interactions:
```typescript
// Test end-to-end conversion
describe('Java to IGCSE Integration', () => {
  it('should convert complete Java method', () => {
    const javaCode = `
      public int add(int a, int b) {
        return a + b;
      }
    `;
    const result = converter.convertJava(javaCode);
    expect(result.pseudocode).toContain('FUNCTION add');
  });
});
```

#### Edge Case Tests
Test boundary conditions and error cases:
```typescript
describe('Error Handling', () => {
  it('should handle empty input gracefully', () => {
    const result = converter.convertJava('');
    expect(result.success).toBe(false);
    expect(result.warnings).toHaveLength(1);
  });
});
```

### Test Data
- Use realistic code examples from educational contexts
- Include both simple and complex scenarios
- Test IGCSE compliance thoroughly
- Cover all supported language features

## Code Style Guidelines

### TypeScript Style
- Use TypeScript strict mode
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Follow naming conventions:
  - Classes: `PascalCase`
  - Functions/methods: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Interfaces: `PascalCase` (no `I` prefix)

### Code Organization
```typescript
// Good: Clear interface definition
interface ConversionOptions {
  indentSize?: number;
  includeComments?: boolean;
}

// Good: Explicit return types
function convertJava(code: string, options?: ConversionOptions): ConversionResult {
  // Implementation
}

// Good: Error handling
try {
  const result = parser.parse(code);
  return result;
} catch (error) {
  return createErrorResult(error.message);
}
```

### Documentation
- Use JSDoc comments for public APIs
- Include examples in documentation
- Document complex algorithms
- Explain IGCSE-specific decisions

```typescript
/**
 * Converts Java for-loop to IGCSE FOR/TO/NEXT format
 * 
 * @param node - The for-loop AST node
 * @returns IGCSE pseudocode representation
 * 
 * @example
 * ```java
 * for (int i = 0; i < 10; i++)
 * ```
 * becomes:
 * ```
 * FOR i ← 0 TO 9
 *    // loop body
 * NEXT i
 * ```
 */
private convertForLoop(node: ForLoopNode): string {
  // Implementation
}
```

### IGCSE Compliance
- Always follow IGCSE pseudocode standards
- Use exact IGCSE keywords and syntax
- Maintain consistent indentation (3 spaces)
- Include explanatory comments for complex conversions

## Submitting Changes

### 1. Pre-submission Checklist
- [ ] All tests pass (`npm test`)
- [ ] Code follows style guidelines (`npm run lint`)
- [ ] Code is properly formatted (`npm run format`)
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventional format
- [ ] Changes are covered by tests

### 2. Push Changes
```bash
git push origin your-branch-name
```

### 3. Create Pull Request
1. Go to GitHub and create a pull request
2. Use a descriptive title and detailed description
3. Reference related issues (`Fixes #123`)
4. Add screenshots or examples if applicable
5. Request review from maintainers

### Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## IGCSE Compliance
- [ ] Output follows IGCSE pseudocode standards
- [ ] Conversion rules documented
- [ ] Edge cases handled appropriately

## Related Issues
Fixes #123
Related to #456

## Screenshots/Examples
If applicable, add examples of input/output.
```

### 4. Code Review Process
- Maintainers will review your pull request
- Address feedback promptly and professionally
- Make requested changes in new commits
- Once approved, maintainers will merge your PR

## Release Process

### Versioning
This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Build and test distribution
5. Create release tag
6. Publish to npm
7. Update documentation

## Advanced Contributing

### Adding New Language Features

#### 1. Parser Extension
```typescript
// Add new AST node type
interface SwitchStatementNode extends JavaASTNode {
  type: 'switch_statement';
  discriminant: ExpressionNode;
  cases: CaseNode[];
}

// Extend parser
class JavaParser {
  private parseSwitchStatement(): SwitchStatementNode {
    // Implementation
  }
}
```

#### 2. Transformer Extension
```typescript
// Add transformation logic
class JavaASTTransformer {
  private transformSwitchStatement(node: SwitchStatementNode): IntermediateRepresentation {
    // Convert to IGCSE CASE OF structure
  }
}
```

#### 3. Generator Extension
```typescript
// Add generation logic
class IGCSEPseudocodeGenerator {
  private generateCaseStatement(ir: IntermediateRepresentation): string {
    // Generate CASE OF/ENDCASE pseudocode
  }
}
```

#### 4. Test Coverage
```typescript
describe('Switch Statement Conversion', () => {
  it('should convert simple switch to CASE OF', () => {
    const javaCode = `
      switch (x) {
        case 1: System.out.println("one"); break;
        case 2: System.out.println("two"); break;
        default: System.out.println("other");
      }
    `;
    
    const expected = `
      CASE OF x
        1: OUTPUT "one"
        2: OUTPUT "two"
        OTHERWISE: OUTPUT "other"
      ENDCASE
    `;
    
    const result = converter.convertJava(javaCode);
    expect(result.pseudocode.trim()).toBe(expected.trim());
  });
});
```

### Performance Optimization
- Profile code with large inputs
- Optimize AST traversal algorithms
- Cache frequently used transformations
- Monitor memory usage

### Documentation Contributions
- Improve API documentation
- Add more examples
- Update troubleshooting guide
- Create tutorial content

## Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Comments**: Code-specific discussions

### Maintainer Response Times
- Issues: Within 48 hours
- Pull Requests: Within 72 hours
- Security Issues: Within 24 hours

### Mentorship
New contributors can request mentorship for:
- Understanding the codebase
- Learning IGCSE pseudocode standards
- Implementing complex features
- Best practices guidance

## Recognition

Contributors are recognized in:
- `CONTRIBUTORS.md` file
- Release notes
- GitHub contributor graphs
- Special mentions for significant contributions

Thank you for contributing to java2igcse! Your efforts help make programming education more accessible and standardized.