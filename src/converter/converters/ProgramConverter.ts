import { ASTNode, ConversionContext } from '../../types/ast';
import { IConverter } from './IConverter';
import { ConverterFactory } from './ConverterFactory';
import { indent } from '../../utils/indent';

export class ProgramConverter implements IConverter {
    convert(node: ASTNode, context: ConversionContext = { indentLevel: 0 }): string {
        const pseudocodeLines: string[] = [];

        // Assuming the CompilationUnit node has a 'declarations' or 'body' property
        // that contains an array of top-level statements/declarations.
        if (node.body) {
            node.body.forEach((statement: ASTNode) => {
                const converter = ConverterFactory.getConverter(statement.type);
                if (converter) {
                    pseudocodeLines.push(indent(context.indentLevel || 0) + converter.convert(statement, context));
                } else {
                    console.warn(`No converter for statement type: ${statement.type}`);
                }
            });
        }

        return pseudocodeLines.join('\n');
    }
}