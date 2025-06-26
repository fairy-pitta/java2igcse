import { ASTNode, ConversionContext } from '../types/ast';
export declare class RecursionGuard {
    static convert(node: ASTNode, context: ConversionContext): string[];
    private static getNodeId;
    /**
     * デバッグ用：現在の再帰状態を取得
     */
    static getRecursionInfo(context: ConversionContext): string;
    /**
     * 安全な深度での実行かチェック
     */
    static isSafeDepth(context: ConversionContext, threshold?: number): boolean;
}
//# sourceMappingURL=RecursionGuard.d.ts.map