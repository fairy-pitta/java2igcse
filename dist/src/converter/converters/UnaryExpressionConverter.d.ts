import { ASTNode, ConversionContext } from '@/types/ast';
import { IConverter } from './IConverter';
export declare class UnaryExpressionConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string[];
    private convertExpression;
    private mapUnaryOperator;
}
//# sourceMappingURL=UnaryExpressionConverter.d.ts.map