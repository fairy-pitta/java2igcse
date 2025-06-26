import { ConverterFactory } from './ConverterFactory';
export class BlockStatementConverter {
    convert(node, context) {
        const statements = node.children || [];
        const results = [];
        for (const stmt of statements) {
            const converter = ConverterFactory.getConverter(stmt);
            results.push(...converter.convert(stmt, context));
        }
        return results;
    }
}
//# sourceMappingURL=BlockStatementConverter.js.map