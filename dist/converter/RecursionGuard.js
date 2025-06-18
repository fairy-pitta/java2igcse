import { ConversionError } from '../types/ast.js';
export class RecursionGuard {
    static convert(node, context, converter) {
        // 深度チェック
        if (context.depth > context.maxDepth) {
            throw new ConversionError(`Maximum recursion depth exceeded: ${context.maxDepth}`, node, context);
        }
        // 循環参照チェック
        const nodeId = this.getNodeId(node);
        if (context.visitedNodes.has(nodeId)) {
            throw new ConversionError(`Circular reference detected: ${nodeId}`, node, context);
        }
        // ノードを訪問済みとしてマーク
        context.visitedNodes.add(nodeId);
        context.depth++;
        context.parentChain.push(nodeId);
        try {
            return converter(node, context);
        }
        finally {
            // クリーンアップ
            context.visitedNodes.delete(nodeId);
            context.depth--;
            context.parentChain.pop();
        }
    }
    static getNodeId(node) {
        // ノードの一意識別子を生成
        const position = node.position;
        const positionStr = position
            ? `${position.line}:${position.column}:${position.offset}`
            : 'unknown';
        const typeStr = node.type || 'unknown';
        const nameStr = node.name || node.value || '';
        return `${typeStr}@${positionStr}:${nameStr}`;
    }
    /**
     * デバッグ用：現在の再帰状態を取得
     */
    static getRecursionInfo(context) {
        return `Depth: ${context.depth}/${context.maxDepth}, Chain: ${context.parentChain.join(' -> ')}`;
    }
    /**
     * 安全な深度での実行かチェック
     */
    static isSafeDepth(context, threshold = 0.8) {
        return context.depth < (context.maxDepth * threshold);
    }
}
//# sourceMappingURL=RecursionGuard.js.map