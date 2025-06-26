# インデント問題包括的レポート

## 概要

制御フローテストにおいて、生成される疑似コードのインデントが期待値と一致しない問題が発生しています。この問題は主に以下の制御構造で発生しており、現在5つのテストケースが失敗している状況です。

## 失敗しているテストケース

### 1. Continue文を含むFor文
**テストケース:** `should convert continue statement in loop`
```java
for (int i = 0; i < 10; i++) { if (i % 2 == 0) continue; sum += i; }
```

**期待される出力:**
```
FOR i ← 0 TO 9
   IF i MOD 2 = 0 THEN
      NEXT FOR
   ENDIF
   sum ← sum + i
ENDFOR
```

**実際の出力:**
```
FOR i ← 0 TO 9
   IF i MOD 2 = 0 THEN
    NEXT FOR
 ENDIF
 sum ← sum + i
ENDFOR
```

**問題点:**
- `NEXT FOR`: 4スペース（期待値6スペース）
- `ENDIF`: 1スペース（期待値3スペース）
- `sum ← sum + i`: 1スペース（期待値3スペース）

### 2. Switch文の複数case
**テストケース:** `should convert switch with multiple cases`

### 3. While文の複雑な条件
**テストケース:** `should convert while loop with complex condition`

### 4. Do-While文の複雑な条件
**テストケース:** `should convert do-while with complex condition`

### 5. 複雑な制御構造のネスト
**テストケース:** `should convert nested control structures`

## 根本原因の詳細分析

### 1. インデント管理の不整合

現在のコードでは、各制御構造が独自のインデント適用方法を持っており、一貫性がありません：

#### IF文の処理 (convertIfStatement)
```typescript
const thenBranch = this.convertBlock(node.thenBranch!, { ...context, indentLevel: context.indentLevel + 1 });
result.push(...thenBranch.map(line => indent(context.indentLevel + 1) + line));
```
**問題:** `convertBlock`で既にインデントレベルを+1しているのに、さらに`indent(context.indentLevel + 1)`を適用している（二重インデント）

#### FOR文の処理 (convertForStatement)
```typescript
if (Array.isArray(bodyNode)) {
  body = bodyNode.flatMap(stmt => this.convertNode(stmt, { ...context, indentLevel: context.indentLevel + 1 }));
} else {
  body = this.convertNode(bodyNode, { ...context, indentLevel: context.indentLevel + 1 });
}
result.push(...body.map(line => indent(context.indentLevel + 1) + line));
```
**問題:** IF文と同様の二重インデント問題

### 2. convertBlockメソッドの問題

```typescript
private convertBlock(node: ASTNode, context: ConversionContext): string[] {
  const statementsRaw = node.children || node.body || [];
  const statements = Array.isArray(statementsRaw) ? statementsRaw : [statementsRaw];
  const results: string[] = [];
  
  for (const stmt of statements) {
    const converted = this.convertNode(stmt, context);
    results.push(...converted);
  }
  
  return results.filter(line => line.trim().length > 0);
}
```
**問題:** `convertBlock`はインデントレベルを受け取るが、実際にはインデントを適用していない

### 3. 個別メソッドでのインデント処理の不統一

- `convertContinueStatement`: インデントを適用しない
- `convertAssignment`: インデントを適用しない
- `convertIfStatement`: 二重インデントを適用
- `convertForStatement`: 二重インデントを適用

## 現在のコード構造の問題点

### 1. インデント責任の曖昧さ
- どのメソッドがインデントを適用するかが不明確
- 上位メソッドと下位メソッドの両方でインデント処理が発生

### 2. コンテキストの不適切な使用
- `indentLevel`を渡しているが、実際の適用が一貫していない
- ネストした構造での計算が複雑化

### 3. 未使用メソッドの存在
- `applyIndent`メソッドが定義されているが使用されていない
- TypeScriptコンパイル警告が発生

## 影響を受けるテストの詳細

### 通過しているテスト (14個)
- 単純なIF文
- 単純なFOR文
- 基本的なWHILE文
- 単純なSwitch文
- Break文を含むループ

### 失敗しているテスト (5個)
1. `should convert continue statement in loop`
2. `should convert switch with multiple cases`
3. `should convert while loop with complex condition`
4. `should convert do-while with complex condition`
5. `should convert nested control structures`

## 推奨される解決策

### 1. 統一されたインデント管理システムの実装

```typescript
// 統一されたインデント適用
private applyIndent(lines: string[], indentLevel: number): string[] {
  const indentStr = indent(indentLevel);
  return lines.map(line => {
    if (line.trim() === '') return line;
    return indentStr + line;
  });
}

// インデント責任の明確化
private convertWithIndent(node: ASTNode, context: ConversionContext): string[] {
  const result = this.convertNode(node, context);
  return this.applyIndent(result, context.indentLevel);
}
```

### 2. convertBlockメソッドの修正

```typescript
private convertBlock(node: ASTNode, context: ConversionContext): string[] {
  const statementsRaw = node.children || node.body || [];
  const statements = Array.isArray(statementsRaw) ? statementsRaw : [statementsRaw];
  const results: string[] = [];
  
  for (const stmt of statements) {
    const converted = this.convertNode(stmt, context);
    results.push(...converted);
  }
  
  return results.filter(line => line.trim().length > 0);
}
```

### 3. 制御構造メソッドの統一

各制御構造メソッドで一貫したインデント適用を行う：

```typescript
private convertIfStatement(node: ASTNode, context: ConversionContext): string[] {
  const condition = this.convertNode(node.condition!, context);
  const result: string[] = [];
  
  result.push(`IF ${condition.join(' ')} THEN`);
  
  const thenBranch = this.convertBlock(node.thenBranch!, { ...context, indentLevel: context.indentLevel + 1 });
  result.push(...this.applyIndent(thenBranch, context.indentLevel + 1));
  
  if (node.elseBranch) {
    // ELSE処理
  }
  
  result.push('ENDIF');
  return this.applyIndent(result, context.indentLevel);
}
```

## 実装上の制約

### 1. ファイル修正制限
- 各ファイルを1回のみ修正可能
- `JavaToPseudocodeConverter.ts`は既に修正済み
- 追加の修正ができない状況

### 2. TypeScriptコンパイル警告
- `applyIndent`メソッドが未使用
- 実装を完了する必要がある


## 関連ファイル

- **メインファイル**: `/Users/shuna/java2ibscg/src/converter/JavaToPseudocodeConverter.ts`
- **テストファイル**: `/Users/shuna/java2ibscg/test/controlflow.test.ts`
- **デバッグスクリプト**: `/Users/shuna/java2ibscg/debug-indent.js`
- **ユーティリティ**: `/Users/shuna/java2ibscg/src/utils/indent.ts`

---

**作成日**: 2024年12月
**ステータス**: 詳細調査完了、解決策提案済み
**優先度**: 高（5つのテストケースが失敗中）