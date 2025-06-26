import { ASTNode, ConversionContext } from '@/types/ast';
import { IConverter } from './IConverter';
export declare class BinaryExpressionConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string[];
    private convertExpression;
    private mapOperator;
}
//# sourceMappingURL=BinaryExpressionConverter.d.ts.map