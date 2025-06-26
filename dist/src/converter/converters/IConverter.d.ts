import { ASTNode, ConversionContext } from '../../../types/ast';
export interface IConverter {
    convert(node: ASTNode, context: ConversionContext): string[];
}
//# sourceMappingURL=IConverter.d.ts.map