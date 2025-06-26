import { ASTNode, ConversionContext } from '@/types/ast';
import { IConverter } from './IConverter';
import { applyIndent } from '@/utils/indent';
import { RecursionGuard } from '@/converter/RecursionGuard';

export class ClassDeclarationConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string[] {
    const result: string[] = [];
    result.push(`CLASS ${node.name}`);

    const body = RecursionGuard.convert(node.body!, { ...context, indentLevel: context.indentLevel + 1 });
    result.push(...applyIndent(body, 1));

    result.push('ENDCLASS');
    return applyIndent(result, context.indentLevel);
  }
}