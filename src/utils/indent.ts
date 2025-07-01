export function indent(text: string, level: number): string {
    if (!text) return '';
    const indentStr = '   '.repeat(level);
    return text
        .split('\n')
        .map(line => line.trim() ? indentStr + line.trim() : '')
        .filter(Boolean)
        .join('\n');
}