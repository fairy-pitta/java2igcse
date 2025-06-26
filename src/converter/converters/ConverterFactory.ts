import { IConverter } from './IConverter.js';
import { VariableDeclarationConverter } from './VariableDeclarationConverter.js';
import { AssignmentConverter } from './AssignmentConverter.js';
import { LiteralConverter } from './LiteralConverter.js';
import { IdentifierConverter } from './IdentifierConverter.js';
import { BinaryExpressionConverter } from './BinaryExpressionConverter.js';
import { UnaryExpressionConverter } from './UnaryExpressionConverter.js';
import { ExpressionStatementConverter } from './ExpressionStatementConverter.js';
import { MethodCallConverter } from './MethodCallConverter.js';
import { ProgramConverter } from './ProgramConverter.js';
import { BlockStatementConverter } from './BlockStatementConverter.js';
import { IfStatementConverter } from './IfStatementConverter.js';
import { ForStatementConverter } from './ForStatementConverter.js';
import { WhileStatementConverter } from './WhileStatementConverter.js';
import { MethodDeclarationConverter } from './MethodDeclarationConverter.js';
import { ClassDeclarationConverter } from './ClassDeclarationConverter.js';
import { ReturnStatementConverter } from './ReturnStatementConverter.js';
import { UpdateExpressionConverter } from './UpdateExpressionConverter.js';
import { BreakStatementConverter } from './BreakStatementConverter.js';
import { ContinueStatementConverter } from './ContinueStatementConverter.js';
import { DoWhileStatementConverter } from './DoWhileStatementConverter.js';
import { SwitchStatementConverter } from './SwitchStatementConverter.js';

export class ConverterFactory {
    static getConverter(type: string): IConverter | undefined {
        switch (type) {
            case 'LocalVariableDeclaration':
            case 'FieldDeclaration':
                return new VariableDeclarationConverter();
            case 'Assignment':
                return new AssignmentConverter();
            case 'Literal':
                return new LiteralConverter();
            case 'Identifier':
                return new IdentifierConverter();
            case 'BinaryExpression':
                return new BinaryExpressionConverter();
            case 'UnaryExpression':
                return new UnaryExpressionConverter();
            case 'ExpressionStatement':
                return new ExpressionStatementConverter();
            case 'MethodInvocation':
                return new MethodCallConverter();
            case 'CompilationUnit':
                return new ProgramConverter();
            case 'BlockStatement':
                return new BlockStatementConverter();
            case 'IfStatement':
                return new IfStatementConverter();
            case 'ForStatement':
                return new ForStatementConverter();
            case 'WhileStatement':
                return new WhileStatementConverter();
            case 'MethodDeclaration':
                return new MethodDeclarationConverter();
            case 'ClassDeclaration':
                return new ClassDeclarationConverter();
            case 'ReturnStatement':
                return new ReturnStatementConverter();
            case 'UpdateExpression':
                return new UpdateExpressionConverter();
            case 'BreakStatement':
                return new BreakStatementConverter();
            case 'ContinueStatement':
                return new ContinueStatementConverter();
            case 'DoWhileStatement':
                return new DoWhileStatementConverter();
            case 'SwitchStatement':
                return new SwitchStatementConverter();
            default:
                console.warn(`No converter for type: ${type}`);
                return undefined;
        }
    }
}