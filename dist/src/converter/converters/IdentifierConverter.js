export class IdentifierConverter {
    convert(node, context) {
        return [node.name || node.value || 'unknown'];
    }
}
//# sourceMappingURL=IdentifierConverter.js.map