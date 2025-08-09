// Unit tests for type definitions and interfaces

import {
  // Main API interfaces
  ConversionOptions,
  ConversionResult,
  ConversionMetadata,
  Warning,
  Java2IGCSEConverter,
  
  // Parser interfaces
  SourceParser,
  ParseResult,
  ValidationResult,
  ParseError,
  
  // AST and IR types
  IntermediateRepresentation,
  IRNodeType,
  SourceLocation,
  ASTTransformer,
  TransformResult,
  
  // Generator interfaces
  PseudocodeGenerator,
  FormattingOptions,
  
  // Context and supporting types
  ConversionContext,
  Scope,
  ScopeType,
  VariableInfo,
  FunctionInfo,
  Parameter,
  IGCSEType,
  JavaASTNode,
  TypeScriptASTNode,
  
  // Error types
  ConversionError,
  UnsupportedFeatureError,
  TypeConversionError,
  ValidationError,
  IGCSEComplianceError,
  ErrorCodes,
  WarnCodes,
  createParseError,
  createUnsupportedFeatureError,
  createTypeConversionError,
  isConversionError,
  formatErrorForUser,
  collectErrorSuggestions
} from '../src/index';

// Import the ParseError class separately to avoid naming conflict
import { ParseError as ParseErrorClass } from '../src/errors';

describe('Type Definitions and Interfaces', () => {
  
  describe('Main API Interfaces', () => {
    test('ConversionOptions should have correct optional properties', () => {
      const options: ConversionOptions = {};
      expect(options).toBeDefined();
      
      const fullOptions: ConversionOptions = {
        indentSize: 4,
        includeComments: true,
        strictMode: false,
        customMappings: { 'System.out.println': 'OUTPUT' }
      };
      expect(fullOptions.indentSize).toBe(4);
      expect(fullOptions.includeComments).toBe(true);
      expect(fullOptions.strictMode).toBe(false);
      expect(fullOptions.customMappings).toEqual({ 'System.out.println': 'OUTPUT' });
    });

    test('ConversionResult should have correct structure', () => {
      const result: ConversionResult = {
        pseudocode: 'OUTPUT "Hello World"',
        warnings: [],
        success: true,
        metadata: {
          sourceLanguage: 'java',
          conversionTime: 150,
          linesProcessed: 5,
          featuresUsed: ['output', 'string_literal']
        }
      };
      
      expect(result.pseudocode).toBe('OUTPUT "Hello World"');
      expect(result.warnings).toEqual([]);
      expect(result.success).toBe(true);
      expect(result.metadata.sourceLanguage).toBe('java');
      expect(result.metadata.conversionTime).toBe(150);
      expect(result.metadata.linesProcessed).toBe(5);
      expect(result.metadata.featuresUsed).toContain('output');
    });

    test('Warning should have correct structure', () => {
      const warning: Warning = {
        message: 'Feature not fully supported',
        line: 10,
        column: 5,
        code: 'FEATURE_NOT_SUPPORTED',
        severity: 'warning'
      };
      
      expect(warning.message).toBe('Feature not fully supported');
      expect(warning.line).toBe(10);
      expect(warning.column).toBe(5);
      expect(warning.code).toBe('FEATURE_NOT_SUPPORTED');
      expect(warning.severity).toBe('warning');
    });
  });

  describe('Parser Interfaces', () => {
    test('ParseResult should handle success and error cases', () => {
      const successResult: ParseResult<JavaASTNode> = {
        ast: { type: 'Program', children: [] },
        errors: [],
        success: true
      };
      
      const errorResult: ParseResult<JavaASTNode> = {
        ast: { type: 'Program', children: [] },
        errors: [
          {
            message: 'Unexpected token',
            line: 1,
            column: 10,
            code: 'SYNTAX_ERROR',
            severity: 'error'
          }
        ],
        success: false
      };
      
      expect(successResult.success).toBe(true);
      expect(successResult.errors).toHaveLength(0);
      expect(errorResult.success).toBe(false);
      expect(errorResult.errors).toHaveLength(1);
      expect(errorResult.errors[0].message).toBe('Unexpected token');
    });

    test('ValidationResult should validate input correctly', () => {
      const validResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
      };
      
      const invalidResult: ValidationResult = {
        isValid: false,
        errors: [
          {
            message: 'Missing semicolon',
            line: 5,
            column: 20,
            code: 'SYNTAX_ERROR',
            severity: 'error'
          }
        ],
        warnings: [
          {
            message: 'Deprecated syntax',
            line: 3,
            column: 1,
            code: 'DEPRECATED_FEATURE',
            severity: 'warning'
          }
        ]
      };
      
      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toHaveLength(1);
      expect(invalidResult.warnings).toHaveLength(1);
    });
  });

  describe('AST and Intermediate Representation', () => {
    test('IntermediateRepresentation should have correct structure', () => {
      const ir: IntermediateRepresentation = {
        type: 'program',
        kind: 'main_program',
        children: [
          {
            type: 'statement',
            kind: 'output_statement',
            children: [],
            metadata: { value: 'Hello World' }
          }
        ],
        metadata: { language: 'java' },
        sourceLocation: {
          line: 1,
          column: 1,
          endLine: 3,
          endColumn: 10
        }
      };
      
      expect(ir.type).toBe('program');
      expect(ir.kind).toBe('main_program');
      expect(ir.children).toHaveLength(1);
      expect(ir.children[0].type).toBe('statement');
      expect(ir.sourceLocation?.line).toBe(1);
    });

    test('IRNodeType should include all expected types', () => {
      const nodeTypes: IRNodeType[] = [
        'program',
        'statement',
        'expression',
        'declaration',
        'control_structure',
        'function_declaration',
        'variable_declaration',
        'array_declaration',
        'assignment',
        'method_call',
        'binary_operation',
        'unary_operation',
        'literal',
        'identifier'
      ];
      
      nodeTypes.forEach(type => {
        const ir: IntermediateRepresentation = {
          type,
          kind: 'test',
          children: [],
          metadata: {}
        };
        expect(ir.type).toBe(type);
      });
    });

    test('TransformResult should handle transformation outcomes', () => {
      const successResult: TransformResult<IntermediateRepresentation> = {
        result: {
          type: 'program',
          kind: 'transformed',
          children: [],
          metadata: {}
        },
        warnings: [],
        success: true
      };
      
      const warningResult: TransformResult<IntermediateRepresentation> = {
        result: {
          type: 'program',
          kind: 'partial',
          children: [],
          metadata: {}
        },
        warnings: [
          {
            message: 'Some features approximated',
            code: 'IGCSE_APPROXIMATION',
            severity: 'warning'
          }
        ],
        success: true
      };
      
      expect(successResult.success).toBe(true);
      expect(successResult.warnings).toHaveLength(0);
      expect(warningResult.warnings).toHaveLength(1);
    });
  });

  describe('Context and Supporting Types', () => {
    test('VariableInfo should store variable metadata', () => {
      const simpleVar: VariableInfo = {
        name: 'count',
        type: 'INTEGER',
        isArray: false
      };
      
      const arrayVar: VariableInfo = {
        name: 'numbers',
        type: 'INTEGER',
        isArray: true,
        arrayDimensions: [10],
        isConstant: false,
        initialValue: null
      };
      
      expect(simpleVar.name).toBe('count');
      expect(simpleVar.type).toBe('INTEGER');
      expect(simpleVar.isArray).toBe(false);
      
      expect(arrayVar.isArray).toBe(true);
      expect(arrayVar.arrayDimensions).toEqual([10]);
    });

    test('FunctionInfo should distinguish procedures from functions', () => {
      const procedure: FunctionInfo = {
        name: 'printMessage',
        parameters: [
          { name: 'message', type: 'STRING' }
        ],
        isProcedure: true,
        isStatic: false,
        visibility: 'public'
      };
      
      const func: FunctionInfo = {
        name: 'calculateSum',
        parameters: [
          { name: 'a', type: 'INTEGER' },
          { name: 'b', type: 'INTEGER' }
        ],
        returnType: 'INTEGER',
        isProcedure: false,
        isStatic: true,
        visibility: 'public'
      };
      
      expect(procedure.isProcedure).toBe(true);
      expect(procedure.returnType).toBeUndefined();
      expect(func.isProcedure).toBe(false);
      expect(func.returnType).toBe('INTEGER');
    });

    test('IGCSEType should include all supported types', () => {
      const types: IGCSEType[] = [
        'INTEGER',
        'REAL',
        'STRING',
        'CHAR',
        'BOOLEAN',
        'ARRAY',
        'UNKNOWN'
      ];
      
      types.forEach(type => {
        const variable: VariableInfo = {
          name: 'test',
          type,
          isArray: false
        };
        expect(variable.type).toBe(type);
      });
    });

    test('Scope should manage nested scopes', () => {
      const globalScope: Scope = {
        type: 'global',
        variables: new Map(),
        functions: new Map()
      };
      
      const functionScope: Scope = {
        type: 'function',
        parent: globalScope,
        variables: new Map(),
        functions: new Map()
      };
      
      const blockScope: Scope = {
        type: 'block',
        parent: functionScope,
        variables: new Map(),
        functions: new Map()
      };
      
      expect(globalScope.type).toBe('global');
      expect(globalScope.parent).toBeUndefined();
      expect(functionScope.parent).toBe(globalScope);
      expect(blockScope.parent).toBe(functionScope);
    });
  });

  describe('Error Classes', () => {
    test('ConversionError should store error details', () => {
      const error = new ConversionError(
        'Test error message',
        'TEST_ERROR',
        {
          line: 10,
          column: 5,
          suggestions: ['Try this', 'Or that'],
          sourceCode: 'int x = 5;'
        }
      );
      
      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.line).toBe(10);
      expect(error.column).toBe(5);
      expect(error.suggestions).toEqual(['Try this', 'Or that']);
      expect(error.sourceCode).toBe('int x = 5;');
      expect(error.name).toBe('ConversionError');
    });

    test('ParseError should extend ConversionError', () => {
      const error = createParseError('Syntax error', 5, 10, 'invalid code');
      
      expect(error).toBeInstanceOf(ConversionError);
      expect(error).toBeInstanceOf(ParseErrorClass);
      expect(error.name).toBe('ParseError');
      expect(error.code).toBe(ErrorCodes.PARSE_ERROR);
      expect(error.line).toBe(5);
      expect(error.column).toBe(10);
    });

    test('UnsupportedFeatureError should store feature information', () => {
      const error = createUnsupportedFeatureError(
        'lambda expressions',
        15,
        20,
        'use regular methods instead'
      );
      
      expect(error).toBeInstanceOf(UnsupportedFeatureError);
      expect(error.featureName).toBe('lambda expressions');
      expect(error.alternativeApproach).toBe('use regular methods instead');
      expect(error.code).toBe(ErrorCodes.UNSUPPORTED_FEATURE);
    });

    test('TypeConversionError should handle type mapping issues', () => {
      const error = createTypeConversionError('Map<String, Integer>', 'ARRAY', 8, 12);
      
      expect(error).toBeInstanceOf(TypeConversionError);
      expect(error.sourceType).toBe('Map<String, Integer>');
      expect(error.targetType).toBe('ARRAY');
      expect(error.code).toBe(ErrorCodes.TYPE_CONVERSION_ERROR);
    });

    test('ValidationError should handle validation failures', () => {
      const error = new ValidationError(
        'IGCSE_KEYWORD_COMPLIANCE',
        'Must use IGCSE-compliant keywords',
        { line: 3, column: 1 }
      );
      
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.validationRule).toBe('IGCSE_KEYWORD_COMPLIANCE');
      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    test('IGCSEComplianceError should handle compliance violations', () => {
      const error = new IGCSEComplianceError(
        'VARIABLE_DECLARATION_FORMAT',
        'Variables must be declared with DECLARE keyword',
        { line: 2, suggestions: ['Use: DECLARE variable : TYPE'] }
      );
      
      expect(error).toBeInstanceOf(IGCSEComplianceError);
      expect(error.complianceRule).toBe('VARIABLE_DECLARATION_FORMAT');
      expect(error.code).toBe(ErrorCodes.IGCSE_COMPLIANCE_ERROR);
    });
  });

  describe('Error Utilities', () => {
    test('isConversionError should identify conversion errors', () => {
      const conversionError = new ConversionError('test', 'TEST');
      const regularError = new Error('regular error');
      const parseError = new ParseErrorClass('parse error');
      
      expect(isConversionError(conversionError)).toBe(true);
      expect(isConversionError(parseError)).toBe(true);
      expect(isConversionError(regularError)).toBe(false);
      expect(isConversionError('string')).toBe(false);
      expect(isConversionError(null)).toBe(false);
    });

    test('formatErrorForUser should format errors nicely', () => {
      const errorWithLocation = new ConversionError('Test error', 'TEST', {
        line: 10,
        column: 5
      });
      
      const errorWithoutLocation = new ConversionError('Test error', 'TEST');
      
      expect(formatErrorForUser(errorWithLocation)).toBe('Test error (line 10, column 5)');
      expect(formatErrorForUser(errorWithoutLocation)).toBe('Test error');
    });

    test('collectErrorSuggestions should gather unique suggestions', () => {
      const errors = [
        new ConversionError('Error 1', 'E1', { suggestions: ['Fix A', 'Fix B'] }),
        new ConversionError('Error 2', 'E2', { suggestions: ['Fix B', 'Fix C'] }),
        new ConversionError('Error 3', 'E3', { suggestions: [] }),
        new ConversionError('Error 4', 'E4') // no suggestions
      ];
      
      const suggestions = collectErrorSuggestions(errors);
      expect(suggestions).toHaveLength(3);
      expect(suggestions).toContain('Fix A');
      expect(suggestions).toContain('Fix B');
      expect(suggestions).toContain('Fix C');
    });
  });

  describe('Error Codes and Warning Codes', () => {
    test('ErrorCodes should include all expected codes', () => {
      expect(ErrorCodes.PARSE_ERROR).toBe('PARSE_ERROR');
      expect(ErrorCodes.SYNTAX_ERROR).toBe('SYNTAX_ERROR');
      expect(ErrorCodes.UNSUPPORTED_FEATURE).toBe('UNSUPPORTED_FEATURE');
      expect(ErrorCodes.TYPE_CONVERSION_ERROR).toBe('TYPE_CONVERSION_ERROR');
      expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCodes.IGCSE_COMPLIANCE_ERROR).toBe('IGCSE_COMPLIANCE_ERROR');
      expect(ErrorCodes.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
    });

    test('WarnCodes should include all expected codes', () => {
      expect(WarnCodes.FEATURE_NOT_SUPPORTED).toBe('FEATURE_NOT_SUPPORTED');
      expect(WarnCodes.PARTIAL_CONVERSION).toBe('PARTIAL_CONVERSION');
      expect(WarnCodes.TYPE_INFERENCE_FALLBACK).toBe('TYPE_INFERENCE_FALLBACK');
      expect(WarnCodes.IGCSE_APPROXIMATION).toBe('IGCSE_APPROXIMATION');
      expect(WarnCodes.MANUAL_REVIEW_SUGGESTED).toBe('MANUAL_REVIEW_SUGGESTED');
    });
  });
});