import { ASTNode, ConversionContext } from '@/types/ast';
import { IConverter } from './IConverter';
import { applyIndent } from '@/utils/indent';
import { ConverterFactory } from './ConverterFactory';

export class WhileStatementConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string[] {
    const condition = this.convertExpression(node.condition!, context);
    const result = [`WHILE ${condition}`];
    
    const body = this.convertBlock(node.body!, { ...context, indentLevel: context.indentLevel + 1 });
    result.push(...applyIndent(body, 1));
    result.push('ENDWHILE');
    
    return applyIndent(result, context.indentLevel);
  }

  private convertExpression(node: ASTNode, context: ConversionContext): string {
    const converter = ConverterFactory.getConverter(node);
    return converter.convert(node, context).join(' ');
  }

  private convertBlock(node: ASTNode, context: ConversionContext): string[] {
    const converter = ConverterFactory.getConverter(node);
    return converter.convert(node, context);
  }
}