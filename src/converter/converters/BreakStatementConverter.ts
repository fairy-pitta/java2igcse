import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';

export class BreakStatementConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string[] {
    return ['EXIT FOR'];
  }
}