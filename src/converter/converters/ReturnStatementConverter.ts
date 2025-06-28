import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { ConverterFactory } from './ConverterFactory';

export class ReturnStatementConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string {
    if (node.argument) {
      const converter = ConverterFactory.getConverter(node.argument.type);
      if (converter) {
        const result = converter.convert(node.argument, context);
        return `RETURN ${result}`;
      }
    }
    return 'RETURN';
  }
}