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
        const statements = [];
        while (!this.isAtEnd()) {
            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            }
        }
        return {
            type: 'Program',
            children: statements,
            position: { line: 1, column: 1, offset: 0 }
        };
    }
    tokenize(code) {
        // 簡単なトークナイザー
        const tokens = [];
        let current = '';
        let inString = false;
        let stringChar = '';
        for (let i = 0; i < code.length; i++) {
            const char = code[i];
            if (inString) {
                current += char;
                if (char === stringChar && code[i - 1] !== '\\') {
                    tokens.push(current);
                    current = '';
                    inString = false;
                }
                continue;
            }
            // Handle comments
            if (char === '/' && i + 1 < code.length && code[i + 1] === '/') {
                // Skip to end of line
                while (i < code.length && code[i] !== '\n') {
                    i++;
                }
                continue;
            }
            if (char === '"' || char === "'") {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
                current = char;
                inString = true;
                stringChar = char;
                continue;
            }
            if (/\s/.test(char)) {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
                continue;
            }
            if (/[;(){}\[\],:]/.test(char)) {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
                tokens.push(char);
                continue;
            }
            // Handle dots (member access vs decimal point)
            if (char === '.') {
                // If current is a number and next is a digit, it's a decimal
                if (/\d/.test(current) && i + 1 < code.length && /\d/.test(code[i + 1])) {
                    current += char;
                    continue;
                }
                // Otherwise it's member access
                if (current) {
                    tokens.push(current);
                    current = '';
                }
                tokens.push(char);
                continue;
            }
            if (/[-+*/%=<>!&|]/.test(char)) {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
                // Handle multi-character operators
                let operator = char;
                if (i + 1 < code.length) {
                    const next = code[i + 1];
                    if ((char === '=' && next === '=') ||
                        (char === '!' && next === '=') ||
                        (char === '<' && next === '=') ||
                        (char === '>' && next === '=') ||
                        (char === '&' && next === '&') ||
                        (char === '|' && next === '|') ||
                        (char === '+' && next === '+') ||
                        (char === '-' && next === '-')) {
                        operator += next;
                        i++;
                    }
                }
                tokens.push(operator);
                continue;
            }
            current += char;
        }
        if (current) {
            tokens.push(current);
        }
        return tokens.filter(token => token.trim().length > 0);
    }
    parseStatement() {
        if (this.isAtEnd())
            return null;
        const token = this.peek();
        // Control flow statements
        if (token === 'if') {
            return this.parseIfStatement();
        }
        if (token === 'for') {
            return this.parseForStatement();
        }
        if (token === 'while') {
            return this.parseWhileStatement();
        }
        if (token === 'do') {
            return this.parseDoWhileStatement();
        }
        if (token === 'switch') {
            return this.parseSwitchStatement();
        }
        if (token === 'break') {
            return this.parseBreakStatement();
        }
        if (token === 'continue') {
            return this.parseContinueStatement();
        }
        if (token === '{') {
            return this.parseBlockStatement();
        }
        // Variable declaration
        if (this.isType(token) || token === 'final' || token === 'static') {
            return this.parseVariableDeclaration();
        }
        // Method call or assignment
        if (this.isIdentifier(token)) {
            return this.parseExpressionStatement();
        }
        // Skip unknown tokens
        this.advance();
        return null;
    }
    parseVariableDeclaration() {
        const position = this.getCurrentPosition();
        const modifiers = [];
        // Handle modifiers
        while (this.match('final', 'static', 'public', 'private', 'protected')) {
            modifiers.push(this.previous());
        }
        const dataType = this.advance();
        const name = this.advance();
        let initializer;
        if (this.match('=')) {
            initializer = this.parseExpression();
        }
        this.consume(';', 'Expected ";" after variable declaration');
        const result = {
            type: 'VariableDeclaration',
            name,
            dataType,
            position,
            value: { modifiers }
        };
        if (initializer) {
            result.initializer = initializer;
        }
        return result;
    }
    parseForVariableDeclaration() {
        const position = this.getCurrentPosition();
        const modifiers = [];
        // Handle modifiers
        while (this.match('final', 'static', 'public', 'private', 'protected')) {
            modifiers.push(this.previous());
        }
        const dataType = this.advance();
        const name = this.advance();
        let initializer;
        if (this.match('=')) {
            initializer = this.parseExpression();
        }
        // Note: Don't consume ';' here - it will be handled by parseForStatement
        const result = {
            type: 'VariableDeclaration',
            name,
            dataType,
            position,
            value: { modifiers }
        };
        if (initializer) {
            result.initializer = initializer;
        }
        return result;
    }
    parseExpressionStatement() {
        const expr = this.parseExpression();
        this.consume(';', 'Expected ";" after expression');
        return expr;
    }
    parseExpression() {
        return this.parseAssignment();
    }
    parseAssignment() {
        const expr = this.parseLogicalOr();
        if (this.match('=')) {
            const right = this.parseAssignment();
            return {
                type: 'Assignment',
                left: expr,
                right,
                position: this.getCurrentPosition()
            };
        }
        return expr;
    }
    parseLogicalOr() {
        let expr = this.parseLogicalAnd();
        while (this.match('||')) {
            const operator = this.previous();
            const right = this.parseLogicalAnd();
            expr = {
                type: 'BinaryExpression',
                left: expr,
                operator,
                right,
                position: this.getCurrentPosition()
            };
        }
        return expr;
    }
    parseLogicalAnd() {
        let expr = this.parseEquality();
        while (this.match('&&')) {
            const operator = this.previous();
            const right = this.parseEquality();
            expr = {
                type: 'BinaryExpression',
                left: expr,
                operator,
                right,
                position: this.getCurrentPosition()
            };
        }
        return expr;
    }
    parseEquality() {
        let expr = this.parseComparison();
        while (this.match('==', '!=')) {
            const operator = this.previous();
            const right = this.parseComparison();
            expr = {
                type: 'BinaryExpression',
                left: expr,
                operator,
                right,
                position: this.getCurrentPosition()
            };
        }
        return expr;
    }
    parseComparison() {
        let expr = this.parseTerm();
        while (this.match('>', '>=', '<', '<=')) {
            const operator = this.previous();
            const right = this.parseTerm();
            expr = {
                type: 'BinaryExpression',
                left: expr,
                operator,
                right,
                position: this.getCurrentPosition()
            };
        }
        return expr;
    }
    parseTerm() {
        let expr = this.parseFactor();
        while (this.match('+', '-', '&')) {
            const operator = this.previous();
            const right = this.parseFactor();
            expr = {
                type: 'BinaryExpression',
                left: expr,
                operator,
                right,
                position: this.getCurrentPosition()
            };
        }
        return expr;
    }
    parseFactor() {
        let expr = this.parseUnary();
        while (this.match('*', '/', '%')) {
            const operator = this.previous();
            const right = this.parseUnary();
            expr = {
                type: 'BinaryExpression',
                left: expr,
                operator,
                right,
                position: this.getCurrentPosition()
            };
        }
        return expr;
    }
    parseUnary() {
        if (this.match('!', '-', '+')) {
            const operator = this.previous();
            const expr = this.parseUnary();
            return {
                type: 'UnaryExpression',
                operator,
                expression: expr,
                position: this.getCurrentPosition()
            };
        }
        return this.parseCall();
    }
    parseCall() {
        let expr = this.parsePrimary();
        while (true) {
            if (this.match('(')) {
                expr = this.finishCall(expr);
            }
            else if (this.match('.')) {
                const name = this.consume('IDENTIFIER', 'Expected property name after "."');
                expr = {
                    type: 'MemberExpression',
                    object: expr,
                    property: { type: 'Identifier', name },
                    position: this.getCurrentPosition()
                };
            }
            else if (this.match('++', '--')) {
                const operator = this.previous();
                expr = {
                    type: 'UpdateExpression',
                    operator,
                    argument: expr,
                    prefix: false,
                    position: this.getCurrentPosition()
                };
            }
            else {
                break;
            }
        }
        return expr;
    }
    finishCall(callee) {
        const args = [];
        if (!this.check(')')) {
            do {
                args.push(this.parseExpression());
            } while (this.match(','));
        }
        this.consume(')', 'Expected ")" after arguments');
        // Handle method calls
        let name = '';
        if (callee.type === 'MemberExpression') {
            name = this.getMemberExpressionName(callee);
        }
        else if (callee.type === 'Identifier') {
            name = callee.name || '';
        }
        return {
            type: 'MethodCall',
            name,
            children: args,
            position: this.getCurrentPosition()
        };
    }
    getMemberExpressionName(expr) {
        // Simplified member expression name extraction
        if (expr.type === 'MemberExpression') {
            const objectName = expr.object?.name || this.getMemberExpressionName(expr.object);
            const propertyName = expr.property?.name || '';
            return `${objectName}.${propertyName}`;
        }
        return expr.name || '';
    }
    parsePrimary() {
        if (this.match('true')) {
            return {
                type: 'Literal',
                value: true,
                position: this.getCurrentPosition()
            };
        }
        if (this.match('false')) {
            return {
                type: 'Literal',
                value: false,
                position: this.getCurrentPosition()
            };
        }
        if (this.isNumber(this.peek())) {
            const value = this.advance();
            return {
                type: 'Literal',
                value: this.parseNumber(value),
                position: this.getCurrentPosition()
            };
        }
        if (this.isString(this.peek())) {
            const value = this.advance();
            return {
                type: 'Literal',
                value: value.slice(1, -1), // Remove quotes
                position: this.getCurrentPosition()
            };
        }
        if (this.isIdentifier(this.peek())) {
            const name = this.advance();
            return {
                type: 'Identifier',
                name,
                position: this.getCurrentPosition()
            };
        }
        if (this.match('(')) {
            const expr = this.parseExpression();
            this.consume(')', 'Expected ")" after expression');
            return expr;
        }
        throw new Error(`Unexpected token: ${this.peek()}`);
    }
    parseNumber(value) {
        if (value.includes('.')) {
            return parseFloat(value);
        }
        return parseInt(value, 10);
    }
    // Helper methods
    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.peek() === type;
    }
    advance() {
        if (!this.isAtEnd()) {
            this.current++;
            this.column++;
        }
        return this.previous();
    }
    isAtEnd() {
        return this.current >= this.tokens.length;
    }
    peek() {
        return this.tokens[this.current] || '';
    }
    previous() {
        return this.tokens[this.current - 1] || '';
    }
    consume(type, message) {
        if (this.check(type))
            return this.advance();
        if (type === 'IDENTIFIER' && this.isIdentifier(this.peek())) {
            return this.advance();
        }
        throw new Error(`${message}. Got: ${this.peek()}`);
    }
    isType(token) {
        return ['int', 'double', 'float', 'boolean', 'String', 'char', 'long', 'short', 'byte'].includes(token);
    }
    isIdentifier(token) {
        return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(token);
    }
    isNumber(token) {
        return /^\d+(\.\d+)?$/.test(token);
    }
    isString(token) {
        return (token.startsWith('"') && token.endsWith('"')) ||
            (token.startsWith("'") && token.endsWith("'"));
    }
    getCurrentPosition() {
        return {
            line: this.line,
            column: this.column,
            offset: this.current
        };
    }
    parseIfStatement() {
        const position = this.getCurrentPosition();
        this.consume('if', 'Expected "if"');
        this.consume('(', 'Expected "(" after "if"');
        const condition = this.parseExpression();
        this.consume(')', 'Expected ")" after if condition');
        const thenBranch = this.parseStatement();
        let elseBranch;
        if (this.match('else')) {
            elseBranch = this.parseStatement();
        }
        return {
            type: 'IfStatement',
            condition,
            thenBranch,
            elseBranch,
            position
        };
    }
    parseForStatement() {
        const position = this.getCurrentPosition();
        this.consume('for', 'Expected "for"');
        this.consume('(', 'Expected "(" after "for"');
        // Check for enhanced for loop (for-each)
        let isEnhancedFor = false;
        // Look ahead to see if this is an enhanced for loop
        let lookahead = 0;
        while (this.current + lookahead < this.tokens.length && this.tokens[this.current + lookahead] !== ')') {
            if (this.tokens[this.current + lookahead] === ':') {
                isEnhancedFor = true;
                break;
            }
            lookahead++;
        }
        if (isEnhancedFor) {
            // Enhanced for loop: for (Type var : iterable)
            const elementType = this.advance();
            const elementName = this.advance();
            this.consume(':', 'Expected ":" in enhanced for loop');
            const iterable = this.parseExpression();
            this.consume(')', 'Expected ")" after for clause');
            const body = this.parseStatement();
            return {
                type: 'EnhancedForStatement',
                elementType,
                elementName,
                iterable,
                body,
                position
            };
        }
        else {
            // Traditional for loop: for (init; condition; update)
            let init = null;
            if (!this.check(';')) {
                if (this.isType(this.peek())) {
                    init = this.parseForVariableDeclaration();
                }
                else {
                    init = this.parseExpression();
                }
                this.consume(';', 'Expected ";" after for loop initializer');
            }
            else {
                this.advance(); // consume ';'
            }
            let condition = null;
            if (!this.check(';')) {
                condition = this.parseExpression();
            }
            this.consume(';', 'Expected ";" after for loop condition');
            let update = null;
            if (!this.check(')')) {
                update = this.parseExpression();
            }
            this.consume(')', 'Expected ")" after for clause');
            const body = this.parseStatement();
            return {
                type: 'ForStatement',
                init,
                condition,
                update,
                body,
                position
            };
        }
    }
    parseWhileStatement() {
        const position = this.getCurrentPosition();
        this.consume('while', 'Expected "while"');
        this.consume('(', 'Expected "(" after "while"');
        const condition = this.parseExpression();
        this.consume(')', 'Expected ")" after while condition');
        const body = this.parseStatement();
        return {
            type: 'WhileStatement',
            condition,
            body,
            position
        };
    }
    parseDoWhileStatement() {
        const position = this.getCurrentPosition();
        this.consume('do', 'Expected "do"');
        const body = this.parseStatement();
        this.consume('while', 'Expected "while" after do body');
        this.consume('(', 'Expected "(" after "while"');
        const condition = this.parseExpression();
        this.consume(')', 'Expected ")" after while condition');
        this.consume(';', 'Expected ";" after do-while statement');
        return {
            type: 'DoWhileStatement',
            body,
            condition,
            position
        };
    }
    parseSwitchStatement() {
        const position = this.getCurrentPosition();
        this.consume('switch', 'Expected "switch"');
        this.consume('(', 'Expected "(" after "switch"');
        const discriminant = this.parseExpression();
        this.consume(')', 'Expected ")" after switch expression');
        this.consume('{', 'Expected "{" before switch body');
        const cases = [];
        let defaultCase;
        while (!this.check('}') && !this.isAtEnd()) {
            if (this.match('case')) {
                const caseValue = this.parseExpression();
                this.consume(':', 'Expected ";" after case value');
                const statements = [];
                while (!this.check('case') && !this.check('default') && !this.check('}') && !this.isAtEnd()) {
                    const stmt = this.parseStatement();
                    if (stmt)
                        statements.push(stmt);
                }
                cases.push({
                    type: 'SwitchCase',
                    test: caseValue,
                    consequent: statements,
                    position: this.getCurrentPosition()
                });
            }
            else if (this.match('default')) {
                this.consume(':', 'Expected ":" after "default"');
                const statements = [];
                while (!this.check('case') && !this.check('default') && !this.check('}') && !this.isAtEnd()) {
                    const stmt = this.parseStatement();
                    if (stmt)
                        statements.push(stmt);
                }
                defaultCase = {
                    type: 'SwitchCase',
                    test: null,
                    consequent: statements,
                    position: this.getCurrentPosition()
                };
            }
            else {
                this.advance();
            }
        }
        this.consume('}', 'Expected "}" after switch body');
        return {
            type: 'SwitchStatement',
            discriminant,
            cases,
            defaultCase,
            position
        };
    }
    parseBreakStatement() {
        const position = this.getCurrentPosition();
        this.consume('break', 'Expected "break"');
        this.consume(';', 'Expected ";" after "break"');
        return {
            type: 'BreakStatement',
            position
        };
    }
    parseContinueStatement() {
        const position = this.getCurrentPosition();
        this.consume('continue', 'Expected "continue"');
        this.consume(';', 'Expected ";" after "continue"');
        return {
            type: 'ContinueStatement',
            position
        };
    }
    parseBlockStatement() {
        const position = this.getCurrentPosition();
        this.consume('{', 'Expected "{"');
        const statements = [];
        while (!this.check('}') && !this.isAtEnd()) {
            const stmt = this.parseStatement();
            if (stmt)
                statements.push(stmt);
        }
        this.consume('}', 'Expected "}"');
        return {
            type: 'BlockStatement',
            body: statements,
            position
        };
    }
}
//# sourceMappingURL=JavaParser.js.map