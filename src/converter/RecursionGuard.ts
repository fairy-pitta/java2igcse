import { ASTNode, ConversionContext } from '../types/ast';
import { ConverterFactory } from './converters/ConverterFactory';

const MAX_DEPTH = 100; // Maximum recursion depth

export class RecursionGuard {
  static convert(
    node: ASTNode, 
    context: ConversionContext
  ): string {
    const newContext = {
      ...context,
      depth: (context.depth || 0) + 1,
      visitedNodes: context.visitedNodes || new Set<string>(),
    };

    if (newContext.depth > MAX_DEPTH) {
      console.error('Maximum recursion depth exceeded');
      return 'ERROR: Maximum recursion depth exceeded';
    }

    // Generate a unique identifier for the node based on its type and properties
    const nodeId = `${node.type}:${node.start || ''}:${node.end || ''}`;
    
    if (newContext.visitedNodes.has(nodeId)) {
      console.error('Circular reference detected');
      return 'ERROR: Circular reference detected';
    }

    newContext.visitedNodes.add(nodeId);

    try {
      const converter = ConverterFactory.getConverter(node['type']);
      if (!converter) {
        console.warn(`No converter for type: ${node['type']}`);
        return '';
      }
      const result = converter.convert(node, newContext);
      return result || '';
    } finally {
      newContext.visitedNodes.delete(nodeId);
    }
  }

  static getDebugInfo(node: ASTNode, context: ConversionContext): string {
    return `Node Type: ${node.type}, Depth: ${context.depth || 0}, Visited Nodes: ${context.visitedNodes ? context.visitedNodes.size : 0}`;
  }
}