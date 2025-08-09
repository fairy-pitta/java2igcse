// java2igcse - Convert Java and TypeScript code to IGCSE pseudocode format

// Export error types
export * from './errors';

// Export validators
export * from './validators/input-validator';

// Export parsers
// export { JavaParser } from './parsers/java-parser'; // Commented out to avoid circular import
// export { TypeScriptParser } from './parsers/typescript-parser'; // Available for direct use

// Export converters
export { TypeConverter } from './converters/type-converter';

// Export transformers
export { BaseASTTransformer, JavaASTTransformer, TypeScriptASTTransformer, VariableDeclarationTransformer } from './transformers';

// Export generators
export { IGCSEPseudocodeGenerator } from './generators';

// ============================================================================
// Main API Interfaces
// ============================================================================

export interface ConversionOptions {
  indentSize?: number;
  includeComments?: boolean;
  strictMode?: boolean;
  customMappings?: Record<string, string>;
}

export interface ConversionResult {
  pseudocode: string;
  warnings: Warning[];
  success: boolean;
  metadata: ConversionMetadata;
}

export interface ConversionMetadata {
  sourceLanguage: 'java' | 'typescript';
  conversionTime: number;
  linesProcessed: number;
  featuresUsed: string[];
}

export interface Warning {
  message: string;
  line?: number;
  column?: number;
  code: string;
  severity: 'warning' | 'info';
}

export interface Java2IGCSEConverter {
  convertJava(
    sourceCode: string,
    options?: ConversionOptions
  ): ConversionResult;
  convertTypeScript(
    sourceCode: string,
    options?: ConversionOptions
  ): ConversionResult;
  convertCode(
    sourceCode: string,
    language: 'java' | 'typescript',
    options?: ConversionOptions
  ): ConversionResult;
}

// ============================================================================
// Parser Interfaces
// ============================================================================

export interface SourceParser<T> {
  parse(sourceCode: string): ParseResult<T>;
  validate(sourceCode: string): ValidationResult;
}

export interface ParseResult<T> {
  ast: T;
  errors: ParseError[];
  success: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ParseError[];
  warnings: Warning[];
}

export interface ParseError {
  message: string;
  line: number;
  column: number;
  code: string;
  severity: 'error' | 'warning';
}

// ============================================================================
// AST and Intermediate Representation Types
// ============================================================================

export interface IntermediateRepresentation {
  type: IRNodeType;
  kind: string;
  children: IntermediateRepresentation[];
  metadata: Record<string, any>;
  sourceLocation?: SourceLocation;
}

export type IRNodeType = 
  | 'program'
  | 'statement' 
  | 'expression'
  | 'declaration'
  | 'control_structure'
  | 'function_declaration'
  | 'variable_declaration'
  | 'array_declaration'
  | 'assignment'
  | 'method_call'
  | 'binary_operation'
  | 'unary_operation'
  | 'literal'
  | 'identifier';

export interface SourceLocation {
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}

// ============================================================================
// AST Transformer Interface
// ============================================================================

export interface ASTTransformer<TInput, TOutput> {
  transform(ast: TInput): TransformResult<TOutput>;
}

export interface TransformResult<T> {
  result: T;
  warnings: Warning[];
  success: boolean;
}

// ============================================================================
// Pseudocode Generator Interface
// ============================================================================

export interface PseudocodeGenerator {
  generate(ir: IntermediateRepresentation): string;
  formatOutput(pseudocode: string, options: FormattingOptions): string;
}

export interface FormattingOptions {
  indentSize: number;
  indentChar: string;
  lineEnding: string;
  maxLineLength?: number;
}

// ============================================================================
// Conversion Context and Supporting Types
// ============================================================================

export interface ConversionContext {
  currentScope: Scope;
  variableDeclarations: Map<string, VariableInfo>;
  functionDeclarations: Map<string, FunctionInfo>;
  indentLevel: number;
  options: ConversionOptions;
}

export interface Scope {
  type: ScopeType;
  parent?: Scope;
  variables: Map<string, VariableInfo>;
  functions: Map<string, FunctionInfo>;
}

export type ScopeType = 'global' | 'function' | 'block' | 'class';

export interface VariableInfo {
  name: string;
  type: IGCSEType;
  isArray: boolean;
  arrayDimensions?: number[];
  isConstant?: boolean;
  initialValue?: any;
}

export interface FunctionInfo {
  name: string;
  parameters: Parameter[];
  returnType?: IGCSEType;
  isProcedure: boolean;
  isStatic?: boolean;
  visibility?: 'public' | 'private' | 'protected';
}

export interface Parameter {
  name: string;
  type: IGCSEType;
  isArray?: boolean;
  isOptional?: boolean;
}

export type IGCSEType = 
  | 'INTEGER'
  | 'REAL' 
  | 'STRING'
  | 'CHAR'
  | 'BOOLEAN'
  | 'ARRAY'
  | 'UNKNOWN'
  | string; // Allow array type strings like "ARRAY[1:10] OF INTEGER"

// ============================================================================
// Language-Specific AST Node Types
// ============================================================================

export interface JavaASTNode {
  type: string;
  children: JavaASTNode[];
  value?: any;
  location?: SourceLocation;
  metadata?: Record<string, any>;
}

export interface TypeScriptASTNode {
  type: string;
  children: TypeScriptASTNode[];
  value?: any;
  location?: SourceLocation;
  metadata?: Record<string, any>;
}

// Main converter implementation
export class Java2IGCSEConverterImpl implements Java2IGCSEConverter {
  private javaParser: any;
  private typeScriptParser: any;
  private javaTransformer: any;
  private typeScriptTransformer: any;
  private pseudocodeGenerator: any;

  constructor() {
    // Components will be initialized lazily with options
  }

  private initializeComponents(options?: ConversionOptions): void {
    // Lazy load components to avoid circular imports
    const { JavaParser } = require('./parsers/java-parser');
    const { TypeScriptParser } = require('./parsers/typescript-parser');
    const { JavaASTTransformer } = require('./transformers/java-transformer');
    const { TypeScriptASTTransformer } = require('./transformers/typescript-transformer');
    const { IGCSEPseudocodeGenerator } = require('./generators/pseudocode-generator');

    this.javaParser = new JavaParser();
    this.typeScriptParser = new TypeScriptParser();
    this.javaTransformer = new JavaASTTransformer(options);
    this.typeScriptTransformer = new TypeScriptASTTransformer(options);
    this.pseudocodeGenerator = new IGCSEPseudocodeGenerator(options);
  }

  convertJava(
    sourceCode: string,
    options?: ConversionOptions
  ): ConversionResult {
    const startTime = Date.now();
    const warnings: Warning[] = [];
    const featuresUsed: string[] = [];

    // Apply default options
    const mergedOptions: ConversionOptions = {
      indentSize: 3, // IGCSE standard: 3 spaces recommended
      includeComments: true,
      strictMode: false,
      customMappings: {},
      ...options
    };

    // Always initialize components with current options to ensure they're up to date
    this.initializeComponents(mergedOptions);

    try {
      // Validate input
      if (sourceCode === null || sourceCode === undefined || typeof sourceCode !== 'string') {
        return this.createErrorResult(
          'java',
          'Invalid source code provided',
          'INVALID_INPUT',
          startTime
        );
      }

      const linesProcessed = sourceCode.split('\n').length;

      // Step 1: Parse Java code
      const parseResult = this.javaParser.parse(sourceCode);
      if (!parseResult.success) {
        return this.createErrorResult(
          'java',
          `Parse error: ${parseResult.errors.map((e: any) => e.message).join(', ')}`,
          'PARSE_ERROR',
          startTime,
          parseResult.errors.map((e: any) => ({
            message: e.message,
            line: e.line,
            column: e.column,
            code: e.code,
            severity: e.severity as 'warning' | 'info'
          }))
        );
      }

      // Add parse warnings
      parseResult.errors.forEach((error: any) => {
        if (error.severity === 'warning') {
          warnings.push({
            message: error.message,
            line: error.line,
            column: error.column,
            code: error.code,
            severity: 'warning'
          });
        }
      });

      // Step 2: Transform AST to Intermediate Representation
      const transformResult = this.javaTransformer.transform(parseResult.ast);
      if (!transformResult.success) {
        return this.createErrorResult(
          'java',
          'Transform error: Failed to convert AST to intermediate representation',
          'TRANSFORM_ERROR',
          startTime,
          warnings
        );
      }

      // Add transform warnings
      transformResult.warnings.forEach((warning: any) => {
        warnings.push(warning);
      });

      // Track features used
      this.trackFeaturesUsed(parseResult.ast, featuresUsed);

      // Step 3: Generate IGCSE pseudocode
      const pseudocode = this.pseudocodeGenerator.generate(transformResult.result);
      
      // Add generator warnings
      if (this.pseudocodeGenerator.getWarnings) {
        const generatorWarnings = this.pseudocodeGenerator.getWarnings();
        generatorWarnings.forEach((warning: any) => {
          warnings.push(warning);
        });
      }

      const conversionTime = Date.now() - startTime;

      return {
        pseudocode,
        warnings,
        success: true,
        metadata: {
          sourceLanguage: 'java',
          conversionTime,
          linesProcessed,
          featuresUsed
        }
      };

    } catch (error) {
      return this.createErrorResult(
        'java',
        `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR',
        startTime,
        warnings
      );
    }
  }

  convertTypeScript(
    sourceCode: string,
    options?: ConversionOptions
  ): ConversionResult {
    const startTime = Date.now();
    const warnings: Warning[] = [];
    const featuresUsed: string[] = [];

    // Apply default options
    const mergedOptions: ConversionOptions = {
      indentSize: 3, // IGCSE standard: 3 spaces recommended
      includeComments: true,
      strictMode: false,
      customMappings: {},
      ...options
    };

    // Always initialize components with current options to ensure they're up to date
    this.initializeComponents(mergedOptions);

    try {
      // Validate input
      if (sourceCode === null || sourceCode === undefined || typeof sourceCode !== 'string') {
        return this.createErrorResult(
          'typescript',
          'Invalid source code provided',
          'INVALID_INPUT',
          startTime
        );
      }

      const linesProcessed = sourceCode.split('\n').length;

      // Step 1: Parse TypeScript code
      const parseResult = this.typeScriptParser.parse(sourceCode);
      if (!parseResult.success) {
        return this.createErrorResult(
          'typescript',
          `Parse error: ${parseResult.errors.map((e: any) => e.message).join(', ')}`,
          'PARSE_ERROR',
          startTime,
          parseResult.errors.map((e: any) => ({
            message: e.message,
            line: e.line,
            column: e.column,
            code: e.code,
            severity: e.severity as 'warning' | 'info'
          }))
        );
      }

      // Add parse warnings
      parseResult.errors.forEach((error: any) => {
        if (error.severity === 'warning') {
          warnings.push({
            message: error.message,
            line: error.line,
            column: error.column,
            code: error.code,
            severity: 'warning'
          });
        }
      });

      // Step 2: Transform AST to Intermediate Representation
      const transformResult = this.typeScriptTransformer.transform(parseResult.ast);
      if (!transformResult.success) {
        return this.createErrorResult(
          'typescript',
          'Transform error: Failed to convert AST to intermediate representation',
          'TRANSFORM_ERROR',
          startTime,
          warnings
        );
      }

      // Add transform warnings
      transformResult.warnings.forEach((warning: any) => {
        warnings.push(warning);
      });

      // Track features used
      this.trackFeaturesUsed(parseResult.ast, featuresUsed);

      // Step 3: Generate IGCSE pseudocode
      const pseudocode = this.pseudocodeGenerator.generate(transformResult.result);
      
      // Add generator warnings
      if (this.pseudocodeGenerator.getWarnings) {
        const generatorWarnings = this.pseudocodeGenerator.getWarnings();
        generatorWarnings.forEach((warning: any) => {
          warnings.push(warning);
        });
      }

      const conversionTime = Date.now() - startTime;

      return {
        pseudocode,
        warnings,
        success: true,
        metadata: {
          sourceLanguage: 'typescript',
          conversionTime,
          linesProcessed,
          featuresUsed
        }
      };

    } catch (error) {
      return this.createErrorResult(
        'typescript',
        `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR',
        startTime,
        warnings
      );
    }
  }

  convertCode(
    sourceCode: string,
    language: 'java' | 'typescript',
    options?: ConversionOptions
  ): ConversionResult {
    if (language === 'java') {
      return this.convertJava(sourceCode, options);
    } else {
      return this.convertTypeScript(sourceCode, options);
    }
  }

  private createErrorResult(
    language: 'java' | 'typescript',
    message: string,
    code: string,
    startTime: number,
    existingWarnings: Warning[] = []
  ): ConversionResult {
    return {
      pseudocode: `// Error: ${message}`,
      warnings: [
        ...existingWarnings,
        {
          message,
          code,
          severity: 'warning'
        }
      ],
      success: false,
      metadata: {
        sourceLanguage: language,
        conversionTime: Date.now() - startTime,
        linesProcessed: 0,
        featuresUsed: []
      }
    };
  }

  private trackFeaturesUsed(ast: any, featuresUsed: string[]): void {
    if (!ast || !ast.type) return;

    // Track different language features based on AST node types
    const featureMap: Record<string, string> = {
      'if_statement': 'conditional statements',
      'while_statement': 'while loops',
      'for_statement': 'for loops',
      'method_declaration': 'methods/functions',
      'class_declaration': 'classes',
      'variable_declaration': 'variable declarations',
      'array_literal': 'arrays',
      'method_call': 'method calls',
      'binary_expression': 'expressions',
      'template_literal': 'template literals',
      'arrow_function': 'arrow functions',
      'destructuring_assignment': 'destructuring'
    };

    const feature = featureMap[ast.type];
    if (feature && !featuresUsed.includes(feature)) {
      featuresUsed.push(feature);
    }

    // Recursively track features in children
    if (ast.children && Array.isArray(ast.children)) {
      ast.children.forEach((child: any) => {
        this.trackFeaturesUsed(child, featuresUsed);
      });
    }
  }
}

export default Java2IGCSEConverterImpl;
