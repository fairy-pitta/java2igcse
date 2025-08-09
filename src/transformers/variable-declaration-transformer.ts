// Variable Declaration Transformer - specialized handling for variable declarations

import {
  IntermediateRepresentation,
  IGCSEType,
  VariableInfo,
  ConversionContext,
  SourceLocation
} from '../index';
import { BaseASTTransformer } from './base-transformer';
import { ErrorCodes } from '../errors';

export interface VariableDeclarationResult {
  ir: IntermediateRepresentation;
  variableInfo: VariableInfo;
  warnings: string[];
}

export class VariableDeclarationTransformer {
  private baseTransformer: BaseASTTransformer<any>;

  constructor(baseTransformer: BaseASTTransformer<any>) {
    this.baseTransformer = baseTransformer;
  }

  transformJavaVariableDeclaration(
    typeValue: string,
    identifierValue: string,
    initialValue?: string,
    typeMetadata?: Record<string, any>,
    location?: SourceLocation
  ): VariableDeclarationResult {
    const warnings: string[] = [];
    
    // Extract array information
    const isArray = typeMetadata?.isArray || false;
    const arrayDimensions = typeMetadata?.arrayDimensions || [];
    
    // Convert Java type to IGCSE type
    const igcseType = this.convertJavaTypeToIGCSE(typeValue);
    
    // Handle type conversion warnings
    if (igcseType === 'STRING' && !this.isKnownJavaType(typeValue)) {
      warnings.push(`Unknown Java type '${typeValue}' converted to STRING`);
    }
    
    // Create variable info
    const variableInfo: VariableInfo = {
      name: identifierValue,
      type: igcseType,
      isArray,
      arrayDimensions,
      isConstant: false,
      initialValue
    };
    
    // Declare variable in context
    this.baseTransformer['declareVariable'](
      identifierValue,
      igcseType,
      isArray,
      arrayDimensions,
      false,
      initialValue
    );
    
    // Generate IGCSE declaration
    const igcseDeclaration = this.generateIGCSEDeclaration(
      identifierValue,
      igcseType,
      isArray,
      arrayDimensions
    );
    
    // Handle array dimension warnings
    if (isArray && arrayDimensions.length > 2) {
      warnings.push(`Multi-dimensional array with ${arrayDimensions.length} dimensions simplified to nested ARRAY declarations`);
    }
    
    // Handle initialization warnings
    if (initialValue && isArray) {
      warnings.push('Array initialization will require manual conversion to IGCSE array assignment statements');
    }
    
    // Create IR node
    const ir = this.baseTransformer['createIRNode'](
      'declaration',
      'variable_declaration',
      [],
      {
        language: 'java',
        variableName: identifierValue,
        sourceType: typeValue,
        igcseType,
        isArray,
        arrayDimensions,
        hasInitializer: !!initialValue,
        initialValue,
        igcseDeclaration,
        scopeInfo: this.getScopeInfo()
      },
      location
    );
    
    return {
      ir,
      variableInfo,
      warnings
    };
  }

  transformTypeScriptVariableDeclaration(
    identifierValue: string,
    typeAnnotation?: string,
    initializer?: string,
    isOptional: boolean = false,
    location?: SourceLocation
  ): VariableDeclarationResult {
    const warnings: string[] = [];
    
    // Clean identifier name
    const cleanName = identifierValue.replace('?', '');
    
    // Determine IGCSE type
    let igcseType: IGCSEType = 'STRING'; // Default fallback
    let isArray = false;
    
    if (typeAnnotation) {
      igcseType = this.convertTypeScriptTypeToIGCSE(typeAnnotation);
      isArray = typeAnnotation.includes('[]') || typeAnnotation.includes('Array<');
      
      // Add type conversion warnings
      if (typeAnnotation.includes('|')) {
        warnings.push(`Union type '${typeAnnotation}' converted to primary type '${igcseType}'`);
      }
      
      if (typeAnnotation.includes('<') && typeAnnotation.includes('>')) {
        warnings.push(`Generic type '${typeAnnotation}' simplified to '${igcseType}'`);
      }
      
      if (typeAnnotation.includes('=>')) {
        warnings.push(`Function type '${typeAnnotation}' converted to return type '${igcseType}'`);
      }
      
      if (['any', 'unknown', 'void'].includes(typeAnnotation.toLowerCase())) {
        warnings.push(`Dynamic type '${typeAnnotation}' converted to STRING`);
      }
    } else if (initializer) {
      // Infer type from initializer
      igcseType = this.inferTypeFromInitializer(initializer);
      warnings.push(`Type inferred from initializer: ${igcseType}`);
    }
    
    // Handle optional parameters
    if (isOptional) {
      warnings.push(`Optional parameter '${identifierValue}' converted to regular parameter`);
    }
    
    // Create variable info
    const variableInfo: VariableInfo = {
      name: cleanName,
      type: igcseType,
      isArray,
      isConstant: false,
      initialValue: initializer
    };
    
    // Declare variable in context
    this.baseTransformer['declareVariable'](
      cleanName,
      igcseType,
      isArray,
      undefined,
      false,
      initializer
    );
    
    // Generate IGCSE declaration
    const igcseDeclaration = this.generateIGCSEDeclaration(
      cleanName,
      igcseType,
      isArray
    );
    
    // Create IR node
    const ir = this.baseTransformer['createIRNode'](
      'declaration',
      'variable_declaration',
      [],
      {
        language: 'typescript',
        variableName: cleanName,
        originalName: identifierValue,
        sourceType: typeAnnotation || 'inferred',
        igcseType,
        isArray,
        isOptional,
        hasTypeAnnotation: !!typeAnnotation,
        hasInitializer: !!initializer,
        initialValue: initializer,
        igcseDeclaration,
        scopeInfo: this.getScopeInfo()
      },
      location
    );
    
    return {
      ir,
      variableInfo,
      warnings
    };
  }

  private convertJavaTypeToIGCSE(javaType: string): IGCSEType {
    switch (javaType) {
      case 'int':
        return 'INTEGER';
      case 'String':
        return 'STRING';
      case 'boolean':
        return 'BOOLEAN';
      case 'double':
      case 'float':
        return 'REAL';
      case 'char':
        return 'CHAR';
      case 'byte':
      case 'short':
      case 'long':
        return 'INTEGER'; // All integer types map to INTEGER
      default:
        return 'STRING'; // Unknown types default to STRING
    }
  }

  public convertTypeScriptTypeToIGCSE(tsType: string): IGCSEType {
    if (!tsType) return 'STRING';

    // Remove optional markers and array brackets for base type conversion
    let baseType = tsType.replace(/\?/g, '').replace(/\[\]/g, '').trim();
    
    // Handle Array<T> generic syntax
    baseType = baseType.replace(/Array<(.+)>/g, '$1');
    
    // Handle other generic types by extracting the inner type
    const genericMatch = baseType.match(/^[A-Za-z]+<(.+)>$/);
    if (genericMatch) {
      baseType = genericMatch[1];
    }

    // Handle union types - take the first non-null/undefined type as primary
    if (baseType.includes('|')) {
      const unionTypes = baseType.split('|').map(t => t.trim());
      const validTypes = unionTypes.filter(t => t !== 'null' && t !== 'undefined');
      baseType = validTypes.length > 0 ? validTypes[0] : unionTypes[0];
    }

    // Handle literal types (e.g., "active" | "inactive")
    if (baseType.startsWith('"') && baseType.endsWith('"')) {
      return 'STRING';
    }

    // Handle tuple types [string, number] -> take first type
    if (baseType.startsWith('[') && baseType.endsWith(']')) {
      const tupleContent = baseType.slice(1, -1);
      const firstType = tupleContent.split(',')[0].trim();
      baseType = firstType;
    }

    // Handle function types (x: number) => string -> return type
    if (baseType.includes('=>')) {
      const returnType = baseType.split('=>')[1].trim();
      baseType = returnType;
    }

    switch (baseType.toLowerCase()) {
      case 'number':
        return 'REAL';
      case 'string':
        return 'STRING';
      case 'boolean':
        return 'BOOLEAN';
      case 'char':
        return 'CHAR';
      case 'int':
      case 'integer':
        return 'INTEGER';
      case 'any':
      case 'unknown':
      case 'void':
        return 'STRING'; // Default to STRING for unknown types
      default:
        return 'STRING';
    }
  }

  private inferTypeFromInitializer(initializer: string): IGCSEType {
    if (!initializer) return 'STRING';

    const value = initializer.trim();

    // Check for boolean literals
    if (value === 'true' || value === 'false') {
      return 'BOOLEAN';
    }

    // Check for string literals
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return 'STRING';
    }

    // Check for numeric literals
    if (/^\d+$/.test(value)) {
      return 'INTEGER';
    }

    if (/^\d+\.\d+$/.test(value)) {
      return 'REAL';
    }

    // Check for array literals
    if (value.startsWith('[') && value.endsWith(']')) {
      return 'STRING'; // Arrays will be handled separately
    }

    // Default to STRING
    return 'STRING';
  }

  private isKnownJavaType(type: string): boolean {
    const knownTypes = [
      'int', 'String', 'boolean', 'double', 'float', 'char',
      'byte', 'short', 'long', 'void'
    ];
    return knownTypes.includes(type);
  }

  private generateIGCSEDeclaration(
    name: string,
    type: IGCSEType,
    isArray: boolean,
    arrayDimensions?: number[]
  ): string {
    if (isArray) {
      let arrayType = type;
      
      // Build nested array type for multi-dimensional arrays
      if (arrayDimensions && arrayDimensions.length > 0) {
        for (let i = arrayDimensions.length - 1; i >= 0; i--) {
          arrayType = `ARRAY[1:n] OF ${arrayType}`;
        }
      } else {
        arrayType = `ARRAY[1:n] OF ${arrayType}`;
      }
      
      return `DECLARE ${name} : ${arrayType}`;
    } else {
      return `DECLARE ${name} : ${type}`;
    }
  }

  private getScopeInfo(): Record<string, any> {
    const snapshot = this.baseTransformer['getContextSnapshot']();
    return {
      scopeDepth: snapshot.scopeDepth,
      currentScopeType: 'unknown', // Would need to be passed from transformer
      totalVariables: snapshot.variableCount,
      totalFunctions: snapshot.functionCount
    };
  }

  // Static utility methods for external use
  static createJavaVariableIR(
    name: string,
    javaType: string,
    igcseType: IGCSEType,
    isArray: boolean = false,
    arrayDimensions: number[] = [],
    initialValue?: string,
    location?: SourceLocation
  ): IntermediateRepresentation {
    return {
      type: 'declaration',
      kind: 'variable_declaration',
      children: [],
      metadata: {
        language: 'java',
        variableName: name,
        sourceType: javaType,
        igcseType,
        isArray,
        arrayDimensions,
        hasInitializer: !!initialValue,
        initialValue,
        igcseDeclaration: isArray 
          ? `DECLARE ${name} : ARRAY[1:n] OF ${igcseType}`
          : `DECLARE ${name} : ${igcseType}`
      },
      sourceLocation: location
    };
  }

  static createTypeScriptVariableIR(
    name: string,
    tsType: string,
    igcseType: IGCSEType,
    isArray: boolean = false,
    isOptional: boolean = false,
    initialValue?: string,
    location?: SourceLocation
  ): IntermediateRepresentation {
    return {
      type: 'declaration',
      kind: 'variable_declaration',
      children: [],
      metadata: {
        language: 'typescript',
        variableName: name,
        sourceType: tsType,
        igcseType,
        isArray,
        isOptional,
        hasInitializer: !!initialValue,
        initialValue,
        igcseDeclaration: isArray 
          ? `DECLARE ${name} : ARRAY[1:n] OF ${igcseType}`
          : `DECLARE ${name} : ${igcseType}`
      },
      sourceLocation: location
    };
  }
}

export default VariableDeclarationTransformer;