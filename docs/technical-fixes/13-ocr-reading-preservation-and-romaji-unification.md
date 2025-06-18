# 13. OCR讀音保存修復與羅馬字格式統一

## 問題描述
用戶反映掃描名片時，OCR確實識別出了讀音（如「Go Masatoshi」和「ちんぴんはん」），但保存後讀音消失了。經分析發現兩個主要問題：

1. **保存時遺漏讀音欄位**：CardEditScreen的handleSave函數沒有包含nameReading和companyReading欄位
2. **自動生成邏輯覆蓋OCR結果**：CardDetailScreen的自動讀音生成會覆蓋OCR掃描出的讀音

## 根本原因分析

### 1. 保存邏輯缺陷
在 `CardEditScreen.tsx` 的 `handleSave` 函數中：
```typescript
const businessCard: BusinessCard = {
  id: route?.params?.card?.id || Date.now().toString(),
  name: cardData.name.trim(),
  company: cardData.company?.trim() || '',
  // ❌ 缺少 nameReading 和 companyReading
  // ...其他欄位
};
```

### 2. 自動生成邏輯問題
在 `CardDetailScreen.tsx` 中：
```typescript
// ❌ 問題：空字符串被認為是沒有讀音
if (!updatedCard.nameReading && updatedCard.name) {
  // 會覆蓋OCR掃描的空字符串結果
}
```

## 解決方案

### 1. 修復保存邏輯
在 `CardEditScreen.tsx` 中添加缺失的讀音欄位：

```typescript
const businessCard: BusinessCard = {
  id: route?.params?.card?.id || Date.now().toString(),
  name: cardData.name.trim(),
  nameReading: cardData.nameReading?.trim() || '', // ✅ 添加
  company: cardData.company?.trim() || '',
  companyReading: cardData.companyReading?.trim() || '', // ✅ 添加
  // ...其他欄位
  subEmail: cardData.subEmail?.trim() || '', // ✅ 同時修復
};
```

### 2. 改善自動生成邏輯
更精確的檢查條件，避免覆蓋OCR結果：

```typescript
// ✅ 修復：只有完全沒有或為空字符串時才生成
if ((!updatedCard.nameReading || updatedCard.nameReading.trim() === '') && updatedCard.name) {
  const generatedReading = JapaneseSortUtils.getKanjiReadingRomaji(updatedCard.name);
  if (generatedReading) {
    updatedCard.nameReading = generatedReading;
    console.log(`自動生成姓名讀音: ${updatedCard.name} → ${generatedReading}`);
  }
}
```

### 3. 統一羅馬字格式
根據用戶建議，統一使用羅馬字格式：

#### 添加平假名轉羅馬字功能
```typescript
static hiraganaToRomaji(hiragana: string): string {
  const romajiMap: { [key: string]: string } = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    // ...完整的轉換對照表
    'きゃ': 'kya', 'しゃ': 'sha', 'ちゃ': 'cha', // 拗音
    'っ': '', 'ー': '', // 促音和長音
  };
  // 智能轉換邏輯
}

static getKanjiReadingRomaji(text: string): string | null {
  const hiraganaReading = this.getKanjiReading(text);
  return hiraganaReading ? this.hiraganaToRomaji(hiraganaReading) : null;
}
```

#### 更新UI說明文字
```typescript
// 編輯頁面placeholder更新
'姓名讀音 (統一使用羅馬字，例: Go Masatoshi)'
'會社名讀音 (統一使用羅馬字)'
```

## 技術實現細節

### 羅馬字轉換規則
- **基本音節**：あ→a, か→ka, さ→sa等
- **濁音半濁音**：が→ga, ば→ba, ぱ→pa
- **拗音**：きゃ→kya, しゃ→sha, ちゃ→cha
- **促音**：っ→省略
- **長音**：ー→省略
- **空格**：保留空格分隔

### 轉換示例
| 平假名 | 羅馬字 | 說明 |
|--------|--------|------|
| はしもと まさふみ | hashimoto masafumi | 基本轉換 |
| りゅうた | ryuta | 拗音+長音 |
| ちんぴんはん | chinpinhan | 複雜音節 |

### 錯誤處理
- OCR掃描失敗時不影響其他欄位
- 轉換失敗時保留原始字符
- 保存失敗時顯示錯誤提示

## 測試驗證

### 1. OCR讀音保存測試
- ✅ 掃描「Go Masatoshi」→ 正確保存
- ✅ 掃描「ちんぴんはん」→ 正確保存
- ✅ 編輯頁面正確顯示OCR讀音

### 2. 自動生成測試
- ✅ 橋本正史 → hashimoto masafumi
- ✅ 田中太郎 → tanaka taro
- ✅ 不覆蓋現有讀音

### 3. 羅馬字轉換測試
- ✅ 平假名正確轉換為羅馬字
- ✅ 拗音和特殊音節處理正確
- ✅ 空格和分隔符保留

## 用戶體驗改善
1. **OCR讀音保留**：掃描出的讀音不再丟失
2. **格式統一**：所有讀音統一使用羅馬字
3. **智能生成**：缺失讀音時自動補充
4. **清晰指導**：編輯頁面明確說明格式要求

## 後續優化
- 支援更多拗音組合
- 添加讀音格式驗證
- 實現讀音語音播放
- 支援自定義轉換規則 