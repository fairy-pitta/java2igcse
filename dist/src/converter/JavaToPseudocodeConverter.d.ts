import { ConverterConfig } from '../types/ast';
export interface ConversionHint {
    integerDivision?: boolean;
}
export declare class JavaToPseudocodeConverter {
    private parser;
    private formatter;
    private config;
    constructor(config?: Partial<ConverterConfig>);
    convert(javaCode: string): string;
    convertWithHint(javaCode: string, hint: ConversionHint): string;
    private createContext;
}
//# sourceMappingURL=JavaToPseudocodeConverter.d.ts.map