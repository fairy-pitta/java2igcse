import { JavaParser } from '../parser/JavaParser';
import { ASTNode, ConversionContext } from '../types/ast';
import { ConverterFactory } from './converters/ConverterFactory';
import { PseudocodeFormatter } from '../formatter/PseudocodeFormatter';

interface ConversionHints {
    integerDivision?: boolean;
    [key: string]: any;
}

export class JavaToPseudocodeConverter {
    private parser: JavaParser;
    private formatter: PseudocodeFormatter;

    constructor() {
        this.parser = new JavaParser();
        this.formatter = new PseudocodeFormatter();
    }

    convert(javaCode: string, hints: ConversionHints = {}): string {
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
        return this.formatter.format(pseudocode);
    }

    convertWithHint(javaCode: string, hints: ConversionHints = {}): string {
        return this.convert(javaCode, hints);
    }
}
