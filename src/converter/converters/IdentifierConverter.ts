import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';

export class IdentifierConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string {
        return node.name;
    }
}
