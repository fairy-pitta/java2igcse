import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';

export class LiteralConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string {
        if (typeof node.value === 'boolean') {
            return node.value ? 'TRUE' : 'FALSE';
        } else if (typeof node.value === 'string') {
            return `"${node.value}"`;
        } else {
            return node.value.toString();
        }
    }
}
