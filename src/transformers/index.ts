// Transformer exports

export { BaseASTTransformer } from './base-transformer';
export { JavaASTTransformer } from './java-transformer';
export { TypeScriptASTTransformer } from './typescript-transformer';
export { VariableDeclarationTransformer } from './variable-declaration-transformer';

// Re-export types for convenience
export type {
  ASTTransformer,
  TransformResult,
  IntermediateRepresentation,
  ConversionContext,
  Scope,
  VariableInfo,
  FunctionInfo
} from '../index';