import { mapJavaTypeToIGCSE } from '@/utils/indent';
import { ConverterFactory } from './ConverterFactory';
export class VariableDeclarationConverter {
    convert(node, context) {
        const dataType = mapJavaTypeToIGCSE(node.dataType || 'int');
        const name = node.name || 'unknown';
        const modifiers = node.value?.modifiers || [];
        const isFinal = modifiers.includes('final') || modifiers.includes('static');
        if (isFinal && node.initializer) {
            const value = this.convertExpression(node.initializer, context);
            return [`CONSTANT ${name} = ${value}`];
        }
        const result = [`DECLARE ${name} : ${dataType}`];
        if (node.initializer) {
            if (node.initializer.type === 'MethodCall' &&
                (node.initializer.name?.includes('nextInt') ||
                    node.initializer.name?.includes('nextLine') ||
                    node.initializer.name?.includes('next'))) {
                result.push(`INPUT ${name}`);
            }
            else {
                const value = this.convertExpression(node.initializer, context);
                let valueStr = value;
                if (dataType === 'BOOLEAN') {
                    valueStr = valueStr.toUpperCase();
                }
                result.push(`${name} ← ${valueStr}`);
            }
        }
        return result;
    }
    convertExpression(node, context) {
        const converter = ConverterFactory.getConverter(node);
        return converter.convert(node, context).join(' ');
    }
}
//# sourceMappingURL=VariableDeclarationConverter.js.map