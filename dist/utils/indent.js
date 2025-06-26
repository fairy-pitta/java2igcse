/**
 * インデント生成ユーティリティ
 * 指定レベルのインデント文字列を返す。
 * 現在は 1 レベル = 3 スペースとするが、将来変更しやすいよう集中管理。
 */
export function indent(level) {
    const SPACES_PER_LEVEL = 3;
    return ' '.repeat(SPACES_PER_LEVEL * level);
}
/**
 * インデント検証用ヘルパー関数
 * 行頭の空白数をカウントし、期待されるインデントレベルを返す
 */
export function getIndentLevel(line) {
    const SPACES_PER_LEVEL = 3;
    const leadingSpaces = line.length - line.trimStart().length;
    return Math.floor(leadingSpaces / SPACES_PER_LEVEL);
}
/**
 * 複数行のインデント構造を検証するヘルパー関数
 */
export function getIndentTree(lines) {
    return lines.map(line => getIndentLevel(line));
}
/**
 * 統一されたインデント適用メソッド
 * 文字列配列の各行に指定されたレベルのインデントを適用する
 */
export function applyIndent(lines, indentLevel) {
    const indentStr = indent(indentLevel);
    return lines.map(line => {
        if (line.trim() === '')
            return line; // 空行はそのまま
        return indentStr + line;
    });
}
export function mapJavaTypeToIGCSE(javaType) {
    const typeMap = {
        'int': 'INTEGER',
        'integer': 'INTEGER',
        'long': 'INTEGER',
        'short': 'INTEGER',
        'byte': 'INTEGER',
        'double': 'REAL',
        'float': 'REAL',
        'boolean': 'BOOLEAN',
        'string': 'STRING',
        'String': 'STRING',
        'char': 'CHAR',
        'Character': 'CHAR'
    };
    return typeMap[javaType.toLowerCase()] || 'STRING';
}
//# sourceMappingURL=indent.js.map