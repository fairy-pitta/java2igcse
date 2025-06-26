import { applyIndent } from '@/utils/indent';
import { ConverterFactory } from './ConverterFactory';
export class ForStatementConverter {
    convert(node, context) {
        const result = [];
        if (node.init) {
            if (node.init.type === 'VariableDeclaration') {
                const varName = node.init.name;
                const initValue = node.init.initializer ? this.convertExpression(node.init.initializer, context) : '0';
                let endValue = '10'; // default
                let step = '1'; // default
                if (node.condition && node.condition.type === 'BinaryExpression') {
                    const rightSide = this.convertExpression(node.condition.right, context);
                    if (node.condition.operator === '<') {
                        endValue = `${parseInt(rightSide) - 1}`;
                    }
                    else if (node.condition.operator === '<=') {
                        endValue = rightSide;
                    }
                }
                if (node.update && node.update.type === 'UpdateExpression') {
                    if (node.update.operator === '++') {
                        step = '1';
                    }
                    else if (node.update.operator === '--') {
                        step = '-1';
                    }
                }
                const forStatement = step === '1'
                    ? `FOR ${varName} ← ${initValue} TO ${endValue}`
                    : `FOR ${varName} ← ${initValue} TO ${endValue} STEP ${step}`;
                result.push(forStatement);
            }
        }
        const body = this.convertBlock(node.body, { ...context, indentLevel: context.indentLevel + 1 });
        result.push(...applyIndent(body, 1));
        result.push('ENDFOR');
        return applyIndent(result, context.indentLevel);
    }
    convertExpression(node, context) {
        const converter = ConverterFactory.getConverter(node);
        return converter.convert(node, context).join(' ');
    }
    convertBlock(node, context) {
        const converter = ConverterFactory.getConverter(node);
        return converter.convert(node, context);
    }
}
//# sourceMappingURL=ForStatementConverter.js.map