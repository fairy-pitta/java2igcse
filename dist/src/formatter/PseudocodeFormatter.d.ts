import { ConverterConfig } from '../types/ast';
export declare class PseudocodeFormatter {
    private indentLevel;
    private readonly indentSize;
    constructor(config?: ConverterConfig);
    format(pseudocode: string[]): string;
    private formatLine;
    private shouldIncreaseIndent;
    private shouldDecreaseIndent;
    private getIndent;
    reset(): void;
    formatVariableDeclaration(name: string, type: string, value?: string): string;
    formatAssignment(variable: string, value: string): string;
    formatMethodCall(name: string, args: string[]): string;
    formatBinaryExpression(left: string, operator: string, right: string): string;
    formatUnaryExpression(operator: string, expression: string): string;
    private mapJavaTypeToPseudocode;
    private mapOperatorToPseudocode;
    formatLiteral(value: any): string;
    formatConstant(name: string, _type: string, value: string): string;
}
//# sourceMappingURL=PseudocodeFormatter.d.ts.map