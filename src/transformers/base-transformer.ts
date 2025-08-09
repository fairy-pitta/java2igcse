// Base AST Transformer for converting language-specific ASTs to Intermediate Representation

import {
  ASTTransformer,
  TransformResult,
  IntermediateRepresentation,
  IRNodeType,
  SourceLocation,
  Warning,
  ConversionContext,
  Scope,
  ScopeType,
  VariableInfo,
  FunctionInfo,
  IGCSEType,
  ConversionOptions
} from '../index';
import { ConversionError, ErrorCodes } from '../errors';
import { InputValidator } from '../validators/input-validator';

export abstract class BaseASTTransformer<TInput> implements ASTTransformer<TInput, IntermediateRepresentation> {
  protected context: ConversionContext;
  protected warnings: Warning[] = [];

  constructor(options: ConversionOptions = {}) {
    this.context = this.createInitialContext(options);
  }

  abstract transform(ast: TInput): TransformResult<IntermediateRepresentation>;

  protected createInitialContext(options: ConversionOptions): ConversionContext {
    const globalScope: Scope = {
      type: 'global',
      variables: new Map(),
      functions: new Map()
    };

    return {
      currentScope: globalScope,
      variableDeclarations: new Map(),
      functionDeclarations: new Map(),
      indentLevel: 0,
      options: {
        indentSize: 4,
        includeComments: true,
        strictMode: false,
        customMappings: {},
        ...options
      }
    };
  }

  protected createIRNode(
    type: IRNodeType,
    kind: string,
    children: IntermediateRepresentation[] = [],
    metadata: Record<string, any> = {},
    sourceLocation?: SourceLocation
  ): IntermediateRepresentation {
    return {
      type,
      kind,
      children,
      metadata,
      sourceLocation
    };
  }

  protected addWarning(
    message: string,
    code: string,
    severity: 'warning' | 'info' = 'warning',
    line?: number,
    column?: number
  ): void {
    this.warnings.push({
      message,
      code,
      severity,
      line,
      column
    });
  }

  protected enterScope(scopeType: ScopeType): void {
    const newScope: Scope = {
      type: scopeType,
      parent: this.context.currentScope,
      variables: new Map(),
      functions: new Map()
    };
    this.context.currentScope = newScope;
  }

  protected exitScope(): void {
    if (this.context.currentScope.parent) {
      this.context.currentScope = this.context.currentScope.parent;
    }
  }

  protected declareVariable(
    name: string,
    type: IGCSEType,
    isArray: boolean = false,
    arrayDimensions?: number[],
    isConstant: boolean = false,
    initialValue?: any
  ): void {
    const variableInfo: VariableInfo = {
      name,
      type,
      isArray,
      arrayDimensions,
      isConstant,
      initialValue
    };

    // Add to current scope
    this.context.currentScope.variables.set(name, variableInfo);
    
    // Add to global variable declarations map
    this.context.variableDeclarations.set(name, variableInfo);
  }

  protected declareFunction(
    name: string,
    parameters: Array<{ name: string; type: IGCSEType; isArray?: boolean; isOptional?: boolean }>,
    returnType?: IGCSEType,
    isStatic: boolean = false,
    visibility: 'public' | 'private' | 'protected' = 'public'
  ): void {
    const functionInfo: FunctionInfo = {
      name,
      parameters: parameters.map(p => ({
        name: p.name,
        type: p.type,
        isArray: p.isArray || false,
        isOptional: p.isOptional || false
      })),
      returnType,
      isProcedure: !returnType || returnType === 'UNKNOWN',
      isStatic,
      visibility
    };

    // Add to current scope
    this.context.currentScope.functions.set(name, functionInfo);
    
    // Add to global function declarations map
    this.context.functionDeclarations.set(name, functionInfo);
  }

  protected lookupVariable(name: string): VariableInfo | undefined {
    let currentScope: Scope | undefined = this.context.currentScope;
    
    while (currentScope) {
      const variable = currentScope.variables.get(name);
      if (variable) {
        return variable;
      }
      currentScope = currentScope.parent;
    }
    
    return undefined;
  }

  protected lookupFunction(name: string): FunctionInfo | undefined {
    let currentScope: Scope | undefined = this.context.currentScope;
    
    while (currentScope) {
      const func = currentScope.functions.get(name);
      if (func) {
        return func;
      }
      currentScope = currentScope.parent;
    }
    
    return undefined;
  }

  protected convertTypeToIGCSE(sourceType: string): IGCSEType {
    // This will be overridden by language-specific transformers
    // but provides a basic fallback implementation
    const normalizedType = sourceType.toLowerCase().trim();
    
    switch (normalizedType) {
      case 'int':
      case 'integer':
        return 'INTEGER';
      case 'double':
      case 'float':
      case 'number':
        return 'REAL';
      case 'string':
        return 'STRING';
      case 'char':
      case 'character':
        return 'CHAR';
      case 'bool':
      case 'boolean':
        return 'BOOLEAN';
      default:
        this.addWarning(
          `Unknown type '${sourceType}' converted to STRING`,
          'TYPE_CONVERSION_FALLBACK',
          'warning'
        );
        return 'STRING';
    }
  }

  protected createTransformResult(
    result: IntermediateRepresentation,
    success: boolean = true
  ): TransformResult<IntermediateRepresentation> {
    return {
      result,
      warnings: [...this.warnings],
      success
    };
  }

  protected handleTransformError(error: Error, fallbackNode?: IntermediateRepresentation, sourceLocation?: SourceLocation): TransformResult<IntermediateRepresentation> {
    const fallback = fallbackNode || this.createIRNode('program', 'empty_program');
    
    if (error instanceof ConversionError) {
      this.addWarning(error.message, error.code, 'warning', error.line, error.column);
    } else {
      const line = sourceLocation?.line;
      const column = sourceLocation?.column;
      this.addWarning(
        `Transformation error: ${error.message}${line ? ` at line ${line}` : ''}${column ? `, column ${column}` : ''}`,
        ErrorCodes.TRANSFORMATION_ERROR,
        'warning',
        line,
        column
      );
    }

    return this.createTransformResult(fallback, false);
  }

  protected handleUnsupportedFeature(
    featureName: string, 
    suggestion?: string, 
    sourceLocation?: SourceLocation,
    fallbackNode?: IntermediateRepresentation
  ): IntermediateRepresentation {
    const message = suggestion 
      ? `Unsupported feature '${featureName}': ${suggestion}`
      : `Unsupported feature '${featureName}' - skipping conversion`;
    
    this.addWarning(
      message,
      ErrorCodes.UNSUPPORTED_FEATURE,
      'warning',
      sourceLocation?.line,
      sourceLocation?.column
    );

    // Return a comment node explaining the unsupported feature
    return fallbackNode || this.createIRNode(
      'statement',
      'comment',
      [],
      {
        comment: `// ${message}`,
        originalFeature: featureName
      },
      sourceLocation
    );
  }

  protected validateTypeConversion(sourceType: string, targetType: string, sourceLocation?: SourceLocation): boolean {
    const validConversions = new Map([
      ['int', 'INTEGER'],
      ['integer', 'INTEGER'],
      ['double', 'REAL'],
      ['float', 'REAL'],
      ['number', 'REAL'],
      ['string', 'STRING'],
      ['char', 'CHAR'],
      ['character', 'CHAR'],
      ['bool', 'BOOLEAN'],
      ['boolean', 'BOOLEAN']
    ]);

    const normalizedSource = sourceType.toLowerCase().trim();
    const expectedTarget = validConversions.get(normalizedSource);

    if (expectedTarget && expectedTarget !== targetType) {
      this.addWarning(
        `Type conversion mismatch: expected ${expectedTarget} for ${sourceType}, got ${targetType}`,
        ErrorCodes.TYPE_CONVERSION_ERROR,
        'warning',
        sourceLocation?.line,
        sourceLocation?.column
      );
      return false;
    }

    if (!expectedTarget && targetType !== 'STRING') {
      this.addWarning(
        `Unknown source type '${sourceType}' converted to ${targetType}`,
        ErrorCodes.TYPE_CONVERSION_ERROR,
        'warning',
        sourceLocation?.line,
        sourceLocation?.column
      );
    }

    return true;
  }

  protected createErrorRecoveryNode(
    errorMessage: string,
    originalContent?: string,
    sourceLocation?: SourceLocation
  ): IntermediateRepresentation {
    return this.createIRNode(
      'statement',
      'error_recovery',
      [],
      {
        error: errorMessage,
        originalContent,
        comment: `// Error: ${errorMessage}${originalContent ? ` - Original: ${originalContent}` : ''}`
      },
      sourceLocation
    );
  }

  protected incrementIndent(): void {
    this.context.indentLevel++;
  }

  protected decrementIndent(): void {
    if (this.context.indentLevel > 0) {
      this.context.indentLevel--;
    }
  }

  protected getCurrentIndent(): string {
    const indentSize = this.context.options.indentSize || 4;
    return ' '.repeat(this.context.indentLevel * indentSize);
  }

  protected resetWarnings(): void {
    this.warnings = [];
  }

  protected getContextSnapshot(): {
    scopeDepth: number;
    variableCount: number;
    functionCount: number;
    indentLevel: number;
  } {
    let scopeDepth = 0;
    let currentScope: Scope | undefined = this.context.currentScope;
    
    while (currentScope) {
      scopeDepth++;
      currentScope = currentScope.parent;
    }

    return {
      scopeDepth,
      variableCount: this.context.variableDeclarations.size,
      functionCount: this.context.functionDeclarations.size,
      indentLevel: this.context.indentLevel
    };
  }
}

export default BaseASTTransformer;