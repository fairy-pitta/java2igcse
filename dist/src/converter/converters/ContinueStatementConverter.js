export class ContinueStatementConverter {
    convert(node, context) {
        // Find the enclosing loop to get the variable name
        for (let i = context.parentChain.length - 1; i >= 0; i--) {
            const parent = context.parentChain[i];
            if (parent && typeof parent !== 'string') {
                if (parent.type === 'ForStatement' && parent.init?.type === 'VariableDeclaration') {
                    return [`NEXT ${parent.init.name}`];
                }
                else if (parent.type === 'EnhancedForStatement') {
                    return [`NEXT ${parent.elementName}`];
                }
            }
        }
        return ['NEXT']; // Fallback for while/do-while or if loop variable is not found
    }
}
//# sourceMappingURL=ContinueStatementConverter.js.map