/**
 * インデント生成ユーティリティ
 * 指定レベルのインデント文字列を返す。
 * 現在は 1 レベル = 3 スペースとするが、将来変更しやすいよう集中管理。
 */
export declare function indent(level: number): string;
/**
 * インデント検証用ヘルパー関数
 * 行頭の空白数をカウントし、期待されるインデントレベルを返す
 */
export declare function getIndentLevel(line: string): number;
/**
 * 複数行のインデント構造を検証するヘルパー関数
 */
export declare function getIndentTree(lines: string[]): number[];
/**
 * 統一されたインデント適用メソッド
 * 文字列配列の各行に指定されたレベルのインデントを適用する
 */
export declare function applyIndent(lines: string[], indentLevel: number): string[];
export declare function mapJavaTypeToIGCSE(javaType: string): string;
//# sourceMappingURL=indent.d.ts.map