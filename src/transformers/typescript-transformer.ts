// TypeScript AST Transformer - converts TypeScript AST to Intermediate Representation

import {
  IntermediateRepresentation,
  TransformResult,
  TypeScriptASTNode,
  IGCSEType,
  ConversionOptions
} from '../index';
import { BaseASTTransformer } from './base-transformer';
import { VariableDeclarationTransformer } from './variable-declaration-transformer';
import { ErrorCodes } from '../errors';
import { ArrayIndexingConverter, ArrayIndexContext } from '../utils/array-indexing-converter';

export class TypeScriptASTTransformer extends BaseASTTransformer<TypeScriptASTNode> {
  private variableTransformer: VariableDeclarationTransformer;
  private arrayIndexContext: ArrayIndexContext;

  constructor(options: ConversionOptions = {}) {
    super(options);
    this.variableTransformer = new VariableDeclarationTransformer(this);
    this.arrayIndexContext = {
      zeroBasedVariables: [],
      oneBasedVariables: [],
      convertedVariables: [],
      arrayNames: [],
      forLoopVariables: {}
    };
  }

  transform(ast: TypeScriptASTNode): TransformResult<IntermediateRepresentation> {
    try {
      this.resetWarnings();
      const result = this.transformNode(ast);
      return this.createTransformResult(result);
    } catch (error) {
      return this.handleTransformError(error as Error);
    }
  }

  private transformNode(node: TypeScriptASTNode): IntermediateRepresentation {
    if (!node) {
      return this.createIRNode('program', 'empty_program');
    }

    switch (node.type) {
      case 'program':
        return this.transformProgram(node);
      case 'variable_statement':
        return this.transformVariableStatement(node);
      case 'variable_declaration':
        return this.transformVariableDeclaration(node);
      case 'ts_variabledeclarationlist':
        return this.transformVariableDeclarationList(node);
      case 'function_declaration':
        return this.transformFunctionDeclaration(node);
      case 'arrow_function':
        return this.transformArrowFunction(node);
      case 'identifier':
        return this.transformIdentifier(node);
      case 'literal':
        return this.transformLiteral(node);
      case 'if_statement':
        return this.transformIfStatement(node);
      case 'while_statement':
        return this.transformWhileStatement(node);
      case 'for_statement':
        return this.transformForStatement(node);
      case 'switch_statement':
        return this.transformSwitchStatement(node);
      case 'block':
        return this.transformBlock(node);
      case 'expression_statement':
        return this.transformExpressionStatement(node);
      case 'call_expression':
        return this.transformCallExpression(node);
      case 'binary_expression':
        return this.transformBinaryExpression(node);
      case 'unary_expression':
        return this.transformUnaryExpression(node);
      case 'class_declaration':
        return this.transformClassDeclaration(node);
      case 'method_declaration':
        return this.transformMethodDeclaration(node);
      case 'property_declaration':
        return this.transformPropertyDeclaration(node);
      case 'template_literal':
        return this.transformTemplateLiteral(node);
      case 'destructuring_assignment':
        return this.transformDestructuringAssignment(node);
      case 'object_destructuring':
        return this.transformObjectDestructuring(node);
      case 'array_destructuring':
        return this.transformArrayDestructuring(node);
      case 'ts_endoffiletoken':
        // Ignore end-of-file tokens as they don't represent actual code
        return this.createIRNode('statement', 'empty_statement', [], {}, node.location);
      default:
        this.addWarning(
          `Unsupported TypeScript AST node type: ${node.type}`,
          ErrorCodes.UNSUPPORTED_FEATURE,
          'warning',
          node.location?.line,
          node.location?.column
        );
        return this.createIRNode('statement', 'unsupported', [], {
          originalType: node.type,
          originalValue: node.value
        }, node.location);
    }
  }

  private transformProgram(node: TypeScriptASTNode): IntermediateRepresentation {
    const children = node.children.map(child => this.transformNode(child));
    
    return this.createIRNode(
      'program',
      'typescript_program',
      children,
      {
        language: 'typescript',
        totalStatements: children.length
      },
      node.location
    );
  }

  private transformVariableDeclarationList(node: TypeScriptASTNode): IntermediateRepresentation {
    // Variable declaration lists typically contain variable declarations
    if (node.children.length > 0) {
      // Return the first child (variable declaration) directly
      return this.transformNode(node.children[0]);
    }
    
    return this.createIRNode('statement', 'empty_statement', [], {}, node.location);
  }

  private transformVariableStatement(node: TypeScriptASTNode): IntermediateRepresentation {
    // Variable statements typically contain variable declarations
    if (node.children.length > 0) {
      // Return the first child (variable declaration) directly
      return this.transformNode(node.children[0]);
    }
    
    return this.createIRNode('statement', 'empty_statement', [], {}, node.location);
  }

  private transformVariableDeclaration(node: TypeScriptASTNode): IntermediateRepresentation {
    const variableName = node.value as string;
    const hasTypeAnnotation = node.metadata?.hasTypeAnnotation || false;
    const typeAnnotation = node.metadata?.typeAnnotation as string;
    const hasInitializer = node.metadata?.hasInitializer || false;
    const initializer = node.metadata?.initializer as string;
    const isOptional = typeAnnotation?.includes('?') || variableName.includes('?');

    // Check if the initializer is an arrow function
    const arrowFunctionChild = node.children.find(child => child.type === 'arrow_function');
    if (arrowFunctionChild) {
      // Transform the arrow function directly
      return this.transformArrowFunction(arrowFunctionChild);
    }

    // Apply array indexing conversion to initializer if present
    let convertedInitializer = hasInitializer ? initializer : undefined;
    if (hasInitializer && initializer) {
      const conversionResult = ArrayIndexingConverter.convertArrayAccess(initializer, this.arrayIndexContext);
      convertedInitializer = conversionResult.convertedExpression;
      
      // Add warnings for array indexing conversion
      conversionResult.warnings.forEach(warning => {
        this.addWarning(warning, 'ARRAY_INDEX_CONVERSION', 'info', node.location?.line, node.location?.column);
      });
    }

    // Use specialized variable declaration transformer
    const result = this.variableTransformer.transformTypeScriptVariableDeclaration(
      variableName,
      hasTypeAnnotation ? typeAnnotation : undefined,
      convertedInitializer,
      isOptional,
      node.location
    );

    // Add any warnings from the variable transformer
    result.warnings.forEach(warning => {
      this.addWarning(warning, 'FEATURE_CONVERSION', 'info', node.location?.line, node.location?.column);
    });

    // Track array names for indexing conversion
    if (result.ir.metadata.isArray) {
      if (!this.arrayIndexContext.arrayNames?.includes(variableName)) {
        this.arrayIndexContext.arrayNames?.push(variableName);
      }
    }

    // Transform child nodes and add them to the IR
    const children = node.children.map(child => this.transformNode(child));

    // Update the IR with transformed children
    result.ir.children = children;

    return result.ir;
  }

  private transformFunctionDeclaration(node: TypeScriptASTNode): IntermediateRepresentation {
    const functionName = node.value as string;
    const parameters = node.metadata?.parameters || [];
    const returnType = node.metadata?.returnType;
    const isAsync = node.metadata?.isAsync || false;

    // Convert parameters to IGCSE format
    const igcseParameters = parameters.map((param: any) => ({
      name: param.name.replace('?', ''),
      type: this.variableTransformer.convertTypeScriptTypeToIGCSE(param.type || 'any'),
      isArray: (param.type || '').includes('[]'),
      isOptional: param.optional || param.name.includes('?')
    }));

    // Determine if it's a procedure or function
    const isProcedure = !returnType || returnType === 'void';
    const igcseReturnType = isProcedure ? undefined : this.variableTransformer.convertTypeScriptTypeToIGCSE(returnType);

    // Declare function in context
    this.declareFunction(functionName, igcseParameters, igcseReturnType);

    const children = node.children.map(child => this.transformNode(child));

    const metadata: Record<string, any> = {
      functionName,
      parameters: igcseParameters,
      returnType: igcseReturnType,
      isProcedure,
      isAsync,
      igcseDeclaration: this.generateFunctionDeclaration(functionName, igcseParameters, igcseReturnType, isProcedure)
    };

    if (isAsync) {
      this.addWarning(
        `Async function '${functionName}' converted to regular ${isProcedure ? 'procedure' : 'function'}`,
        'FEATURE_CONVERSION',
        'info',
        node.location?.line,
        node.location?.column
      );
    }

    return this.createIRNode(
      'function_declaration',
      isProcedure ? 'procedure_declaration' : 'function_declaration',
      children,
      metadata,
      node.location
    );
  }

  private transformArrowFunction(node: TypeScriptASTNode): IntermediateRepresentation {
    const parameters = node.metadata?.parameters || [];
    const returnType = node.metadata?.returnType;

    // Generate a name for the arrow function
    const functionName = `arrowFunction_${Date.now()}`;

    this.addWarning(
      'Arrow function converted to named procedure',
      'FEATURE_CONVERSION',
      'info',
      node.location?.line,
      node.location?.column
    );

    // Convert parameters to IGCSE format
    const igcseParameters = parameters.map((param: any) => ({
      name: param.name.replace('?', ''),
      type: this.variableTransformer.convertTypeScriptTypeToIGCSE(param.type || 'any'),
      isArray: (param.type || '').includes('[]'),
      isOptional: param.optional || param.name.includes('?')
    }));

    const isProcedure = !returnType || returnType === 'void';
    const igcseReturnType = isProcedure ? undefined : this.variableTransformer.convertTypeScriptTypeToIGCSE(returnType);

    const children = node.children.map(child => this.transformNode(child));

    return this.createIRNode(
      'function_declaration',
      'arrow_function_converted',
      children,
      {
        functionName,
        parameters: igcseParameters,
        returnType: igcseReturnType,
        isProcedure,
        isArrowFunction: true,
        igcseDeclaration: this.generateFunctionDeclaration(functionName, igcseParameters, igcseReturnType, isProcedure)
      },
      node.location
    );
  }

  private transformIdentifier(node: TypeScriptASTNode): IntermediateRepresentation {
    const name = node.value as string;
    const variableInfo = this.lookupVariable(name);
    const functionInfo = this.lookupFunction(name);

    return this.createIRNode(
      'identifier',
      'identifier',
      [],
      {
        name,
        isVariable: !!variableInfo,
        isFunction: !!functionInfo,
        variableInfo,
        functionInfo
      },
      node.location
    );
  }

  private transformLiteral(node: TypeScriptASTNode): IntermediateRepresentation {
    const value = node.value as string;
    const literalType = node.metadata?.literalType || 'unknown';
    
    let igcseValue = value;
    let igcseType: IGCSEType = 'STRING';

    switch (literalType) {
      case 'number':
        igcseType = value.includes('.') ? 'REAL' : 'INTEGER';
        igcseValue = value;
        break;
      case 'string':
        igcseType = 'STRING';
        igcseValue = `"${value}"`;
        break;
      case 'boolean':
        igcseType = 'BOOLEAN';
        igcseValue = value === 'true' ? 'TRUE' : 'FALSE';
        break;
      default:
        this.addWarning(
          `Unknown literal type: ${literalType}`,
          ErrorCodes.TYPE_CONVERSION_ERROR,
          'warning',
          node.location?.line,
          node.location?.column
        );
        break;
    }

    return this.createIRNode(
      'literal',
      'literal_value',
      [],
      {
        originalValue: value,
        igcseValue,
        literalType,
        igcseType
      },
      node.location
    );
  }

  private transformIfStatement(node: TypeScriptASTNode): IntermediateRepresentation {
    const children = node.children.map(child => this.transformNode(child));
    
    // Extract condition and blocks
    const condition = children[0]; // condition node
    const thenBlock = children[1]; // then block
    const elseBlock = children.length > 2 ? children[2] : null; // else block (optional)
    
    const hasElse = node.metadata?.hasElse || false;
    const isElseIf = node.metadata?.isElseIf || false;
    
    return this.createIRNode(
      'control_structure',
      'if_statement',
      children,
      {
        condition: node.metadata?.igcseCondition || node.metadata?.condition,
        hasElse,
        isElseIf,
        thenBlock,
        elseBlock,
        controlType: 'conditional'
      },
      node.location
    );
  }

  private transformWhileStatement(node: TypeScriptASTNode): IntermediateRepresentation {
    const children = node.children.map(child => this.transformNode(child));
    
    // Extract condition and body from TypeScript AST
    let condition: IntermediateRepresentation | undefined;
    let body: IntermediateRepresentation | undefined;
    
    // For TypeScript, we need to extract condition and body from the children
    // The structure should be: [condition, body]
    if (children.length >= 2) {
      condition = children[0];
      body = children[1];
    } else if (children.length === 1) {
      // If only one child, it might be the body with condition in metadata
      body = children[0];
    }
    
    // Try to extract condition from node metadata first, then from children
    let conditionValue = '';
    if (node.metadata?.igcseCondition) {
      conditionValue = node.metadata.igcseCondition;
    } else if (node.metadata?.condition) {
      conditionValue = this.convertConditionOperators(node.metadata.condition);
    } else if (condition) {
      conditionValue = condition.metadata?.igcseCondition || condition.metadata?.value || '';
    }
    
    return this.createIRNode(
      'control_structure',
      'while_loop',
      children,
      {
        condition: conditionValue,
        body
      },
      node.location
    );
  }

  private transformForStatement(node: TypeScriptASTNode): IntermediateRepresentation {
    const children = node.children.map(child => this.transformNode(child));
    
    // For TypeScript, we need to extract for loop components from the AST structure
    // The structure should be: [initialization, condition, increment, body]
    let initialization: IntermediateRepresentation | undefined;
    let condition: IntermediateRepresentation | undefined;
    let increment: IntermediateRepresentation | undefined;
    let body: IntermediateRepresentation | undefined;
    
    if (children.length >= 4) {
      initialization = children[0];
      condition = children[1];
      increment = children[2];
      body = children[3];
    } else if (children.length >= 2) {
      // Simplified case - assume condition and body
      condition = children[0];
      body = children[1];
    }
    
    // Try to extract for loop metadata from node metadata first, then from children
    let variable = node.metadata?.variable || 'i';
    let startValue = node.metadata?.startValue || '0';
    let endCondition = node.metadata?.endCondition || '';
    let incrementExpression = node.metadata?.incrementExpression || '';
    
    // Fallback to extracting from children if metadata not available
    if (!variable || !startValue || !endCondition || !incrementExpression) {
      // Extract from initialization if available
      if (initialization && initialization.metadata?.variable) {
        variable = initialization.metadata.variable;
        startValue = initialization.metadata.expression || initialization.metadata.startValue || '0';
      }
      
      // Extract from condition if available
      if (condition && condition.metadata?.value) {
        endCondition = condition.metadata.value;
      }
      
      // Extract from increment if available
      if (increment && increment.metadata?.value) {
        incrementExpression = increment.metadata.value;
      }
    }
    
    // Track zero-based variables for array indexing conversion
    if (startValue === '0') {
      if (!this.arrayIndexContext.zeroBasedVariables?.includes(variable)) {
        this.arrayIndexContext.zeroBasedVariables?.push(variable);
      }
    } else if (startValue === '1') {
      if (!this.arrayIndexContext.oneBasedVariables?.includes(variable)) {
        this.arrayIndexContext.oneBasedVariables?.push(variable);
      }
    }
    
    // Store for loop variable context
    this.arrayIndexContext.forLoopVariables = this.arrayIndexContext.forLoopVariables || {};
    this.arrayIndexContext.forLoopVariables[variable] = {
      start: parseInt(startValue) || 0,
      end: endCondition
    };
    
    // Convert for loop bounds using array indexing converter
    const boundsConversion = ArrayIndexingConverter.convertForLoopBounds(
      variable,
      startValue,
      endCondition,
      this.arrayIndexContext.arrayNames
    );
    
    // Add warnings for bounds conversion
    boundsConversion.warnings.forEach(warning => {
      this.addWarning(warning, 'ARRAY_INDEX_CONVERSION', 'info', node.location?.line, node.location?.column);
    });
    
    // If the start value was converted from 0 to 1, track this variable as converted
    if (startValue === '0' && boundsConversion.startValue === '1') {
      if (!this.arrayIndexContext.convertedVariables?.includes(variable)) {
        this.arrayIndexContext.convertedVariables = this.arrayIndexContext.convertedVariables || [];
        this.arrayIndexContext.convertedVariables.push(variable);
      }
    }
    
    // Convert for loop to IGCSE format with converted bounds
    const forLoopData = this.convertForLoopToIGCSE(
      variable, 
      boundsConversion.startValue, 
      boundsConversion.endValue, 
      incrementExpression
    );
    
    return this.createIRNode(
      'control_structure',
      'for_loop',
      children,
      {
        variable: forLoopData.variable,
        startValue: forLoopData.startValue,
        endValue: forLoopData.endValue,
        stepValue: forLoopData.stepValue,
        body,
        originalStartValue: startValue,
        originalEndCondition: endCondition
      },
      node.location
    );
  }

  private transformSwitchStatement(node: TypeScriptASTNode): IntermediateRepresentation {
    const children = node.children.map(child => this.transformNode(child));
    
    // Extract switch components
    const expression = node.metadata?.expression || children[0]?.metadata?.value || 'value';
    const cases = node.metadata?.cases || [];
    const defaultCase = node.metadata?.defaultCase;
    
    this.addWarning(
      'Switch statement converted to CASE statement',
      'FEATURE_CONVERSION',
      'info',
      node.location?.line,
      node.location?.column
    );
    
    return this.createIRNode(
      'control_structure',
      'switch_statement',
      children,
      {
        expression,
        cases,
        defaultCase,
        hasDefault: !!defaultCase
      },
      node.location
    );
  }

  private transformBlock(node: TypeScriptASTNode): IntermediateRepresentation {
    this.enterScope('block');
    const children = node.children.map(child => this.transformNode(child));
    this.exitScope();
    
    return this.createIRNode(
      'statement',
      'block',
      children,
      {},
      node.location
    );
  }

  private transformExpressionStatement(node: TypeScriptASTNode): IntermediateRepresentation {
    // Expression statements are typically method calls or assignments wrapped in a statement
    if (node.children.length > 0) {
      const expression = this.transformNode(node.children[0]);
      
      // If the expression is a method call that was converted to an output statement,
      // return it directly
      if (expression.kind === 'output_statement') {
        return expression;
      }
      
      return expression;
    }
    
    return this.createIRNode('statement', 'empty_statement', [], {}, node.location);
  }

  private transformCallExpression(node: TypeScriptASTNode): IntermediateRepresentation {
    const methodName = node.metadata?.methodName as string;
    const objectName = node.metadata?.objectName as string;
    const methodArgs = node.metadata?.arguments as string[] || [];
    
    // Check for console.log() calls
    if (objectName === 'console' && (methodName === 'log' || methodName === 'error' || methodName === 'warn')) {
      return this.createOutputStatement(methodArgs, node);
    }
    
    // Check for string method calls
    if (this.isStringMethod(methodName)) {
      return this.transformStringMethod(objectName, methodName, methodArgs, node);
    }
    
    // If we have method metadata, create a method call IR
    if (methodName || objectName) {
      return this.createIRNode(
        'method_call',
        'method_call',
        [],
        {
          methodName,
          objectName,
          arguments: methodArgs,
          isProcedureCall: true, // Assume procedure call unless we know it returns a value
          originalCall: node.value
        },
        node.location
      );
    }
    
    // For generic call expressions without method metadata, create a generic expression IR
    const children = node.children.map(child => this.transformNode(child));
    
    return this.createIRNode(
      'expression',
      'call_expression',
      children,
      {},
      node.location
    );
  }

  private transformBinaryExpression(node: TypeScriptASTNode): IntermediateRepresentation {
    const children = node.children.map(child => this.transformNode(child));
    const operator = node.metadata?.operator as string;
    const leftOperand = node.metadata?.left as string;
    const rightOperand = node.metadata?.right as string;
    
    let igcseOperator = operator;
    let igcseExpression = '';
    
    // Convert operators to IGCSE equivalents
    switch (operator) {
      case '+':
        // Check if this is string concatenation or numeric addition
        // For now, we'll assume it's addition unless we have more context
        igcseOperator = '+';
        igcseExpression = `${leftOperand} + ${rightOperand}`;
        break;
        
      case '==':
        igcseOperator = '=';
        igcseExpression = `${leftOperand} = ${rightOperand}`;
        break;
        
      case '!=':
        igcseOperator = '<>';
        igcseExpression = `${leftOperand} <> ${rightOperand}`;
        break;
        
      case '&&':
        igcseOperator = 'AND';
        igcseExpression = `${leftOperand} AND ${rightOperand}`;
        break;
        
      case '||':
        igcseOperator = 'OR';
        igcseExpression = `${leftOperand} OR ${rightOperand}`;
        break;
        
      case '%':
        igcseOperator = 'MOD';
        igcseExpression = `${leftOperand} MOD ${rightOperand}`;
        break;
        
      default:
        igcseOperator = operator;
        igcseExpression = `${leftOperand} ${operator} ${rightOperand}`;
        break;
    }
    
    // Add warning for operator conversion if needed
    if (operator !== igcseOperator) {
      this.addWarning(
        `Operator '${operator}' converted to '${igcseOperator}'`,
        'FEATURE_CONVERSION',
        'info',
        node.location?.line,
        node.location?.column
      );
    }
    
    // Convert array indexing in the expression
    const conversionResult = ArrayIndexingConverter.convertArrayAccess(igcseExpression, this.arrayIndexContext);
    
    // Add warnings for array indexing conversion
    conversionResult.warnings.forEach(warning => {
      this.addWarning(warning, 'ARRAY_INDEX_CONVERSION', 'info', node.location?.line, node.location?.column);
    });
    
    return this.createIRNode(
      'expression',
      'binary_expression',
      children,
      {
        originalOperator: operator,
        igcseOperator,
        igcseExpression: conversionResult.convertedExpression,
        leftOperand,
        rightOperand,
        hasArrayAccess: conversionResult.hasArrayAccess
      },
      node.location
    );
  }

  private transformUnaryExpression(node: TypeScriptASTNode): IntermediateRepresentation {
    const children = node.children.map(child => this.transformNode(child));
    
    return this.createIRNode(
      'expression',
      'unary_expression',
      children,
      {},
      node.location
    );
  }



  private createOutputStatement(methodArgs: string[], node: TypeScriptASTNode): IntermediateRepresentation {
    // Convert arguments to expressions for OUTPUT statement
    const expressions: string[] = [];
    
    for (const arg of methodArgs) {
      // Handle string concatenation first (before checking for string literals)
      if (arg.includes('+')) {
        // Split by + and handle each part
        const parts = arg.split('+').map(part => part.trim());
        for (const part of parts) {
          if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
            expressions.push(part.replace(/'/g, '"'));
          } else if (part) { // Only add non-empty parts
            expressions.push(part); // Variable reference
          }
        }
      }
      // Handle template literals (simplified)
      else if (arg.startsWith('`') && arg.endsWith('`')) {
        // Convert template literal to string literal (simplified)
        const content = arg.slice(1, -1);
        expressions.push(`"${content}"`);
        this.addWarning(
          'Template literal converted to simple string - variable interpolation not supported',
          'FEATURE_CONVERSION',
          'info',
          node.location?.line,
          node.location?.column
        );
      }
      // Handle string literals
      else if (arg.startsWith('"') && arg.endsWith('"') || arg.startsWith("'") && arg.endsWith("'")) {
        expressions.push(arg.replace(/'/g, '"')); // Convert single quotes to double quotes
      }
      // Handle variable references
      else {
        expressions.push(arg);
      }
    }
    
    // If no arguments, output empty string
    if (expressions.length === 0) {
      expressions.push('""');
    }
    
    return this.createIRNode(
      'statement',
      'output_statement',
      [],
      {
        expressions,
        originalMethod: node.value,
        language: 'typescript'
      },
      node.location
    );
  }

  private convertConditionOperators(condition: string): string {
    return condition
      .replace(/==/g, '=')
      .replace(/!=/g, '<>')
      .replace(/&&/g, 'AND')
      .replace(/\|\|/g, 'OR')
      .replace(/!/g, 'NOT ')
      .replace(/%/g, 'MOD')
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  }

  private convertForLoopToIGCSE(variable: string, startValue: string, endCondition: string, incrementExpression: string): {
    variable: string;
    startValue: string;
    endValue: string;
    stepValue: number;
  } {
    // Parse start value
    const start = parseInt(startValue) || 0;
    
    // Parse end condition (e.g., "i < 10", "i <= 15", "i > 0")
    let endValue = '';
    let stepValue = 1;
    
    if (endCondition.includes('<=')) {
      const parts = endCondition.split('<=');
      if (parts.length === 2) {
        endValue = parts[1].trim();
      }
    } else if (endCondition.includes('<')) {
      const parts = endCondition.split('<');
      if (parts.length === 2) {
        const endNum = parseInt(parts[1].trim());
        if (!isNaN(endNum)) {
          endValue = (endNum - 1).toString();
        } else {
          endValue = parts[1].trim() + '-1';
        }
      }
    } else if (endCondition.includes('>=')) {
      const parts = endCondition.split('>=');
      if (parts.length === 2) {
        endValue = parts[1].trim();
        stepValue = -1; // Assume decrement
      }
    } else if (endCondition.includes('>')) {
      const parts = endCondition.split('>');
      if (parts.length === 2) {
        const endNum = parseInt(parts[1].trim());
        if (!isNaN(endNum)) {
          endValue = (endNum + 1).toString();
        } else {
          endValue = parts[1].trim() + '+1';
        }
        stepValue = -1; // Assume decrement
      }
    }
    
    // Parse increment expression (e.g., "i++", "i--", "i += 2", "i = i + 3")
    if (incrementExpression.includes('++')) {
      stepValue = 1;
    } else if (incrementExpression.includes('--')) {
      stepValue = -1;
    } else if (incrementExpression.includes('+=')) {
      const parts = incrementExpression.split('+=');
      if (parts.length === 2) {
        const step = parseInt(parts[1].trim());
        if (!isNaN(step)) {
          stepValue = step;
        }
      }
    } else if (incrementExpression.includes('-=')) {
      const parts = incrementExpression.split('-=');
      if (parts.length === 2) {
        const step = parseInt(parts[1].trim());
        if (!isNaN(step)) {
          stepValue = -step;
        }
      }
    } else if (incrementExpression.includes('=') && incrementExpression.includes('+')) {
      // Handle "i = i + 2" format
      const match = incrementExpression.match(/=\s*\w+\s*\+\s*(\d+)/);
      if (match) {
        const step = parseInt(match[1]);
        if (!isNaN(step)) {
          stepValue = step;
        }
      }
    } else if (incrementExpression.includes('=') && incrementExpression.includes('-')) {
      // Handle "i = i - 2" format
      const match = incrementExpression.match(/=\s*\w+\s*-\s*(\d+)/);
      if (match) {
        const step = parseInt(match[1]);
        if (!isNaN(step)) {
          stepValue = -step;
        }
      }
    }
    
    return {
      variable,
      startValue,
      endValue,
      stepValue
    };
  }

  private transformClassDeclaration(node: TypeScriptASTNode): IntermediateRepresentation {
    const className = node.metadata?.className as string;
    const heritage = node.metadata?.heritage as string[] || [];
    
    this.addWarning(
      `Class '${className}' converted to procedural equivalents with comments`,
      'FEATURE_CONVERSION',
      'info',
      node.location?.line,
      node.location?.column
    );

    // Transform child nodes (methods and properties)
    const children = node.children.map(child => this.transformNode(child));

    let inheritanceComment = `// ${className}`;
    if (heritage.length > 0) {
      inheritanceComment += ` extends ${heritage.join(', ')}`;
    }

    return this.createIRNode(
      'declaration',
      'class_converted',
      children,
      {
        className,
        heritage,
        classComment: inheritanceComment,
        inheritanceComment
      },
      node.location
    );
  }

  private transformMethodDeclaration(node: TypeScriptASTNode): IntermediateRepresentation {
    const methodName = node.metadata?.methodName as string;
    const parameters = node.metadata?.parameters || [];
    const returnType = node.metadata?.returnType;
    const isStatic = node.metadata?.isStatic || false;
    const isAsync = node.metadata?.isAsync || false;
    const visibility = node.metadata?.visibility || 'public';

    // Convert parameters to IGCSE format
    const igcseParameters = parameters.map((param: any) => ({
      name: param.name.replace('?', ''),
      type: this.variableTransformer.convertTypeScriptTypeToIGCSE(param.type || 'any'),
      isArray: (param.type || '').includes('[]'),
      isOptional: param.optional || param.name.includes('?')
    }));

    // Determine if it's a procedure or function
    const isProcedure = !returnType || returnType === 'void';
    const igcseReturnType = isProcedure ? undefined : this.variableTransformer.convertTypeScriptTypeToIGCSE(returnType);

    // Declare function in context
    this.declareFunction(methodName, igcseParameters, igcseReturnType, isStatic, visibility as 'public' | 'private' | 'protected');

    const children = node.children.map(child => this.transformNode(child));

    const metadata: Record<string, any> = {
      methodName,
      parameters: igcseParameters,
      returnType: igcseReturnType,
      isProcedure,
      isStatic,
      isAsync,
      visibility,
      igcseDeclaration: this.generateFunctionDeclaration(methodName, igcseParameters, igcseReturnType, isProcedure)
    };

    if (isStatic) {
      this.addWarning(
        `Static method '${methodName}' converted to ${isProcedure ? 'procedure' : 'function'}`,
        'FEATURE_CONVERSION',
        'info',
        node.location?.line,
        node.location?.column
      );
      
      metadata.staticComment = `// Static method`;
    }

    if (isAsync) {
      this.addWarning(
        `Async method '${methodName}' converted to regular ${isProcedure ? 'procedure' : 'function'}`,
        'FEATURE_CONVERSION',
        'info',
        node.location?.line,
        node.location?.column
      );
    }

    return this.createIRNode(
      'function_declaration',
      isProcedure ? 'procedure_declaration' : 'function_declaration',
      children,
      metadata,
      node.location
    );
  }

  private transformPropertyDeclaration(node: TypeScriptASTNode): IntermediateRepresentation {
    const propertyName = node.metadata?.propertyName as string;
    const typeAnnotation = node.metadata?.type as string;
    const isStatic = node.metadata?.isStatic || false;
    const isReadonly = node.metadata?.isReadonly || false;
    const hasInitializer = node.metadata?.hasInitializer || false;
    const initializer = node.metadata?.initializer as string;
    const visibility = node.metadata?.visibility || 'public';

    // Use specialized variable declaration transformer
    const result = this.variableTransformer.transformTypeScriptVariableDeclaration(
      propertyName,
      typeAnnotation,
      hasInitializer ? initializer : undefined,
      false, // not optional for properties
      node.location
    );

    // Add any warnings from the variable transformer
    result.warnings.forEach(warning => {
      this.addWarning(warning, 'FEATURE_CONVERSION', 'info', node.location?.line, node.location?.column);
    });

    // Add static property warning if needed
    if (isStatic) {
      this.addWarning(
        `Static property '${propertyName}' converted to regular variable`,
        'FEATURE_CONVERSION',
        'info',
        node.location?.line,
        node.location?.column
      );
      
      result.ir.metadata.staticComment = `// Static variable`;
      result.ir.metadata.isStatic = true;
    }

    // Add readonly warning if needed
    if (isReadonly) {
      this.addWarning(
        `Readonly property '${propertyName}' converted to regular variable`,
        'FEATURE_CONVERSION',
        'info',
        node.location?.line,
        node.location?.column
      );
      
      result.ir.metadata.isReadonly = true;
      result.ir.metadata.readonlyComment = `// Constant variable`;
    }

    // Transform child nodes and add them to the IR
    const children = node.children.map(child => this.transformNode(child));

    // Update the IR with transformed children and metadata
    result.ir.children = children;
    result.ir.metadata.visibility = visibility;

    return result.ir;
  }

  private transformTemplateLiteral(node: TypeScriptASTNode): IntermediateRepresentation {
    const templateString = node.value as string;
    const expressions = node.metadata?.expressions || [];
    const templateParts = node.metadata?.templateParts || [];
    
    this.addWarning(
      'Template literal converted to string concatenation',
      'FEATURE_CONVERSION',
      'info',
      node.location?.line,
      node.location?.column
    );

    // Convert template literal to string concatenation
    let concatenatedString = '';
    let parts: string[] = [];
    
    if (expressions.length === 0) {
      // Simple template literal without expressions - extract content from backticks
      let content = templateString;
      if (content.startsWith('`') && content.endsWith('`')) {
        content = content.slice(1, -1); // Remove backticks
      }
      concatenatedString = `"${content}"`;
      parts = [concatenatedString];
    } else {
      // Template literal with expressions - convert to concatenation
      for (let i = 0; i < templateParts.length; i++) {
        const part = templateParts[i];
        if (part !== undefined && part !== '') {
          parts.push(`"${part}"`);
        } else if (part === '' && i === 0) {
          // Handle case where template starts with expression
          parts.push('""');
        }
        
        if (i < expressions.length) {
          parts.push(expressions[i]);
        }
      }
      
      concatenatedString = parts.join(' & ');
    }

    return this.createIRNode(
      'expression',
      'template_literal_converted',
      [],
      {
        originalTemplate: templateString,
        expressions,
        concatenatedString,
        parts,
        igcseExpression: concatenatedString
      },
      node.location
    );
  }

  private transformDestructuringAssignment(node: TypeScriptASTNode): IntermediateRepresentation {
    const pattern = node.metadata?.pattern;
    const source = node.metadata?.source;
    const destructuringType = node.metadata?.destructuringType || 'object';
    
    this.addWarning(
      `Destructuring assignment converted to individual variable assignments`,
      'FEATURE_CONVERSION',
      'info',
      node.location?.line,
      node.location?.column
    );

    // Convert destructuring to individual assignments
    const assignments: IntermediateRepresentation[] = [];
    
    if (destructuringType === 'object' && pattern) {
      // Object destructuring: const { a, b } = obj -> a = obj.a; b = obj.b;
      // For renamed: const { a: newA, b: newB } = obj -> newA = obj.a; newB = obj.b;
      const properties = pattern.properties || [];
      
      for (const prop of properties) {
        const varName = prop.name; // The new variable name
        const sourceProp = prop.value || prop.key || prop.name; // The property to access
        
        const assignment = this.createIRNode(
          'statement',
          'assignment_statement',
          [],
          {
            variable: varName,
            expression: `${source}.${sourceProp}`,
            igcseAssignment: `${varName} ← ${source}.${sourceProp}`,
            originalDestructuring: true
          },
          node.location
        );
        
        assignments.push(assignment);
      }
    } else if (destructuringType === 'array' && pattern) {
      // Array destructuring: const [a, b] = arr -> a = arr[0]; b = arr[1];
      const elements = pattern.elements || [];
      
      for (let i = 0; i < elements.length; i++) {
        const varName = elements[i];
        if (varName) {
          const assignment = this.createIRNode(
            'statement',
            'assignment_statement',
            [],
            {
              variable: varName,
              expression: `${source}[${i + 1}]`, // IGCSE uses 1-based indexing
              igcseAssignment: `${varName} ← ${source}[${i + 1}]`,
              originalDestructuring: true
            },
            node.location
          );
          
          assignments.push(assignment);
        }
      }
    }

    return this.createIRNode(
      'statement',
      'destructuring_converted',
      assignments,
      {
        originalPattern: pattern,
        source,
        destructuringType,
        assignmentCount: assignments.length
      },
      node.location
    );
  }

  private transformObjectDestructuring(node: TypeScriptASTNode): IntermediateRepresentation {
    return this.transformDestructuringAssignment({
      ...node,
      metadata: {
        ...node.metadata,
        destructuringType: 'object'
      }
    });
  }

  private transformArrayDestructuring(node: TypeScriptASTNode): IntermediateRepresentation {
    return this.transformDestructuringAssignment({
      ...node,
      metadata: {
        ...node.metadata,
        destructuringType: 'array'
      }
    });
  }

  private isStringMethod(methodName: string): boolean {
    const stringMethods = [
      'length', 'charAt', 'substring', 'substr', 'slice',
      'indexOf', 'lastIndexOf', 'toLowerCase', 'toUpperCase',
      'trim', 'replace', 'split', 'concat', 'includes',
      'startsWith', 'endsWith', 'repeat', 'padStart', 'padEnd'
    ];
    return stringMethods.includes(methodName);
  }

  private transformStringMethod(
    objectName: string,
    methodName: string,
    methodArgs: string[],
    node: TypeScriptASTNode
  ): IntermediateRepresentation {
    let igcseExpression = '';
    let igcseFunction = '';
    let returnType: IGCSEType = 'STRING';
    
    this.addWarning(
      `String method '${methodName}' converted to IGCSE string function`,
      'FEATURE_CONVERSION',
      'info',
      node.location?.line,
      node.location?.column
    );

    switch (methodName) {
      case 'length':
        igcseFunction = 'LENGTH';
        igcseExpression = `LENGTH(${objectName})`;
        returnType = 'INTEGER';
        break;
        
      case 'charAt':
        igcseFunction = 'MID';
        const charIndex = methodArgs[0] || '0';
        // Convert 0-based index to 1-based and get single character
        igcseExpression = `MID(${objectName}, ${charIndex} + 1, 1)`;
        returnType = 'CHAR';
        break;
        
      case 'substring':
      case 'substr':
      case 'slice':
        igcseFunction = 'SUBSTRING';
        const startIndex = methodArgs[0] || '0';
        const endIndex = methodArgs[1];
        
        if (endIndex) {
          // substring(start, end) -> SUBSTRING(string, start+1, end-start)
          if (methodName === 'substring') {
            igcseExpression = `SUBSTRING(${objectName}, ${startIndex} + 1, ${endIndex} - ${startIndex})`;
          } else {
            // substr(start, length) -> SUBSTRING(string, start+1, length)
            igcseExpression = `SUBSTRING(${objectName}, ${startIndex} + 1, ${endIndex})`;
          }
        } else {
          // substring(start) -> SUBSTRING(string, start+1, LENGTH(string) - start)
          igcseExpression = `SUBSTRING(${objectName}, ${startIndex} + 1, LENGTH(${objectName}) - ${startIndex})`;
        }
        break;
        
      case 'indexOf':
        igcseFunction = 'FIND';
        const searchString = methodArgs[0] || '""';
        igcseExpression = `FIND(${objectName}, ${searchString}) - 1`; // Convert to 0-based
        returnType = 'INTEGER';
        this.addWarning(
          'indexOf converted to FIND - result adjusted for 0-based indexing',
          'FEATURE_CONVERSION',
          'info',
          node.location?.line,
          node.location?.column
        );
        break;
        
      case 'toLowerCase':
        igcseFunction = 'LCASE';
        igcseExpression = `LCASE(${objectName})`;
        break;
        
      case 'toUpperCase':
        igcseFunction = 'UCASE';
        igcseExpression = `UCASE(${objectName})`;
        break;
        
      case 'concat':
        igcseFunction = 'CONCATENATION';
        const concatArg = methodArgs[0] || '""';
        igcseExpression = `${objectName} & ${concatArg}`;
        break;
        
      case 'replace':
        const searchValue = methodArgs[0] || '""';
        const replaceValue = methodArgs[1] || '""';
        igcseExpression = `REPLACE(${objectName}, ${searchValue}, ${replaceValue})`;
        this.addWarning(
          'replace method converted to REPLACE function - may need manual implementation',
          'FEATURE_CONVERSION',
          'warning',
          node.location?.line,
          node.location?.column
        );
        break;
        
      case 'includes':
      case 'startsWith':
      case 'endsWith':
        // These don't have direct IGCSE equivalents, convert to conditional expressions
        const includesArg = methodArgs[0] || '""';
        if (methodName === 'includes') {
          igcseExpression = `FIND(${objectName}, ${includesArg}) > 0`;
        } else if (methodName === 'startsWith') {
          igcseExpression = `LEFT(${objectName}, LENGTH(${includesArg})) = ${includesArg}`;
        } else { // endsWith
          igcseExpression = `RIGHT(${objectName}, LENGTH(${includesArg})) = ${includesArg}`;
        }
        returnType = 'BOOLEAN';
        this.addWarning(
          `${methodName} converted to conditional expression using IGCSE string functions`,
          'FEATURE_CONVERSION',
          'info',
          node.location?.line,
          node.location?.column
        );
        break;
        
      case 'trim':
        igcseExpression = `TRIM(${objectName})`;
        this.addWarning(
          'trim method converted to TRIM function - may need manual implementation',
          'FEATURE_CONVERSION',
          'warning',
          node.location?.line,
          node.location?.column
        );
        break;
        
      case 'split':
        const delimiter = methodArgs[0] || '""';
        igcseExpression = `SPLIT(${objectName}, ${delimiter})`;
        returnType = 'STRING'; // Should be array, but simplified
        this.addWarning(
          'split method converted to SPLIT function - returns array, consider manual implementation',
          'FEATURE_CONVERSION',
          'warning',
          node.location?.line,
          node.location?.column
        );
        break;
        
      default:
        igcseExpression = `${objectName}.${methodName}(${methodArgs.join(', ')})`;
        this.addWarning(
          `String method '${methodName}' has no direct IGCSE equivalent - manual conversion needed`,
          'FEATURE_CONVERSION',
          'warning',
          node.location?.line,
          node.location?.column
        );
        break;
    }

    return this.createIRNode(
      'expression',
      'string_method_converted',
      [],
      {
        originalObject: objectName,
        originalMethod: methodName,
        originalArguments: methodArgs,
        igcseFunction,
        igcseExpression,
        returnType,
        originalCall: `${objectName}.${methodName}(${methodArgs.join(', ')})`
      },
      node.location
    );
  }

  private generateFunctionDeclaration(
    name: string,
    parameters: Array<{ name: string; type: IGCSEType; isArray?: boolean; isOptional?: boolean }>,
    returnType?: IGCSEType,
    isProcedure: boolean = true
  ): string {
    const paramList = parameters.map(p => {
      const paramType = p.isArray ? `ARRAY[1:SIZE] OF ${p.type}` : p.type;
      return `${p.name} : ${paramType}`;
    }).join(', ');

    if (isProcedure) {
      return `PROCEDURE ${name}(${paramList})`;
    } else {
      return `FUNCTION ${name}(${paramList}) RETURNS ${returnType}`;
    }
  }
}

export default TypeScriptASTTransformer;