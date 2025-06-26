import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
export declare class IfStatementConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string[];
    private convertExpression;
    private convertBlock;
}
//# sourceMappingURL=IfStatementConverter.d.ts.map