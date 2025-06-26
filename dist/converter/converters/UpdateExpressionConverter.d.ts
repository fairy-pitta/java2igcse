import { ASTNode, ConversionContext } from '@/types/ast';
import { IConverter } from './IConverter';
export declare class UpdateExpressionConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string[];
    private convertExpression;
}
//# sourceMappingURL=UpdateExpressionConverter.d.ts.map