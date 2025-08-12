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
      
      // Handle partial parse results
      if (ast.metadata?.partialParse) {
        this.addWarning(
          'Processing partially parsed AST. Some features may not be converted correctly.',
          ErrorCodes.PARTIAL_PARSE,
          'warning'
        );
      }
      
      const result = this.transformNode(ast);
      return this.createTransformResult(result);
    } catch (error) {
      // Create a partial result with whatever we could transform
      const partialResult = this.createIRNode('program', 'partial_program', [], {
        transformError: true,
        errorMessage: (error as Error).message,
        originalAST: ast
      });
      
      return this.handleTransformError(error as Error, partialResult);
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
      case 'interface_declaration':
        return this.transformInterfaceDeclaration(node);
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
    const igcseParameters = parameters.map((param: any) => {
      const convertedType = this.variableTransformer.convertTypeScriptTypeToIGCSE(param.type || 'any');
      const isConvertedArray = convertedType.includes('ARRAY[') && convertedType.includes('] OF ');
      
      return {
        name: param.name.replace('?', ''),
        type: convertedType,
        isArray: !isConvertedArray && (param.type || '').includes('[]'),
        isOptional: param.optional || param.name.includes('?')
      };
    });

    // Handle Promise return types
    let processedReturnType = returnType;
    if (returnType && returnType.startsWith('Promise<')) {
      const promiseMatch = returnType.match(/^Promise<(.+)>$/);
      if (promiseMatch) {
        processedReturnType = promiseMatch[1];
        // Add warning about Promise conversion
        this.addWarning(
          `Promise<${promiseMatch[1]}> return type converted to ${promiseMatch[1]}`,
          'FEATURE_CONVERSION',
          'info',
          node.location?.line,
          node.location?.column
        );
      }
    }

    // Determine if it's a procedure or function
    const isProcedure = !processedReturnType || processedReturnType === 'void';
    const igcseReturnType = isProcedure ? undefined : this.variableTransformer.convertTypeScriptTypeToIGCSE(processedReturnType);

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
      
      // Add async function comment to metadata
      metadata.asyncComment = '// Async function - handles asynchronous operations';
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
    const isAsync = node.metadata?.isAsync || false;

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
    const igcseParameters = parameters.map((param: any) => {
      const convertedType = this.variableTransformer.convertTypeScriptTypeToIGCSE(param.type || 'any');
      const isConvertedArray = convertedType.includes('ARRAY[') && convertedType.includes('] OF ');
      
      return {
        name: param.name.replace('?', ''),
        type: convertedType,
        isArray: !isConvertedArray && (param.type || '').includes('[]'),
        isOptional: param.optional || param.name.includes('?')
      };
    });

    // Handle Promise return types
    let processedReturnType = returnType;
    if (returnType && returnType.startsWith('Promise<')) {
      const promiseMatch = returnType.match(/^Promise<(.+)>$/);
      if (promiseMatch) {
        processedReturnType = promiseMatch[1];
        // Add warning about Promise conversion
        this.addWarning(
          `Promise<${promiseMatch[1]}> return type converted to ${promiseMatch[1]}`,
          'FEATURE_CONVERSION',
          'info',
          node.location?.line,
          node.location?.column
        );
      }
    }

    const isProcedure = !processedReturnType || processedReturnType === 'void';
    const igcseReturnType = isProcedure ? undefined : this.variableTransformer.convertTypeScriptTypeToIGCSE(processedReturnType);

    const children = node.children.map(child => this.transformNode(child));

    const metadata: Record<string, any> = {
      functionName,
      parameters: igcseParameters,
      returnType: igcseReturnType,
      isProcedure,
      isAsync,
      isArrowFunction: true,
      igcseDeclaration: this.generateFunctionDeclaration(functionName, igcseParameters, igcseReturnType, isProcedure)
    };

    if (isAsync) {
      this.addWarning(
        `Async arrow function converted to regular ${isProcedure ? 'procedure' : 'function'}`,
        'FEATURE_CONVERSION',
        'info',
        node.location?.line,
        node.location?.column
      );
      
      // Add async function comment to metadata
      metadata.asyncComment = '// Async function - handles asynchronous operations';
    }

    return this.createIRNode(
      'function_declaration',
      'arrow_function_converted',
      children,
      metadata,
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
    
    // Only convert for loop bounds if the loop is iterating over arrays
    const isArrayLoop = endCondition.includes('.length') || 
                       endCondition.includes('LENGTH(') ||
                       (this.arrayIndexContext.arrayNames && 
                        this.arrayIndexContext.arrayNames.some(arrayName => endCondition.includes(arrayName)));
    
    let boundsConversion;
    if (isArrayLoop) {
      // Convert for loop bounds using array indexing converter
      boundsConversion = ArrayIndexingConverter.convertForLoopBounds(
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
    } else {
      // For non-array loops, use the original bounds but still parse them properly
      const { ForLoopParser } = require('../utils/for-loop-parser');
      const endResult = ForLoopParser.parseEndCondition(endCondition, variable);
      
      boundsConversion = {
        startValue: startValue, // Keep original start value
        endValue: endResult.endValue,
        isDecrement: endResult.isDecrement,
        warnings: endResult.warnings
      };
      
      // Add warnings for bounds conversion
      boundsConversion.warnings.forEach((warning: string) => {
        this.addWarning(warning, 'FOR_LOOP_CONVERSION', 'info', node.location?.line, node.location?.column);
      });
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
        isDecrement: forLoopData.isDecrement,
        body,
        originalStartValue: startValue,
        originalEndCondition: endCondition
      },
      node.location
    );
  }

  private transformSwitchStatement(node: TypeScriptASTNode): IntermediateRepresentation {
    // Extract switch components from metadata
    let expression = node.metadata?.expression || 'value';
    const cases = node.metadata?.cases || [];
    const hasDefault = node.metadata?.hasDefault || false;
    
    // Convert boolean literals in switch expression
    if (expression === 'true') {
      expression = 'TRUE';
    } else if (expression === 'false') {
      expression = 'FALSE';
    }
    
    // Create case statement nodes
    const caseNodes: IntermediateRepresentation[] = [];
    
    for (const caseInfo of cases) {
      if (caseInfo.isDefault) {
        // Create default case node
        const defaultStatements = caseInfo.statements.map((stmt: string) => {
          // Skip break statements
          if (stmt.trim() === 'break;') {
            return null;
          }
          
          // Handle console.log statements
          if (stmt.includes('console.log(')) {
            const match = stmt.match(/console\.log\((.+)\)/);
            if (match) {
              const argument = match[1].trim();
              return this.createIRNode(
                'statement',
                'output_statement',
                [],
                { 
                  expressions: [argument],
                  igcseStatement: `OUTPUT ${argument}`
                },
                node.location
              );
            }
          }
          
          // For other statements, create a generic statement node
          return this.createIRNode(
            'statement',
            'expression_statement',
            [],
            { originalStatement: stmt },
            node.location
          );
        }).filter((stmt: any) => stmt !== null);
        
        caseNodes.push(this.createIRNode(
          'control_structure',
          'default_case',
          defaultStatements,
          {},
          node.location
        ));
      } else {
        // Create case statement node
        const caseStatements = caseInfo.statements.map((stmt: string) => {
          // Skip break statements
          if (stmt.trim() === 'break;') {
            return null;
          }
          
          // Handle console.log statements
          if (stmt.includes('console.log(')) {
            const match = stmt.match(/console\.log\((.+)\)/);
            if (match) {
              const argument = match[1].trim();
              return this.createIRNode(
                'statement',
                'output_statement',
                [],
                { 
                  expressions: [argument],
                  igcseStatement: `OUTPUT ${argument}`
                },
                node.location
              );
            }
          }
          
          // For other statements, create a generic statement node
          return this.createIRNode(
            'statement',
            'expression_statement',
            [],
            { originalStatement: stmt },
            node.location
          );
        }).filter((stmt: any) => stmt !== null);
        
        caseNodes.push(this.createIRNode(
          'control_structure',
          'case_statement',
          caseStatements,
          { value: caseInfo.value },
          node.location
        ));
      }
    }
    
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
      caseNodes,
      {
        expression,
        cases: cases.map((c: any) => c.value),
        hasDefault
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

  private transformInterfaceDeclaration(node: TypeScriptASTNode): IntermediateRepresentation {
    const interfaceName = node.value as string;
    const properties = node.metadata?.properties || [];
    const typeParameters = node.metadata?.typeParameters || [];
    const heritage = node.metadata?.heritage || [];
    const isGeneric = node.metadata?.isGeneric || false;
    
    // Generate property information for comments
    const propertyComments: string[] = [];
    const methodComments: string[] = [];
    const indexSignatures: string[] = [];
    
    for (const prop of properties) {
      if (prop.isMethod) {
        // Handle method signatures - use simplified types for interface comments
        const paramStr = prop.parameters.map((p: any) => `${p.name} : ${this.convertTypeForInterfaceComment(p.type)}`).join(', ');
        
        let returnTypeStr = '';
        if (prop.returnType !== 'void') {
          let returnType = prop.returnType;
          
          // Handle array return types specially
          if (returnType.includes('[]') || returnType.includes('Array<')) {
            let baseType = returnType;
            if (baseType.includes('[]')) {
              baseType = baseType.replace(/\[\]/g, '');
            } else if (baseType.includes('Array<')) {
              const arrayMatch = baseType.match(/Array<(.+)>$/);
              if (arrayMatch) {
                baseType = arrayMatch[1];
              }
            }
            const convertedBaseType = this.convertTypeForInterfaceComment(baseType);
            
            // Only show array syntax for generic type parameters, simplify concrete types
            if (this.isGenericTypeParameter(baseType)) {
              returnTypeStr = ` RETURNS ARRAY[1:SIZE] OF ${convertedBaseType}`;
            } else {
              returnTypeStr = ` RETURNS ${convertedBaseType}`;
            }
          } else {
            returnTypeStr = ` RETURNS ${this.convertTypeForInterfaceComment(returnType)}`;
          }
        }
        
        methodComments.push(`${prop.name}(${paramStr})${returnTypeStr}`);
      } else if (prop.isIndexSignature) {
        // Handle index signatures
        const keyType = this.convertTypeForInterfaceComment(prop.keyType || 'string');
        const valueType = this.convertTypeForInterfaceComment(prop.type);
        indexSignatures.push(`[${keyType}]: ${valueType}`);
      } else {
        // Handle property signatures - use simplified types for interface comments
        let propType = this.convertTypeForInterfaceComment(prop.type);
        const isOptional = prop.optional || prop.name.includes('?');
        const isReadonly = prop.readonly || false;
        
        // Handle union types more descriptively
        if (prop.type.includes('|')) {
          const unionTypes = prop.type.split('|').map((t: string) => t.trim());
          const igcseTypes = unionTypes.map((t: string) => this.convertTypeForInterfaceComment(t));
          const uniqueTypes = [...new Set(igcseTypes)];
          if (uniqueTypes.length > 1) {
            propType = uniqueTypes.join(' | ');
          }
        }
        
        // Handle function types
        if (prop.type.includes('=>')) {
          const returnType = prop.type.split('=>')[1].trim();
          const igcseReturnType = this.convertTypeForInterfaceComment(returnType);
          propType = `FUNCTION RETURNS ${igcseReturnType}`;
        }
        
        // For interface comments, handle arrays specially
        let finalType = propType;
        if (prop.type.includes('[]') || prop.type.includes('Array<')) {
          let baseType = prop.type;
          if (baseType.includes('[]')) {
            baseType = baseType.replace(/\[\]/g, '');
          } else if (baseType.includes('Array<')) {
            const arrayMatch = baseType.match(/Array<(.+)>$/);
            if (arrayMatch) {
              baseType = arrayMatch[1];
            }
          }
          const convertedBaseType = this.convertTypeForInterfaceComment(baseType);
          
          // For properties, always show array syntax
          finalType = `ARRAY[1:SIZE] OF ${convertedBaseType}`;
        }
        
        // Add modifiers to property description
        let propDescription = `${prop.name}`;
        if (isOptional) propDescription += '?';
        if (isReadonly) propDescription = `readonly ${propDescription}`;
        propDescription += ` (${finalType})`;
        
        propertyComments.push(propDescription);
      }
    }
    
    // Generate interface comment
    let interfaceComment = '';
    if (isGeneric) {
      const typeParamStr = typeParameters.map((tp: any) => {
        if (tp.constraint) {
          return `${tp.name} extends ${tp.constraint}`;
        }
        return tp.name;
      }).join(', ');
      interfaceComment = `// Generic interface: ${interfaceName}<${typeParamStr}>`;
      
      // Add type parameter explanation
      if (typeParameters.length > 0) {
        const typeExplanations = typeParameters.map((tp: any) => {
          if (tp.constraint) {
            // Extract property name from constraint like "{ id: number }" -> "id"
            const constraintText = tp.constraint;
            const propertyMatch = constraintText.match(/{\s*(\w+)\s*:/);
            if (propertyMatch) {
              return `// Type parameter ${tp.name} represents any type with ${propertyMatch[1]} property`;
            }
            return `// Type parameter ${tp.name} represents any type with ${constraintText} property`;
          }
          return `// Type parameter ${tp.name} represents any type`;
        });
        interfaceComment += '\n' + typeExplanations.join('\n');
      }
    } else {
      interfaceComment = `// Interface: ${interfaceName}`;
    }
    
    // Add inheritance information
    if (heritage.length > 0) {
      interfaceComment += `\n// Extends: ${heritage.join(', ')}`;
    }
    
    // Add index signature information
    if (indexSignatures.length > 0) {
      interfaceComment += `\n// Index signatures: ${indexSignatures.join(', ')}`;
    }
    
    // Add property information
    if (propertyComments.length > 0) {
      interfaceComment += `\n// Properties: ${propertyComments.join(', ')}`;
    }
    
    // Add method information
    if (methodComments.length > 0) {
      interfaceComment += `\n// Methods: ${methodComments.join(', ')}`;
    }
    
    // Add note about empty interfaces
    if (propertyComments.length === 0 && methodComments.length === 0 && indexSignatures.length === 0) {
      interfaceComment += `\n// Empty interface - can be extended by other interfaces`;
    }
    
    this.addWarning(
      `Interface '${interfaceName}' converted to descriptive comments`,
      'FEATURE_CONVERSION',
      'info',
      node.location?.line,
      node.location?.column
    );
    
    return this.createIRNode(
      'interface_declaration',
      'interface_comment',
      [],
      {
        interfaceName,
        properties,
        typeParameters,
        heritage,
        isGeneric,
        interfaceComment,
        propertyComments,
        methodComments,
        indexSignatures
      },
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

  private convertForLoopToIGCSE(variable: string, startValue: string, endValue: string, incrementExpression: string): {
    variable: string;
    startValue: string;
    endValue: string;
    stepValue?: string;
    isDecrement: boolean;
  } {
    // Import ForLoopParser dynamically to avoid circular imports
    const { ForLoopParser } = require('../utils/for-loop-parser');
    
    // Parse the increment expression to get step value and direction
    const incrementResult = ForLoopParser.parseIncrementExpression(incrementExpression, variable);
    
    return {
      variable,
      startValue,
      endValue, // Use the converted end value directly
      stepValue: incrementResult.stepValue !== "1" ? incrementResult.stepValue : undefined,
      isDecrement: incrementResult.isDecrement
    };
  }

  private transformClassDeclaration(node: TypeScriptASTNode): IntermediateRepresentation {
    const className = node.metadata?.className as string;
    const heritage = node.metadata?.heritage as string[] || [];
    const typeParameters = node.metadata?.typeParameters || [];
    const isGeneric = node.metadata?.isGeneric || false;
    const extendsClasses = node.metadata?.extends || [];
    const implementsInterfaces = node.metadata?.implements || [];
    
    this.addWarning(
      `Class '${className}' converted to procedural equivalents with comments`,
      'FEATURE_CONVERSION',
      'info',
      node.location?.line,
      node.location?.column
    );

    // Transform child nodes (methods and properties)
    const children = node.children.map(child => this.transformNode(child));

    // Generate class comment with generics support
    let classComment = '';
    if (isGeneric) {
      const typeParamStr = typeParameters.map((tp: any) => {
        if (tp.constraint) {
          return `${tp.name} extends ${tp.constraint}`;
        }
        return tp.name;
      }).join(', ');
      classComment = `// Generic class: ${className}<${typeParamStr}>`;
      
      // Add type parameter explanation
      if (typeParameters.length > 0) {
        const typeExplanations = typeParameters.map((tp: any) => {
          if (tp.constraint) {
            // Extract property name from constraint like "{ id: number }" -> "id"
            const constraintText = tp.constraint;
            const propertyMatch = constraintText.match(/{\s*(\w+)\s*:/);
            if (propertyMatch) {
              return `// Type parameter ${tp.name} represents any type with ${propertyMatch[1]} property`;
            }
            return `// Type parameter ${tp.name} represents any type with ${constraintText} property`;
          }
          return `// Type parameter ${tp.name} represents any type`;
        });
        classComment += '\n' + typeExplanations.join('\n');
      }
    } else {
      classComment = `// ${className}`;
    }

    // Add inheritance information
    if (extendsClasses.length > 0) {
      classComment += `\n// ${className} extends ${extendsClasses.join(', ')}`;
    }
    
    // Add implementation information
    if (implementsInterfaces.length > 0) {
      classComment += `\n// ${className} implements ${implementsInterfaces.join(', ')}`;
    }

    return this.createIRNode(
      'declaration',
      'class_converted',
      children,
      {
        className,
        heritage,
        typeParameters,
        isGeneric,
        extendsClasses,
        implementsInterfaces,
        classComment,
        inheritanceComment: classComment
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
    const igcseParameters = parameters.map((param: any) => {
      const convertedType = this.variableTransformer.convertTypeScriptTypeToIGCSE(param.type || 'any');
      const isConvertedArray = convertedType.includes('ARRAY[') && convertedType.includes('] OF ');
      
      return {
        name: param.name.replace('?', ''),
        type: convertedType,
        isArray: !isConvertedArray && (param.type || '').includes('[]'),
        isOptional: param.optional || param.name.includes('?')
      };
    });

    // Handle Promise return types
    let processedReturnType = returnType;
    if (returnType && returnType.startsWith('Promise<')) {
      const promiseMatch = returnType.match(/^Promise<(.+)>$/);
      if (promiseMatch) {
        processedReturnType = promiseMatch[1];
        // Add warning about Promise conversion
        this.addWarning(
          `Promise<${promiseMatch[1]}> return type converted to ${promiseMatch[1]}`,
          'FEATURE_CONVERSION',
          'info',
          node.location?.line,
          node.location?.column
        );
      }
    }

    // Determine if it's a procedure or function
    const isProcedure = !processedReturnType || processedReturnType === 'void';
    const igcseReturnType = isProcedure ? undefined : this.variableTransformer.convertTypeScriptTypeToIGCSE(processedReturnType);

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
      
      // Add async method comment to metadata
      metadata.asyncComment = '// Async method - handles asynchronous operations';
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

  /**
   * Convert TypeScript types to simplified IGCSE types for interface comments
   * This is different from the full type conversion as it simplifies array types
   */
  private convertTypeForInterfaceComment(tsType: string): string {
    if (!tsType) return 'STRING';

    // Remove optional markers and whitespace
    let baseType = tsType.replace(/\?/g, '').trim();
    
    // Handle Array<T> generic syntax - extract base type
    if (baseType.includes('Array<')) {
      const arrayMatch = baseType.match(/Array<(.+)>$/);
      if (arrayMatch) {
        baseType = arrayMatch[1];
      }
    } else if (baseType.includes('[]')) {
      // Handle T[] syntax - extract base type
      baseType = baseType.replace(/\[\]/g, '');
    }
    
    // Handle Promise types - extract inner type
    if (baseType.startsWith('Promise<')) {
      const promiseMatch = baseType.match(/^Promise<(.+)>$/);
      if (promiseMatch) {
        baseType = promiseMatch[1];
      }
    }
    
    // Handle other generic types by extracting the inner type
    const genericMatch = baseType.match(/^[A-Za-z]+<(.+)>$/);
    if (genericMatch) {
      baseType = genericMatch[1];
    }

    // Handle union types - take the first non-null/undefined type as primary
    if (baseType.includes('|')) {
      const unionTypes = baseType.split('|').map(t => t.trim());
      const validTypes = unionTypes.filter(t => t !== 'null' && t !== 'undefined');
      baseType = validTypes.length > 0 ? validTypes[0] : unionTypes[0];
    }

    // Handle literal types (e.g., "active" | "inactive")
    if (baseType.startsWith('"') && baseType.endsWith('"')) {
      return 'STRING';
    }

    // Handle tuple types [string, number] -> take first type
    if (baseType.startsWith('[') && baseType.endsWith(']')) {
      const tupleContent = baseType.slice(1, -1);
      const firstType = tupleContent.split(',')[0].trim();
      baseType = firstType;
    }

    // Handle function types (x: number) => string -> return type
    if (baseType.includes('=>')) {
      const returnType = baseType.split('=>')[1].trim();
      baseType = returnType;
    }

    // Convert to IGCSE types - simplified for interface comments
    switch (baseType.toLowerCase()) {
      case 'number':
        return 'REAL';
      case 'string':
        return 'STRING';
      case 'boolean':
        return 'BOOLEAN';
      case 'char':
        return 'CHAR';
      case 'int':
      case 'integer':
        return 'INTEGER';
      case 'any':
      case 'unknown':
      case 'void':
        return 'STRING';
      default:
        // Check if this is a generic type parameter (single uppercase letter or short PascalCase)
        if (this.isGenericTypeParameter(baseType)) {
          // This looks like a generic type parameter, preserve it
          return baseType;
        }
        // For other custom types in interface comments, convert to STRING
        return 'STRING';
    }
  }

  /**
   * Check if a type name is a generic type parameter (like T, U, K, V, etc.)
   */
  private isGenericTypeParameter(typeName: string): boolean {
    // Generic type parameters are typically:
    // - Single uppercase letters (T, U, K, V)
    // - Short PascalCase names (TKey, TValue)
    // - But not common type names like User, String, etc.
    return /^[A-Z][a-zA-Z]*$/.test(typeName) && 
           typeName.length <= 10 && 
           !['String', 'Number', 'Boolean', 'Object', 'Array', 'Function', 'User', 'Admin', 'Config'].includes(typeName);
  }
}

export default TypeScriptASTTransformer;