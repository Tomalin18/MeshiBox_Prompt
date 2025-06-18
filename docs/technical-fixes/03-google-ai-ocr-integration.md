# Google AI Studio OCR 集成實現

## 📋 概述
本文檔記錄了 MeishiBox 應用中集成 Google AI Studio API 進行名片 OCR 文字識別的完整實現過程。

## 🎯 功能目標
- 拍照後自動進行 OCR 分析
- 將識別結果自動帶入 CardEditScreen 對應欄位
- 提供友好的處理狀態提示
- 確保 OCR 失敗時的優雅降級

## 🔧 技術實現

### 1. Google AI Studio OCR 服務

#### 服務文件：`src/services/GoogleAIOCRService.ts`

**核心功能**：
- 圖片預處理和 base64 轉換
- Google AI Studio API 調用
- 結構化數據解析
- 備用文本解析機制

**API 配置**：
```typescript
private static readonly API_KEY = 'AIzaSyBrKZZTEzwrV_ic0BPOI5MycvTkDvM_VpY';
private static readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
```

**主要方法**：
- `preprocessImage()`: 圖片預處理，調整尺寸和壓縮
- `imageToBase64()`: 圖片轉 base64 編碼
- `extractTextFromImage()`: 調用 Google AI API 進行 OCR
- `fallbackTextParsing()`: 備用正則表達式解析
- `processBusinessCard()`: 主要 OCR 處理入口

### 2. 提示工程優化

**AI 提示設計**：
```text
請分析這張名片圖片，提取以下信息並以 JSON 格式返回：

要提取的欄位：
- name: 姓名（日文或中文或英文）
- company: 公司名稱
- department: 部門
- position: 職位
- phone: 電話號碼（固定電話）
- mobile: 手機號碼
- fax: 傳真號碼
- email: 電子郵件
- website: 網站地址
- address: 地址
- postalCode: 郵遞區號
- memo: 其他備註信息

請只返回 JSON 格式的結果，不要包含其他文字。
```

**生成配置**：
```typescript
generationConfig: {
  temperature: 0.1,    // 低溫度確保一致性
  topK: 32,           // 限制候選詞數量
  topP: 1,            // 保持完整概率分佈
  maxOutputTokens: 1024, // 限制輸出長度
}
```

### 3. 相機界面集成

#### 修改文件：`src/screens/CameraScreen.tsx`

**新增狀態**：
```typescript
const [isProcessingOCR, setIsProcessingOCR] = useState(false);
```

**拍照流程更新**：
```typescript
const handleCapture = async () => {
  // 1. 拍照
  const photo = await cameraRef.current.takePictureAsync();
  
  // 2. 顯示 OCR 處理狀態
  setIsProcessingOCR(true);
  
  // 3. 進行 OCR 分析
  const ocrData = await GoogleAIOCRService.processBusinessCard(imageUri);
  
  // 4. 導航到編輯頁面並帶入結果
  navigation.navigate('cardEdit', { 
    imageUri: imageUri,
    ocrData: ocrData,
    fromCamera: true,
  });
};
```

**UI 狀態顯示**：
```typescript
{isProcessingOCR ? (
  <View style={styles.processingContainer}>
    <Text style={styles.processingText}>名片分析中...</Text>
    <Text style={styles.processingSubText}>請稍候，正在識別名片信息</Text>
  </View>
) : (
  <Text style={styles.instructionText}>枠内に名刺を置いてください</Text>
)}
```

### 4. 編輯界面集成

#### 修改文件：`src/screens/CardEditScreen.tsx`

**數據初始化邏輯**：
```typescript
useEffect(() => {
  const initializeCardData = async () => {
    if (route?.params?.card) {
      // 編輯現有名片
      setCardData(route.params.card);
    } else if (route?.params?.ocrData) {
      // 使用已處理的 OCR 數據
      setCardData(route.params.ocrData);
    } else if (route?.params?.imageUri && !route?.params?.ocrData) {
      // 需要處理 OCR 的新名片
      setIsProcessingOCR(true);
      const ocrData = await GoogleAIOCRService.processBusinessCard(imageUri);
      setCardData(ocrData);
      setIsProcessingOCR(false);
    }
  };
  
  initializeCardData();
}, [route?.params]);
```

**OCR 處理狀態顯示**：
```typescript
{isProcessingOCR && (
  <View style={styles.ocrOverlay}>
    <Text style={styles.ocrText}>正在分析名片...</Text>
    <Text style={styles.ocrSubText}>請稍候，AI 正在識別文字信息</Text>
  </View>
)}
```

## 🎨 用戶體驗設計

### 1. 處理狀態反饋
- **相機界面**：橙色高亮的處理狀態文字
- **編輯界面**：半透明遮罩層顯示處理進度
- **一致性**：統一的色彩和字體設計

### 2. 錯誤處理機制
- **優雅降級**：OCR 失敗時仍可進入編輯頁面
- **錯誤日誌**：詳細的錯誤信息記錄
- **用戶友好**：不會因 OCR 失敗而中斷流程

### 3. 性能優化
- **圖片預處理**：調整尺寸減少 API 調用時間
- **異步處理**：不阻塞 UI 主線程
- **狀態管理**：正確的組件生命週期管理

## 📊 API 使用詳情

### 請求格式
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "提示文本...",
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "base64圖片數據"
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.1,
    "topK": 32,
    "topP": 1,
    "maxOutputTokens": 1024
  }
}
```

### 響應處理
```typescript
const result = await response.json();
const textContent = result.candidates[0].content.parts[0].text;
const ocrResult = JSON.parse(textContent);
```

### 備用解析
當 JSON 解析失敗時，使用正則表達式提取：
- 電子郵件：`/[\w\.-]+@[\w\.-]+\.\w+/g`
- 電話號碼：`/(\d{2,4}-\d{4}-\d{4}|\d{3}-\d{3}-\d{4})/g`
- 手機號碼：`/(070|080|090)-\d{4}-\d{4}/g`
- 網站：`/(https?:\/\/[\w\.-]+|www\.[\w\.-]+)/g`
- 郵遞區號：`/〒?\s*(\d{3}-\d{4})/g`

## 🔒 安全考慮

### API 金鑰管理
- 目前直接嵌入代碼中（開發階段）
- 生產環境應使用環境變量或安全存儲
- 考慮實現 API 金鑰輪換機制

### 數據隱私
- 圖片數據僅用於 OCR 處理
- 不在本地永久存儲 base64 數據
- API 調用使用 HTTPS 加密傳輸

## 📈 未來改進

### 1. 功能增強
- 支持多語言 OCR（中文、英文、日文）
- 批量處理多張名片
- OCR 結果的置信度評分

### 2. 性能優化
- 實現本地 OCR 備選方案
- 圖片壓縮算法優化
- API 調用結果緩存

### 3. 用戶體驗
- 可視化的 OCR 識別區域標記
- 手動調整 OCR 結果的界面
- 學習用戶修正習慣的 AI 優化

## 🧪 測試策略

### 1. 功能測試
- 不同類型名片的 OCR 準確性
- 網絡異常情況的錯誤處理
- 各種圖片格式和質量的兼容性

### 2. 性能測試
- API 響應時間測量
- 大尺寸圖片處理性能
- 內存使用情況監控

### 3. 用戶體驗測試
- 處理狀態顯示的及時性
- 錯誤情況下的用戶引導
- 整體流程的流暢度

## 📝 更新記錄
- **2024-12-19**: 初始實現 Google AI Studio OCR 集成
- 完成相機拍照到編輯頁面的自動 OCR 流程
- 實現了友好的用戶狀態反饋
- 添加了完善的錯誤處理機制 