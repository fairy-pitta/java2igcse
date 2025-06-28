import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { indent } from '../../utils/indent';
import { RecursionGuard } from '../RecursionGuard';

export class MethodDeclarationConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string {
    const result: string[] = [];
    const returnType = this.mapJavaTypeToIGCSE(node.returnType || 'void');
    const name = node.name || 'unknown';
    const parameters = this.convertParameters(node.parameters || [], context);

    // Determine if it's a PROCEDURE or FUNCTION
    const isFunction = returnType !== 'VOID'; // Assuming VOID for void methods

    if (isFunction) {
      result.push(`FUNCTION ${name}(${parameters}) RETURNS ${returnType}`);
    } else {
      result.push(`PROCEDURE ${name}(${parameters})`);
    }

    if (node.body) {
      const bodyResult = RecursionGuard.convert(node.body, { ...context, indentLevel: (context.indentLevel || 0) + 1 });
      result.push(bodyResult);
    }

    if (isFunction) {
      result.push('ENDFUNCTION');
    } else {
      result.push('ENDPROCEDURE');
    }

    return result.map(line => indent(context.indentLevel || 0) + line).join('\n');
  }

  private convertParameters(params: ASTNode[], context: ConversionContext): string {
    return params.map(param => {
      const paramType = this.mapJavaTypeToIGCSE(param.dataType || 'unknown');
      return `${param.name} : ${paramType}`;
    }).join(', ');
  }

  private mapJavaTypeToIGCSE(javaType: string): string {
    switch (javaType.toLowerCase()) {
      case 'int':
      case 'integer':
        return 'INTEGER';
      case 'string':
        return 'STRING';
      case 'boolean':
        return 'BOOLEAN';
      case 'double':
      case 'float':
        return 'REAL';
      case 'void':
        return 'VOID';
      default:
        return 'UNKNOWN';
    }
  }
}