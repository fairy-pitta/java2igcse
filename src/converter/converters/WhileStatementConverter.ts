import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { indent } from '../../utils/indent';
import { ConverterFactory } from './ConverterFactory';

export class WhileStatementConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string {
    const condition = node.condition ? this.convertExpression(node.condition, context) : '';
    const result: string[] = [`WHILE ${condition}`];
    
    if (node.body) {
      const body = this.convertBlock(node.body, { ...context, indentLevel: (context.indentLevel || 0) + 1 });
      result.push(body);
    }
    result.push('ENDWHILE');
    
    return result.map(line => indent(context.indentLevel || 0) + line).join('\n');
  }

  private convertExpression(node: ASTNode, context: ConversionContext): string {
    const converter = ConverterFactory.getConverter(node.type);
    return converter ? converter.convert(node, context) : '';
  }

  private convertBlock(node: ASTNode, context: ConversionContext): string {
    const converter = ConverterFactory.getConverter(node.type);
    return converter ? converter.convert(node, context) : '';
  }
}