import { ASTNode, ConversionContext } from '../../types/ast.js';

export interface IConverter {
    convert(node: ASTNode, context: ConversionContext): string | string[];
}