# 訂閱功能隱藏和相機權限按鈕文字修改

## 📋 修改概述

根據用戶要求，由於目前沒有實際訂閱制度，需要暫時隱藏訂閱相關功能，並將相機權限請求按鈕的日文改為中性詞彙。

### 修改內容
1. **隱藏訂閱功能**：不跳轉訂閱頁面，直接進入主功能
2. **相機權限按鈕**：將「許可する」改為「繼續」

## 🔧 修改詳情

### 1. LoadingScreen 導航修改

**修改文件**：`src/screens/LoadingScreen.tsx`

**修改內容**：
```typescript
// 修改前
const timer = setTimeout(() => {
  navigation.navigate('Subscription');
}, 2500);

// 修改後
const timer = setTimeout(() => {
  navigation.navigate('CardList');
}, 2500);
```

**說明**：
- 應用啟動後直接進入名片列表頁面
- 跳過訂閱頁面，用戶可直接使用核心功能
- 保持2.5秒的載入時間以確保良好的用戶體驗

### 2. SettingsScreen 訂閱區塊隱藏

**修改文件**：`src/screens/SettingsScreen.tsx`

**修改內容**：
```typescript
// 隱藏整個會員狀態區塊
{/* 暫時隱藏訂閱相關功能
<View style={styles.section}>
  {renderSectionTitle('メンバーシップ')}
  
  {renderCard(
    'diamond',
    'メンバーシップの状態 無料版',
    `残りスキャン回数: ${remainingScans}`,
    () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('subscription');
    }
  )}
  
  {renderCard(
    'refresh',
    '購入を復元',
    undefined,
    handleRestorePurchases
  )}
</View>
*/}
```

**保留功能**：
- ✅ CSV 匯出功能
- ✅ 支援功能（評價、聯絡）
- ✅ 版本資訊顯示

**隱藏功能**：
- ❌ 會員狀態顯示
- ❌ 訂閱升級按鈕
- ❌ 購買復原功能

### 3. 相機權限按鈕文字修改

**修改文件**：`src/screens/CameraScreen.tsx`

**修改內容**：
```typescript
// 修改前
<Text style={styles.settingsButtonText}>許可する</Text>

// 修改後
<Text style={styles.settingsButtonText}>繼續</Text>
```

**說明**：
- 將日文「許可する」改為中性的「繼續」
- 符合多語言友好的設計原則
- 按鈕功能保持不變，仍然觸發相機權限請求

## 💡 設計考量

### 訂閱功能隱藏策略
1. **註釋而非刪除**：使用註釋方式隱藏，便於未來重新啟用
2. **保持代碼完整性**：相關服務類和類型定義保持不變
3. **用戶體驗優先**：直接進入核心功能，減少阻擋

### 按鈕文字優化
1. **語言中性**：避免特定語言依賴
2. **語義清晰**：「繼續」清楚表達下一步操作
3. **保持一致性**：與其他界面的按鈕風格統一

## 🔄 未來復原計劃

### 重新啟用訂閱功能
1. 移除 LoadingScreen 中的註釋
2. 移除 SettingsScreen 中的註釋區塊
3. 可考慮添加開關控制是否顯示訂閱功能

### 多語言支持
- 可建立語言文件統一管理按鈕文字
- 支援中文、日文、英文等多種語言切換

## 📊 影響評估

### 正面影響
- ✅ 用戶可直接使用核心功能
- ✅ 減少用戶流失和困惑
- ✅ 簡化應用流程

### 注意事項
- ⚠️ 用戶無法升級到Pro版
- ⚠️ 需要其他方式控制使用限制
- ⚠️ 未來重新啟用時需要完整測試

## 🏷️ 標籤
- **類型**: 🔧 Feature Hide
- **優先級**: 🟡 High
- **狀態**: ✅ 已完成

## 📅 實施記錄
- **開始時間**: 2024-12-20
- **完成時間**: 2024-12-20
- **分支**: hide-subscription-and-fix-camera-permission
- **修改文件**: 3個文件
- **測試狀態**: 待測試 