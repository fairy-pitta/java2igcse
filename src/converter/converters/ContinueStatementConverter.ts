import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';

export class ContinueStatementConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string {
    // Find the enclosing loop to get the variable name
    for (let i = context.parentChain.length - 1; i >= 0; i--) {
      const parent = context.parentChain[i] as unknown as ASTNode;
      if (parent && typeof parent !== 'string') {
          if (parent.type === 'ForStatement' && parent.init?.type === 'VariableDeclaration') {
            return `NEXT ${parent.init.name || ''}`
          } else if (parent.type === 'EnhancedForStatement') {
            return `NEXT ${parent.elementName || ''}`
          }
      }
    }
    return 'NEXT'; // Fallback for while/do-while or if loop variable is not found
  }
}