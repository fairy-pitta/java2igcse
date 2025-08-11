// IGCSE Pseudocode Generator
// Converts Intermediate Representation to IGCSE-compliant pseudocode

import {
  PseudocodeGenerator,
  FormattingOptions,
  IntermediateRepresentation,
  IRNodeType,
  ConversionOptions,
  Warning
} from '../index';

export class IGCSEPseudocodeGenerator implements PseudocodeGenerator {
  private options: ConversionOptions;
  private warnings: Warning[] = [];
  private currentIndentLevel: number = 0;

  constructor(options: ConversionOptions = {}) {
    this.options = {
      indentSize: 4, // IGCSE standard: 4 spaces for proper readability
      includeComments: true,
      strictMode: false,
      customMappings: {},
      ...options
    };
  }

  generate(ir: IntermediateRepresentation): string {
    this.warnings = [];
    this.currentIndentLevel = 0;
    
    try {
      const pseudocode = this.generateNode(ir);
      return this.formatOutput(pseudocode, this.getDefaultFormattingOptions());
    } catch (error) {
      this.addWarning(
        `Generation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GENERATION_ERROR'
      );
      return '// Error generating pseudocode';
    }
  }

  formatOutput(pseudocode: string, options: FormattingOptions): string {
    const lines = pseudocode.split('\n');
    const formattedLines: string[] = [];
    
    for (const line of lines) {
      // Only trim empty lines, preserve indentation for non-empty lines
      if (line.trim() === '') {
        formattedLines.push('');
        continue;
      }
      
      // Apply line length limit if specified (check trimmed length)
      if (options.maxLineLength && line.trim().length > options.maxLineLength) {
        this.addWarning(
          `Line exceeds maximum length: ${line.trim().length} > ${options.maxLineLength}`,
          'LINE_TOO_LONG'
        );
      }
      
      formattedLines.push(line);
    }
    
    return formattedLines.join(options.lineEnding);
  }

  getWarnings(): Warning[] {
    return [...this.warnings];
  }

  private generateNode(node: IntermediateRepresentation): string {
    switch (node.type) {
      case 'program':
        return this.generateProgram(node);
      case 'declaration':
        return this.generateDeclaration(node);
      case 'statement':
        return this.generateStatement(node);
      case 'expression':
        return this.generateExpression(node);
      case 'control_structure':
        return this.generateControlStructure(node);
      case 'function_declaration':
        return this.generateFunctionDeclaration(node);
      case 'variable_declaration':
        return this.generateVariableDeclaration(node);
      case 'array_declaration':
        return this.generateArrayDeclaration(node);
      case 'assignment':
        return this.generateAssignment(node);
      case 'method_call':
        return this.generateMethodCall(node);
      case 'binary_operation':
        return this.generateBinaryOperation(node);
      case 'unary_operation':
        return this.generateUnaryOperation(node);
      case 'literal':
        return this.generateLiteral(node);
      case 'identifier':
        return this.generateIdentifier(node);
      default:
        this.addWarning(
          `Unknown node type: ${node.type}`,
          'UNKNOWN_NODE_TYPE'
        );
        return `// Unknown node type: ${node.type}`;
    }
  }

  private generateProgram(node: IntermediateRepresentation): string {
    const parts: string[] = [];
    
    if (this.options.includeComments && node.metadata.comment) {
      parts.push(`// ${node.metadata.comment}`);
    }
    
    // Generate program body
    for (const child of node.children) {
      const childCode = this.generateNode(child);
      if (childCode.trim()) {
        parts.push(childCode);
      }
    }
    
    return parts.join('\n');
  }

  private generateDeclaration(node: IntermediateRepresentation): string {
    switch (node.kind) {
      case 'variable_declaration':
        return this.generateVariableDeclaration(node);
      case 'array_declaration':
        return this.generateArrayDeclaration(node);
      case 'function_declaration':
        return this.generateFunctionDeclaration(node);
      case 'class_converted':
        return this.generateClassDeclaration(node);
      case 'parameter_declaration':
        return ''; // Parameters are handled by the function declaration itself
      case 'type_reference':
        return ''; // Type references are handled by their parent nodes
      default:
        return this.generateGenericDeclaration(node);
    }
  }

  private generateVariableDeclaration(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const variableName = metadata.variableName;
    const igcseType = metadata.igcseType;
    const hasInitializer = metadata.hasInitializer;
    const initialValue = metadata.initialValue;
    const isArray = metadata.isArray;
    const isStatic = metadata.isStatic;
    const isFinal = metadata.isFinal;
    
    if (!variableName || !igcseType) {
      this.addWarning(
        'Variable declaration missing required metadata',
        'MISSING_METADATA'
      );
      return '// Invalid variable declaration';
    }

    const parts: string[] = [];
    
    // Add static comment if needed
    if (isStatic && this.options.includeComments) {
      parts.push(this.addIndentation('// Static variable'));
    }
    
    // Add final/constant comment if needed
    if (isFinal && this.options.includeComments) {
      parts.push(this.addIndentation('// Constant variable'));
    }

    let declaration: string;
    
    if (isArray) {
      const arrayDimensions = metadata.arrayDimensions || [];
      if (arrayDimensions.length === 1) {
        // Simple array: DECLARE array : ARRAY[1:size] OF TYPE
        const size = arrayDimensions[0];
        declaration = `DECLARE ${variableName} : ARRAY[1:${size}] OF ${igcseType}`;
      } else if (arrayDimensions.length > 1) {
        // Multi-dimensional array
        let arrayType = igcseType;
        for (let i = arrayDimensions.length - 1; i >= 0; i--) {
          const size = arrayDimensions[i];
          arrayType = `ARRAY[1:${size}] OF ${arrayType}`;
        }
        declaration = `DECLARE ${variableName} : ${arrayType}`;
      } else {
        // Array without specified dimensions
        declaration = `DECLARE ${variableName} : ARRAY[1:SIZE] OF ${igcseType}`;
      }
    } else {
      // Simple variable declaration
      declaration = `DECLARE ${variableName} : ${igcseType}`;
    }
    
    // Add initializer if present
    if (hasInitializer && initialValue !== undefined) {
      if (isArray) {
        this.addWarning(
          'Array initialization requires manual conversion to individual assignments',
          'ARRAY_INITIALIZATION'
        );
        declaration += ` // Initialize with: ${initialValue}`;
      } else {
        declaration += ` ← ${this.formatInitialValue(initialValue, igcseType)}`;
      }
    }
    
    parts.push(this.addIndentation(declaration));
    
    return parts.join('\n');
  }

  private generateArrayDeclaration(node: IntermediateRepresentation): string {
    // This is handled by generateVariableDeclaration when isArray is true
    return this.generateVariableDeclaration(node);
  }

  private generateFunctionDeclaration(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const functionName = metadata.functionName || metadata.methodName;
    const parameters = metadata.parameters || [];
    const returnType = metadata.returnType;
    const isProcedure = metadata.isProcedure;
    const isStatic = metadata.isStatic;
    
    if (!functionName) {
      this.addWarning(
        'Function declaration missing name',
        'MISSING_FUNCTION_NAME'
      );
      return '// Invalid function declaration';
    }

    const parts: string[] = [];
    
    // Add static comment if needed
    if (isStatic && this.options.includeComments) {
      parts.push(this.addIndentation('// Static method'));
    }
    
    // Also check for staticComment in metadata
    if (metadata.staticComment && this.options.includeComments) {
      parts.push(this.addIndentation(metadata.staticComment));
    }
    
    // Generate parameter list
    const paramList = parameters.map((param: any) => {
      if (param.isArray) {
        return `${param.name} : ARRAY[1:SIZE] OF ${param.type}`;
      }
      return `${param.name} : ${param.type}`;
    }).join(', ');
    
    // Generate function/procedure declaration
    let declaration: string;
    if (isProcedure) {
      declaration = `PROCEDURE ${functionName}(${paramList})`;
    } else {
      declaration = `FUNCTION ${functionName}(${paramList}) RETURNS ${returnType}`;
    }
    
    parts.push(this.addIndentation(declaration));
    
    // Generate function body
    this.incrementIndent();
    for (const child of node.children) {
      // Skip function metadata nodes (identifiers, type references, parameters)
      if (child.kind === 'identifier' || child.kind === 'type_reference' || child.kind === 'parameter_declaration') {
        continue;
      }
      
      const childCode = this.generateNode(child);
      if (childCode.trim()) {
        parts.push(childCode);
      }
    }
    this.decrementIndent();
    
    // Add end statement
    const endStatement = isProcedure ? 'ENDPROCEDURE' : 'ENDFUNCTION';
    parts.push(this.addIndentation(endStatement));
    
    return parts.join('\n');
  }

  private generateStatement(node: IntermediateRepresentation): string {
    switch (node.kind) {
      case 'output_statement':
        return this.generateOutputStatement(node);
      case 'input_statement':
        return this.generateInputStatement(node);
      case 'assignment_statement':
        return this.generateAssignment(node);
      case 'return_statement':
        return this.generateReturnStatement(node);
      case 'block':
        return this.generateBlock(node);
      case 'empty_statement':
        return ''; // Empty statements produce no output
      default:
        return this.generateGenericStatement(node);
    }
  }

  private generateBlock(node: IntermediateRepresentation): string {
    const parts: string[] = [];
    
    for (const child of node.children) {
      const childCode = this.generateNode(child);
      if (childCode.trim()) {
        parts.push(childCode);
      }
    }
    
    return parts.join('\n');
  }

  private generateOutputStatement(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const expressions = metadata.expressions || [];
    
    if (expressions.length === 0) {
      return this.addIndentation('OUTPUT ""');
    }
    
    // Handle multiple expressions (e.g., OUTPUT "Hello", name, "!")
    const outputParts = expressions.map((expr: any) => {
      if (typeof expr === 'string') {
        // Check if it's already a quoted string literal
        if (expr.startsWith('"') && expr.endsWith('"')) {
          return expr;
        }
        // Heuristic: treat common variable names, simple identifiers, and array access as variables
        // In real usage, the IR should have metadata to distinguish literals from variables
        const commonVariableNames = ['name', 'count', 'i', 'j', 'k', 'x', 'y', 'z', 'result', 'value', 'data', 'message', 'square', 'sum', 'total', 'temp', 'item', 'index', 'size', 'length', 'width', 'height', 'area', 'volume', 'maximum', 'minimum', 'max', 'min', 'avg', 'average', 'num', 'number', 'numbers', 'arr', 'array', 'list', 'args', 'arg', 'param', 'params'];
        const isSimpleIdentifier = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr);
        const isArrayAccess = /^[a-zA-Z_][a-zA-Z0-9_]*\[[^\]]+\]$/.test(expr); // Matches arr[i], matrix[i][j], etc.
        const isMethodCall = /^[a-zA-Z_][a-zA-Z0-9_]*\([^)]*\)$/.test(expr); // Matches function(), method(args)
        
        if (isSimpleIdentifier && (commonVariableNames.includes(expr.toLowerCase()) || expr.length <= 3)) {
          return expr; // Treat as variable
        }
        
        if (isArrayAccess || isMethodCall) {
          return expr; // Treat as variable/expression
        }
        
        // Otherwise, treat as string literal
        return `"${expr}"`;
      }
      return String(expr);
    });
    
    return this.addIndentation(`OUTPUT ${outputParts.join(', ')}`);
  }

  private generateInputStatement(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const variable = metadata.variable;
    const prompt = metadata.prompt;
    
    if (!variable) {
      this.addWarning(
        'Input statement missing variable',
        'MISSING_INPUT_VARIABLE'
      );
      return this.addIndentation('// Invalid input statement');
    }
    
    if (prompt) {
      return this.addIndentation(`INPUT "${prompt}", ${variable}`);
    }
    
    return this.addIndentation(`INPUT ${variable}`);
  }

  private generateAssignment(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const variable = metadata.variable;
    const expression = metadata.expression;
    
    if (!variable || expression === undefined) {
      this.addWarning(
        'Assignment missing variable or expression',
        'MISSING_ASSIGNMENT_PARTS'
      );
      return this.addIndentation('// Invalid assignment');
    }
    
    return this.addIndentation(`${variable} ← ${expression}`);
  }

  private generateReturnStatement(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const expression = metadata.expression;
    
    if (expression !== undefined) {
      return this.addIndentation(`RETURN ${expression}`);
    }
    
    return this.addIndentation('RETURN');
  }

  private generateExpression(node: IntermediateRepresentation): string {
    // Expressions are typically handled inline, but this provides a fallback
    return node.metadata.value || node.metadata.expression || '';
  }

  private generateControlStructure(node: IntermediateRepresentation): string {
    switch (node.kind) {
      case 'if_statement':
        return this.generateIfStatement(node);
      case 'while_loop':
        return this.generateWhileLoop(node);
      case 'for_loop':
        return this.generateForLoop(node);
      case 'switch_statement':
        return this.generateSwitchStatement(node);
      default:
        this.addWarning(
          `Unknown control structure: ${node.kind}`,
          'UNKNOWN_CONTROL_STRUCTURE'
        );
        return `// Unknown control structure: ${node.kind}`;
    }
  }

  private generateIfStatement(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const condition = metadata.condition;
    const hasElse = metadata.hasElse;
    const isElseIf = metadata.isElseIf;
    
    if (!condition) {
      this.addWarning(
        'If statement missing condition',
        'MISSING_IF_CONDITION'
      );
      return this.addIndentation('// Invalid if statement');
    }
    
    const parts: string[] = [];
    parts.push(this.addIndentation(`IF ${condition} THEN`));
    
    // Check if this is the new format (with structured blocks) or old format (direct children)
    const hasStructuredBlocks = metadata.thenBlock || (node.children.length > 1 && node.children[1]?.kind === 'block');
    
    this.incrementIndent();
    
    if (hasStructuredBlocks) {
      // New format: structured with condition, then block, else block
      const thenBlock = node.children[1]; // Second child is the then block
      if (thenBlock) {
        const thenCode = this.generateNode(thenBlock);
        if (thenCode.trim()) {
          parts.push(thenCode);
        }
      }
    } else {
      // Old format: direct children are the body statements
      for (const child of node.children) {
        // Skip condition nodes as they are already handled in the IF statement
        if (child.kind === 'condition') {
          continue;
        }
        
        const childCode = this.generateNode(child);
        if (childCode.trim()) {
          parts.push(childCode);
        }
      }
    }
    
    this.decrementIndent();
    
    // Generate else block if present (only for new format)
    if (hasStructuredBlocks && hasElse && node.children.length > 2) {
      const elseBlock = node.children[2];
      
      if (isElseIf && elseBlock.kind === 'if_statement') {
        // Handle else if - generate as ELSE IF
        const elseIfCondition = elseBlock.metadata.condition;
        parts.push(this.addIndentation(`ELSE IF ${elseIfCondition} THEN`));
        
        this.incrementIndent();
        const elseIfThenBlock = elseBlock.children[1];
        if (elseIfThenBlock) {
          const elseIfCode = this.generateNode(elseIfThenBlock);
          if (elseIfCode.trim()) {
            parts.push(elseIfCode);
          }
        }
        this.decrementIndent();
        
        // Handle nested else if/else
        if (elseBlock.metadata.hasElse && elseBlock.children.length > 2) {
          const nestedElse = elseBlock.children[2];
          if (nestedElse.kind === 'if_statement') {
            // Recursive else if - extract the condition and continue the chain
            const recursiveElseIf = this.generateElseIfChain(nestedElse);
            parts.push(recursiveElseIf);
          } else {
            // Final else block
            parts.push(this.addIndentation('ELSE'));
            this.incrementIndent();
            const finalElseCode = this.generateNode(nestedElse);
            if (finalElseCode.trim()) {
              parts.push(finalElseCode);
            }
            this.decrementIndent();
          }
        }
      } else {
        // Regular else block
        parts.push(this.addIndentation('ELSE'));
        this.incrementIndent();
        const elseCode = this.generateNode(elseBlock);
        if (elseCode.trim()) {
          parts.push(elseCode);
        }
        this.decrementIndent();
      }
    }
    
    parts.push(this.addIndentation('ENDIF'));
    
    return parts.join('\n');
  }

  private generateElseIfChain(node: IntermediateRepresentation): string {
    const parts: string[] = [];
    const condition = node.metadata.condition;
    
    parts.push(this.addIndentation(`ELSE IF ${condition} THEN`));
    
    this.incrementIndent();
    const thenBlock = node.children[1];
    if (thenBlock) {
      const thenCode = this.generateNode(thenBlock);
      if (thenCode.trim()) {
        parts.push(thenCode);
      }
    }
    this.decrementIndent();
    
    // Handle further nesting
    if (node.metadata.hasElse && node.children.length > 2) {
      const elseBlock = node.children[2];
      if (elseBlock.kind === 'if_statement') {
        // Continue the chain
        const chainCode = this.generateElseIfChain(elseBlock);
        parts.push(chainCode);
      } else {
        // Final else
        parts.push(this.addIndentation('ELSE'));
        this.incrementIndent();
        const elseCode = this.generateNode(elseBlock);
        if (elseCode.trim()) {
          parts.push(elseCode);
        }
        this.decrementIndent();
      }
    }
    
    return parts.join('\n');
  }

  private generateWhileLoop(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const condition = metadata.condition;
    
    if (!condition) {
      this.addWarning(
        'While loop missing condition',
        'MISSING_WHILE_CONDITION'
      );
      return this.addIndentation('// Invalid while loop');
    }
    
    const parts: string[] = [];
    parts.push(this.addIndentation(`WHILE ${condition} DO`));
    
    // Generate body - skip condition nodes, only process block/body nodes
    this.incrementIndent();
    for (const child of node.children) {
      // Skip condition nodes as they are already handled in the WHILE statement
      if (child.kind === 'condition') {
        continue;
      }
      
      const childCode = this.generateNode(child);
      if (childCode.trim()) {
        parts.push(childCode);
      }
    }
    this.decrementIndent();
    
    parts.push(this.addIndentation('ENDWHILE'));
    
    return parts.join('\n');
  }

  private generateForLoop(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const variable = metadata.variable;
    const startValue = metadata.startValue;
    const endValue = metadata.endValue;
    const stepValue = metadata.stepValue;
    
    if (!variable || startValue === undefined || endValue === undefined) {
      this.addWarning(
        'For loop missing required parameters',
        'MISSING_FOR_PARAMETERS'
      );
      return this.addIndentation('// Invalid for loop');
    }
    
    const parts: string[] = [];
    
    let forStatement = `FOR ${variable} ← ${startValue} TO ${endValue}`;
    if (stepValue && stepValue !== 1) {
      forStatement += ` STEP ${stepValue}`;
    }
    
    parts.push(this.addIndentation(forStatement));
    
    // Generate body - skip initialization, condition, and increment nodes
    this.incrementIndent();
    for (const child of node.children) {
      // Skip for loop control nodes as they are already handled in the FOR statement
      if (child.kind === 'for_initialization' || child.kind === 'for_condition' || child.kind === 'for_increment') {
        continue;
      }
      
      const childCode = this.generateNode(child);
      if (childCode.trim()) {
        parts.push(childCode);
      }
    }
    this.decrementIndent();
    
    parts.push(this.addIndentation(`NEXT ${variable}`));
    
    return parts.join('\n');
  }

  private generateSwitchStatement(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const expression = metadata.expression;
    const cases = metadata.cases || [];
    const hasDefault = metadata.hasDefault;
    
    if (!expression) {
      this.addWarning(
        'Switch statement missing expression',
        'MISSING_SWITCH_EXPRESSION'
      );
      return this.addIndentation('// Invalid switch statement');
    }
    
    const parts: string[] = [];
    parts.push(this.addIndentation(`CASE OF ${expression}`));
    
    this.incrementIndent();
    
    // Generate case statements from children
    for (const child of node.children) {
      if (child.kind === 'case_statement') {
        const caseValue = child.metadata.value;
        const caseStatements = child.children;
        
        parts.push(this.addIndentation(`${caseValue}:`));
        
        this.incrementIndent();
        for (const stmt of caseStatements) {
          const stmtCode = this.generateNode(stmt);
          if (stmtCode.trim()) {
            parts.push(stmtCode);
          }
        }
        this.decrementIndent();
      } else if (child.kind === 'default_case') {
        const defaultStatements = child.children;
        
        parts.push(this.addIndentation('OTHERWISE:'));
        
        this.incrementIndent();
        for (const stmt of defaultStatements) {
          const stmtCode = this.generateNode(stmt);
          if (stmtCode.trim()) {
            parts.push(stmtCode);
          }
        }
        this.decrementIndent();
      }
    }
    
    this.decrementIndent();
    parts.push(this.addIndentation('ENDCASE'));
    
    return parts.join('\n');
  }

  private generateMethodCall(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const methodName = metadata.methodName;
    const methodArgs = metadata.arguments || [];
    const isProcedureCall = metadata.isProcedureCall;
    
    if (!methodName) {
      this.addWarning(
        'Method call missing name',
        'MISSING_METHOD_NAME'
      );
      return '// Invalid method call';
    }
    
    const argList = methodArgs.join(', ');
    
    if (isProcedureCall) {
      return this.addIndentation(`CALL ${methodName}(${argList})`);
    } else {
      // Function call - typically used in expressions
      return `${methodName}(${argList})`;
    }
  }

  private generateBinaryOperation(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const left = metadata.left;
    const operator = metadata.operator;
    const right = metadata.right;
    
    if (!left || !operator || !right) {
      this.addWarning(
        'Binary operation missing operands or operator',
        'MISSING_BINARY_PARTS'
      );
      return '// Invalid binary operation';
    }
    
    // Convert operators to IGCSE format
    const igcseOperator = this.convertOperatorToIGCSE(operator);
    
    return `${left} ${igcseOperator} ${right}`;
  }

  private generateUnaryOperation(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const operator = metadata.operator;
    const operand = metadata.operand;
    
    if (!operator || !operand) {
      this.addWarning(
        'Unary operation missing operator or operand',
        'MISSING_UNARY_PARTS'
      );
      return '// Invalid unary operation';
    }
    
    const igcseOperator = this.convertOperatorToIGCSE(operator);
    
    return `${igcseOperator}${operand}`;
  }

  private generateLiteral(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const value = metadata.value;
    const type = metadata.type;
    
    if (value === undefined) {
      return '';
    }
    
    // Format literal based on type
    switch (type) {
      case 'STRING':
        return typeof value === 'string' && value.startsWith('"') && value.endsWith('"') 
          ? value 
          : `"${value}"`;
      case 'CHAR':
        return `'${value}'`;
      case 'BOOLEAN':
        return value.toString().toUpperCase();
      default:
        return String(value);
    }
  }

  private generateIdentifier(node: IntermediateRepresentation): string {
    return node.metadata.name || '';
  }

  private generateGenericDeclaration(node: IntermediateRepresentation): string {
    this.addWarning(
      `Generic declaration handler used for: ${node.kind}`,
      'GENERIC_DECLARATION'
    );
    
    // Only output debug information if comments are enabled
    if (this.options.includeComments) {
      return this.addIndentation(`// ${node.kind}: ${JSON.stringify(node.metadata)}`);
    }
    
    return ''; // Return empty string if comments are disabled
  }

  private generateGenericStatement(node: IntermediateRepresentation): string {
    this.addWarning(
      `Generic statement handler used for: ${node.kind}`,
      'GENERIC_STATEMENT'
    );
    
    // Only output debug information if comments are enabled
    if (this.options.includeComments) {
      return this.addIndentation(`// ${node.kind}: ${JSON.stringify(node.metadata)}`);
    }
    
    return ''; // Return empty string if comments are disabled
  }

  private convertOperatorToIGCSE(operator: string): string {
    const operatorMap: Record<string, string> = {
      '==': '=',
      '!=': '<>',
      '&&': 'AND',
      '||': 'OR',
      '!': 'NOT',
      '%': 'MOD',
      '//': 'DIV', // Integer division
      // Arithmetic operators remain the same
      '+': '+',
      '-': '-',
      '*': '*',
      '/': '/',
      '<': '<',
      '>': '>',
      '<=': '<=',
      '>=': '>='
    };
    
    return operatorMap[operator] || operator;
  }

  private formatInitialValue(value: any, type: string): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    switch (type) {
      case 'STRING':
        return typeof value === 'string' && value.startsWith('"') && value.endsWith('"')
          ? value
          : `"${value}"`;
      case 'CHAR':
        return `'${value}'`;
      case 'BOOLEAN':
        return String(value).toUpperCase();
      default:
        return String(value);
    }
  }

  private addIndentation(line: string): string {
    if (!line.trim()) {
      return line;
    }
    
    const indent = ' '.repeat(this.currentIndentLevel * (this.options.indentSize || 4));
    return indent + line;
  }

  private incrementIndent(): void {
    this.currentIndentLevel++;
  }

  private decrementIndent(): void {
    if (this.currentIndentLevel > 0) {
      this.currentIndentLevel--;
    }
  }

  private getDefaultFormattingOptions(): FormattingOptions {
    return {
      indentSize: this.options.indentSize || 4,
      indentChar: ' ',
      lineEnding: '\n',
      maxLineLength: 80
    };
  }

  private generateClassDeclaration(node: IntermediateRepresentation): string {
    const metadata = node.metadata;
    const className = metadata.className;
    const inheritanceComment = metadata.inheritanceComment || metadata.classComment;
    
    const parts: string[] = [];
    
    // Add inheritance comment if needed
    if (inheritanceComment && this.options.includeComments) {
      parts.push(this.addIndentation(inheritanceComment));
    }
    
    // Generate class body (methods and properties)
    for (const child of node.children) {
      const childCode = this.generateNode(child);
      if (childCode.trim()) {
        parts.push(childCode);
      }
    }
    
    return parts.join('\n');
  }

  private addWarning(message: string, code: string, severity: 'warning' | 'info' = 'warning'): void {
    this.warnings.push({
      message,
      code,
      severity
    });
  }
}

export default IGCSEPseudocodeGenerator;