export class PseudocodeFormatter {
    indentLevel = 0;
    indentSize;
    constructor(config) {
        this.indentSize = config?.indentSize || 2;
    }
    format(pseudocode) {
        console.log('Formatting lines:', pseudocode);
        return pseudocode
            .map(line => this.formatLine(line))
            .join('\n')
            .trim();
    }
    formatLine(line) {
        console.log('Formatting line (before):', line);
        const trimmed = line.trim();
        // Handle indentation changes
        if (this.shouldDecreaseIndent(trimmed)) {
            this.indentLevel = Math.max(0, this.indentLevel - 1);
        }
        const formatted = this.getIndent() + trimmed;
        if (this.shouldIncreaseIndent(trimmed)) {
            this.indentLevel++;
        }
        console.log('Formatting line (after):', formatted);
        return formatted;
    }
    shouldIncreaseIndent(line) {
        const keywords = [
            'IF', 'ELSE', 'ELSEIF', 'WHILE', 'FOR', 'REPEAT',
            'PROCEDURE', 'FUNCTION', 'CASE'
        ];
        const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
        return regex.test(line);
    }
    shouldDecreaseIndent(line) {
        const keywords = [
            'ENDIF', 'ELSE', 'ELSEIF', 'ENDWHILE', 'ENDFOR', 'NEXT', 'UNTIL',
            'ENDPROCEDURE', 'ENDFUNCTION', 'ENDCASE'
        ];
        const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
        return regex.test(line);
    }
    getIndent() {
        return ' '.repeat(this.indentLevel * this.indentSize);
    }
    reset() {
        this.indentLevel = 0;
    }
    // Utility methods for specific formatting
    formatVariableDeclaration(name, type, value) {
        if (value !== undefined) {
            return `DECLARE ${name} : ${this.mapJavaTypeToPseudocode(type)} ← ${value}`;
        }
        return `DECLARE ${name} : ${this.mapJavaTypeToPseudocode(type)}`;
    }
    formatAssignment(variable, value) {
        return `${variable} ← ${value}`;
    }
    formatMethodCall(name, args) {
        if (name === 'System.out.println') {
            return `OUTPUT ${args.join(', ')}`;
        }
        if (name === 'System.out.print') {
            return `OUTPUT ${args.join(', ')}`;
        }
        if (name.includes('Scanner') && name.includes('next')) {
            return `INPUT ${args.join(', ')}`;
        }
        return `${name}(${args.join(', ')})`;
    }
    formatBinaryExpression(left, operator, right) {
        const pseudoOperator = this.mapOperatorToPseudocode(operator);
        return `${left} ${pseudoOperator} ${right}`;
    }
    formatUnaryExpression(operator, expression) {
        const pseudoOperator = this.mapOperatorToPseudocode(operator);
        return `${pseudoOperator}${expression}`;
    }
    mapJavaTypeToPseudocode(javaType) {
        const typeMap = {
            'int': 'INTEGER',
            'double': 'REAL',
            'float': 'REAL',
            'boolean': 'BOOLEAN',
            'String': 'STRING',
            'char': 'CHAR',
            'long': 'INTEGER',
            'short': 'INTEGER',
            'byte': 'INTEGER'
        };
        return typeMap[javaType] || javaType.toUpperCase();
    }
    mapOperatorToPseudocode(operator) {
        const operatorMap = {
            '==': '=',
            '!=': '<>',
            '&&': 'AND',
            '||': 'OR',
            '!': 'NOT ',
            '&': '&', // String concatenation
            '+': '+',
            '-': '-',
            '*': '*',
            '/': '/',
            '%': 'MOD',
            '<': '<',
            '>': '>',
            '<=': '<=',
            '>=': '>='
        };
        return operatorMap[operator] || operator;
    }
    formatLiteral(value) {
        if (typeof value === 'string') {
            return `"${value}"`;
        }
        if (typeof value === 'boolean') {
            return value ? 'TRUE' : 'FALSE';
        }
        return String(value);
    }
    formatConstant(name, _type, value) {
        return `CONSTANT ${name} = ${value}`;
    }
}
//# sourceMappingURL=PseudocodeFormatter.js.map