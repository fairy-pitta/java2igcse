export class LiteralConverter {
    convert(node, context) {
        const value = node.value;
        if (typeof value === 'string') {
            return [`"${value}"`];
        }
        if (typeof value === 'boolean') {
            return [value ? 'TRUE' : 'FALSE'];
        }
        return [String(value)];
    }
}
//# sourceMappingURL=LiteralConverter.js.map