import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { ConverterFactory } from './ConverterFactory';

export class ExpressionStatementConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string {
        if (!node.expression) {
            console.warn('Expression node is missing');
            return '';
        }
        const expressionConverter = ConverterFactory.getConverter(node.expression.type);
        return expressionConverter ? expressionConverter.convert(node.expression, context) : '';
    }
}
