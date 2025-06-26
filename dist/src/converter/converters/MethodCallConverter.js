import { ConverterFactory } from './ConverterFactory';
export class MethodCallConverter {
    convert(node, context) {
        const methodName = node.name || '';
        if (methodName.includes('println') || methodName.includes('print')) {
            const args = node.children || [];
            if (args.length > 0 && args[0]) {
                const argument = this.convertExpression(args[0], context);
                return [`OUTPUT ${argument}`];
            }
            return ['OUTPUT'];
        }
        if (methodName.includes('nextInt') || methodName.includes('nextLine') || methodName.includes('next')) {
            return ['INPUT'];
        }
        const args = (node.children || []).map(arg => this.convertExpression(arg, context)).join(', ');
        return [`${methodName}(${args})`];
    }
    convertExpression(node, context) {
        const converter = ConverterFactory.getConverter(node);
        return converter.convert(node, context).join(' ');
    }
}
//# sourceMappingURL=MethodCallConverter.js.map