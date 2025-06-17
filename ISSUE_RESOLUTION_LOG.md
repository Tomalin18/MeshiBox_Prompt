# MeishiBox 問題解決日誌

## 2024年12月19日 - iOS 模擬器文件系統權限錯誤

### 問題描述
用戶在 iOS 模擬器中運行 MeishiBox 應用時遇到以下錯誤：

```
ERROR Failed to load business cards: [Error: Failed to create storage directory.Error Domain=NSCocoaErrorDomain Code=512 "The file "@anonymous" couldn't be saved in the folder "ExponentExperienceData".]
```

### 錯誤分析

1. **錯誤類型**: NSCocoaErrorDomain Code=512
2. **錯誤原因**: iOS 模擬器中的文件系統權限限制
3. **影響範圍**: 
   - 名片數據導出功能
   - CSV 文件生成
   - vCard 文件創建
   - 單個名片數據導出

### 技術細節

**問題根源**:
- `FileSystem.documentDirectory` 在 iOS 模擬器中可能不存在或無權限
- ExportService 中直接使用 `FileSystem.documentDirectory + fileName` 沒有檢查目錄存在性
- 缺少錯誤處理和降級機制

**受影響的文件**:
- `src/services/ExportService.ts` (主要)
- `src/screens/SettingsScreen.tsx` (調用導出功能)

### 解決方案實施

#### 1. 創建目錄存在性檢查方法

在 `ExportService.ts` 中添加 `ensureDirectoryExists()` 方法：

```typescript
private static async ensureDirectoryExists(): Promise<string> {
  try {
    const documentDirectory = FileSystem.documentDirectory;
    if (!documentDirectory) {
      throw new Error('Document directory not available');
    }

    // 檢查目錄是否存在
    const dirInfo = await FileSystem.getInfoAsync(documentDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(documentDirectory, { intermediates: true });
    }

    return documentDirectory;
  } catch (error) {
    console.error('Failed to ensure directory exists:', error);
    // 降級到緩存目錄
    const cacheDirectory = FileSystem.cacheDirectory;
    if (cacheDirectory) {
      const dirInfo = await FileSystem.getInfoAsync(cacheDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(cacheDirectory, { intermediates: true });
      }
      return cacheDirectory;
    }
    throw new Error('No available directory for file storage');
  }
}
```

#### 2. 更新所有文件創建方法

修改以下方法使用新的目錄檢查：
- `saveAndShareCSV()`
- `saveAndShareVCard()`
- `exportSingleCard()`

**修改前**:
```typescript
const fileUri = FileSystem.documentDirectory + fileName;
```

**修改後**:
```typescript
const baseDirectory = await this.ensureDirectoryExists();
const fileUri = baseDirectory + fileName;
```

#### 3. 降級策略

實現了智能降級機制：
1. 首先嘗試使用 `FileSystem.documentDirectory`
2. 如果失敗，自動降級到 `FileSystem.cacheDirectory`
3. 如果都失敗，拋出明確的錯誤信息

### 測試驗證

創建了測試腳本 `test-fix.js` 來驗證修復：
- 測試目錄創建
- 測試文件寫入
- 測試降級機制
- 測試清理功能

### 部署步驟

1. **代碼修改**: ✅ 完成
2. **測試驗證**: ✅ 完成
3. **文檔更新**: ✅ 完成
4. **提交代碼**: ✅ 完成

```bash
git add .
git commit -m "Fix: Resolve iOS simulator file system permission errors"
```

### 預防措施

1. **添加到故障排除指南**: 
   - 更新 `TROUBLESHOOTING.md` 包含此問題的解決方案
   - 添加 iOS 模擬器重置指令
   - 提供替代測試方法

2. **代碼改進**:
   - 所有文件操作都添加了錯誤處理
   - 實現了降級機制
   - 添加了詳細的日誌記錄

3. **測試建議**:
   - 在真實設備上測試
   - 定期重置 iOS 模擬器
   - 監控文件系統操作的錯誤

### 後續監控

需要關注的指標：
- 文件導出成功率
- iOS 模擬器 vs 真實設備的行為差異
- 用戶反饋的文件系統相關問題

### 相關文件更新

1. **`src/services/ExportService.ts`** - 主要修復
2. **`TROUBLESHOOTING.md`** - 添加新的故障排除項目
3. **`test-fix.js`** - 測試驗證腳本
4. **`ISSUE_RESOLUTION_LOG.md`** - 本文檔

### 學習要點

1. **iOS 模擬器限制**: 文件系統權限比真實設備更嚴格
2. **錯誤處理重要性**: 需要為所有文件操作添加適當的錯誤處理
3. **降級策略**: 在主要方案失敗時提供替代方案
4. **測試環境差異**: 模擬器和真實設備的行為可能不同

---

**解決者**: AI Assistant  
**解決時間**: 2024年12月19日  
**狀態**: ✅ 已解決  
**驗證**: ✅ 已測試 