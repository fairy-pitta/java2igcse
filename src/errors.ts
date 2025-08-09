// Error handling classes and enums for java2igcse

// ============================================================================
// Error Code Enums
// ============================================================================

export enum ErrorCodes {
  // Parse Errors
  PARSE_ERROR = 'PARSE_ERROR',
  SYNTAX_ERROR = 'SYNTAX_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Conversion Errors
  UNSUPPORTED_FEATURE = 'UNSUPPORTED_FEATURE',
  TYPE_CONVERSION_ERROR = 'TYPE_CONVERSION_ERROR',
  TRANSFORMATION_ERROR = 'TRANSFORMATION_ERROR',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  IGCSE_COMPLIANCE_ERROR = 'IGCSE_COMPLIANCE_ERROR',
  
  // System Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

export enum WarnCodes {
  // Feature Warnings
  FEATURE_NOT_SUPPORTED = 'FEATURE_NOT_SUPPORTED',
  PARTIAL_CONVERSION = 'PARTIAL_CONVERSION',
  TYPE_INFERENCE_FALLBACK = 'TYPE_INFERENCE_FALLBACK',
  
  // Style Warnings
  FORMATTING_ADJUSTED = 'FORMATTING_ADJUSTED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  
  // Compatibility Warnings
  IGCSE_APPROXIMATION = 'IGCSE_APPROXIMATION',
  MANUAL_REVIEW_SUGGESTED = 'MANUAL_REVIEW_SUGGESTED'
}

// ============================================================================
// Error Classes
// ============================================================================

export class ConversionError extends Error {
  public readonly code: string;
  public readonly line?: number;
  public readonly column?: number;
  public readonly suggestions?: string[];
  public readonly sourceCode?: string;
  public readonly cause?: Error;

  constructor(
    message: string,
    code: string,
    options?: {
      line?: number;
      column?: number;
      suggestions?: string[];
      sourceCode?: string;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = 'ConversionError';
    this.code = code;
    this.line = options?.line;
    this.column = options?.column;
    this.suggestions = options?.suggestions;
    this.sourceCode = options?.sourceCode;
    
    if (options?.cause) {
      this.cause = options.cause;
    }
  }

  public toString(): string {
    let result = `${this.name}: ${this.message} (${this.code})`;
    
    if (this.line !== undefined) {
      result += ` at line ${this.line}`;
      if (this.column !== undefined) {
        result += `, column ${this.column}`;
      }
    }
    
    if (this.suggestions && this.suggestions.length > 0) {
      result += `\nSuggestions:\n${this.suggestions.map(s => `  - ${s}`).join('\n')}`;
    }
    
    return result;
  }
}

export class ParseError extends ConversionError {
  constructor(
    message: string,
    options?: {
      line?: number;
      column?: number;
      suggestions?: string[];
      sourceCode?: string;
      cause?: Error;
    }
  ) {
    super(message, ErrorCodes.PARSE_ERROR, options);
    this.name = 'ParseError';
  }
}

export class UnsupportedFeatureError extends ConversionError {
  public readonly featureName: string;
  public readonly alternativeApproach?: string;

  constructor(
    featureName: string,
    message?: string,
    options?: {
      line?: number;
      column?: number;
      alternativeApproach?: string;
      suggestions?: string[];
      sourceCode?: string;
    }
  ) {
    const errorMessage = message || `Unsupported feature: ${featureName}`;
    super(errorMessage, ErrorCodes.UNSUPPORTED_FEATURE, options);
    this.name = 'UnsupportedFeatureError';
    this.featureName = featureName;
    this.alternativeApproach = options?.alternativeApproach;
  }
}

export class TypeConversionError extends ConversionError {
  public readonly sourceType: string;
  public readonly targetType?: string;

  constructor(
    sourceType: string,
    message?: string,
    options?: {
      targetType?: string;
      line?: number;
      column?: number;
      suggestions?: string[];
      sourceCode?: string;
    }
  ) {
    const errorMessage = message || `Cannot convert type: ${sourceType}`;
    super(errorMessage, ErrorCodes.TYPE_CONVERSION_ERROR, options);
    this.name = 'TypeConversionError';
    this.sourceType = sourceType;
    this.targetType = options?.targetType;
  }
}

export class ValidationError extends ConversionError {
  public readonly validationRule: string;

  constructor(
    validationRule: string,
    message?: string,
    options?: {
      line?: number;
      column?: number;
      suggestions?: string[];
      sourceCode?: string;
    }
  ) {
    const errorMessage = message || `Validation failed: ${validationRule}`;
    super(errorMessage, ErrorCodes.VALIDATION_ERROR, options);
    this.name = 'ValidationError';
    this.validationRule = validationRule;
  }
}

export class IGCSEComplianceError extends ConversionError {
  public readonly complianceRule: string;

  constructor(
    complianceRule: string,
    message?: string,
    options?: {
      line?: number;
      column?: number;
      suggestions?: string[];
      sourceCode?: string;
    }
  ) {
    const errorMessage = message || `IGCSE compliance violation: ${complianceRule}`;
    super(errorMessage, ErrorCodes.IGCSE_COMPLIANCE_ERROR, options);
    this.name = 'IGCSEComplianceError';
    this.complianceRule = complianceRule;
  }
}

// ============================================================================
// Error Factory Functions
// ============================================================================

export function createParseError(
  message: string,
  line?: number,
  column?: number,
  sourceCode?: string
): ParseError {
  return new ParseError(message, { line, column, sourceCode });
}

export function createUnsupportedFeatureError(
  featureName: string,
  line?: number,
  column?: number,
  alternativeApproach?: string
): UnsupportedFeatureError {
  return new UnsupportedFeatureError(featureName, undefined, {
    line,
    column,
    alternativeApproach,
    suggestions: alternativeApproach ? [`Try using: ${alternativeApproach}`] : undefined
  });
}

export function createTypeConversionError(
  sourceType: string,
  targetType?: string,
  line?: number,
  column?: number
): TypeConversionError {
  const message = targetType 
    ? `Cannot convert from ${sourceType} to ${targetType}`
    : `Cannot determine IGCSE type for ${sourceType}`;
    
  return new TypeConversionError(sourceType, message, {
    targetType,
    line,
    column,
    suggestions: [
      'Check if the type is supported in IGCSE pseudocode',
      'Consider using a simpler type that maps to IGCSE standards'
    ]
  });
}

// ============================================================================
// Error Utilities
// ============================================================================

export function isConversionError(error: unknown): error is ConversionError {
  return error instanceof ConversionError;
}

export function formatErrorForUser(error: ConversionError): string {
  let message = error.message;
  
  if (error.line !== undefined) {
    message += ` (line ${error.line}`;
    if (error.column !== undefined) {
      message += `, column ${error.column}`;
    }
    message += ')';
  }
  
  return message;
}

export function collectErrorSuggestions(errors: ConversionError[]): string[] {
  const suggestions = new Set<string>();
  
  for (const error of errors) {
    if (error.suggestions) {
      error.suggestions.forEach(suggestion => suggestions.add(suggestion));
    }
  }
  
  return Array.from(suggestions);
}