import { ConverterFactory } from './ConverterFactory';
export class ExpressionStatementConverter {
    convert(node, context) {
        const converter = ConverterFactory.getConverter(node.expression);
        return converter.convert(node.expression, context);
    }
}
//# sourceMappingURL=ExpressionStatementConverter.js.map