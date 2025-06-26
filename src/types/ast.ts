export interface ASTNode {
    type: string;
    [key: string]: any;
}

export interface ConversionContext {
    indentLevel: number;
    integerDivision?: boolean;
    [key: string]: any;
}