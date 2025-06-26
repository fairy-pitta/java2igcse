import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { ConverterFactory } from './ConverterFactory';

export class MethodCallConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string {
        if (node.expression && node.expression.name === 'System.out') {
            if (node.methodName === 'println' || node.methodName === 'print') {
                const args = node.arguments.map((arg: ASTNode) => {
                    const converter = ConverterFactory.getConverter(arg.type);
                    return converter ? converter.convert(arg, context) : '';
                }).join(' & '); // Pseudocode uses & for concatenation in OUTPUT
                return `OUTPUT ${args}`;
            }
        }
        // Handle other method calls as needed
        return '';
    }
}
