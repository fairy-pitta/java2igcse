import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { applyIndent } from '../../utils/indent';
import { ConverterFactory } from './ConverterFactory';

export class IfStatementConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string[] {
    const condition = this.convertExpression(node.condition!, context);
    const result: string[] = [];

    result.push(`IF ${condition} THEN`);

    const thenContext = { ...context, indentLevel: context.indentLevel + 1 };
    const thenBranch = this.convertBlock(node.thenBranch!, thenContext);
    result.push(...applyIndent(thenBranch, 1));

    if (node.elseBranch) {
      if (node.elseBranch.type === 'IfStatement') {
        const elseIfResult = this.convert(node.elseBranch, context);
        if (elseIfResult && elseIfResult.length > 0) {
          result.push(`ELSE ${elseIfResult[0]!.trim()}`);
          result.push(...elseIfResult.slice(1));
        }
      } else {
        result.push('ELSE');
        const elseContext = { ...context, indentLevel: context.indentLevel + 1 };
        const elseBranch = this.convertBlock(node.elseBranch!, elseContext);
        result.push(...applyIndent(elseBranch, 1));
        result.push('ENDIF');
      }
    }

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