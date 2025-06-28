import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { indent } from '../../utils/indent';
import { RecursionGuard } from '../RecursionGuard';

export class DoWhileStatementConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string {
    const result: string[] = ['REPEAT'];
    
    if (node.body) {
      const body = RecursionGuard.convert(node.body, { ...context, indentLevel: (context.indentLevel || 0) + 1 });
      result.push(body);
    }
    
    if (node.condition) {
      const condition = RecursionGuard.convert(node.condition, context);
      const negatedCondition = this.negateCondition(condition);
      result.push(`UNTIL ${negatedCondition}`);
    }
    
    return result.map(line => indent(context.indentLevel || 0) + line).join('\n');
  }

  private negateCondition(condition: string): string {
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
  
  private negateSingleCondition(condition: string): string {
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