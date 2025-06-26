export function indent(level: number): string {
    return '    '.repeat(level);
}

export function applyIndent(lines: string[], level: number): string[] {
    const indentation = indent(level);
    return lines.map(line => `${indentation}${line}`);
}

export function mapJavaTypeToIGCSE(javaType: string): string {
    switch (javaType) {
        case 'int':
        case 'long':
        case 'short':
        case 'byte':
            return 'INTEGER';
        case 'double':
        case 'float':
            return 'REAL';
        case 'boolean':
            return 'BOOLEAN';
        case 'char':
            return 'CHAR';
        case 'String':
            return 'STRING';
        case 'void':
            return 'VOID';
        default:
            return 'ANY'; // Or throw an error for unsupported types
    }
}
