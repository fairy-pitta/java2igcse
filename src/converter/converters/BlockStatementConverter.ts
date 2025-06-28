import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { ConverterFactory } from './ConverterFactory';

export class BlockStatementConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string {
    const statements = node.children || [];
    const results: string[] = [];

    for (const stmt of statements) {
      const converter = ConverterFactory.getConverter(stmt.type);
      if (converter) {
        results.push(converter.convert(stmt, context));
      }
    }

    return results.join('\n');
  }
}