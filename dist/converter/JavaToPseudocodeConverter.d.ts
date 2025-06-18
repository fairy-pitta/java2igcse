import { ConverterConfig } from '../types/ast';
export interface ConversionHint {
    integerDivision?: boolean;
}
export declare class JavaToPseudocodeConverter {
    private parser;
    private formatter;
    private config;
    constructor(config?: Partial<ConverterConfig>);
    convert(javaCode: string): string;
    convertWithHint(javaCode: string, hint: ConversionHint): string;
    private createContext;
    private convertNode;
    private convertVariableDeclaration;
    private convertAssignment;
    private convertBinaryExpression;
    private convertUnaryExpression;
    private convertMethodCall;
    private convertLiteral;
    private convertIdentifier;
    private convertBlock;
    private mapJavaTypeToIGCSE;
    private mapOperator;
    private mapUnaryOperator;
    private isStringConcatenation;
    private convertIfStatement;
    private convertForStatement;
    private convertEnhancedForStatement;
    private convertWhileStatement;
    private convertDoWhileStatement;
    private convertSwitchStatement;
    private convertBreakStatement;
    private convertContinueStatement;
    private negateCondition;
    private convertUpdateExpression;
}
//# sourceMappingURL=JavaToPseudocodeConverter.d.ts.map