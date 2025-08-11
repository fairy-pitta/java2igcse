// Java AST Transformer - converts Java AST to Intermediate Representation

import {
  IntermediateRepresentation,
  TransformResult,
  JavaASTNode,
  IGCSEType,
  ConversionOptions
} from '../index';
import { BaseASTTransformer } from './base-transformer';
import { VariableDeclarationTransformer } from './variable-declaration-transformer';
import { ErrorCodes } from '../errors';
import { ArrayIndexingConverter, ArrayIndexContext } from '../utils/array-indexing-converter';

export class JavaASTTransformer extends BaseASTTransformer<JavaASTNode> {
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

  transform(ast: JavaASTNode): TransformResult<IntermediateRepresentation> {
    try {
      this.resetWarnings();
      const result = this.transformNode(ast);
      return this.createTransformResult(result);
    } catch (error) {
      return this.handleTransformError(error as Error);
    }
  }

  private transformNode(node: JavaASTNode): IntermediateRepresentation {
    if (!node) {
      return this.createIRNode('program', 'empty_program');
    }

    switch (node.type) {
      case 'program':
        return this.transformProgram(node);
      case 'variable_declaration':
        return this.transformVariableDeclaration(node);
      case 'type':
        return this.transformType(node);
      case 'identifier':
        return this.transformIdentifier(node);
      case 'literal':
        return this.transformLiteral(node);
      case 'array_literal':
        return this.transformArrayLiteral(node);
      case 'new_expression':
        return this.transformNewExpression(node);
      case 'method_declaration':
        return this.transformMethodDeclaration(node);
      case 'method_call':
        return this.transformMethodCall(node);
      case 'expression_statement':
        return this.transformExpressionStatement(node);
      case 'if_statement':
        return this.transformIfStatement(node);
      case 'while_statement':
        return this.transformWhileStatement(node);
      case 'for_statement':
        return this.transformForStatement(node);
      case 'switch_statement':
        return this.transformSwitchStatement(node);
      case 'case_statement':
        return this.transformCaseStatement(node);
      case 'default_case':
        return this.transformDefaultCase(node);
      case 'assignment_statement':
        return this.transformAssignmentStatement(node);
      case 'expression':
        return this.transformExpression(node);
      case 'condition':
        return this.transformCondition(node);
      case 'block':
        return this.transformBlock(node);
      case 'class_declaration':
        return this.transformClassDeclaration(node);
      case 'parameter':
        return this.transformParameter(node);
      case 'return_statement':
        return this.transformReturnStatement(node);
      default:
        this.addWarning(
          `Unsupported Java AST node type: ${node.type}`,
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

  private transformProgram(node: JavaASTNode): IntermediateRepresentation {
    const children = node.children.map(child => this.transformNode(child));
    
    return this.createIRNode(
      'program',
      'java_program',
      children,
      {
        language: 'java',
        totalStatements: children.length
      },
      node.location
    );
  }

  private transformVariableDeclaration(node: JavaASTNode): IntermediateRepresentation {
    if (node.children.length < 2) {
      this.addWarning(
        'Incomplete variable declaration',
        ErrorCodes.PARSE_ERROR,
        'warning',
        node.location?.line,
        node.location?.column
      );
      return this.createIRNode('declaration', 'invalid_variable_declaration', [], {}, node.location);
    }

    const typeNode = node.children[0];
    const identifierNode = node.children[1];
    const valueNode = node.children.length > 2 ? node.children[2] : null;

    const javaType = typeNode.value as string;
    const variableName = identifierNode.value as string;
    const initialValue = valueNode?.value as string;
    const isStatic = node.metadata?.isStatic || false;
    const isFinal = node.metadata?.isFinal || false;
    const visibility = node.metadata?.visibility || 'public';

    // Apply array indexing conversion to initialValue if present
    let convertedInitialValue = initialValue;
    if (initialValue) {
      const conversionResult = ArrayIndexingConverter.convertArrayAccess(initialValue, this.arrayIndexContext);
      convertedInitialValue = conversionResult.convertedExpression;
      
      // Add warnings for array indexing conversion
      conversionResult.warnings.forEach(warning => {
        this.addWarning(warning, 'ARRAY_INDEX_CONVERSION', 'info', node.location?.line, node.location?.column);
      });
    }

    // Use specialized variable declaration transformer
    const result = this.variableTransformer.transformJavaVariableDeclaration(
      javaType,
      variableName,
      convertedInitialValue,
      typeNode.metadata,
      node.location
    );

    // Add any warnings from the variable transformer
    result.warnings.forEach(warning => {
      this.addWarning(warning, ErrorCodes.TYPE_CONVERSION_ERROR, 'warning', node.location?.line, node.location?.column);
    });

    // Add static variable warning if needed
    if (isStatic) {
      this.addWarning(
        `Static variable '${variableName}' converted to regular variable`,
        'FEATURE_CONVERSION',
        'info',
        node.location?.line,
        node.location?.column
      );
      
      // Add static comment to metadata for generator
      result.ir.metadata.staticComment = `// Static variable`;
      result.ir.metadata.isStatic = true;
    }

    // Add final/constant warning if needed
    if (isFinal) {
      this.addWarning(
        `Final variable '${variableName}' converted to regular variable`,
        'FEATURE_CONVERSION',
        'info',
        node.location?.line,
        node.location?.column
      );
      
      result.ir.metadata.isFinal = true;
      result.ir.metadata.finalComment = `// Constant variable`;
    }

    // Transform child nodes and add them to the IR
    const children: IntermediateRepresentation[] = [
      this.transformNode(typeNode),
      this.transformNode(identifierNode)
    ];

    if (valueNode) {
      children.push(this.transformNode(valueNode));
    }

    // Track array names for indexing conversion
    if (result.ir.metadata.isArray) {
      if (!this.arrayIndexContext.arrayNames?.includes(variableName)) {
        this.arrayIndexContext.arrayNames?.push(variableName);
      }
    }

    // Update the IR with transformed children and metadata
    result.ir.children = children;
    result.ir.metadata.visibility = visibility;

    return result.ir;
  }

  private transformType(node: JavaASTNode): IntermediateRepresentation {
    const javaType = node.value as string;
    const igcseType = this.convertJavaTypeToIGCSE(javaType);
    const isArray = node.metadata?.isArray || false;
    const arrayDimensions = node.metadata?.arrayDimensions || [];

    return this.createIRNode(
      'declaration',
      'type_reference',
      [],
      {
        javaType,
        igcseType,
        isArray,
        arrayDimensions
      },
      node.location
    );
  }

  private transformIdentifier(node: JavaASTNode): IntermediateRepresentation {
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

  private transformLiteral(node: JavaASTNode): IntermediateRepresentation {
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

  private transformArrayLiteral(node: JavaASTNode): IntermediateRepresentation {
    const value = node.value as string;
    
    return this.createIRNode(
      'literal',
      'array_literal',
      [],
      {
        originalValue: value,
        igcseValue: value, // Array literals will need special handling in generator
        literalType: 'array'
      },
      node.location
    );
  }

  private transformNewExpression(node: JavaASTNode): IntermediateRepresentation {
    const expression = node.value as string;
    
    // Check if it's an array instantiation
    const isArrayNew = expression.includes('[') && expression.includes(']');
    
    return this.createIRNode(
      'expression',
      'new_expression',
      [],
      {
        originalExpression: expression,
        isArrayInstantiation: isArrayNew,
        requiresComment: true // New expressions often need explanatory comments in IGCSE
      },
      node.location
    );
  }

  private transformMethodDeclaration(node: JavaASTNode): IntermediateRepresentation {
    const methodName = node.metadata?.methodName as string;
    const returnType = node.metadata?.returnType as string;
    const igcseReturnType = node.metadata?.igcseReturnType as IGCSEType;
    const isProcedure = node.metadata?.isProcedure as boolean;
    const isStatic = node.metadata?.isStatic as boolean;
    const isConstructor = node.metadata?.isConstructor as boolean;
    const visibility = node.metadata?.visibility as string;
    const parameters = node.metadata?.parameters || [];

    // Declare function in context
    this.declareFunction(methodName, parameters, igcseReturnType, isStatic, visibility as 'public' | 'private' | 'protected');

    // Transform child nodes
    const children = node.children.map(child => this.transformNode(child));

    const metadata: Record<string, any> = {
      methodName,
      returnType: igcseReturnType, // Use IGCSE return type instead of Java return type
      igcseReturnType,
      isProcedure,
      isStatic,
      isConstructor,
      visibility,
      parameters,
      igcseDeclaration: this.generateMethodDeclaration(methodName, parameters, igcseReturnType, isProcedure)
    };

    // Add constructor comment if needed
    if (isConstructor) {
      this.addWarning(
        `Constructor '${methodName}' converted to procedure`,
        'FEATURE_CONVERSION',
        'info',
        node.location?.line,
        node.location?.column
      );
    }

    // Add static method comment if needed
    if (isStatic) {
      this.addWarning(
        `Static method '${methodName}' converted to ${isProcedure ? 'procedure' : 'function'}`,
        'FEATURE_CONVERSION',
        'info',
        node.location?.line,
        node.location?.column
      );
      
      // Add static comment to metadata for generator
      metadata.staticComment = `// Static method`;
    }

    return this.createIRNode(
      'function_declaration',
      isProcedure ? 'procedure_declaration' : 'function_declaration',
      children,
      metadata,
      node.location
    );
  }

  private transformMethodCall(node: JavaASTNode): IntermediateRepresentation {
    const methodName = node.metadata?.methodName as string;
    const objectName = node.metadata?.objectName as string;
    const methodArgs = node.metadata?.arguments as string[] || [];
    
    // Check for System.out.println() calls
    if (objectName === 'System.out' && (methodName === 'println' || methodName === 'print')) {
      return this.createOutputStatement(methodArgs, node);
    }
    
    // Check for other common output methods
    if (methodName === 'println' || methodName === 'print') {
      return this.createOutputStatement(methodArgs, node);
    }
    
    // Check for string method calls
    if (this.isJavaStringMethod(methodName)) {
      return this.transformJavaStringMethod(objectName, methodName, methodArgs, node);
    }
    
    // For other method calls, create a generic method call IR
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

  private transformExpressionStatement(node: JavaASTNode): IntermediateRepresentation {
    // Check if this is an increment/decrement statement
    if (node.metadata?.operator && (node.metadata.operator === '++' || node.metadata.operator === '--')) {
      const variable = node.metadata.variable as string;
      const operator = node.metadata.operator as string;
      const isIncrement = operator === '++';
      
      return this.createIRNode(
        'statement',
        'assignment_statement',
        [],
        {
          variable,
          expression: isIncrement ? `${variable} + 1` : `${variable} - 1`,
          originalExpression: `${variable}${operator}`,
          isIncrement,
          isDecrement: !isIncrement
        },
        node.location
      );
    }
    
    // Expression statements are typically method calls or assignments wrapped in a statement
    if (node.children.length > 0) {
      const expression = this.transformNode(node.children[0]);
      
      // If the expression is a method call that was converted to an output statement,
      // wrap it as a statement
      if (expression.kind === 'output_statement') {
        return this.createIRNode(
          'statement',
          'output_statement',
          [],
          expression.metadata,
          node.location
        );
      }
      
      return expression;
    }
    
    return this.createIRNode('statement', 'empty_statement', [], {}, node.location);
  }

  private createOutputStatement(methodArgs: string[], node: JavaASTNode): IntermediateRepresentation {
    // Convert arguments to expressions for OUTPUT statement
    const expressions: string[] = [];
    
    for (const arg of methodArgs) {
      // Handle string concatenation first (before checking for string literals)
      if (arg.includes('+')) {
        // Split by + and handle each part
        const parts = arg.split('+').map(part => part.trim());
        for (const part of parts) {
          if (part.startsWith('"') && part.endsWith('"')) {
            expressions.push(part);
          } else if (part) { // Only add non-empty parts
            expressions.push(part); // Variable reference
          }
        }
      }
      // Handle string literals
      else if (arg.startsWith('"') && arg.endsWith('"')) {
        expressions.push(arg);
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
        language: 'java'
      },
      node.location
    );
  }

  private transformIfStatement(node: JavaASTNode): IntermediateRepresentation {
    const children = node.children.map(child => this.transformNode(child));
    
    // Extract condition and blocks
    const condition = children[0]; // condition node
    const thenBlock = children[1]; // then block
    const elseBlock = children.length > 2 ? children[2] : null; // else block (optional)
    
    const hasElse = node.metadata?.hasElse || false;
    const isElseIf = node.metadata?.isElseIf || false;
    
    // Apply array indexing conversion to the condition
    let conditionText = condition.metadata?.igcseCondition || condition.metadata?.value || '';
    const conversionResult = ArrayIndexingConverter.convertArrayAccess(conditionText, this.arrayIndexContext);
    
    // Add warnings for array indexing conversion in conditions
    conversionResult.warnings.forEach(warning => {
      this.addWarning(warning, 'ARRAY_INDEX_CONVERSION', 'info', node.location?.line, node.location?.column);
    });
    
    return this.createIRNode(
      'control_structure',
      'if_statement',
      children,
      {
        condition: conversionResult.convertedExpression,
        hasElse,
        isElseIf,
        thenBlock,
        elseBlock
      },
      node.location
    );
  }

  private transformWhileStatement(node: JavaASTNode): IntermediateRepresentation {
    const children = node.children.map(child => this.transformNode(child));
    
    // Extract condition and body
    const condition = children[0]; // condition node
    const body = children[1]; // body block
    
    return this.createIRNode(
      'control_structure',
      'while_loop',
      children,
      {
        condition: condition.metadata?.igcseCondition || condition.metadata?.value,
        body
      },
      node.location
    );
  }

  private transformForStatement(node: JavaASTNode): IntermediateRepresentation {
    // Transform children but skip condition and increment nodes as they're handled via metadata
    const children: IntermediateRepresentation[] = [];
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child.type === 'for_condition' || child.type === 'for_increment') {
        // Skip these nodes - they're handled via metadata
        continue;
      }
      children.push(this.transformNode(child));
    }
    
    // Extract for loop components
    const initialization = children[0]; // initialization node
    const body = children[1]; // body block (condition and increment are skipped)
    
    // Parse for loop metadata
    const variable = node.metadata?.variable || 'i';
    const startValue = node.metadata?.startValue || '0';
    const endCondition = node.metadata?.endCondition || '';
    const incrementExpression = node.metadata?.incrementExpression || '';
    
    // Track zero-based variables for array indexing conversion
    // Note: After conversion, the loop variable will be 1-based in IGCSE
    if (startValue === '0') {
      // Original Java loop starts from 0, but after conversion it will start from 1
      // So we track it as originally zero-based but will become one-based
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

  private convertForLoopToIGCSE(variable: string, startValue: string, endCondition: string, incrementExpression: string): {
    variable: string;
    startValue: string;
    endValue: string;
    stepValue: number;
  } {
    // The startValue and endCondition have already been processed by ArrayIndexingConverter
    // so we just need to determine the step value and format appropriately
    
    let stepValue = 1;
    
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
      endValue: endCondition, // Use the converted end condition directly
      stepValue
    };
  }

  private transformSwitchStatement(node: JavaASTNode): IntermediateRepresentation {
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

  private transformCaseStatement(node: JavaASTNode): IntermediateRepresentation {
    const children = node.children.map(child => this.transformNode(child));
    const caseValue = node.metadata?.value || 'unknown';
    
    return this.createIRNode(
      'control_structure',
      'case_statement',
      children,
      {
        value: caseValue
      },
      node.location
    );
  }

  private transformDefaultCase(node: JavaASTNode): IntermediateRepresentation {
    const children = node.children.map(child => this.transformNode(child));
    
    return this.createIRNode(
      'control_structure',
      'default_case',
      children,
      {},
      node.location
    );
  }

  private transformAssignmentStatement(node: JavaASTNode): IntermediateRepresentation {
    const children = node.children.map(child => this.transformNode(child));
    
    const variable = node.metadata?.variable || (children[0]?.metadata?.name);
    const expression = node.metadata?.expression || (children[1]?.metadata?.value);
    
    // Convert array indexing from 0-based to 1-based
    const conversionResult = ArrayIndexingConverter.convertArrayAssignment(
      variable || '',
      expression || '',
      this.arrayIndexContext
    );
    
    // Add warnings for array indexing conversion
    conversionResult.warnings.forEach(warning => {
      this.addWarning(warning, 'ARRAY_INDEX_CONVERSION', 'info', node.location?.line, node.location?.column);
    });
    
    // Extract converted variable and expression
    const assignmentParts = conversionResult.convertedExpression.split(' ← ');
    const convertedVariable = assignmentParts[0] || variable;
    const convertedExpression = assignmentParts[1] || expression;
    
    return this.createIRNode(
      'statement',
      'assignment_statement',
      children,
      {
        variable: convertedVariable,
        expression: convertedExpression,
        originalVariable: variable,
        originalExpression: expression,
        hasArrayAccess: conversionResult.hasArrayAccess
      },
      node.location
    );
  }

  private transformExpression(node: JavaASTNode): IntermediateRepresentation {
    const expression = node.value as string;
    
    // Convert array indexing from 0-based to 1-based
    const conversionResult = ArrayIndexingConverter.convertArrayAccess(expression, this.arrayIndexContext);
    
    // Add warnings for array indexing conversion
    conversionResult.warnings.forEach(warning => {
      this.addWarning(warning, 'ARRAY_INDEX_CONVERSION', 'info', node.location?.line, node.location?.column);
    });
    
    return this.createIRNode(
      'expression',
      'expression',
      [],
      {
        value: conversionResult.convertedExpression,
        originalExpression: expression,
        hasArrayAccess: conversionResult.hasArrayAccess
      },
      node.location
    );
  }

  private transformCondition(node: JavaASTNode): IntermediateRepresentation {
    const originalCondition = node.value as string;
    const igcseCondition = node.metadata?.igcseCondition || originalCondition;
    
    return this.createIRNode(
      'expression',
      'condition',
      [],
      {
        originalCondition,
        igcseCondition,
        value: igcseCondition
      },
      node.location
    );
  }

  private transformBlock(node: JavaASTNode): IntermediateRepresentation {
    this.enterScope('block');
    const children = node.children.map(child => this.transformNode(child));
    this.exitScope();
    
    return this.createIRNode(
      'statement',
      'block',
      children,
      {
        statementCount: children.length
      },
      node.location
    );
  }

  private convertJavaTypeToIGCSE(javaType: string): IGCSEType {
    switch (javaType) {
      case 'int':
        return 'INTEGER';
      case 'String':
        return 'STRING';
      case 'boolean':
        return 'BOOLEAN';
      case 'double':
      case 'float':
        return 'REAL';
      case 'char':
        return 'CHAR';
      default:
        this.addWarning(
          `Unknown Java type '${javaType}' converted to STRING`,
          ErrorCodes.TYPE_CONVERSION_ERROR,
          'warning'
        );
        return 'STRING';
    }
  }

  private transformClassDeclaration(node: JavaASTNode): IntermediateRepresentation {
    const className = node.metadata?.className as string;
    const superClass = node.metadata?.superClass as string;
    const interfaces = node.metadata?.interfaces as string[] || [];
    const heritage = node.metadata?.heritage as string[] || [];
    const visibility = node.metadata?.visibility || 'public';
    
    this.addWarning(
      `Class '${className}' converted to procedural equivalents with comments`,
      'FEATURE_CONVERSION',
      'info',
      node.location?.line,
      node.location?.column
    );

    // Add inheritance warning if needed
    if (superClass || interfaces.length > 0) {
      const inheritanceDesc = superClass ? `extends ${superClass}` : '';
      const implementsDesc = interfaces.length > 0 ? `implements ${interfaces.join(', ')}` : '';
      const fullDesc = [inheritanceDesc, implementsDesc].filter(Boolean).join(' ');
      
      this.addWarning(
        `Class inheritance '${className} ${fullDesc}' converted to comments`,
        'FEATURE_CONVERSION',
        'info',
        node.location?.line,
        node.location?.column
      );
    }

    // Transform child nodes (class body)
    const children = node.children.map(child => this.transformNode(child));

    let inheritanceComment = `// ${className}`;
    if (superClass) {
      inheritanceComment += ` inherits from ${superClass}`;
    }
    if (interfaces.length > 0) {
      inheritanceComment += ` implements ${interfaces.join(', ')}`;
    }
    
    // Add "class" suffix only if no inheritance info
    if (!superClass && interfaces.length === 0) {
      inheritanceComment += ` class`;
    }

    return this.createIRNode(
      'declaration',
      'class_converted',
      children,
      {
        className,
        superClass,
        interfaces,
        heritage,
        visibility,
        classComment: inheritanceComment,
        inheritanceComment
      },
      node.location
    );
  }

  private generateMethodDeclaration(
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

  private isJavaStringMethod(methodName: string): boolean {
    const javaStringMethods = [
      'length', 'charAt', 'substring', 'indexOf', 'lastIndexOf',
      'toLowerCase', 'toUpperCase', 'trim', 'replace', 'replaceAll',
      'split', 'concat', 'contains', 'startsWith', 'endsWith',
      'equals', 'equalsIgnoreCase', 'compareTo', 'isEmpty'
    ];
    return javaStringMethods.includes(methodName);
  }

  private transformJavaStringMethod(
    objectName: string,
    methodName: string,
    methodArgs: string[],
    node: JavaASTNode
  ): IntermediateRepresentation {
    let igcseExpression = '';
    let igcseFunction = '';
    let returnType: IGCSEType = 'STRING';
    
    this.addWarning(
      `Java string method '${methodName}' converted to IGCSE string function`,
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
        igcseFunction = 'SUBSTRING';
        const startIndex = methodArgs[0] || '0';
        const endIndex = methodArgs[1];
        
        if (endIndex) {
          // substring(start, end) -> SUBSTRING(string, start+1, end-start)
          igcseExpression = `SUBSTRING(${objectName}, ${startIndex} + 1, ${endIndex} - ${startIndex})`;
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
        
      case 'contains':
        igcseExpression = `FIND(${objectName}, ${methodArgs[0] || '""'}) > 0`;
        returnType = 'BOOLEAN';
        this.addWarning(
          'contains converted to conditional expression using FIND',
          'FEATURE_CONVERSION',
          'info',
          node.location?.line,
          node.location?.column
        );
        break;
        
      case 'startsWith':
        const prefix = methodArgs[0] || '""';
        igcseExpression = `LEFT(${objectName}, LENGTH(${prefix})) = ${prefix}`;
        returnType = 'BOOLEAN';
        this.addWarning(
          'startsWith converted to conditional expression using LEFT',
          'FEATURE_CONVERSION',
          'info',
          node.location?.line,
          node.location?.column
        );
        break;
        
      case 'endsWith':
        const suffix = methodArgs[0] || '""';
        igcseExpression = `RIGHT(${objectName}, LENGTH(${suffix})) = ${suffix}`;
        returnType = 'BOOLEAN';
        this.addWarning(
          'endsWith converted to conditional expression using RIGHT',
          'FEATURE_CONVERSION',
          'info',
          node.location?.line,
          node.location?.column
        );
        break;
        
      case 'equals':
        const compareString = methodArgs[0] || '""';
        igcseExpression = `${objectName} = ${compareString}`;
        returnType = 'BOOLEAN';
        break;
        
      case 'equalsIgnoreCase':
        const compareStringIgnoreCase = methodArgs[0] || '""';
        igcseExpression = `LCASE(${objectName}) = LCASE(${compareStringIgnoreCase})`;
        returnType = 'BOOLEAN';
        this.addWarning(
          'equalsIgnoreCase converted using LCASE for case-insensitive comparison',
          'FEATURE_CONVERSION',
          'info',
          node.location?.line,
          node.location?.column
        );
        break;
        
      case 'isEmpty':
        igcseExpression = `LENGTH(${objectName}) = 0`;
        returnType = 'BOOLEAN';
        this.addWarning(
          'isEmpty converted to LENGTH comparison',
          'FEATURE_CONVERSION',
          'info',
          node.location?.line,
          node.location?.column
        );
        break;
        
      case 'replace':
      case 'replaceAll':
        const searchValue = methodArgs[0] || '""';
        const replaceValue = methodArgs[1] || '""';
        igcseExpression = `REPLACE(${objectName}, ${searchValue}, ${replaceValue})`;
        this.addWarning(
          `${methodName} method converted to REPLACE function - may need manual implementation`,
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
        
      default:
        igcseExpression = `${objectName}.${methodName}(${methodArgs.join(', ')})`;
        this.addWarning(
          `Java string method '${methodName}' has no direct IGCSE equivalent - manual conversion needed`,
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

  private transformParameter(node: JavaASTNode): IntermediateRepresentation {
    const parameterName = node.metadata?.parameterName as string;
    const parameterType = node.metadata?.parameterType as string;
    const isArray = node.metadata?.isArray || false;
    
    return this.createIRNode(
      'declaration',
      'parameter_declaration',
      [],
      {
        parameterName,
        parameterType,
        igcseType: this.convertJavaTypeToIGCSE(parameterType),
        isArray
      },
      node.location
    );
  }

  private transformReturnStatement(node: JavaASTNode): IntermediateRepresentation {
    const hasExpression = node.metadata?.hasExpression || false;
    const expression = node.metadata?.expression;
    
    return this.createIRNode(
      'statement',
      'return_statement',
      [],
      {
        hasExpression,
        expression
      },
      node.location
    );
  }
}

export default JavaASTTransformer;