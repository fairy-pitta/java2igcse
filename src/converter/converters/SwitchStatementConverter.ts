import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { indent } from '../../utils/indent';
import { ConverterFactory } from './ConverterFactory';
import { RecursionGuard } from '../RecursionGuard';

export class SwitchStatementConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string {
    const discriminant = node.discriminant ? RecursionGuard.convert(node.discriminant, context) : '';
    const result = [`CASE OF ${discriminant}`];
    
    const caseGroups: { tests: string[], consequent: ASTNode[] }[] = [];
    let currentGroup: { tests: string[], consequent: ASTNode[] } = { tests: [], consequent: [] };

    for (const caseNode of node.cases || []) {
      if (caseNode.test) {
        currentGroup.tests.push(RecursionGuard.convert(caseNode.test, context).join(' '));
      }

      if (caseNode.consequent && caseNode.consequent.length > 0) {
        currentGroup.consequent.push(...caseNode.consequent);
        if (caseNode.consequent.some(c => c.type === 'BreakStatement') || caseNode.consequent.some(c => c.type === 'ReturnStatement')) {
          caseGroups.push(currentGroup);
          currentGroup = { tests: [], consequent: [] };
        } else {
           // fallthrough
        }
      } else if (!caseNode.test) { // default case
        currentGroup.consequent.push(...(caseNode.consequent || []));
        caseGroups.push(currentGroup);
        currentGroup = { tests: [], consequent: [] };
      }
    }
    if (currentGroup.tests.length > 0 || currentGroup.consequent.length > 0) {
        caseGroups.push(currentGroup);
    }

    for (const group of caseGroups) {
      const testStr = group.tests.length > 0 ? group.tests.join(', ') : 'OTHERWISE';
      const body = RecursionGuard.convert(
        { type: 'Block', children: group.consequent.filter(s => s.type !== 'BreakStatement') },
        { ...context, indentLevel: context.indentLevel + 1 }
      );
      
      if (body.length > 0) {
        result.push(`   ${testStr}: ${body[0] || ''}`);
        result.push(...body.slice(1).map(line => `   ${line}`));
      } else {
        result.push(`   ${testStr}:`);
      }
    }
    
    result.push('ENDCASE');
    return result.map(line => indent(context.indentLevel || 0) + line).join('\n');
  }
}