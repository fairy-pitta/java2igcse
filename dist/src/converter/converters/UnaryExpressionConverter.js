import { ConverterFactory } from './ConverterFactory';
export class UnaryExpressionConverter {
    convert(node, context) {
        const operand = this.convertExpression(node.expression, context);
        const operator = this.mapUnaryOperator(node.operator);
        if (operator === '-' && !isNaN(Number(operand))) {
            return [`-${operand}`];
        }
        return [`${operator} ${operand}`];
    }
    convertExpression(node, context) {
        const converter = ConverterFactory.getConverter(node);
        return converter.convert(node, context).join(' ');
    }
    mapUnaryOperator(operator) {
        const operatorMap = {
            '!': 'NOT',
            '-': '-',
            '+': '+'
        };
        return operatorMap[operator] || operator;
    }
}
//# sourceMappingURL=UnaryExpressionConverter.js.map