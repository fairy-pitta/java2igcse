import { JavaParser } from '../parser/JavaParser.js';
import { ASTNode, ConversionContext } from '../types/ast.js';
import { ConverterFactory } from './converters/ConverterFactory.js';
import { PseudocodeFormatter } from '../formatter/PseudocodeFormatter.js';

export class JavaToPseudocodeConverter {
    private parser: JavaParser;
    private formatter: PseudocodeFormatter;

    constructor() {
        this.parser = new JavaParser();
        this.formatter = new PseudocodeFormatter();
    }

    convert(javaCode: string, hints: any = {}): string {
        const ast = this.parser.parse(javaCode);
        if (!ast) {
            return '';
        }

        const initialContext: ConversionContext = {
            indentLevel: 0,
            ...hints
        };

        const converter = ConverterFactory.getConverter(ast.type);
        if (!converter) {
            throw new Error(`No converter found for AST type: ${ast.type}`);
        }

        const pseudocode = converter.convert(ast, initialContext);
        const formattedCode = Array.isArray(pseudocode) ? pseudocode.join('\n') : pseudocode;
        return this.formatter.format(formattedCode);
    }
}
