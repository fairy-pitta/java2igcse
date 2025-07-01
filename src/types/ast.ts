export type NodeType =
    | 'Program'
    | 'IfStatement'
    | 'WhileStatement'
    | 'DoWhileStatement'
    | 'ForStatement'
    | 'SwitchStatement'
    | 'Block'
    | 'MethodInvocation'
    | 'BinaryExpression'
    | 'Literal'
    | 'Identifier';

export interface BaseNode {
    type: NodeType;
}

export interface Program extends BaseNode {
    type: 'Program';
    body: Statement[];
}

export interface IfStatement extends BaseNode {
    type: 'IfStatement';
    condition: Expression;
    thenBranch: Statement;
    elseBranch?: Statement;
}

export interface WhileStatement extends BaseNode {
    type: 'WhileStatement';
    condition: Expression;
    body: Statement;
}

export interface DoWhileStatement extends BaseNode {
    type: 'DoWhileStatement';
    condition: Expression;
    body: Statement;
}

export interface ForStatement extends BaseNode {
    type: 'ForStatement';
    init?: Expression;
    condition?: Expression;
    update?: Expression;
    body: Statement;
}

export interface SwitchStatement extends BaseNode {
    type: 'SwitchStatement';
    discriminant: Expression;
    cases: SwitchCase[];
}

export interface SwitchCase {
    test: Expression | null; // null for default case
    consequent: Statement[];
}

export interface Block extends BaseNode {
    type: 'Block';
    body: Statement[];
}

export interface MethodInvocation extends BaseNode {
    type: 'MethodInvocation';
    callee: string;
    arguments: Expression[];
}

export interface BinaryExpression extends BaseNode {
    type: 'BinaryExpression';
    operator: string;
    left: Expression;
    right: Expression;
}

export interface Literal extends BaseNode {
    type: 'Literal';
    value: string | number | boolean;
}

export interface Identifier extends BaseNode {
    type: 'Identifier';
    name: string;
}

export type Node = Program | Statement | Expression;
export type Statement = IfStatement | WhileStatement | DoWhileStatement | ForStatement | SwitchStatement | Block | MethodInvocation;
export type Expression = BinaryExpression | Literal | Identifier | MethodInvocation;

export interface ConversionContext {
    indentLevel?: number;
    [key: string]: any;
}