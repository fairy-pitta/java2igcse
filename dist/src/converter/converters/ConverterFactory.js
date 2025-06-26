import { VariableDeclarationConverter } from './VariableDeclarationConverter';
import { IfStatementConverter } from './IfStatementConverter';
import { ForStatementConverter } from './ForStatementConverter';
import { WhileStatementConverter } from './WhileStatementConverter';
import { BlockStatementConverter } from './BlockStatementConverter';
import { ExpressionStatementConverter } from './ExpressionStatementConverter';
import { AssignmentConverter } from './AssignmentConverter';
import { BinaryExpressionConverter } from './BinaryExpressionConverter';
import { UnaryExpressionConverter } from './UnaryExpressionConverter';
import { UpdateExpressionConverter } from './UpdateExpressionConverter';
import { MethodCallConverter } from './MethodCallConverter';
import { LiteralConverter } from './LiteralConverter';
import { IdentifierConverter } from './IdentifierConverter';
import { ProgramConverter } from './ProgramConverter';
import { DoWhileStatementConverter } from './DoWhileStatementConverter';
import { SwitchStatementConverter } from './SwitchStatementConverter';
import { BreakStatementConverter } from './BreakStatementConverter';
import { ContinueStatementConverter } from './ContinueStatementConverter';
import { ReturnStatementConverter } from './ReturnStatementConverter';
import { ClassDeclarationConverter } from './ClassDeclarationConverter';
import { MethodDeclarationConverter } from './MethodDeclarationConverter';
export class ConverterFactory {
    static converters = new Map();
    static getConverter(node) {
        if (this.converters.has(node.type)) {
            return this.converters.get(node.type);
        }
        let converter;
        switch (node.type) {
            case 'Program':
                converter = new ProgramConverter();
                break;
            case 'VariableDeclaration':
                converter = new VariableDeclarationConverter();
                break;
            case 'IfStatement':
                converter = new IfStatementConverter();
                break;
            case 'ForStatement':
                converter = new ForStatementConverter();
                break;
            case 'WhileStatement':
                converter = new WhileStatementConverter();
                break;
            case 'DoWhileStatement':
                converter = new DoWhileStatementConverter();
                break;
            case 'SwitchStatement':
                converter = new SwitchStatementConverter();
                break;
            case 'BreakStatement':
                converter = new BreakStatementConverter();
                break;
            case 'ContinueStatement':
                converter = new ContinueStatementConverter();
                break;
            case 'ReturnStatement':
                converter = new ReturnStatementConverter();
                break;
            case 'ClassDeclaration':
                converter = new ClassDeclarationConverter();
                break;
            case 'MethodDeclaration':
                converter = new MethodDeclarationConverter();
                break;
            case 'BlockStatement':
            case 'Block': // Block is used by RecursionGuard for generic blocks
                converter = new BlockStatementConverter();
                break;
            case 'ExpressionStatement':
                converter = new ExpressionStatementConverter();
                break;
            case 'Assignment':
                converter = new AssignmentConverter();
                break;
            case 'BinaryExpression':
                converter = new BinaryExpressionConverter();
                break;
            case 'UnaryExpression':
                converter = new UnaryExpressionConverter();
                break;
            case 'UpdateExpression':
                converter = new UpdateExpressionConverter();
                break;
            case 'MethodCall':
                converter = new MethodCallConverter();
                break;
            case 'Literal':
                converter = new LiteralConverter();
                break;
            case 'Identifier':
                converter = new IdentifierConverter();
                break;
            // Add other converters here
            default:
                throw new Error(`No converter found for node type: ${node.type}`);
        }
        this.converters.set(node.type, converter);
        return converter;
    }
}
//# sourceMappingURL=ConverterFactory.js.map