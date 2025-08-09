// Type conversion utilities for Java to IGCSE
import { IGCSEType } from '../index';

export interface TypeConversionResult {
  igcseType: IGCSEType;
  isArray: boolean;
  arrayDimensions?: number[];
  warnings: string[];
}

export class TypeConverter {
  /**
   * Convert Java type to IGCSE type
   */
  static convertJavaType(javaType: string, isArray: boolean = false, arrayDimensions: number[] = []): TypeConversionResult {
    const warnings: string[] = [];
    let igcseType: IGCSEType;

    // Convert basic Java types to IGCSE types
    switch (javaType.toLowerCase()) {
      case 'int':
      case 'integer':
        igcseType = 'INTEGER';
        break;
      
      case 'double':
      case 'float':
        igcseType = 'REAL';
        if (javaType === 'float') {
          warnings.push('Java float converted to IGCSE REAL - precision may differ');
        }
        break;
      
      case 'string':
        igcseType = 'STRING';
        break;
      
      case 'char':
      case 'character':
        igcseType = 'CHAR';
        break;
      
      case 'boolean':
        igcseType = 'BOOLEAN';
        break;
      
      default:
        igcseType = 'UNKNOWN';
        warnings.push(`Unknown Java type '${javaType}' - using UNKNOWN type`);
        break;
    }

    return {
      igcseType,
      isArray,
      arrayDimensions,
      warnings
    };
  }

  /**
   * Generate IGCSE array declaration syntax
   */
  static generateIGCSEArrayDeclaration(baseType: IGCSEType, dimensions: number[]): string {
    if (dimensions.length === 0) {
      return baseType;
    }

    // For IGCSE, arrays are declared as ARRAY[1:size] OF TYPE
    // For unknown sizes, we use ARRAY[1:n] OF TYPE
    let result = baseType;
    
    for (let i = dimensions.length - 1; i >= 0; i--) {
      const size = dimensions[i] > 0 ? dimensions[i] : 'n';
      result = `ARRAY[1:${size}] OF ${result}`;
    }

    return result;
  }

  /**
   * Convert Java variable declaration to IGCSE format
   */
  static convertVariableDeclaration(
    name: string, 
    javaType: string, 
    isArray: boolean = false, 
    arrayDimensions: number[] = [],
    initialValue?: string
  ): {
    declaration: string;
    warnings: string[];
  } {
    const typeResult = this.convertJavaType(javaType, isArray, arrayDimensions);
    const warnings = [...typeResult.warnings];

    let declaration: string;

    if (typeResult.isArray) {
      const arrayType = this.generateIGCSEArrayDeclaration(typeResult.igcseType, typeResult.arrayDimensions || []);
      declaration = `DECLARE ${name} : ${arrayType}`;
    } else {
      declaration = `DECLARE ${name} : ${typeResult.igcseType}`;
    }

    // Add initialization if present
    if (initialValue !== undefined) {
      const convertedValue = this.convertLiteralValue(initialValue, typeResult.igcseType);
      declaration += `\n${name} ← ${convertedValue}`;
    }

    return {
      declaration,
      warnings
    };
  }

  /**
   * Convert Java literal values to IGCSE format
   */
  static convertLiteralValue(value: string, targetType: IGCSEType): string {
    switch (targetType) {
      case 'STRING':
        // Ensure string literals are properly quoted
        if (!value.startsWith('"') || !value.endsWith('"')) {
          return `"${value}"`;
        }
        return value;
      
      case 'CHAR':
        // Convert to single quotes for IGCSE
        if (value.startsWith('"') && value.endsWith('"') && value.length === 3) {
          return `'${value.slice(1, -1)}'`;
        }
        return value;
      
      case 'BOOLEAN':
        // IGCSE uses TRUE/FALSE (uppercase)
        return value.toLowerCase() === 'true' ? 'TRUE' : 'FALSE';
      
      case 'INTEGER':
      case 'REAL':
        // Numbers remain the same
        return value;
      
      default:
        return value;
    }
  }
}

// export { TypeConverter };