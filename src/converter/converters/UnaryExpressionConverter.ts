import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { ConverterFactory } from './ConverterFactory';

export class UnaryExpressionConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string {
        const argumentConverter = ConverterFactory.getConverter(node.argument.type);
        const argument = argumentConverter ? argumentConverter.convert(node.argument, context) : '';

        let operator = node.operator;
        switch (operator) {
            case '!':
                operator = 'NOT';
                break;
            // Add other unary operators as needed
        }

        return `${operator} ${argument}`;
    }
}
