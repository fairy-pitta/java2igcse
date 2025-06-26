import { applyIndent, mapJavaTypeToIGCSE } from '@/utils/indent';
import { RecursionGuard } from '@/converter/RecursionGuard';
export class MethodDeclarationConverter {
    convert(node, context) {
        const result = [];
        const returnType = mapJavaTypeToIGCSE(node.returnType || 'void');
        const name = node.name || 'unknown';
        const parameters = this.convertParameters(node.parameters || [], context);
        // Determine if it's a PROCEDURE or FUNCTION
        const isFunction = returnType !== 'VOID'; // Assuming VOID for void methods
        if (isFunction) {
            result.push(`FUNCTION ${name}(${parameters}) RETURNS ${returnType}`);
        }
        else {
            result.push(`PROCEDURE ${name}(${parameters})`);
        }
        const body = RecursionGuard.convert(node.body, { ...context, indentLevel: context.indentLevel + 1 });
        result.push(...applyIndent(body, 1));
        if (isFunction) {
            result.push('ENDFUNCTION');
        }
        else {
            result.push('ENDPROCEDURE');
        }
        return applyIndent(result, context.indentLevel);
    }
    convertParameters(params, context) {
        return params.map(param => {
            const paramType = mapJavaTypeToIGCSE(param.dataType || 'unknown');
            return `${param.name} : ${paramType}`;
        }).join(', ');
    }
}
//# sourceMappingURL=MethodDeclarationConverter.js.map