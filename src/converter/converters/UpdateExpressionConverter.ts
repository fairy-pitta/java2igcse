import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { ConverterFactory } from './ConverterFactory';

export class UpdateExpressionConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string {
    const argument = this.convertExpression(node.argument!, context);
    const variable = argument;
    
    if (node.operator === '++') {
      return `${variable} ← ${variable} + 1`;
    } else if (node.operator === '--') {
      return `${variable} ← ${variable} - 1`;
    }
    
    return `${variable} ← ${variable} - 1`;
  }

  private convertExpression(node: ASTNode, context: ConversionContext): string {
    const converter = ConverterFactory.getConverter(node.type);
    return converter ? converter.convert(node, context) : node.name || '';
  }
}