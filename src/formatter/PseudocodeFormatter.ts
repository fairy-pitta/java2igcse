export class PseudocodeFormatter {
    private indentLevel: number = 0;
    private readonly indentSize: number = 3;

    format(code: string): string {
        if (!code) return '';
        
        const lines = code.split('\n');
        this.indentLevel = 0;
        const formattedLines = lines.map(line => this.formatLine(line.trim()));
        return formattedLines.join('\n');
    }

    private formatLine(line: string): string {
        if (!line) return '';

        if (this.isEndKeyword(line)) {
            this.indentLevel--;
        }

        const indentedLine = this.indent(line);

        if (this.isStartKeyword(line)) {
            this.indentLevel++;
        }

        return indentedLine;
    }

    private indent(line: string): string {
        if (this.indentLevel < 0) this.indentLevel = 0;

        if (line.startsWith('CASE OF')) {
            return line;
        }

        if (line.startsWith('ENDCASE')) {
            return line;
        }

        if (line.match(/^"[A-Z]":|^OTHERWISE:/)) {
            return ' '.repeat(this.indentSize) + line;
        }

        if (line.startsWith('ELSE')) {
            return ' '.repeat(Math.max(0, this.indentLevel - 1) * this.indentSize) + line;
        }

        if (line.startsWith('OUTPUT')) {
            return ' '.repeat(this.indentLevel * this.indentSize) + line.replace(/^   /, '');
        }

        return ' '.repeat(this.indentLevel * this.indentSize) + line;
    }

    private isStartKeyword(line: string): boolean {
        const startKeywords = [
            'IF',
            'WHILE',
            'FOR',
            'REPEAT',
            'CASE OF'
        ];
        return startKeywords.some(keyword => line.startsWith(keyword));
    }

    private isEndKeyword(line: string): boolean {
        const endKeywords = [
            'ENDIF',
            'ELSE',
            'ENDWHILE',
            'NEXT',
            'UNTIL',
            'ENDCASE'
        ];
        return endKeywords.some(keyword => line.startsWith(keyword));
    }
}