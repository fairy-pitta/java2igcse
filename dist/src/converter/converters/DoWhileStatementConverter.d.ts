import { ASTNode, ConversionContext } from '@/types/ast';
import { IConverter } from './IConverter';
export declare class DoWhileStatementConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string[];
    private negateCondition;
    private negateSingleCondition;
}
//# sourceMappingURL=DoWhileStatementConverter.d.ts.map