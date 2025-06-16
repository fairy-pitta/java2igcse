/**
 * Java AST Node types for conversion
 */
export interface SourcePosition {
  line: number;
  column: number;
  offset: number;
}

export interface ASTNode {
  type: string;
  value?: any;
  children?: ASTNode[];
  position?: SourcePosition;
  name?: string;
  returnType?: string;
  parameters?: ASTNode[];
  body?: ASTNode;
  expression?: ASTNode;
  condition?: ASTNode;
  thenStatement?: ASTNode;
  elseStatement?: ASTNode;
  init?: ASTNode;
  update?: ASTNode;
  left?: ASTNode;
  right?: ASTNode;
  operator?: string;
  dataType?: string;
  initializer?: ASTNode;
  object?: ASTNode;
  property?: ASTNode;
}

export interface ConversionContext {
  depth: number;
  maxDepth: number;
  visitedNodes: Set<string>;
  parentChain: string[];
  indentLevel: number;
  currentScope: string;
}

export interface ConversionRule {
  canHandle(node: ASTNode): boolean;
  convert(node: ASTNode, context: ConversionContext): string;
}

export interface ConverterConfig {
  maxDepth: number;
  indentSize: number;
  debugMode: boolean;
  strictMode: boolean;
}

export class ConversionError extends Error {
  constructor(
    message: string,
    public node: ASTNode,
    public context: ConversionContext
  ) {
    const position = node.position;
    const locationInfo = position 
      ? ` at line ${position.line}, column ${position.column}`
      : '';
    super(`${message}${locationInfo}`);
    this.name = 'ConversionError';
  }
}