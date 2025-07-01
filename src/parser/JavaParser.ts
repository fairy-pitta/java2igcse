import { parse } from 'java-parser';

export interface ParseResult {
    cst: any;
    errors: ParseError[];
    warnings: ParseWarning[];
}

export interface ParseError {
    message: string;
    line: number;
    column: number;
    nodeType?: string;
}

export interface ParseWarning {
    message: string;
    line: number;
    column: number;
    nodeType?: string;
}

export interface ParserOptions {
    strictMode?: boolean;
    maxDepth?: number;
    ignoreComments?: boolean;
}

export interface ParserContext {
    currentScope: string;
    variables: Map<string, string>;
    functions: Map<string, string>;
    depth: number;
}

export class JavaParser {
    private options: ParserOptions;
    private context: ParserContext;
    private errors: ParseError[];
    private warnings: ParseWarning[];

    constructor(options: ParserOptions = {}) {
        this.options = {
            strictMode: true,
            maxDepth: 10,
            ignoreComments: false,
            ...options
        };

        this.context = {
            currentScope: 'global',
            variables: new Map(),
            functions: new Map(),
            depth: 0
        };

        this.errors = [];
        this.warnings = [];
    }

    parse(code: string): ParseResult {
        try {
            const cst = parse(code);
            return {
                cst,
                errors: this.errors,
                warnings: this.warnings
            };
        } catch (error) {
            this.errors.push({
                message: error.message,
                line: error.location?.start.line || 0,
                column: error.location?.start.column || 0
            });
            return {
                cst: null,
                errors: this.errors,
                warnings: this.warnings
            };
        }
    }

    getNodeName(node: any): string {
        if (!node) return '';
        if (typeof node === 'string') return node;
        if (node.name) return node.name;
        // CSTノードの場合、nodeTypeプロパティにノード名が格納されている
        return node.nodeType || '';
    }

    getNodeChildren(node: any): any {
        if (!node) return {};
        if (Array.isArray(node)) return node;
        if (typeof node === 'string') return {};
        return node.children || {};
    }
    }

    isLoop(node: any): boolean {
        const name = this.getNodeName(node);
        return ['whileStatement', 'doStatement', 'forStatement'].includes(name);
    }

    isConditional(node: any): boolean {
        const name = this.getNodeName(node);
        return ['ifStatement', 'switchStatement'].includes(name);
    }

    isMethodCall(node: any): boolean {
        return this.getNodeName(node) === 'methodInvocation';
    }

    isOperator(node: any): boolean {
        return this.getNodeName(node) === 'infixExpression';
    }

    convertOperator(operator: string): string {
        const operatorMap: { [key: string]: string } = {
            '===': '=',
            '==': '=',
            '!==': '≠',
            '!=': '≠',
            '>=': '≥',
            '<=': '≤',
            '&&': 'AND',
            '||': 'OR',
            '++': '+ 1',
            '--': '- 1',
            '+=': '←',
            '-=': '←',
            '*=': '←',
            '/=': '←',
            '=': '←'
        };
        return operatorMap[operator] || operator;
    }

    isSwitchCase(node: any): boolean {
        return this.getNodeName(node) === 'switchBlockStatementGroup';
    }

    isBreakStatement(node: any): boolean {
        return this.getNodeName(node) === 'breakStatement';
    }

    isIdentifier(node: any): boolean {
        return this.getNodeName(node) === 'Identifier';
    }

    private addError(error: ParseError) {
        this.errors.push(error);
    }

    private addWarning(warning: ParseWarning) {
        this.warnings.push(warning);
    }

    private validateDepth() {
        if (this.context.depth >= this.options.maxDepth!) {
            this.addError({
                message: `Maximum nesting depth of ${this.options.maxDepth} exceeded`,
                line: 0,
                column: 0
            });
            return false;
        }
        return true;
    }
}