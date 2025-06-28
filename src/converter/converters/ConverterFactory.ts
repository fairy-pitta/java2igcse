import { IConverter } from './IConverter';
import { VariableDeclarationConverter } from './VariableDeclarationConverter';
import { AssignmentConverter } from './AssignmentConverter';
import { LiteralConverter } from './LiteralConverter';
import { IdentifierConverter } from './IdentifierConverter';
import { BinaryExpressionConverter } from './BinaryExpressionConverter';
import { UnaryExpressionConverter } from './UnaryExpressionConverter';
import { ExpressionStatementConverter } from './ExpressionStatementConverter';
import { MethodCallConverter } from './MethodCallConverter';
import { ProgramConverter } from './ProgramConverter';
import { BlockStatementConverter } from './BlockStatementConverter';
import { IfStatementConverter } from './IfStatementConverter';
import { ForStatementConverter } from './ForStatementConverter';
import { WhileStatementConverter } from './WhileStatementConverter';
import { MethodDeclarationConverter } from './MethodDeclarationConverter';
import { ClassDeclarationConverter } from './ClassDeclarationConverter';
import { ReturnStatementConverter } from './ReturnStatementConverter';
import { UpdateExpressionConverter } from './UpdateExpressionConverter';
import { BreakStatementConverter } from './BreakStatementConverter';
import { ContinueStatementConverter } from './ContinueStatementConverter';
import { DoWhileStatementConverter } from './DoWhileStatementConverter';
import { SwitchStatementConverter } from './SwitchStatementConverter';

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