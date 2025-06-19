# SettingsScreen CSV匯出功能實現與Header高度統一

## 修復概述

實現SettingsScreen的CSV匯出功能，移除Pro版限制，讓用戶可以直接匯出所有名片資料為CSV格式。同時統一header高度，保持與其他頁面的視覺一致性。

## 問題分析

### 1. CSV匯出功能被限制
- **問題**：CSV匯出功能被限制為Pro版功能，用戶無法使用
- **表現**：點擊匯出時顯示"Pro版でご利用いただけます"提示
- **影響**：用戶無法備份或轉移名片資料

### 2. Header高度不統一
- **問題**：SettingsScreen的header高度為100px，其他頁面為60px
- **表現**：設定頁面的header明顯比其他頁面高
- **影響**：視覺不一致，用戶體驗不佳

## 技術解決方案

### 1. CSV匯出功能實現

#### 匯入ExportService
```typescript
import { ExportService } from '../services/ExportService';
```

#### 修改handleExport函數
```typescript
const handleExport = async () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  try {
    // 取得所有名片資料
    const businessCards = await StorageService.getAllBusinessCards();
    
    if (businessCards.length === 0) {
      Alert.alert(
        '匯出CSV',
        '目前沒有名片資料可以匯出',
        [{ text: 'OK' }]
      );
      return;
    }

    // 匯出CSV並分享
    await ExportService.saveAndShareCSV(businessCards);
    
    Alert.alert(
      '匯出成功',
      `已成功匯出 ${businessCards.length} 張名片的資料`,
      [{ text: 'OK' }]
    );
  } catch (error) {
    console.error('Export failed:', error);
    Alert.alert(
      '匯出失敗',
      '匯出CSV時發生錯誤，請重試',
      [{ text: 'OK' }]
    );
  }
};
```

### 2. Header高度統一

#### 樣式修改
```typescript
header: {
  height: 60, // 從100改為60
  backgroundColor: '#FFFFFF',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
```

## 功能特色

### CSV匯出功能
- **完整資料匯出**：包含所有名片欄位（姓名、公司、部門、職位、聯絡方式等）
- **UTF-8編碼支援**：正確處理日文字符
- **分享功能整合**：利用系統分享功能讓用戶可以儲存或傳送CSV檔案
- **錯誤處理**：適當的錯誤處理和用戶反饋
- **空資料檢查**：當沒有名片資料時顯示相應提示

### Header統一性
- **一致的高度**：與其他頁面保持60px的統一高度
- **視覺協調**：保持整體應用的視覺一致性
- **用戶體驗提升**：統一的界面元素提供更好的使用體驗

## 技術依賴

### 現有服務整合
- **StorageService**：用於取得所有名片資料
- **ExportService**：提供CSV匯出和分享功能
- **ExportService.saveAndShareCSV()**：核心匯出方法

### CSV匯出格式
ExportService提供的CSV格式包含以下欄位：
- 姓名、公司、部門、職位
- 電話、手機、傳真
- 電子郵件、網站、地址
- 備註、創建日期、更新日期

## 使用者體驗改善

### 操作流程
1. 用戶點擊「settings.pro_features.export_to_...」選項
2. 系統檢查是否有名片資料
3. 如有資料，自動匯出為CSV並開啟分享選單
4. 用戶可以選擇儲存到檔案或分享給其他應用程式
5. 顯示成功提示，包含匯出的名片數量

### 錯誤處理
- **無資料**：顯示「目前沒有名片資料可以匯出」
- **匯出失敗**：顯示「匯出CSV時發生錯誤，請重試」
- **系統反饋**：適當的觸覺回饋和視覺提示

## 測試建議

### 功能測試
1. **有名片資料時的匯出**：確認可以正常匯出CSV檔案
2. **無名片資料時的處理**：確認顯示適當的提示訊息
3. **錯誤情況處理**：測試網路錯誤或儲存空間不足的情況
4. **分享功能**：確認可以透過各種方式分享CSV檔案

### 視覺測試
1. **Header高度一致性**：對比各頁面的header高度
2. **響應式設計**：在不同螢幕尺寸下的顯示效果
3. **動畫流暢性**：頁面切換時的視覺連貫性

## 修改文件

### 主要修改
- `MeishiBox/src/screens/SettingsScreen.tsx`
  - 新增ExportService匯入
  - 實現handleExport異步函數
  - 調整header高度樣式

### 相關文件
- `MeishiBox/src/services/ExportService.ts`（已存在，提供CSV匯出功能）
- `MeishiBox/src/services/StorageService.ts`（已存在，提供資料存取功能）

## 總結

此次修改成功實現了SettingsScreen的CSV匯出功能，移除了Pro版限制，讓所有用戶都能夠備份和轉移他們的名片資料。同時統一了header高度，提升了整體應用的視覺一致性和用戶體驗。修改充分利用了現有的服務架構，保持了代碼的整潔性和可維護性。 