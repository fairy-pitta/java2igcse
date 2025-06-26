import { ConverterFactory } from './ConverterFactory';
export class UpdateExpressionConverter {
    convert(node, context) {
        const argument = this.convertExpression(node.argument, context);
        const variable = argument;
        if (node.operator === '++') {
            return [`${variable} ← ${variable} + 1`];
        }
        else if (node.operator === '--') {
            return [`${variable} ← ${variable} - 1`];
        }
        return [`${variable} ← ${variable} - 1`];
    }
    convertExpression(node, context) {
        const converter = ConverterFactory.getConverter(node);
        return converter.convert(node, context).join(' ');
    }
}
//# sourceMappingURL=UpdateExpressionConverter.js.map