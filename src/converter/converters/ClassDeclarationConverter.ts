import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { indent } from '../../utils/indent';
import { RecursionGuard } from '../RecursionGuard';

export class ClassDeclarationConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string {
    const result: string[] = [];
    result.push(`CLASS ${node.name || ''}`);

    if (node.body) {
      const body = RecursionGuard.convert(node.body, { ...context, indentLevel: (context.indentLevel || 0) + 1 });
      result.push(body);
    }

    result.push('ENDCLASS');
    return result.map(line => indent(context.indentLevel || 0) + line).join('\n');
  }
}