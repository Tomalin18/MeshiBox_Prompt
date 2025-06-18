# 導航參數傳遞修復

## 問題描述
用戶報告 OCR 分析完成後沒有跳轉到編輯頁面的問題。經過分析發現是導航系統的參數傳遞機制有問題。

## 問題分析

### 根本原因
1. **路由名稱不匹配**: `CameraScreen` 使用 `'cardEdit'` 但 `App.tsx` 只處理 `'CardEdit'`
2. **參數傳遞缺失**: 簡單的狀態導航系統沒有傳遞 OCR 數據參數
3. **導航流程中斷**: OCR 完成後無法將數據帶入編輯頁面

### 影響範圍
- 拍照後 OCR 分析完成但無法進入編輯頁面
- 從相冊選擇圖片後 OCR 分析完成但無法進入編輯頁面
- OCR 數據無法正確傳遞給 `CardEditScreen`

## 修復方案

### 1. 添加路由名稱支持
```typescript
// App.tsx - 添加 cardEdit 路由支持
case 'cardEdit':
  setCurrentScreen('edit');
  break;
```

### 2. 實現參數傳遞機制
```typescript
// App.tsx - 添加參數狀態管理
const [screenParams, setScreenParams] = useState<any>(null);

const mockNavigation = {
  navigate: (screen: string, params?: any) => {
    setScreenParams(params || null); // 保存參數
    // ... 路由邏輯
  },
  goBack: () => {
    setScreenParams(null); // 清除參數
    // ... 返回邏輯
  },
};
```

### 3. 更新屏幕渲染邏輯
```typescript
// App.tsx - 傳遞參數給組件
const renderScreen = () => {
  const route = screenParams ? { params: screenParams } : undefined;
  
  switch (currentScreen) {
    case 'edit':
      return <CardEditScreen navigation={mockNavigation} route={route} />;
    case 'detail':
      return <CardDetailScreen navigation={mockNavigation} route={route} />;
    // ... 其他屏幕
  }
};
```

## 修復效果

### OCR 工作流程
1. **拍照/選圖** → 觸發 OCR 分析
2. **OCR 處理** → 顯示 "名片分析中..." 狀態
3. **分析完成** → 調用 `navigation.navigate('cardEdit', { ocrData, imageUri })`
4. **參數傳遞** → `App.tsx` 保存參數並切換到編輯頁面
5. **頁面渲染** → `CardEditScreen` 接收參數並自動填充表單

### 參數傳遞流程
```typescript
// CameraScreen.tsx - OCR 完成後
navigation.navigate('cardEdit', { 
  imageUri: imageUri,
  ocrData: ocrData,
  fromCamera: true,
  cropArea: cropData,
  orientation: orientation,
});

// App.tsx - 參數保存和傳遞
setScreenParams(params); // 保存參數
setCurrentScreen('edit'); // 切換頁面

// CardEditScreen.tsx - 參數接收
useEffect(() => {
  if (route?.params?.ocrData) {
    setCardData(route.params.ocrData); // 自動填充
  }
}, [route?.params]);
```

## 測試驗證

### 測試場景
1. **拍照 OCR**: 拍照 → OCR 分析 → 自動跳轉編輯頁面 → 表單自動填充
2. **相冊 OCR**: 選圖 → OCR 分析 → 自動跳轉編輯頁面 → 表單自動填充
3. **OCR 失敗**: 分析失敗 → 仍跳轉編輯頁面 → 空白表單
4. **編輯現有名片**: 從詳情頁編輯 → 正確傳遞卡片數據

### 預期結果
- ✅ OCR 分析完成後自動跳轉到編輯頁面
- ✅ 表單字段自動填充 OCR 識別的數據
- ✅ 圖片正確顯示在編輯頁面頂部
- ✅ OCR 失敗時仍能正常進入編輯頁面

## 相關文件
- `MeishiBox/App.tsx` - 導航系統和參數傳遞
- `MeishiBox/src/screens/CameraScreen.tsx` - OCR 處理和導航調用
- `MeishiBox/src/screens/CardEditScreen.tsx` - 參數接收和表單填充

## 提交信息
- 修復導航參數傳遞機制
- 添加 cardEdit 路由支持
- 確保 OCR 數據正確傳遞給編輯頁面
- 完善導航狀態管理和參數清理

這個修復解決了 OCR 分析完成後無法跳轉到編輯頁面的核心問題，確保了完整的相機→OCR→編輯工作流程。 