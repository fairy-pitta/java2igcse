import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { ConverterFactory } from './ConverterFactory';
import { mapJavaTypeToIGCSE } from '../../utils/indent';

export class VariableDeclarationConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string {
        const declarations: string[] = [];
        const assignments: string[] = [];

        // Handle modifiers for constants
        const isFinal = node.modifiers && (node.modifiers.includes('final') || node.modifiers.includes('static'));

        if (isFinal && node.initializer) {
            const valueConverter = ConverterFactory.getConverter(node.initializer.type);
            const value = valueConverter ? valueConverter.convert(node.initializer, context) : '';
            return `CONSTANT ${node.name} = ${value}`;
        }

        const dataType = mapJavaTypeToIGCSE(node.dataType);
        declarations.push(`DECLARE ${node.name} : ${dataType}`);

        if (node.initializer) {
            // Special handling for Scanner input methods
            if (node.initializer.type === 'MethodInvocation' && node.initializer.expression && node.initializer.expression.name === 'scanner') {
                if (node.initializer.methodName && (node.initializer.methodName.includes('next'))) {
                    assignments.push(`INPUT ${node.name}`);
                }
            } else {
                const valueConverter = ConverterFactory.getConverter(node.initializer.type);
                const value = valueConverter ? valueConverter.convert(node.initializer, context) : '';
                let valueStr = value;
                if (dataType === 'BOOLEAN') {
                    valueStr = valueStr.toUpperCase();
                }
                assignments.push(`${node.name} ← ${valueStr}`);
            }
        }

        return [...declarations, ...assignments].join('\n');
    }
}