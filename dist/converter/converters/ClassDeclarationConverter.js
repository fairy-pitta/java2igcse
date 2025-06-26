import { applyIndent } from '@/utils/indent';
import { RecursionGuard } from '@/converter/RecursionGuard';
export class ClassDeclarationConverter {
    convert(node, context) {
        const result = [];
        result.push(`CLASS ${node.name}`);
        const body = RecursionGuard.convert(node.body, { ...context, indentLevel: context.indentLevel + 1 });
        result.push(...applyIndent(body, 1));
        result.push('ENDCLASS');
        return applyIndent(result, context.indentLevel);
    }
}
//# sourceMappingURL=ClassDeclarationConverter.js.map