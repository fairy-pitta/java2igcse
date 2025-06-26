import { applyIndent } from '@/utils/indent';
import { ConverterFactory } from './ConverterFactory';
export class WhileStatementConverter {
    convert(node, context) {
        const condition = this.convertExpression(node.condition, context);
        const result = [`WHILE ${condition}`];
        const body = this.convertBlock(node.body, { ...context, indentLevel: context.indentLevel + 1 });
        result.push(...applyIndent(body, 1));
        result.push('ENDWHILE');
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
//# sourceMappingURL=WhileStatementConverter.js.map