import { applyIndent } from '@/utils/indent';
import { RecursionGuard } from '@/converter/RecursionGuard';
export class DoWhileStatementConverter {
    convert(node, context) {
        const result = ['REPEAT'];
        const body = RecursionGuard.convert(node.body, { ...context, indentLevel: context.indentLevel + 1 });
        result.push(...applyIndent(body, 1));
        const condition = RecursionGuard.convert(node.condition, context).join(' ');
        const negatedCondition = this.negateCondition(condition);
        result.push(`UNTIL ${negatedCondition}`);
        return applyIndent(result, context.indentLevel);
    }
    negateCondition(condition) {
        if (condition.includes(' AND ')) {
            const parts = condition.split(' AND ');
            const negatedParts = parts.map(part => this.negateSingleCondition(part.trim()));
            return negatedParts.join(' OR ');
        }
        if (condition.includes(' OR ')) {
            const parts = condition.split(' OR ');
            const negatedParts = parts.map(part => this.negateSingleCondition(part.trim()));
            return negatedParts.join(' AND ');
        }
        return this.negateSingleCondition(condition);
    }
    negateSingleCondition(condition) {
        if (condition.includes(' < ')) {
            return condition.replace(' < ', ' ≥ ');
        }
        if (condition.includes(' > ')) {
            return condition.replace(' > ', ' ≤ ');
        }
        if (condition.includes(' ≤ ')) {
            return condition.replace(' ≤ ', ' > ');
        }
        if (condition.includes(' ≥ ')) {
            return condition.replace(' ≥ ', ' < ');
        }
        if (condition.includes(' = ')) {
            return condition.replace(' = ', ' <> ');
        }
        if (condition.includes(' <> ')) {
            return condition.replace(' <> ', ' = ');
        }
        return `NOT (${condition})`;
    }
}
//# sourceMappingURL=DoWhileStatementConverter.js.map