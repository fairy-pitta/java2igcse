import { ASTNode, ConversionContext } from '@/types/ast';
import { IConverter } from './IConverter';
export declare class ForStatementConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string[];
    private convertExpression;
    private convertBlock;
}
//# sourceMappingURL=ForStatementConverter.d.ts.map