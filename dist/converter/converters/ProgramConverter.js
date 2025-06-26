import { RecursionGuard } from '@/converter/RecursionGuard';
export class ProgramConverter {
    convert(node, context) {
        const results = [];
        for (const childNode of node.children || []) {
            results.push(...RecursionGuard.convert(childNode, context));
        }
        return results;
    }
}
//# sourceMappingURL=ProgramConverter.js.map