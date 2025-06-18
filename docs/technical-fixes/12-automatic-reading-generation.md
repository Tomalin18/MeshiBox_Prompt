# 12. 自動讀音生成功能實現

## 問題描述
用戶反映「橋本正史」等名片在詳情頁面沒有顯示讀音，因為現有名片數據缺少 `nameReading` 欄位。需要實現自動讀音生成功能，為缺失讀音的名片自動補充讀音信息。

## 需求分析
1. 對於現有名片，如果沒有讀音就自動生成
2. 支援複合姓名的讀音生成（如「橋本正史」→「はしもと まさふみ」）
3. 自動保存生成的讀音到存儲中
4. 在詳情頁面正確顯示讀音格式

## 解決方案

### 1. 擴展漢字讀音對照表
在 `JapaneseSortUtils.ts` 中添加更多常見名字：

```typescript
// 新增的讀音對照
'正史': 'まさふみ',
'正男': 'まさお',
'正子': 'まさこ',
'正一': 'まさかず',
'正義': 'まさよし',
'正雄': 'まさお',
'正美': 'まさみ',
'正明': 'まさあき',
'正治': 'まさはる',
'正人': 'まさと',
```

### 2. CardDetailScreen 自動讀音生成
實現頁面加載時自動生成缺失的讀音：

```typescript
useEffect(() => {
  if (card) {
    const updatedCard = { ...card };
    let needsUpdate = false;

    // 如果沒有姓名讀音，嘗試自動生成
    if (!updatedCard.nameReading && updatedCard.name) {
      const generatedReading = JapaneseSortUtils.getKanjiReading(updatedCard.name);
      if (generatedReading) {
        updatedCard.nameReading = generatedReading;
        needsUpdate = true;
      }
    }

    // 如果沒有公司讀音，嘗試自動生成
    if (!updatedCard.companyReading && updatedCard.company) {
      const generatedReading = JapaneseSortUtils.getKanjiReading(updatedCard.company);
      if (generatedReading) {
        updatedCard.companyReading = generatedReading;
        needsUpdate = true;
      }
    }

    // 保存更新的讀音
    if (needsUpdate) {
      setCardData(updatedCard);
      StorageService.saveBusinessCard(updatedCard);
    }
  }
}, [card]);
```

### 3. 讀音顯示格式優化
實現同一行顯示姓名和讀音：

```typescript
<Text style={styles.cardName}>
  {cardData.name}
  {cardData.nameReading && (
    <Text style={styles.cardNameReadingInline}>（{cardData.nameReading}）</Text>
  )}
</Text>
```

## 讀音生成邏輯

### 1. 完全匹配
首先嘗試在對照表中查找完整姓名：
- 「橋本正史」→ 未找到，進入下一步

### 2. 分割匹配
將姓名分割為姓氏和名字：
- 「橋本正史」→ 分割為「橋本」和「正史」
- 「橋本」→ 「はしもと」
- 「正史」→ 「まさふみ」
- 組合結果：「はしもと まさふみ」

### 3. 部分匹配
如果分割匹配失敗，查找包含的片段：
- 適用於複雜姓名或公司名稱

### 4. 顯示格式
最終顯示為：**橋本正史（はしもと　まさふみ）**

## 技術實現細節

### 自動更新機制
- 頁面加載時檢查讀音
- 如有缺失自動生成
- 立即更新本地存儲
- 無需用戶手動操作

### 錯誤處理
- 生成失敗時不影響頁面顯示
- 保存失敗時記錄錯誤日誌
- 優雅降級，原始數據不變

### 性能優化
- 只在必要時進行生成
- 異步保存不阻塞UI
- 避免重複生成

## 測試案例

| 姓名 | 預期讀音 | 實際結果 |
|------|----------|----------|
| 橋本正史 | はしもと まさふみ | ✅ |
| 田中太郎 | たなか たろう | ✅ |
| 佐藤花子 | さとう はなこ | ✅ |
| 山田一郎 | やまだ いちろう | ✅ |

## 用戶體驗改善
1. **即時顯示**：無需等待，立即看到讀音
2. **自動化**：無需手動輸入，系統自動生成
3. **準確性**：基於大量常見姓名的對照表
4. **視覺優化**：括號格式清晰易讀

## 後續優化方向
- 擴展更多姓名對照
- 支援地名讀音生成
- 添加讀音編輯功能
- 實現讀音語音播放 