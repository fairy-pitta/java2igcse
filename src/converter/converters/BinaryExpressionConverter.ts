import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { ConverterFactory } from './ConverterFactory';

export class BinaryExpressionConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string {
        const leftConverter = ConverterFactory.getConverter(node.left.type);
        const rightConverter = ConverterFactory.getConverter(node.right.type);

        const left = leftConverter ? leftConverter.convert(node.left, context) : '';
        const right = rightConverter ? rightConverter.convert(node.right, context) : '';

        let operator = node.operator;
        switch (operator) {
            case '&&':
                operator = 'AND';
                break;
            case '||':
                operator = 'OR';
                break;
            case '==':
                operator = '=';
                break;
            case '!=':
                operator = '≠';
                break;
            case '<=':
                operator = '≤';
                break;
            case '>=':
                operator = '≥';
                break;
            case '%':
                operator = 'MOD';
                break;
            case '+':
                // Handle string concatenation
                if (node.left.dataType === 'String' || node.right.dataType === 'String') {
                    operator = '&';
                }
                break;
            case '/':
                // This is a placeholder for integer division hint. Actual hint handling will be in JavaToPseudocodeConverter.
                if (context.integerDivision) {
                    operator = 'DIV';
                }
                break;
        }

        return `${left} ${operator} ${right}`;
    }
}
