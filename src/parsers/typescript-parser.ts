// TypeScript Parser for IGCSE conversion using TypeScript Compiler API

import * as ts from 'typescript';

// Local interfaces to avoid circular imports
interface SourceLocation {
  line: number;
  column: number;
}

interface ParseError {
  message: string;
  line: number;
  column: number;
  code: string;
  severity: 'error' | 'warning';
}

interface Warning {
  message: string;
  line?: number;
  column?: number;
  code: string;
  severity: 'warning' | 'info';
}

interface TypeScriptASTNode {
  type: string;
  children: TypeScriptASTNode[];
  value?: any;
  location?: SourceLocation;
  metadata?: Record<string, any>;
}

interface ParseResult<T> {
  ast: T;
  errors: ParseError[];
  success: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: ParseError[];
  warnings: Warning[];
}

export interface TypeScriptParseResult extends ParseResult<TypeScriptASTNode> {
  ast: TypeScriptASTNode;
  errors: ParseError[];
  success: boolean;
}

export interface TypeAnnotationInfo {
  name: string;
  typeScriptType: string;
  isArray: boolean;
  isOptional: boolean;
  isUnion: boolean;
  unionTypes?: string[];
  igcseType: string;
  igcseDeclaration: string;
  warnings: string[];
}

export class TypeScriptParser {
  private sourceFile: ts.SourceFile | null = null;
  private errors: ParseError[] = [];

  parse(sourceCode: string): TypeScriptParseResult {
    this.errors = [];

    // Input validation - allow empty input for backward compatibility
    if (sourceCode === null || sourceCode === undefined) {
      this.addError('Source code cannot be null or undefined', 1, 1, 'INVALID_INPUT');
      return {
        ast: { type: 'program', children: [], location: { line: 1, column: 1 } },
        errors: this.errors,
        success: false
      };
    }

    // For empty input, return empty program but mark as successful for backward compatibility
    if (sourceCode.trim().length === 0) {
      return {
        ast: { type: 'program', children: [], location: { line: 1, column: 1 } },
        errors: this.errors,
        success: true
      };
    }

    // Check for basic syntax requirements
    this.validateBasicSyntax(sourceCode);

    try {
      // Create TypeScript source file
      this.sourceFile = ts.createSourceFile(
        'temp.ts',
        sourceCode,
        ts.ScriptTarget.Latest,
        true
      );

      // Check for TypeScript compiler diagnostics
      this.checkCompilerDiagnostics(sourceCode);

      // Check for basic syntax errors by examining the AST
      if (this.sourceFile && this.hasParseErrors(this.sourceFile)) {
        this.addError('Syntax error detected in TypeScript code', 1, 1, 'SYNTAX_ERROR');
      }

      // Convert TypeScript AST to our internal AST format
      const ast = this.convertTSNodeToAST(this.sourceFile);

      // Post-parse validation
      this.validateAST(ast);

      return {
        ast,
        errors: this.errors,
        success: this.errors.filter(e => e.severity === 'error').length === 0
      };
    } catch (error) {
      const parseError: ParseError = {
        message: this.createDescriptiveErrorMessage(error, sourceCode),
        line: 1,
        column: 1,
        code: 'PARSE_ERROR',
        severity: 'error'
      };

      return {
        ast: { type: 'program', children: [], location: { line: 1, column: 1 } },
        errors: [...this.errors, parseError],
        success: false
      };
    }
  }

  validate(sourceCode: string): ValidationResult {
    const parseResult = this.parse(sourceCode);
    const warnings: Warning[] = [];

    // Add TypeScript-specific validation warnings
    if (sourceCode.includes('console.log')) {
      warnings.push({
        message: 'console.log will be converted to OUTPUT statement',
        code: 'FEATURE_CONVERSION',
        severity: 'info'
      });
    }

    if (sourceCode.includes('=>')) {
      warnings.push({
        message: 'Arrow functions will be converted to named procedures',
        code: 'FEATURE_CONVERSION',
        severity: 'info'
      });
    }

    if (sourceCode.includes('interface') || sourceCode.includes('type ')) {
      warnings.push({
        message: 'TypeScript interfaces and type aliases will be converted to comments',
        code: 'FEATURE_CONVERSION',
        severity: 'info'
      });
    }

    return {
      isValid: parseResult.success,
      errors: parseResult.errors,
      warnings
    };
  }

  extractTypeAnnotations(ast: TypeScriptASTNode): TypeAnnotationInfo[] {
    const annotations: TypeAnnotationInfo[] = [];
    
    this.traverseAST(ast, (node) => {
      if (node.type === 'variable_declaration' && node.metadata?.hasTypeAnnotation) {
        const annotation = this.convertTypeAnnotation(node);
        if (annotation) {
          annotations.push(annotation);
        }
      }
    });

    return annotations;
  }

  private convertTSNodeToAST(node: ts.Node): TypeScriptASTNode {
    const location = this.getLocationFromNode(node);
    const children: TypeScriptASTNode[] = [];

    // Convert child nodes
    ts.forEachChild(node, (child) => {
      children.push(this.convertTSNodeToAST(child));
    });

    // Determine node type and extract relevant information
    const nodeType = this.getNodeTypeName(node);
    let value: any = undefined;
    let metadata: Record<string, any> = {};

    switch (node.kind) {
      case ts.SyntaxKind.VariableDeclaration:
        const varDecl = node as ts.VariableDeclaration;
        
        // Check if this is a destructuring assignment
        if (ts.isObjectBindingPattern(varDecl.name)) {
          const objPattern = varDecl.name as ts.ObjectBindingPattern;
          metadata = {
            destructuringType: 'object',
            pattern: {
              properties: objPattern.elements.map(elem => ({
                key: elem.propertyName?.getText(),
                name: elem.name.getText(),
                value: elem.propertyName?.getText() || elem.name.getText()
              }))
            },
            source: varDecl.initializer?.getText(),
            hasTypeAnnotation: !!varDecl.type,
            typeAnnotation: varDecl.type?.getText()
          };
          value = `{${objPattern.elements.map(e => e.name.getText()).join(', ')}}`;
        } else if (ts.isArrayBindingPattern(varDecl.name)) {
          const arrPattern = varDecl.name as ts.ArrayBindingPattern;
          metadata = {
            destructuringType: 'array',
            pattern: {
              elements: arrPattern.elements.map(elem => 
                ts.isOmittedExpression(elem) ? null : elem.name.getText()
              )
            },
            source: varDecl.initializer?.getText(),
            hasTypeAnnotation: !!varDecl.type,
            typeAnnotation: varDecl.type?.getText()
          };
          value = `[${arrPattern.elements.map(e => 
            ts.isOmittedExpression(e) ? '' : e.name.getText()
          ).join(', ')}]`;
        } else {
          // Regular variable declaration
          value = varDecl.name.getText();
          metadata = {
            hasTypeAnnotation: !!varDecl.type,
            typeAnnotation: varDecl.type?.getText(),
            hasInitializer: !!varDecl.initializer,
            initializer: varDecl.initializer?.getText()
          };
        }
        break;

      case ts.SyntaxKind.Identifier:
        value = (node as ts.Identifier).text;
        break;

      case ts.SyntaxKind.StringLiteral:
        value = (node as ts.StringLiteral).text;
        metadata = { literalType: 'string' };
        break;

      case ts.SyntaxKind.NumericLiteral:
        value = (node as ts.NumericLiteral).text;
        metadata = { literalType: 'number' };
        break;

      case ts.SyntaxKind.TrueKeyword:
      case ts.SyntaxKind.FalseKeyword:
        value = node.kind === ts.SyntaxKind.TrueKeyword ? 'true' : 'false';
        metadata = { literalType: 'boolean' };
        break;

      case ts.SyntaxKind.FunctionDeclaration:
        const funcDecl = node as ts.FunctionDeclaration;
        value = funcDecl.name?.getText();
        metadata = {
          parameters: funcDecl.parameters.map(p => ({
            name: p.name.getText(),
            type: p.type?.getText(),
            optional: !!p.questionToken
          })),
          returnType: funcDecl.type?.getText(),
          isAsync: funcDecl.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword),
          isStatic: funcDecl.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword)
        };
        break;

      case ts.SyntaxKind.ClassDeclaration:
        const classDecl = node as ts.ClassDeclaration;
        value = classDecl.name?.getText();
        metadata = {
          className: classDecl.name?.getText(),
          heritage: classDecl.heritageClauses?.map(h => h.getText())
        };
        break;

      case ts.SyntaxKind.MethodDeclaration:
        const methodDecl = node as ts.MethodDeclaration;
        value = methodDecl.name?.getText();
        metadata = {
          methodName: methodDecl.name?.getText(),
          parameters: methodDecl.parameters.map(p => ({
            name: p.name.getText(),
            type: p.type?.getText(),
            optional: !!p.questionToken
          })),
          returnType: methodDecl.type?.getText(),
          isStatic: methodDecl.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword),
          isAsync: methodDecl.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword),
          visibility: this.getVisibility(methodDecl.modifiers)
        };
        break;

      case ts.SyntaxKind.PropertyDeclaration:
        const propDecl = node as ts.PropertyDeclaration;
        value = propDecl.name?.getText();
        metadata = {
          propertyName: propDecl.name?.getText(),
          type: propDecl.type?.getText(),
          isStatic: propDecl.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword),
          isReadonly: propDecl.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword),
          hasInitializer: !!propDecl.initializer,
          initializer: propDecl.initializer?.getText(),
          visibility: this.getVisibility(propDecl.modifiers)
        };
        break;

      case ts.SyntaxKind.ArrowFunction:
        const arrowFunc = node as ts.ArrowFunction;
        metadata = {
          parameters: arrowFunc.parameters.map(p => ({
            name: p.name.getText(),
            type: p.type?.getText(),
            optional: !!p.questionToken
          })),
          returnType: arrowFunc.type?.getText(),
          isArrowFunction: true
        };
        break;

      case ts.SyntaxKind.TemplateExpression:
      case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        const templateNode = node as ts.TemplateLiteral;
        value = templateNode.getText();
        
        if (ts.isTemplateExpression(templateNode)) {
          // Template with expressions: `Hello ${name}!`
          const templateExpr = templateNode as ts.TemplateExpression;
          const expressions = templateExpr.templateSpans.map(span => span.expression.getText());
          const templateParts = [templateExpr.head.text];
          templateExpr.templateSpans.forEach(span => {
            templateParts.push(span.literal.text);
          });
          
          metadata = {
            literalType: 'template',
            expressions,
            templateParts,
            hasExpressions: true
          };
        } else {
          // Simple template without expressions: `Hello World`
          metadata = {
            literalType: 'template',
            expressions: [],
            templateParts: [templateNode.text],
            hasExpressions: false
          };
        }
        break;

      case ts.SyntaxKind.ObjectBindingPattern:
        const objBinding = node as ts.ObjectBindingPattern;
        metadata = {
          destructuringType: 'object',
          pattern: {
            properties: objBinding.elements.map(elem => ({
              key: elem.propertyName?.getText(),
              name: elem.name.getText(),
              value: elem.propertyName?.getText() || elem.name.getText()
            }))
          }
        };
        break;

      case ts.SyntaxKind.ArrayBindingPattern:
        const arrBinding = node as ts.ArrayBindingPattern;
        metadata = {
          destructuringType: 'array',
          pattern: {
            elements: arrBinding.elements.map(elem => 
              ts.isOmittedExpression(elem) ? null : elem.name.getText()
            )
          }
        };
        break;

      case ts.SyntaxKind.IfStatement:
        const ifStmt = node as ts.IfStatement;
        metadata = {
          condition: ifStmt.expression.getText(),
          igcseCondition: this.convertConditionOperators(ifStmt.expression.getText()),
          hasElse: !!ifStmt.elseStatement,
          isElseIf: ifStmt.elseStatement && ts.isIfStatement(ifStmt.elseStatement)
        };
        break;

      case ts.SyntaxKind.WhileStatement:
        const whileStmt = node as ts.WhileStatement;
        metadata = {
          condition: whileStmt.expression.getText(),
          igcseCondition: this.convertConditionOperators(whileStmt.expression.getText())
        };
        break;

      case ts.SyntaxKind.CallExpression:
        const callExpr = node as ts.CallExpression;
        const callText = callExpr.getText();
        
        // Extract method and object names for console.log, string methods, etc.
        if (ts.isPropertyAccessExpression(callExpr.expression)) {
          const propAccess = callExpr.expression as ts.PropertyAccessExpression;
          const objectName = propAccess.expression.getText();
          const methodName = propAccess.name.getText();
          const args = callExpr.arguments.map(arg => arg.getText());
          
          metadata = {
            methodName,
            objectName,
            arguments: args,
            originalCall: callText,
            isMethodCall: true
          };
        } else {
          // Direct function call
          const functionName = callExpr.expression.getText();
          const args = callExpr.arguments.map(arg => arg.getText());
          
          metadata = {
            methodName: functionName,
            arguments: args,
            originalCall: callText,
            isMethodCall: false
          };
        }
        break;

      case ts.SyntaxKind.BinaryExpression:
        const binExpr = node as ts.BinaryExpression;
        const operatorToken = binExpr.operatorToken;
        const operatorText = operatorToken.getText();
        const leftText = binExpr.left.getText();
        const rightText = binExpr.right.getText();
        
        metadata = {
          operator: operatorText,
          left: leftText,
          right: rightText,
          operatorKind: operatorToken.kind
        };
        break;

      case ts.SyntaxKind.ForStatement:
        const forStmt = node as ts.ForStatement;
        
        // Extract for loop components
        let variable = 'i';
        let startValue = '0';
        let endCondition = '';
        let incrementExpression = '';
        
        // Extract initialization (e.g., "let i = 0")
        if (forStmt.initializer) {
          if (ts.isVariableDeclarationList(forStmt.initializer)) {
            const varDecl = forStmt.initializer.declarations[0];
            if (varDecl.name && ts.isIdentifier(varDecl.name)) {
              variable = varDecl.name.text;
            }
            if (varDecl.initializer) {
              startValue = varDecl.initializer.getText();
            }
          }
        }
        
        // Extract condition (e.g., "i < 10")
        if (forStmt.condition) {
          endCondition = forStmt.condition.getText();
        }
        
        // Extract increment (e.g., "i++")
        if (forStmt.incrementor) {
          incrementExpression = forStmt.incrementor.getText();
        }
        
        metadata = {
          variable,
          startValue,
          endCondition,
          incrementExpression
        };
        break;

      default:
        if (node.getText) {
          value = node.getText();
        }
        break;
    }

    return {
      type: nodeType,
      children,
      value,
      location,
      metadata
    };
  }

  private convertTypeAnnotation(node: TypeScriptASTNode): TypeAnnotationInfo | null {
    if (!node.metadata?.hasTypeAnnotation) return null;

    const name = node.value as string;
    const typeScriptType = node.metadata.typeAnnotation as string;
    const isOptional = typeScriptType.includes('?') || name.includes('?');
    const isUnion = typeScriptType.includes('|');
    const isArray = typeScriptType.includes('[]') || typeScriptType.includes('Array<');

    let unionTypes: string[] | undefined;
    if (isUnion) {
      unionTypes = typeScriptType.split('|').map(t => t.trim());
    }

    const igcseType = this.convertTypeScriptTypeToIGCSE(typeScriptType);
    const warnings: string[] = [];

    // Generate specific warnings for different type features
    if (isUnion) {
      warnings.push(`Union type ${typeScriptType} converted to ${igcseType}. Manual review recommended.`);
    }

    if (isOptional) {
      warnings.push(`Optional parameter ${name} converted to regular parameter. Consider default value handling.`);
    }

    // Check for complex generic types
    if (typeScriptType.includes('<') && typeScriptType.includes('>')) {
      warnings.push(`Generic type ${typeScriptType} simplified to ${igcseType}. Type information may be lost.`);
    }

    // Check for function types
    if (typeScriptType.includes('=>')) {
      warnings.push(`Function type ${typeScriptType} converted to ${igcseType}. Consider converting to PROCEDURE/FUNCTION.`);
    }

    // Check for tuple types
    if (typeScriptType.startsWith('[') && typeScriptType.includes(',')) {
      warnings.push(`Tuple type ${typeScriptType} converted to ${igcseType}. Consider using separate variables.`);
    }

    // Check for literal types
    if (typeScriptType.includes('"') && typeScriptType.includes('|')) {
      warnings.push(`Literal union type ${typeScriptType} converted to ${igcseType}. Consider using constants.`);
    }

    // Check for any/unknown types
    if (typeScriptType.includes('any') || typeScriptType.includes('unknown')) {
      warnings.push(`Dynamic type ${typeScriptType} converted to ${igcseType}. Consider using specific type.`);
    }

    let igcseDeclaration = '';
    if (isArray) {
      // Handle multi-dimensional arrays
      const arrayDepth = (typeScriptType.match(/\[\]/g) || []).length;
      if (arrayDepth > 1) {
        igcseDeclaration = `DECLARE ${name} : ARRAY[1:n] OF ${igcseType} // Multi-dimensional array simplified`;
        warnings.push(`Multi-dimensional array converted to single dimension. Consider restructuring.`);
      } else {
        igcseDeclaration = `DECLARE ${name} : ARRAY[1:n] OF ${igcseType}`;
      }
    } else {
      igcseDeclaration = `DECLARE ${name} : ${igcseType}`;
    }

    return {
      name,
      typeScriptType,
      isArray,
      isOptional,
      isUnion,
      unionTypes,
      igcseType,
      igcseDeclaration,
      warnings
    };
  }

  private convertTypeScriptTypeToIGCSE(tsType: string): string {
    // Remove optional markers and array brackets for base type conversion
    let baseType = tsType.replace(/\?/g, '').replace(/\[\]/g, '').trim();
    
    // Handle Array<T> generic syntax
    baseType = baseType.replace(/Array<(.+)>/g, '$1');
    
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
        return 'STRING'; // Default to STRING for unknown types
      default:
        // For custom types, default to STRING
        return 'STRING';
    }
  }

  private getNodeTypeName(node: ts.Node): string {
    switch (node.kind) {
      case ts.SyntaxKind.SourceFile:
        return 'program';
      case ts.SyntaxKind.VariableStatement:
        return 'variable_statement';
      case ts.SyntaxKind.VariableDeclaration:
        return 'variable_declaration';
      case ts.SyntaxKind.FunctionDeclaration:
        return 'function_declaration';
      case ts.SyntaxKind.ArrowFunction:
        return 'arrow_function';
      case ts.SyntaxKind.ClassDeclaration:
        return 'class_declaration';
      case ts.SyntaxKind.MethodDeclaration:
        return 'method_declaration';
      case ts.SyntaxKind.PropertyDeclaration:
        return 'property_declaration';
      case ts.SyntaxKind.Identifier:
        return 'identifier';
      case ts.SyntaxKind.StringLiteral:
      case ts.SyntaxKind.NumericLiteral:
      case ts.SyntaxKind.TrueKeyword:
      case ts.SyntaxKind.FalseKeyword:
        return 'literal';
      case ts.SyntaxKind.IfStatement:
        return 'if_statement';
      case ts.SyntaxKind.WhileStatement:
        return 'while_statement';
      case ts.SyntaxKind.ForStatement:
        return 'for_statement';
      case ts.SyntaxKind.Block:
        return 'block';
      case ts.SyntaxKind.ExpressionStatement:
        return 'expression_statement';
      case ts.SyntaxKind.CallExpression:
        return 'call_expression';
      case ts.SyntaxKind.BinaryExpression:
        return 'binary_expression';
      case ts.SyntaxKind.PrefixUnaryExpression:
      case ts.SyntaxKind.PostfixUnaryExpression:
        return 'unary_expression';
      case ts.SyntaxKind.TemplateExpression:
      case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        return 'template_literal';
      case ts.SyntaxKind.ObjectBindingPattern:
        return 'object_destructuring';
      case ts.SyntaxKind.ArrayBindingPattern:
        return 'array_destructuring';
      case ts.SyntaxKind.VariableDeclaration:
        // Check if this is a destructuring assignment
        const varDecl = node as ts.VariableDeclaration;
        if (ts.isObjectBindingPattern(varDecl.name) || ts.isArrayBindingPattern(varDecl.name)) {
          return 'destructuring_assignment';
        }
        return 'variable_declaration';
      default:
        return `ts_${ts.SyntaxKind[node.kind].toLowerCase()}`;
    }
  }

  private getLocationFromNode(node: ts.Node): SourceLocation {
    if (!this.sourceFile) {
      return { line: 1, column: 1 };
    }

    const { line, character } = this.sourceFile.getLineAndCharacterOfPosition(node.getStart());
    return {
      line: line + 1, // TypeScript uses 0-based line numbers
      column: character + 1 // TypeScript uses 0-based column numbers
    };
  }

  private addDiagnosticError(diagnostic: ts.Diagnostic): void {
    let line = 1;
    let column = 1;

    if (diagnostic.file && diagnostic.start !== undefined) {
      const { line: tsLine, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      line = tsLine + 1;
      column = character + 1;
    }

    this.errors.push({
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      line,
      column,
      code: `TS${diagnostic.code}`,
      severity: 'error'
    });
  }

  private hasParseErrors(node: ts.Node): boolean {
    // Check for missing tokens or malformed syntax
    if (node.kind === ts.SyntaxKind.MissingDeclaration) {
      return true;
    }
    
    // Check for specific error patterns
    const sourceText = node.getFullText();
    
    // Check for incomplete variable declarations
    if (sourceText.includes('let') && sourceText.includes('=') && sourceText.includes('= ;')) {
      return true;
    }
    
    // Check for incomplete type annotations
    if (sourceText.includes(': =')) {
      return true;
    }
    
    // Recursively check children
    let hasErrors = false;
    ts.forEachChild(node, (child) => {
      if (this.hasParseErrors(child)) {
        hasErrors = true;
      }
    });
    
    return hasErrors;
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

  private getVisibility(modifiers?: ts.NodeArray<ts.ModifierLike>): 'public' | 'private' | 'protected' {
    if (!modifiers) return 'public';
    
    for (const modifier of modifiers) {
      if (ts.isModifier(modifier)) {
        switch (modifier.kind) {
          case ts.SyntaxKind.PrivateKeyword:
            return 'private';
          case ts.SyntaxKind.ProtectedKeyword:
            return 'protected';
          case ts.SyntaxKind.PublicKeyword:
            return 'public';
        }
      }
    }
    
    return 'public';
  }

  private traverseAST(node: TypeScriptASTNode, callback: (node: TypeScriptASTNode) => void): void {
    if (!node) return;

    callback(node);

    if (node.children) {
      for (const child of node.children) {
        this.traverseAST(child, callback);
      }
    }
  }

  private addError(message: string, line: number, column: number, code: string = 'PARSE_ERROR'): void {
    this.errors.push({
      message,
      line,
      column,
      code,
      severity: 'error'
    });
  }

  private addWarning(message: string, line: number, column: number, code: string): void {
    this.errors.push({
      message,
      line,
      column,
      code,
      severity: 'warning'
    });
  }

  private validateBasicSyntax(sourceCode: string): void {
    // Check for common syntax issues
    const openBraces = (sourceCode.match(/\{/g) || []).length;
    const closeBraces = (sourceCode.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      this.addError(
        `Mismatched braces: ${openBraces} opening braces, ${closeBraces} closing braces`,
        1, 1, 'SYNTAX_ERROR'
      );
    }

    const openParens = (sourceCode.match(/\(/g) || []).length;
    const closeParens = (sourceCode.match(/\)/g) || []).length;
    
    if (openParens !== closeParens) {
      this.addError(
        `Mismatched parentheses: ${openParens} opening parentheses, ${closeParens} closing parentheses`,
        1, 1, 'SYNTAX_ERROR'
      );
    }

    // Check for unterminated template literals (more precise check)
    const lines = sourceCode.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let inTemplate = false;
      let escaped = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (escaped) {
          escaped = false;
          continue;
        }
        
        if (char === '\\') {
          escaped = true;
          continue;
        }
        
        if (char === '`') {
          inTemplate = !inTemplate;
        }
      }
      
      if (inTemplate) {
        this.addError(`Unterminated template literal on line ${i + 1}`, i + 1, 1, 'SYNTAX_ERROR');
        break; // Only report the first one
      }
    }

    // Check for unsupported features and add warnings
    this.checkUnsupportedFeatures(sourceCode);
  }

  private checkUnsupportedFeatures(sourceCode: string): void {
    const unsupportedFeatures = [
      { pattern: /import\s+.*from/, feature: 'ES6 imports', suggestion: 'Remove import statements or add as comments' },
      { pattern: /export\s+/, feature: 'ES6 exports', suggestion: 'Remove export statements or add as comments' },
      { pattern: /async\s+/, feature: 'async/await', suggestion: 'Convert to synchronous code or add as comments' },
      { pattern: /await\s+/, feature: 'await expressions', suggestion: 'Convert to synchronous calls' },
      { pattern: /Promise\s*</, feature: 'Promises', suggestion: 'Convert to synchronous operations' },
      { pattern: /interface\s+/, feature: 'interfaces', suggestion: 'Convert to type comments or class definitions' },
      { pattern: /type\s+\w+\s*=/, feature: 'type aliases', suggestion: 'Convert to comments or use concrete types' },
      { pattern: /namespace\s+/, feature: 'namespaces', suggestion: 'Convert to classes or remove' },
      { pattern: /module\s+/, feature: 'modules', suggestion: 'Convert to classes or remove' },
      { pattern: /declare\s+/, feature: 'ambient declarations', suggestion: 'Remove declare statements' },
      { pattern: /abstract\s+/, feature: 'abstract classes', suggestion: 'Convert to concrete classes' },
      { pattern: /readonly\s+/, feature: 'readonly modifier', suggestion: 'Remove readonly modifier' },
      { pattern: /private\s+#/, feature: 'private fields', suggestion: 'Use private keyword instead' },
      { pattern: /\?\?/, feature: 'nullish coalescing', suggestion: 'Use conditional statements' },
      { pattern: /\?\./, feature: 'optional chaining', suggestion: 'Use explicit null checks' },
      { pattern: /as\s+/, feature: 'type assertions', suggestion: 'Remove type assertions' },
      { pattern: /<.*>/g, feature: 'generics', suggestion: 'Remove generic type parameters' },
      { pattern: /decorator|@\w+/, feature: 'decorators', suggestion: 'Remove decorators or convert to comments' }
    ];

    for (const { pattern, feature, suggestion } of unsupportedFeatures) {
      if (pattern.test(sourceCode)) {
        this.addWarning(
          `Unsupported feature detected: ${feature}. ${suggestion}`,
          1, 1, 'UNSUPPORTED_FEATURE'
        );
      }
    }
  }

  private checkCompilerDiagnostics(sourceCode: string): void {
    try {
      // Create a simple program to get compiler diagnostics
      const compilerOptions: ts.CompilerOptions = {
        target: ts.ScriptTarget.Latest,
        module: ts.ModuleKind.CommonJS,
        strict: false,
        noEmit: true
      };

      const program = ts.createProgram(['temp.ts'], compilerOptions, {
        getSourceFile: (fileName) => {
          if (fileName === 'temp.ts') {
            return ts.createSourceFile(fileName, sourceCode, ts.ScriptTarget.Latest, true);
          }
          return undefined;
        },
        writeFile: () => {},
        getCurrentDirectory: () => '',
        getDirectories: () => [],
        fileExists: () => true,
        readFile: () => '',
        getCanonicalFileName: (fileName) => fileName,
        useCaseSensitiveFileNames: () => true,
        getNewLine: () => '\n',
        getDefaultLibFileName: () => 'lib.d.ts'
      });

      const diagnostics = ts.getPreEmitDiagnostics(program);
      
      for (const diagnostic of diagnostics) {
        if (diagnostic.file && diagnostic.start !== undefined) {
          const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
          
          // Only add as warnings for now, not errors
          this.addWarning(
            `TypeScript diagnostic: ${message}`,
            line + 1, character + 1, `TS${diagnostic.code}`
          );
        }
      }
    } catch (error) {
      // If compiler diagnostics fail, just continue without them
      this.addWarning(
        'Could not run TypeScript compiler diagnostics',
        1, 1, 'DIAGNOSTIC_ERROR'
      );
    }
  }

  private validateAST(ast: TypeScriptASTNode): void {
    // Validate the generated AST for completeness and correctness
    this.traverseAST(ast, (node) => {
      // Check for incomplete nodes
      if (!node.type || node.type === 'unknown') {
        const line = node.location?.line || 1;
        const column = node.location?.column || 1;
        this.addError(
          `Incomplete AST node detected at line ${line}`,
          line, column, 'AST_VALIDATION_ERROR'
        );
      }

      // Check for missing required children
      if (node.type === 'variable_declaration' && node.children.length < 1) {
        const line = node.location?.line || 1;
        const column = node.location?.column || 1;
        this.addError(
          `Incomplete variable declaration at line ${line}`,
          line, column, 'AST_VALIDATION_ERROR'
        );
      }

      if (node.type === 'if_statement' && node.children.length < 2) {
        const line = node.location?.line || 1;
        const column = node.location?.column || 1;
        this.addError(
          `Incomplete if statement at line ${line}`,
          line, column, 'AST_VALIDATION_ERROR'
        );
      }

      // Check for unsupported node types that slipped through
      const unsupportedTypes = ['import_declaration', 'export_declaration', 'interface_declaration', 'type_alias'];
      if (unsupportedTypes.includes(node.type)) {
        const line = node.location?.line || 1;
        const column = node.location?.column || 1;
        this.addWarning(
          `Unsupported AST node type '${node.type}' at line ${line}`,
          line, column, 'UNSUPPORTED_AST_NODE'
        );
      }
    });
  }

  private createDescriptiveErrorMessage(error: unknown, sourceCode: string): string {
    if (error instanceof Error) {
      const baseMessage = error.message;
      
      // Try to extract line information from error message
      const lineMatch = baseMessage.match(/line (\d+)/);
      const line = lineMatch ? parseInt(lineMatch[1]) : 1;
      
      // Get context around the error
      const lines = sourceCode.split('\n');
      const contextLine = lines[line - 1];
      
      if (contextLine) {
        return `${baseMessage} near "${contextLine.trim()}" at line ${line}`;
      } else {
        return `${baseMessage} at line ${line}`;
      }
    }
    
    return 'Unknown parse error in TypeScript code';
  }}
