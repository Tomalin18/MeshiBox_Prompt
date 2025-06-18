# ふりがな支援與名片圖片顯示修復

## 修復概述

實現真正的五十音排序支援，通過添加ふりがな（讀音）欄位來確保準確排序，同時在名片詳情頁面添加拍攝照片的顯示功能。

## 問題分析

### 1. 五十音排序準確性問題
- **問題**：依賴漢字對照表無法涵蓋所有姓名和公司名
- **根本原因**：缺少實際的讀音信息（ふりがな）
- **解決方案**：添加專用的讀音欄位供用戶輸入

### 2. 名片詳情頁面缺少圖片
- **問題**：詳情頁面只顯示文字信息，沒有原始名片圖片
- **期望**：在頁面頂部顯示拍攝的名片照片

## 技術解決方案

### 1. 數據結構擴展

#### BusinessCard 接口更新
```typescript
export interface BusinessCard {
  id: string;
  name: string;
  nameReading?: string; // ふりがな - 姓名讀音
  company: string;
  companyReading?: string; // 公司名讀音
  // ... 其他欄位
}
```

#### OCR 結果接口更新
```typescript
export interface GoogleAIOCRResult {
  name?: string;
  nameReading?: string; // 姓名讀音（ふりがな）
  company?: string;
  companyReading?: string; // 公司名讀音
  // ... 其他欄位
}
```

### 2. 排序算法優化

#### 讀音優先排序
```typescript
static getKanaForSorting(text: string, reading?: string): string {
  // 優先使用提供的讀音
  if (reading && reading.trim()) {
    return this.normalizeKana(reading.trim());
  }
  
  // 備用：自動轉換邏輯
  // ...
}
```

#### 支援讀音參數的比較函數
```typescript
static compareKana(a: string, b: string, readingA?: string, readingB?: string): number {
  const kanaA = this.getKanaForSorting(a, readingA);
  const kanaB = this.getKanaForSorting(b, readingB);
  // 比較邏輯...
}
```

### 3. UI 界面更新

#### CardEditScreen 添加讀音輸入欄位
```typescript
{/* 基本情報區域 */}
{renderInputField('person-outline', '鴨山かほり', 'name')}
{renderInputField('text-outline', 'かもやま かほり', 'nameReading')}
{renderInputField('business-outline', '統一企業集團', 'company')}
{renderInputField('text-outline', 'とういつきぎょうしゅうだん', 'companyReading')}
```

#### CardDetailScreen 添加圖片和讀音顯示
```typescript
{/* 名片圖片 */}
{card.imageUri && (
  <View style={styles.cardImageSection}>
    <Image source={{ uri: card.imageUri }} style={styles.cardImage} />
  </View>
)}

{/* 基本信息含讀音 */}
<Text style={styles.cardName}>{card.name}</Text>
{card.nameReading && (
  <Text style={styles.cardNameReading}>{card.nameReading}</Text>
)}
```

### 4. OCR 智能提取

#### AI 提示更新
```
要提取的欄位：
- name: 姓名
- nameReading: 姓名讀音（ふりがな）
- company: 公司名稱  
- companyReading: 公司名讀音
```

#### 讀音自動推測
- 嘗試從名片上的ふりがな文字識別
- 基於漢字對照表提供建議讀音
- 允許用戶手動編輯和修正

### 5. 搜索功能增強

#### 包含讀音的搜索
```typescript
return allCards.filter(card => 
  card.name.toLowerCase().includes(lowercaseQuery) ||
  card.nameReading?.toLowerCase().includes(lowercaseQuery) ||
  card.company.toLowerCase().includes(lowercaseQuery) ||
  card.companyReading?.toLowerCase().includes(lowercaseQuery) ||
  // 其他欄位...
);
```

## 實現效果

### 1. 準確的五十音排序
- **真實讀音**：基於用戶輸入的實際讀音進行排序
- **智能備用**：沒有讀音時使用漢字對照表
- **正確分組**：按照真實的あいうえお順序分組

### 2. 完整的名片展示
- **原始圖片**：顯示拍攝的名片照片
- **讀音信息**：顯示姓名和公司的ふりがな
- **視覺層次**：圖片 → 基本信息 → 詳細聯絡信息

### 3. 智能輸入體驗
- **OCR 輔助**：自動提取可能的讀音信息
- **手動編輯**：用戶可以修正和補充讀音
- **搜索增強**：支援讀音搜索功能

## 使用場景

### 1. 標準日文名片
```
田中太郎 (たなか たろう)
株式会社ABC (かぶしきがいしゃ エービーシー)
```

### 2. 複雜漢字名片
```
鷲見一郎 (すみ いちろう)  
※ 需要手動輸入正確讀音
```

### 3. 外國公司名片
```
マイクロソフト (まいくろそふと)
Microsoft Japan (まいくろそふと じゃぱん)
```

## 技術亮點

1. **雙重保障**：讀音優先 + 自動轉換備用
2. **用戶友好**：直觀的ふりがな輸入界面
3. **智能OCR**：嘗試自動識別讀音信息
4. **完整展示**：圖片 + 文字的完整名片信息
5. **搜索增強**：支援讀音搜索提高查找效率

## 後續優化

1. **讀音驗證**：檢查輸入的讀音格式是否正確
2. **智能建議**：基於常見組合提供讀音建議
3. **語音輸入**：支援語音輸入讀音信息
4. **批量編輯**：批量修正已有名片的讀音信息
5. **學習功能**：記住用戶的讀音習慣和修正 