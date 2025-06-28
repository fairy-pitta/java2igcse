import { parse } from 'java-parser';
import { ASTNode } from '../types/ast';

export class JavaParser {
    public parse(javaCode: string): ASTNode {
        try {
            const cst = parse(javaCode);
            return this.cstToAst(cst);
        } catch (error) {
            console.error("Error parsing Java code:", error);
            throw error;
        }
    }

    private cstToAst(cstNode: any): ASTNode {
        if (!cstNode) {
            return { type: 'EmptyNode' };
        }

        const astNode: ASTNode = {
            type: cstNode.name,
        };

        for (const key in cstNode) {
            if (key === 'name') continue;

            const value = cstNode[key];

            if (Array.isArray(value)) {
                astNode[key] = value.map(item => this.cstToAst(item));
            } else if (typeof value === 'object' && value !== null && value.name) {
                astNode[key] = this.cstToAst(value);
            } else {
                astNode[key] = value;
            }
        }

        return astNode;
    }
}
