export class ConversionError extends Error {
    node;
    context;
    constructor(message, node, context) {
        const position = node.position;
        const locationInfo = position
            ? ` at line ${position.line}, column ${position.column}`
            : '';
        super(`${message}${locationInfo}`);
        this.node = node;
        this.context = context;
        this.name = 'ConversionError';
    }
}
//# sourceMappingURL=ast.js.map