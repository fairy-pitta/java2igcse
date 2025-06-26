import { ASTNode, ConversionContext } from '@/types/ast';
import { IConverter } from './IConverter';
export declare class MethodDeclarationConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string[];
    private convertParameters;
}
//# sourceMappingURL=MethodDeclarationConverter.d.ts.map