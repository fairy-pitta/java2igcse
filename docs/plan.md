# Java to IGCSE Pseudocode Converter - 開発計画

## 📋 プロジェクト概要

JavaのソースコードをIGCSE Computer Science仕様のpseudocodeに変換するライブラリを開発する。

## 🎯 目標

- Javaの基本的な構文をIGCSE pseudocode形式に変換
- 読みやすく、IGCSE試験で使用可能な形式での出力
- 段階的な実装により、徐々に対応範囲を拡大

## 🏗️ アーキテクチャ設計

### コンポーネント構成

```
java2ibscg/
├── src/
│   ├── parser/          # Java構文解析
│   ├── converter/       # 変換ロジック
│   ├── formatter/       # pseudocode出力フォーマット
│   ├── types/          # TypeScript型定義
│   └── index.ts        # メインエントリーポイント
├── test/               # テストケース
├── examples/           # サンプルコード
├── dist/               # コンパイル済みJavaScript
└── docs/              # ドキュメント
```

### 主要クラス設計

1. **JavaParser** - Java AST解析（TypeScript実装）
2. **PseudocodeConverter** - 変換メインロジック
3. **PseudocodeFormatter** - 出力フォーマット
4. **ConverterConfig** - 変換設定管理
5. **ASTNode** - Java AST型定義

## 🔄 変換対応範囲

### Phase 1: 基本構文
- [x] 変数宣言 (`int x = 5` → `DECLARE x : INTEGER`)
- [x] 代入文 (`x = 10` → `x ← 10`)
- [x] 基本演算子 (`+`, `-`, `*`, `/`, `%` → `+`, `-`, `*`, `/`, `MOD`)
- [x] 入出力 (`System.out.println()` → `OUTPUT`, `Scanner` → `INPUT`)

### Phase 2: 制御構造
- [x] if-else文 → `IF-THEN-ELSE-ENDIF`
- [x] switch文 → `CASE-ENDCASE`
- [x] for文 → `FOR-TO-NEXT`
- [x] while文 → `WHILE-ENDWHILE`
- [x] do-while文 → `REPEAT-UNTIL`

### Phase 3: データ構造
- [x] 配列 → `ARRAY[1:n] OF TYPE`
- [x] 文字列操作
- [x] クラス → `TYPE-ENDTYPE` (Record)

### Phase 4: 高度な機能
- [x] メソッド → `PROCEDURE/FUNCTION`
- [x] パラメータ渡し → `BYREF`
- [x] ファイル操作 → `OPENFILE/READFILE/CLOSEFILE`
- [x] 継承 → `INHERITS`

## ⚠️ 実装上の重要な課題と対策

### 1. ネスト構造（再帰）の無限ループ対策

**問題**: 深いネスト構造や循環参照により無限再帰が発生する可能性

**対策**:
```typescript
interface ConversionContext {
  depth: number;
  maxDepth: number; // デフォルト: 50
  visitedNodes: Set<string>; // ノードIDの追跡
  parentChain: string[]; // 親ノードのチェーン
}

class RecursionGuard {
  static convert(node: ASTNode, context: ConversionContext): string {
    // 深度チェック
    if (context.depth > context.maxDepth) {
      throw new Error(`Maximum recursion depth exceeded: ${context.maxDepth}`);
    }
    
    // 循環参照チェック
    const nodeId = this.getNodeId(node);
    if (context.visitedNodes.has(nodeId)) {
      throw new Error(`Circular reference detected: ${nodeId}`);
    }
    
    context.visitedNodes.add(nodeId);
    context.depth++;
    
    try {
      return this.doConvert(node, context);
    } finally {
      context.visitedNodes.delete(nodeId);
      context.depth--;
    }
  }
}
```

### 2. if-elif-else構造の正しい処理

**問題**: `else if`の前に誤って`ENDIF`を出力してしまう

**対策**:
```typescript
class IfElseConverter {
  convert(ifNode: ASTNode): string {
    const conditions = this.extractConditions(ifNode);
    let result = '';
    
    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      
      if (i === 0) {
        // 最初のIF
        result += `IF ${condition.expression} THEN\n`;
      } else if (condition.isElse) {
        // 最後のELSE
        result += `ELSE\n`;
      } else {
        // 中間のELSE IF (IGCSEではネストしたIF-ELSEとして表現)
        result += `ELSE\n`;
        result += `   IF ${condition.expression} THEN\n`;
      }
      
      result += this.convertBlock(condition.body, i > 0 ? '   ' : '');
    }
    
    // 適切な数のENDIFを追加
    const endifCount = conditions.filter(c => !c.isElse && conditions.indexOf(c) > 0).length + 1;
    for (let i = 0; i < endifCount; i++) {
      result += 'ENDIF\n';
    }
    
    return result;
  }
}
```

### 3. Procedure vs Function の判別

**問題**: Javaのメソッドが値を返すかどうかでPROCEDUREとFUNCTIONを区別する必要

**対策**:
```typescript
class MethodConverter {
  convert(methodNode: ASTNode): string {
    const returnType = this.getReturnType(methodNode);
    const hasReturnStatement = this.hasReturnStatement(methodNode.body);
    
    // 判別ロジック
    const isProcedure = returnType === 'void' || 
                       (!hasReturnStatement && returnType !== 'void');
    
    if (isProcedure) {
      return this.convertToProcedure(methodNode);
    } else {
      return this.convertToFunction(methodNode);
    }
  }
  
  private hasReturnStatement(body: ASTNode): boolean {
    // 再帰的にreturn文を検索（ネスト対策済み）
    return this.searchReturnStatement(body, new Set());
  }
  
  private convertToProcedure(methodNode: ASTNode): string {
    const name = methodNode.name;
    const params = this.convertParameters(methodNode.parameters);
    const body = this.convertMethodBody(methodNode.body);
    
    return `PROCEDURE ${name}(${params})\n${body}ENDPROCEDURE\n`;
  }
  
  private convertToFunction(methodNode: ASTNode): string {
    const name = methodNode.name;
    const params = this.convertParameters(methodNode.parameters);
    const returnType = this.mapJavaTypeToIGCSE(methodNode.returnType);
    const body = this.convertMethodBody(methodNode.body);
    
    return `FUNCTION ${name}(${params}) RETURNS ${returnType}\n${body}ENDFUNCTION\n`;
  }
}
```

### 4. エラーハンドリングとデバッグ支援

```typescript
class ConversionError extends Error {
  constructor(
    message: string,
    public node: ASTNode,
    public context: ConversionContext
  ) {
    super(`${message} at line ${node.position?.line}, column ${node.position?.column}`);
  }
}

class DebugLogger {
  static logConversion(node: ASTNode, result: string, context: ConversionContext) {
    if (process.env.DEBUG_CONVERSION) {
      console.log(`[${context.depth}] ${node.type} -> ${result.substring(0, 50)}...`);
    }
  }
}
```

## 🛠️ 実装戦略

### 1. パーサー実装
- **ライブラリ選択**: java-parser (npm: java-parser) または自作パーサー
- **理由**: TypeScript/Node.js環境での軽量なJava構文解析

### 2. 変換ルール定義
```typescript
interface ConversionRule {
  canHandle(javaNode: ASTNode): boolean;
  convert(javaNode: ASTNode, context: ConversionContext): string;
}

interface ASTNode {
  type: string;
  value?: any;
  children?: ASTNode[];
  position?: SourcePosition;
}
```

### 3. 出力フォーマット
- **インデント**: 3スペース（IGCSE推奨）
- **キーワード**: 全て大文字
- **フォント**: monospace推奨の注釈付き

## 📝 変換例

### Java入力
```java
public class Example {
    public static void main(String[] args) {
        int x = 5;
        if (x > 3) {
            System.out.println("Large");
        } else {
            System.out.println("Small");
        }
    }
}
```

### IGCSE Pseudocode出力
```pseudocode
DECLARE x : INTEGER
x ← 5
IF x > 3 THEN
   OUTPUT "Large"
ELSE
   OUTPUT "Small"
ENDIF
```

## 🧪 テスト戦略

### 単体テスト
- 各変換ルールの個別テスト
- エッジケースの検証
- 無効な入力の処理

### 統合テスト
- 完全なJavaプログラムの変換
- 複雑な制御構造の組み合わせ
- 実際のIGCSE問題例での検証

### テストケース例
```
test/
├── basic/
│   ├── variables.java
│   ├── operators.java
│   └── io.java
├── control/
│   ├── if_else.java
│   ├── loops.java
│   └── switch.java
└── advanced/
    ├── arrays.java
    ├── methods.java
    └── classes.java
```


## 🔧 技術スタック

- **言語**: TypeScript 5.0+
- **ランタイム**: Node.js 18+
- **パーサー**: java-parser (npm)
- **ビルドツール**: npm/yarn + tsc
- **テスト**: Vitest + @vitest/ui
- **リンター**: ESLint + Prettier
- **CI/CD**: GitHub Actions

## 📚 参考資料

- IGCSE Computer Science Pseudocode仕様 (`igsce-rules.md`)
- JavaParser公式ドキュメント
- IGCSE過去問題集

## 📅 開発スケジュール

### Week 1-2: 基盤構築
- TypeScriptプロジェクト構造設定
- package.json、tsconfig.json、vitest.config.ts設定
- java-parser (npm) の統合
- 再帰ガード機能付き変換フレームワーク
- エラーハンドリング基盤
- デバッグ支援機能

### Week 3-4: Phase 1実装
- 変数、演算子、入出力の変換
- 基本テストケース作成（Vitest）
- 再帰ガードのテスト

### Week 5-6: Phase 2実装
- 制御構造の変換（if-elif-else対策済み）
- 複雑なネスト構造の対応
- 無限再帰防止機能のテスト

### Week 7-8: Phase 3-4実装
- データ構造とメソッドの変換
- Procedure/Function判別機能
- 高度な機能の実装

## 🚀 将来の拡張

- **IDE統合**: VS Code拡張機能
- **Web版**: ブラウザでの変換ツール（WebAssembly対応）
- **CLI版**: コマンドライン変換ツール
- **逆変換**: Pseudocode → Java
- **他言語対応**: Python, C++ → IGCSE Pseudocode
- **npm パッケージ**: 他のプロジェクトでの利用

## ⚠️ 制限事項

- 複雑なJavaの機能（ジェネリクス、ラムダ式等）は対象外
- IGCSEレベルに適した簡潔な変換を優先
- 完全な意味保持よりも教育的価値を重視

---

**次のステップ**: TypeScriptプロジェクトの初期化（package.json、tsconfig.json作成）とJavaパーサーライブラリの調査・選定から開始する。