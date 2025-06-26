import { ASTNode, ConversionContext } from '@/types/ast';
import { IConverter } from './IConverter';
export declare class AssignmentConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext): string[];
    private convertExpression;
}
//# sourceMappingURL=AssignmentConverter.d.ts.map