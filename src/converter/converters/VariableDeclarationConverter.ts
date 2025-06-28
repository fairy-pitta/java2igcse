import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { ConverterFactory } from './ConverterFactory';

export class VariableDeclarationConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string {
        const declarations: string[] = [];
        const assignments: string[] = [];

        // Handle modifiers for constants
        const isFinal = node.modifiers && (node.modifiers.includes('final') || node.modifiers.includes('static'));

        if (isFinal && node.initializer) {
            const valueConverter = ConverterFactory.getConverter(node.initializer.type);
            const result = valueConverter ? valueConverter.convert(node.initializer, context) : '';
            const value = Array.isArray(result) ? result.join(' ') : result;
            return `CONSTANT ${node.name} = ${value}`;
        }

        const dataType = this.mapJavaTypeToIGCSE(node.dataType || 'unknown');
        declarations.push(`DECLARE ${node.name} : ${dataType}`);

        if (node.initializer) {
            // Special handling for Scanner input methods
            if (node.initializer.type === 'MethodInvocation' && node.initializer.expression && node.initializer.expression.name === 'scanner') {
                if (node.initializer.methodName && (node.initializer.methodName.includes('next'))) {
                    assignments.push(`INPUT ${node.name}`);
                }
            } else {
                const valueConverter = ConverterFactory.getConverter(node.initializer.type);
                const result = valueConverter ? valueConverter.convert(node['initializer'], context) : '';
                const value = Array.isArray(result) ? result.join(' ') : result;
                let valueStr = value;
                if (dataType === 'BOOLEAN') {
                    valueStr = valueStr.toUpperCase();
                }
                assignments.push(`${node.name} ← ${valueStr}`);
            }
        }

        const lines = [...declarations, ...assignments];
        return lines.length > 0 ? lines.join('\n') : '';
    }

    private mapJavaTypeToIGCSE(javaType: string): string {
        switch (javaType.toLowerCase()) {
            case 'int':
            case 'integer':
                return 'INTEGER';
            case 'string':
                return 'STRING';
            case 'boolean':
                return 'BOOLEAN';
            case 'double':
            case 'float':
                return 'REAL';
            case 'void':
                return 'VOID';
            default:
                return 'UNKNOWN';
        }
    }
}