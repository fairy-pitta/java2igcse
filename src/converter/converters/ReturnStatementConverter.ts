import { ASTNode, ConversionContext } from '@/types/ast';
import { IConverter } from './IConverter';

export class ReturnStatementConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string[] {
    if (node.argument) {
      // Assuming argument is an expression that can be converted
      // You'll need to implement a way to convert expressions using the factory
      return [`RETURN ${node.argument.value}`]; // Placeholder
    }
    return ['RETURN'];
  }
}