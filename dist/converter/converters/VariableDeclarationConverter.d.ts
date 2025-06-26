import { ASTNode, ConversionContext } from '@/types/ast';
import { IConverter } from './IConverter';
export declare class VariableDeclarationConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string[];
    private convertExpression;
}
//# sourceMappingURL=VariableDeclarationConverter.d.ts.map