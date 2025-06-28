import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { indent } from '../../utils/indent';
import { ConverterFactory } from './ConverterFactory';

export class ForStatementConverter implements IConverter {
  public convert(node: ASTNode, context: ConversionContext): string {
    const result: string[] = [];
    
    if (node.init) {
      if (node.init.type === 'VariableDeclaration') {
        const varName = node.init.name;
        const initValue = node.init.initializer ? this.convertExpression(node.init.initializer, context) : '0';
        
        let endValue = '10'; // default
        let step = '1'; // default
        
        if (node.condition && node.condition.type === 'BinaryExpression') {
          const rightSide = this.convertExpression(node.condition.right!, context);
          if (node.condition.operator === '<') {
            endValue = `${parseInt(rightSide) - 1}`;
          } else if (node.condition.operator === '<=') {
            endValue = rightSide;
          }
        }
        
        if (node.update && node.update.type === 'UpdateExpression') {
          if (node.update.operator === '++') {
            step = '1';
          } else if (node.update.operator === '--') {
            step = '-1';
          }
        }
        
        const forStatement = step === '1' 
          ? `FOR ${varName} ← ${initValue} TO ${endValue}`
          : `FOR ${varName} ← ${initValue} TO ${endValue} STEP ${step}`;
        
        result.push(forStatement);
      }
    }
    
    if (node.body) {
      const bodyConverter = ConverterFactory.getConverter(node.body.type);
      if (bodyConverter) {
        const bodyResult = bodyConverter.convert(node.body, { ...context, indentLevel: (context.indentLevel || 0) + 1 });
        result.push(bodyResult);
      }
    }
    
    result.push('ENDFOR');
    
    return result.map(line => indent(context.indentLevel) + line).join('\n');
  }

  private convertExpression(node: ASTNode, context: ConversionContext): string {
    const converter = ConverterFactory.getConverter(node);
    return converter.convert(node, context).join(' ');
  }

  private convertBlock(node: ASTNode, context: ConversionContext): string[] {
    const converter = ConverterFactory.getConverter(node);
    return converter.convert(node, context);
  }
}