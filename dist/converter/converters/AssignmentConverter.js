import { ConverterFactory } from './ConverterFactory';
export class AssignmentConverter {
    convert(node, context) {
        const left = this.convertExpression(node.left, context);
        const right = this.convertExpression(node.right, context);
        return [`${left} ← ${right}`];
    }
    convertExpression(node, context) {
        const converter = ConverterFactory.getConverter(node);
        return converter.convert(node, context).join(' ');
    }
}
//# sourceMappingURL=AssignmentConverter.js.map