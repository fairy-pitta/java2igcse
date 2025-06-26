import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { ConverterFactory } from './ConverterFactory';

export class AssignmentConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string {
        const leftConverter = ConverterFactory.getConverter(node.left.type);
        const rightConverter = ConverterFactory.getConverter(node.right.type);

        const left = leftConverter ? leftConverter.convert(node.left, context) : '';
        const right = rightConverter ? rightConverter.convert(node.right, context) : '';

        return `${left} ← ${right}`;
    }
}
