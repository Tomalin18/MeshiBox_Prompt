# 日文假名排序與真實數據顯示修復

## 修復概述

修復名片一覽頁面的日文假名排序功能，以及名片詳情頁面顯示真實數據的問題。

## 問題分析

### 1. 排序問題
- **問題**：「名前順」和「会社名順」使用簡單的 `localeCompare`，無法正確處理日文假名排序
- **期望**：按照あいうえお順序進行排序和分組顯示

### 2. 詳情頁面數據問題
- **問題**：CardDetailScreen 顯示硬編碼的 mock 數據，而不是傳入的真實名片數據
- **期望**：顯示實際掃描和編輯後的名片信息

## 技術解決方案

### 1. 日文假名排序工具類

創建 `JapaneseSortUtils.ts` 工具類：

#### 核心功能
- **假名轉換**：漢字轉假名讀音對照
- **標準化處理**：片假名轉平假名統一處理
- **權重排序**：按あいうえお順序分配權重
- **分組標籤**：生成あ、か、さ等分組標籤

#### 漢字讀音對照表
```typescript
const KANJI_READING_MAP = {
  // 常見姓氏
  '田中': 'たなか', '佐藤': 'さとう', '鈴木': 'すずき',
  // 常見名字
  '太郎': 'たろう', '花子': 'はなこ',
  // 常見公司名
  'トヨタ': 'とよた', 'ソニー': 'そにー',
  // ... 更多對照
};
```

#### 排序算法
```typescript
static compareKana(a: string, b: string): number {
  const kanaA = this.getKanaForSorting(a);
  const kanaB = this.getKanaForSorting(b);
  
  // 逐字符比較權重
  for (let i = 0; i < maxLength; i++) {
    const weightA = this.getKanaWeight(charA);
    const weightB = this.getKanaWeight(charB);
    
    if (weightA !== weightB) {
      return weightA - weightB;
    }
  }
}
```

### 2. CardListScreen 排序更新

#### 更新前
```typescript
switch (sortBy) {
  case 'name':
    sortedCards.sort((a, b) => a.name.localeCompare(b.name));
    break;
  case 'company':
    sortedCards.sort((a, b) => a.company.localeCompare(b.company));
    break;
}

// 簡單按首字母分組
sortedCards.forEach(card => {
  const firstLetter = card.name.charAt(0).toUpperCase();
  groups[firstLetter].push(card);
});
```

#### 更新後
```typescript
switch (sortBy) {
  case 'name':
    sortedCards = JapaneseSortUtils.sortByName(sortedCards);
    break;
  case 'company':
    sortedCards = JapaneseSortUtils.sortByCompany(sortedCards);
    break;
}

// 使用日文分組
const groupBy = sortBy === 'name' ? 'name' : 'company';
const groupedItems = JapaneseSortUtils.groupItems(sortedCards, groupBy);
```

### 3. CardDetailScreen 真實數據顯示

#### 更新前（硬編碼數據）
```typescript
{renderContactItem(
  'phone-portrait-outline',
  '070-1319-4481', // 硬編碼
  'call',
  () => handlePhoneCall('070-1319-4481')
)}
```

#### 更新後（真實數據）
```typescript
{card.mobile && renderContactItem(
  'phone-portrait-outline',
  card.mobile, // 使用真實數據
  'call',
  () => handlePhoneCall(card.mobile!)
)}
```

#### 添加名片基本信息顯示
```typescript
<View style={styles.cardInfoSection}>
  <View style={styles.cardInfoContainer}>
    <Text style={styles.cardName}>{card.name}</Text>
    <Text style={styles.cardCompany}>{card.company}</Text>
    {card.department && (
      <Text style={styles.cardDepartment}>{card.department}</Text>
    )}
    {card.position && (
      <Text style={styles.cardPosition}>{card.position}</Text>
    )}
  </View>
</View>
```

## 實現效果

### 1. 日文排序效果
- **名前順**：按照假名讀音あいうえお順序排列
- **会社名順**：公司名按照假名讀音排序
- **分組顯示**：あ、か、さ、た等假名分組標籤

### 2. 真實數據顯示
- **聯絡信息**：顯示實際的電話、郵件、網站等
- **公司信息**：顯示真實的地址、部門、職位等
- **條件顯示**：只顯示有數據的欄位，避免空白項目

## 測試場景

### 1. 排序測試
- 創建包含平假名、片假名、漢字的名片
- 測試名前順排序是否按あいうえお順序
- 測試会社名順排序是否正確
- 驗證分組標籤是否正確

### 2. 數據顯示測試  
- 掃描名片後查看詳情頁面
- 編輯名片信息後查看更新
- 測試各種欄位的條件顯示
- 驗證聯絡方式的功能性（撥號、郵件等）

## 技術亮點

1. **智能假名轉換**：支援漢字到假名的智能轉換
2. **完整分組系統**：あいうえお標準分組
3. **條件渲染**：只顯示有數據的欄位
4. **功能性聯絡**：支援直接撥號、發郵件等操作

## 後續優化

1. **擴展漢字對照表**：添加更多常見姓名和公司名
2. **機器學習讀音**：集成更智能的漢字讀音識別
3. **用戶自定義**：允許用戶手動設定讀音
4. **國際化支援**：支援其他語言的排序規則 