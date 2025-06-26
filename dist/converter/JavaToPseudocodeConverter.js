import { ConversionError } from '../types/ast.js';
import { JavaParser } from '../parser/JavaParser.js';
import { PseudocodeFormatter } from '../formatter/PseudocodeFormatter.js';
import { RecursionGuard } from './RecursionGuard.js';
export class JavaToPseudocodeConverter {
    parser;
    formatter;
    config;
    constructor(config) {
        this.config = {
            maxDepth: 50,
            indentSize: 3,
            debugMode: false,
            strictMode: true,
            ...config
        };
        this.parser = new JavaParser();
        this.formatter = new PseudocodeFormatter(this.config);
    }
    convert(javaCode) {
        try {
            const ast = this.parser.parse(javaCode);
            const context = this.createContext();
            const pseudocode = RecursionGuard.convert(ast, context);
            return this.formatter.format(pseudocode);
        }
        catch (error) {
            if (error instanceof ConversionError) {
                throw error;
            }
            throw new Error(`Conversion failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    convertWithHint(javaCode, hint) {
        try {
            const ast = this.parser.parse(javaCode);
            const context = this.createContext();
            // Apply hints to context
            if (hint.integerDivision) {
                context.integerDivision = true;
            }
            const pseudocode = RecursionGuard.convert(ast, context);
            return this.formatter.format(pseudocode);
        }
        catch (error) {
            if (error instanceof ConversionError) {
                throw error;
            }
            throw new Error(`Conversion failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    createContext() {
        return {
            depth: 0,
            maxDepth: this.config.maxDepth,
            visitedNodes: new Set(),
            parentChain: [],
            indentLevel: 0,
            currentScope: 'global'
        };
    }
}
//# sourceMappingURL=JavaToPseudocodeConverter.js.map