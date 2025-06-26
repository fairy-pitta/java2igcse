import { ASTNode, ConversionContext } from '@/types/ast';
import { IConverter } from './IConverter';
export declare class WhileStatementConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string[];
    private convertExpression;
    private convertBlock;
}
//# sourceMappingURL=WhileStatementConverter.d.ts.map