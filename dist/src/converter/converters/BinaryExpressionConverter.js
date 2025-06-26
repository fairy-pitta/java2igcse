import { ConverterFactory } from './ConverterFactory';
export class BinaryExpressionConverter {
    convert(node, context) {
        const left = this.convertExpression(node.left, context);
        const right = this.convertExpression(node.right, context);
        const operator = this.mapOperator(node.operator);
        return [`${left} ${operator} ${right}`];
    }
    convertExpression(node, context) {
        const converter = ConverterFactory.getConverter(node);
        return converter.convert(node, context).join(' ');
    }
    mapOperator(operator) {
        const operatorMap = {
            '+': '+',
            '-': '-',
            '*': '*',
            '/': '/',
            '%': 'MOD',
            '==': '=',
            '!=': '≠',
            '<': '<',
            '>': '>',
            '<=': '≤',
            '>=': '≥',
            '&&': 'AND',
            '||': 'OR',
            '&': '&' // String concatenation
        };
        return operatorMap[operator] || operator;
    }
}
//# sourceMappingURL=BinaryExpressionConverter.js.map