import { JavaParser, ParseResult } from '../parser/JavaParser';
import { PseudocodeFormatter } from '../formatter/PseudocodeFormatter';

export interface ConversionResult {
    code: string;
    errors: ConversionError[];
    warnings: ConversionWarning[];
    statistics: ConversionStatistics;
}

export interface ConversionError {
    message: string;
    line: number;
    column: number;
    nodeType?: string;
    sourceCode?: string;
}

export interface ConversionWarning {
    message: string;
    line: number;
    column: number;
    nodeType?: string;
    sourceCode?: string;
}

export interface ConversionStatistics {
    totalLines: number;
    convertedNodes: number;
    errorCount: number;
    warningCount: number;
    conversionTime: number;
}

export interface ConverterOptions {
    strictMode?: boolean;
    maxDepth?: number;
    ignoreComments?: boolean;
    preserveComments?: boolean;
}

export class JavaToPseudocodeConverter {
    private parser: JavaParser;
    private formatter: PseudocodeFormatter;
    private options: ConverterOptions;
    private errors: ConversionError[];
    private warnings: ConversionWarning[];
    private statistics: ConversionStatistics;

    constructor(options: ConverterOptions = {}) {
        this.options = {
            strictMode: true,
            maxDepth: 10,
            ignoreComments: false,
            preserveComments: true,
            ...options
        };

        this.parser = new JavaParser({
            strictMode: this.options.strictMode,
            maxDepth: this.options.maxDepth,
            ignoreComments: this.options.ignoreComments
        });
        this.formatter = new PseudocodeFormatter();

        this.errors = [];
        this.warnings = [];
        this.statistics = {
            totalLines: 0,
            convertedNodes: 0,
            errorCount: 0,
            warningCount: 0,
            conversionTime: 0
        };
    }

    convert(javaCode: string): ConversionResult {
        const startTime = Date.now();
        this.resetStatistics();

        try {
            const parseResult = this.parser.parse(javaCode);
            this.handleParseResult(parseResult);

            if (this.errors.length > 0) {
                return this.createErrorResult();
            }

            const pseudocode = this.convertNode(parseResult.cst);
            const formattedCode = this.formatter.format(pseudocode);

            this.statistics.conversionTime = Date.now() - startTime;
            return this.createSuccessResult(formattedCode);
        } catch (error) {
            this.handleError(error);
            return this.createErrorResult();
        }
    }

    private convertNode(node: any): string {
        if (!node) return '';

        try {
            this.statistics.convertedNodes++;

            // 文字列の場合は直接返す
            if (typeof node === 'string') return node;
            // 配列の場合は各要素を変換して結合
            if (Array.isArray(node)) {
                return node.map(item => this.convertNode(item)).filter(Boolean).join('\n');
            }

            const nodeName = this.parser.getNodeName(node);

            switch (nodeName) {
                case 'ordinaryCompilationUnit':
                    return this.convertCompilationUnit(node);
                case 'classDeclaration':
                    return this.convertClassDeclaration(node);
                case 'methodDeclaration':
                    return this.convertMethodDeclaration(node);
                case 'block':
                    return this.convertBlock(node);
                case 'blockStatement':
                    return this.convertNode(node.children);
                case 'statement':
                    return this.convertNode(node.children);
                case 'ifStatement':
                    return this.convertIfStatement(node);
                case 'whileStatement':
                    return this.convertWhileStatement(node);
                case 'doStatement':
                    return this.convertDoWhileStatement(node);
                case 'forStatement':
                    return this.convertForStatement(node);
                case 'switchStatement':
                    return this.convertSwitchStatement(node);
                case 'switchBlockStatementGroup':
                    return this.convertSwitchCase(node);
                case 'methodInvocation':
                    return this.convertMethodInvocation(node);
                case 'infixExpression':
                    return this.convertInfixExpression(node);
                case 'unaryExpression':
                    return this.convertUnaryExpression(node);
                case 'postfixExpression':
                    return this.convertPostfixExpression(node);
                case 'variableDeclarationStatement':
                    return this.convertVariableDeclaration(node);
                case 'literal':
                    return this.convertLiteral(node);
                case 'Identifier':
                    return node.image || '';
            }

            // 子ノードがある場合は再帰的に処理
            if (node.children) {
                const children = this.parser.getNodeChildren(node);
                const result = Object.values(children)
                    .flat()
                    .map(child => this.convertNode(child))
                    .filter(Boolean)
                    .join('\n');
                return result;
            }

            this.addWarning({
                message: `Unsupported node type: ${nodeName}`,
                line: node.location?.startLine || 0,
                column: node.location?.startColumn || 0,
                nodeType: nodeName
            });
            return '';
        } catch (error) {
            this.handleError(error, node);
            return '';
        }
    }

    private convertCompilationUnit(node: any): string {
        const children = this.parser.getNodeChildren(node);
        return children.typeDeclaration?.map((type: any) => this.convertNode(type)).join('\n') || '';
    }

    private convertClassDeclaration(node: any): string {
        const children = this.parser.getNodeChildren(node);
        return children.classBody?.[0].children.classBodyDeclaration?.map((decl: any) => this.convertNode(decl)).join('\n') || '';
    }

    private convertMethodDeclaration(node: any): string {
        const children = this.parser.getNodeChildren(node);
        return this.convertNode(children.methodBody?.[0]);
    }

    private convertBlock(node: any): string {
        const children = this.parser.getNodeChildren(node);
        if (!children.blockStatements) return '';
        return children.blockStatements
            .map((stmt: any) => this.convertNode(stmt))
            .filter(Boolean)
            .join('\n');
    }

    private convertIfStatement(node: any): string {
        const children = this.parser.getNodeChildren(node);
        const condition = this.convertNode(children.parExpression?.[0]);
        const thenBranch = this.convertNode(children.statement?.[0]);
        const elseBranch = children.Else ? this.convertNode(children.statement?.[1]) : '';

        let result = `IF ${condition} THEN\n${thenBranch}`;
        if (elseBranch) {
            result += `\nELSE\n${elseBranch}`;
        }
        return result + '\nENDIF';
    }
    }

    private convertWhileStatement(node: any): string {
        const children = this.parser.getNodeChildren(node);
        const condition = this.convertNode(children.parExpression?.[0]);
        const body = this.convertNode(children.statement?.[0]);
        return `WHILE ${condition} DO\n${body}\nENDWHILE`;
    }

    private convertDoWhileStatement(node: any): string {
        const children = this.parser.getNodeChildren(node);
        const body = this.convertNode(children.statement?.[0]);
        const condition = this.convertNode(children.parExpression?.[0]);
        const negatedCondition = this.negateCondition(condition);
        return `REPEAT\n${body}\nUNTIL ${negatedCondition}`;
    }

    private negateCondition(condition: string): string {
        const operatorMap: { [key: string]: string } = {
            '<': '>=',
            '>': '<=',
            '<=': '>',
            '>=': '<',
            '=': '≠',
            '≠': '='
        };

        for (const [op, negatedOp] of Object.entries(operatorMap)) {
            if (condition.includes(` ${op} `)) {
                return condition.replace(` ${op} `, ` ${negatedOp} `);
            }
        }

        return condition;
    }

    private convertForStatement(node: any): string {
        const children = this.parser.getNodeChildren(node);
        const forControl = children.forControl?.[0];
        if (!forControl) return '';

        const forControlChildren = this.parser.getNodeChildren(forControl);
        const init = forControlChildren.forInit?.[0];
        if (!init) return '';

        const initChildren = this.parser.getNodeChildren(init);
        const varDecl = initChildren.localVariableDeclaration?.[0];
        if (!varDecl) return '';

        const varDeclChildren = this.parser.getNodeChildren(varDecl);
        const varName = varDeclChildren.variableDeclaratorId?.[0].children.Identifier?.[0].image;
        const startValue = this.convertNode(varDeclChildren.variableInitializer?.[0]);

        const condition = forControlChildren.expression?.[0];
        if (!condition) return '';

        const endValue = parseInt(this.convertNode(condition)) - 1;
        const body = this.convertNode(children.statement?.[0]);

        return `FOR ${varName} ← ${startValue} TO ${endValue}\n${body}\nNEXT ${varName}`;
    }

    private convertSwitchStatement(node: any): string {
        const children = this.parser.getNodeChildren(node);
        const expression = this.convertNode(children.parExpression?.[0]);
        const switchBlock = children.switchBlock?.[0];
        if (!switchBlock) return '';

        const switchBlockChildren = this.parser.getNodeChildren(switchBlock);
        const cases = switchBlockChildren.switchBlockStatementGroup
            ?.map((stmt: any) => this.convertNode(stmt))
            .filter(Boolean)
            .join('\n');
        return `CASE OF ${expression}\n${cases}\nENDCASE`;
    }

    private convertSwitchCase(node: any): string {
        const children = this.parser.getNodeChildren(node);
        const label = children.switchLabel?.[0];
        if (!label) return '';

        const labelChildren = this.parser.getNodeChildren(label);
        const expression = labelChildren.constantExpression
            ? this.convertNode(labelChildren.constantExpression[0])
            : 'OTHERWISE';

        const statements = children.blockStatements
            ?.filter((stmt: any) => !this.parser.getNodeChildren(stmt).breakStatement)
            .map((stmt: any) => this.convertNode(stmt))
            .filter(Boolean)
            .join('\n');
        return `   ${expression}: ${statements}`;
    }
    }
    }

    private convertMethodInvocation(node: any): string {
        const children = this.parser.getNodeChildren(node);
        const methodName = children.methodName?.[0].children.Identifier?.[0].image;
        if (methodName === 'println') {
            const primary = children.primary?.[0];
            if (!primary) return '';

            const primaryChildren = this.parser.getNodeChildren(primary);
            if (primaryChildren.expression?.[0].children.primary?.[0].children.Identifier?.[0].image === 'System' &&
                primaryChildren.Identifier?.[0].image === 'out') {
                const args = children.argumentList?.[0].children.expression?.map((arg: any) => {
                    const argChildren = this.parser.getNodeChildren(arg);
                    if (argChildren.infixExpression?.[0]?.children.operator?.[0].image === '+') {
                        return this.flattenInfixExpression(argChildren.infixExpression[0]);
                    }
                    return this.convertNode(arg);
                }).flat().filter(Boolean) || [];
                return `OUTPUT ${args.join(', ')}`;
            }
        }
        return '';
    }

    private flattenInfixExpression(node: any): string[] {
        if (node.children.operator?.[0].image === '+') {
            const left = node.children.expression?.[0].children.infixExpression?.[0]?.children.operator?.[0].image === '+'
                ? this.flattenInfixExpression(node.children.expression[0].children.infixExpression[0])
                : [this.convertNode(node.children.expression[0])];
            const right = node.children.expression?.[1].children.infixExpression?.[0]?.children.operator?.[0].image === '+'
                ? this.flattenInfixExpression(node.children.expression[1].children.infixExpression[0])
                : [this.convertNode(node.children.expression[1])];
            return [...left, ...right];
        }
        return [this.convertInfixExpression(node)];
    }

    private convertInfixExpression(node: any): string {
        const children = this.parser.getNodeChildren(node);
        const operator = children.operator?.[0].image;
        if (operator === '+') {
            const parts = this.flattenInfixExpression(node);
            return parts.join(', ');
        }
        const left = this.convertNode(children.expression?.[0]);
        const right = this.convertNode(children.expression?.[1]);
        const convertedOperator = this.parser.convertOperator(operator);
        return `${left} ${convertedOperator} ${right}`;
    }

    private convertUnaryExpression(node: any): string {
        const children = this.parser.getNodeChildren(node);
        const operand = this.convertNode(children.expression?.[0]);
        const operator = children.unaryOperator?.[0].image;
        return operator === '!' ? `NOT ${operand}` : `${operator}${operand}`;
    }

    private convertPostfixExpression(node: any): string {
        const children = this.parser.getNodeChildren(node);
        const operand = this.convertNode(children.expression?.[0]);
        const operator = children.postfixOperator?.[0].image;
        return `${operand} ${operator === '++' ? '+ 1' : '- 1'}`;
    }

    private convertVariableDeclaration(node: any): string {
        const children = this.parser.getNodeChildren(node);
        const localVarDecl = children.localVariableDeclaration?.[0];
        if (!localVarDecl) return '';

        const localVarDeclChildren = this.parser.getNodeChildren(localVarDecl);
        const declarations = localVarDeclChildren.variableDeclarators?.[0].children.variableDeclarator
            ?.map((variable: any) => {
                const varChildren = this.parser.getNodeChildren(variable);
                const name = varChildren.variableDeclaratorId?.[0].children.Identifier?.[0].image;
                const initializer = varChildren.variableInitializer?.[0] ? this.convertNode(varChildren.variableInitializer[0]) : '';
                return initializer ? `${name} ← ${initializer}` : '';
            })
            .filter(Boolean)
            .join('\n');
        return declarations || '';
    }

    private convertLiteral(node: any): string {
        const children = this.parser.getNodeChildren(node);
        const value = children.StringLiteral?.[0]?.image || children.IntegerLiteral?.[0]?.image || children.BooleanLiteral?.[0]?.image;
        if (typeof value === 'string') {
            return value.startsWith('"') ? value : `"${value}"`;
        }
        return String(value);
    }

    private handleParseResult(result: ParseResult) {
        result.errors.forEach(error => {
            this.errors.push({
                ...error,
                sourceCode: error.nodeType
            });
        });

        result.warnings.forEach(warning => {
            this.warnings.push({
                ...warning,
                sourceCode: warning.nodeType
            });
        });

        this.statistics.errorCount = this.errors.length;
        this.statistics.warningCount = this.warnings.length;
    }

    private handleError(error: any, node?: any) {
        const conversionError: ConversionError = {
            message: error.message || 'Unknown error occurred during conversion',
            line: node?.loc?.start.line || error.line || 0,
            column: node?.loc?.start.column || error.column || 0,
            nodeType: node ? this.parser.getNodeType(node) : undefined,
            sourceCode: node ? JSON.stringify(node) : undefined
        };

        this.errors.push(conversionError);
        this.statistics.errorCount++;
    }

    private addWarning(warning: ConversionWarning) {
        this.warnings.push(warning);
        this.statistics.warningCount++;
    }

    private resetStatistics() {
        this.statistics = {
            totalLines: 0,
            convertedNodes: 0,
            errorCount: 0,
            warningCount: 0,
            conversionTime: 0
        };
        this.errors = [];
        this.warnings = [];
    }

    private createSuccessResult(code: string): ConversionResult {
        return {
            code,
            errors: this.errors,
            warnings: this.warnings,
            statistics: this.statistics
        };
    }

    private createErrorResult(): ConversionResult {
        return {
            code: '',
            errors: this.errors,
            warnings: this.warnings,
            statistics: this.statistics
        };
    }
}