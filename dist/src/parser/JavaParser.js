export class JavaParser {
    tokens = [];
    current = 0;
    line = 1;
    column = 1;
    parse(code) {
        this.tokens = this.tokenize(code);
        this.current = 0;
        this.line = 1;
        this.column = 1;
        // ... parsing logic ...
        return null; // Placeholder
    }
    tokenize(code) {
        const tokens = [];
        const keywords = ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'int', 'double', 'boolean', 'String', 'char', 'void', 'class', 'public', 'private', 'protected', 'static', 'final', 'new'];
        let cursor = 0;
        while (cursor < code.length) {
            let char = code[cursor];
            if (this.isWhitespace(char)) {
                if (char === '\n') {
                    this.line++;
                    this.column = 1;
                }
                else {
                    this.column++;
                }
                cursor++;
                continue;
            }
            if (char === '/' && code[cursor + 1] === '/') {
                while (cursor < code.length && code[cursor] !== '\n') {
                    cursor++;
                }
                continue;
            }
            if (this.isAlpha(char)) {
                let word = '';
                while (cursor < code.length && this.isAlphaNumeric(code[cursor])) {
                    word += code[cursor];
                    cursor++;
                }
                if (word === 'true' || word === 'false') {
                    tokens.push({ type: 'BooleanLiteral', value: word === 'true' });
                }
                else if (keywords.includes(word)) {
                    tokens.push({ type: 'Keyword', value: word });
                }
                else {
                    tokens.push({ type: 'Identifier', value: word });
                }
                this.column += word.length;
                continue;
            }
            if (this.isDigit(char)) {
                let numStr = '';
                let hasDecimal = false;
                while (cursor < code.length && (this.isDigit(code[cursor]) || (code[cursor] === '.' && !hasDecimal))) {
                    if (code[cursor] === '.') {
                        hasDecimal = true;
                    }
                    numStr += code[cursor];
                    cursor++;
                }
                tokens.push({ type: 'NumericLiteral', value: parseFloat(numStr) });
                this.column += numStr.length;
                continue;
            }
            if (char === '"') {
                let str = '';
                cursor++; // Skip opening quote
                while (cursor < code.length && code[cursor] !== '"') {
                    str += code[cursor];
                    cursor++;
                }
                cursor++; // Skip closing quote
                tokens.push({ type: 'StringLiteral', value: str });
                this.column += str.length + 2;
                continue;
            }
            if (char === '\'') {
                let charValue = '';
                cursor++; // Skip opening quote
                if (cursor < code.length && code[cursor] !== '\'') {
                    charValue = code[cursor];
                    cursor++;
                }
                cursor++; // Skip closing quote
                tokens.push({ type: 'CharLiteral', value: charValue });
                this.column += charValue.length + 2;
                continue;
            }
            const twoCharOp = code.substring(cursor, cursor + 2);
            const oneCharOp = char;
            const twoCharOps = ['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/='];
            if (twoCharOps.includes(twoCharOp)) {
                tokens.push({ type: 'Operator', value: twoCharOp });
                cursor += twoCharOp.length;
                this.column += twoCharOp.length;
                continue;
            }
            else if (this.isOperator(oneCharOp)) {
                tokens.push({ type: 'Operator', value: oneCharOp });
                cursor += oneCharOp.length;
                this.column += oneCharOp.length;
                continue;
            }
            if (this.isPunctuator(char)) {
                tokens.push({ type: 'Punctuator', value: char });
                cursor++;
                this.column++;
                continue;
            }
            throw new Error(`Unexpected character: ${char} at line ${this.line} column ${this.column}`);
        }
        return tokens;
    }
    isWhitespace(char) {
        return /\s/.test(char);
    }
    isAlpha(char) {
        return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
    }
    isAlphaNumeric(char) {
        return this.isAlpha(char) || this.isDigit(char);
    }
    isDigit(char) {
        return char >= '0' && char <= '9';
    }
    isOperator(char) {
        return ['+', '-', '*', '/', '%', '=', '!', '<', '>'].includes(char);
    }
    isPunctuator(char) {
        return [';', ',', '(', ')', '{', '}', '[', ']', '.'].includes(char);
    }
}
//# sourceMappingURL=JavaParser.js.map