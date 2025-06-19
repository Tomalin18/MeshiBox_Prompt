# MeishiBox API 文檔

## 概述

MeishiBox 應用程式的 API 文檔，包含所有主要服務和接口的詳細說明。

## 🔧 OCR 服務 API

### OCR 文字識別服務

**檔案位置**: `src/services/ocrService.ts`

#### `processOCR(imageUri: string): Promise<Partial<BusinessCard>>`

使用 OCR 技術處理名刺圖片並提取文字資訊。

**參數**:
- `imageUri` (string): 圖片的本地 URI 路徑

**回傳值**:
- `Promise<Partial<BusinessCard>>`: 識別出的名刺資訊物件

**使用範例**:
```typescript
import { processOCR } from '../services/ocrService';

const handleOCR = async (imageUri: string) => {
  try {
    const ocrResult = await processOCR(imageUri);
    console.log('OCR 結果:', ocrResult);
  } catch (error) {
    console.error('OCR 處理失敗:', error);
  }
};
```

**錯誤處理**:
- 網路連接錯誤
- API 配額超限
- 圖片格式不支援
- 服務器錯誤

---

## 📱 螢幕組件 API

### CameraScreen 相機畫面

**檔案位置**: `src/screens/CameraScreen.tsx`

#### Props 介面
```typescript
interface Props {
  navigation: NavigationProp<any>;
}
```

#### 主要方法

##### `handleCapture(): Promise<void>`
處理相機拍攝功能

**功能**:
- 拍攝名刺照片
- 觸發掃描動畫
- 並行處理 OCR 識別
- 導航到編輯頁面

##### `processOCRInParallel(imageUri: string): Promise<void>`
並行處理 OCR 識別

**參數**:
- `imageUri` (string): 拍攝的圖片 URI

**功能**:
- 背景處理 OCR 識別
- 更新識別狀態
- 快取識別結果

---

### CardEditScreen 編輯畫面

**檔案位置**: `src/screens/CardEditScreen.tsx`

#### Props 介面
```typescript
interface Props {
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
  route?: {
    params?: {
      card?: BusinessCard;
      imageUri?: string;
      ocrData?: Partial<BusinessCard>;
    };
  };
}
```

#### 主要方法

##### `handleSave(): Promise<void>`
儲存名刺資料

**功能**:
- 驗證必填欄位
- 儲存到本地存儲
- 導航回列表頁面

##### `updateField(field: keyof BusinessCard, value: string): void`
更新特定欄位值

**參數**:
- `field`: 欄位名稱
- `value`: 新的欄位值

##### `clearField(field: keyof BusinessCard): void`
清除特定欄位值

**參數**:
- `field`: 要清除的欄位名稱

---

### CardListScreen 列表畫面

**檔案位置**: `src/screens/CardListScreen.tsx`

#### 主要方法

##### `loadCards(): Promise<void>`
載入已儲存的名刺列表

##### `deleteCard(cardId: string): Promise<void>`
刪除指定的名刺

**參數**:
- `cardId` (string): 名刺的唯一識別碼

---

## 🧩 組件 API

### ScanTransitionOverlay 掃描過場動畫

**檔案位置**: `src/components/ScanTransitionOverlay.tsx`

#### Props 介面
```typescript
interface Props {
  visible: boolean;
  onComplete: () => void;
}
```

#### 功能
- 顯示專業的掃描動畫效果
- 旋轉掃描圖標
- 金色星星火花特效
- 進度條動畫
- 動態文字更新

---

### LoadingOverlay 載入覆蓋層

**檔案位置**: `src/components/LoadingOverlay.tsx`

#### Props 介面
```typescript
interface Props {
  visible: boolean;
  message?: string;
}
```

#### 功能
- 顯示載入狀態
- 可自定義載入訊息
- 半透明背景遮罩

---

## 📊 資料類型定義

### BusinessCard 名刺資料結構

**檔案位置**: `src/types/BusinessCard.ts`

```typescript
export interface BusinessCard {
  id: string;
  name: string;
  nameReading?: string;
  company: string;
  companyReading?: string;
  position: string;
  department?: string;
  email: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  website?: string;
  address?: string;
  postalCode?: string;
  memo?: string;
  imageUri?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 欄位說明
- `id`: 唯一識別碼
- `name`: 姓名（必填）
- `nameReading`: 姓名讀音
- `company`: 公司名稱（必填）
- `companyReading`: 公司名稱讀音
- `position`: 職位
- `department`: 部門
- `email`: 電子郵件
- `phone`: 電話號碼
- `mobile`: 手機號碼
- `fax`: 傳真號碼
- `website`: 網站
- `address`: 地址
- `postalCode`: 郵遞區號
- `memo`: 備註
- `imageUri`: 名刺圖片 URI
- `createdAt`: 建立時間
- `updatedAt`: 更新時間

---

## 🔧 工具函數 API

### 資料驗證

#### `validateBusinessCard(card: Partial<BusinessCard>): boolean`
驗證名刺資料完整性

**參數**:
- `card`: 要驗證的名刺資料

**回傳值**:
- `boolean`: 驗證結果

### 資料轉換

#### `formatPhoneNumber(phone: string): string`
格式化電話號碼

**參數**:
- `phone`: 原始電話號碼

**回傳值**:
- `string`: 格式化後的電話號碼

#### `generateCardId(): string`
生成唯一的名刺識別碼

**回傳值**:
- `string`: 唯一識別碼

---

## 🗄️ 儲存服務 API

### AsyncStorage 本地儲存

#### `saveCard(card: BusinessCard): Promise<void>`
儲存名刺到本地

**參數**:
- `card`: 要儲存的名刺資料

#### `getCards(): Promise<BusinessCard[]>`
獲取所有已儲存的名刺

**回傳值**:
- `Promise<BusinessCard[]>`: 名刺陣列

#### `deleteCard(cardId: string): Promise<void>`
刪除指定的名刺

**參數**:
- `cardId`: 要刪除的名刺識別碼

#### `updateCard(card: BusinessCard): Promise<void>`
更新名刺資料

**參數**:
- `card`: 更新後的名刺資料

---

## 🔗 導航 API

### 導航參數

#### CameraScreen → CardEditScreen
```typescript
navigation.navigate('CardEdit', {
  imageUri: string,
  ocrData: Partial<BusinessCard>
});
```

#### CardListScreen → CardEditScreen
```typescript
navigation.navigate('CardEdit', {
  card: BusinessCard
});
```

---

## ⚙️ 配置 API

### 應用程式配置

**檔案位置**: `app.json`

#### 重要配置項目
- `expo.name`: 應用程式名稱
- `expo.version`: 版本號
- `expo.icon`: 應用程式圖標
- `expo.splash`: 啟動畫面配置
- `expo.permissions`: 權限設定

### 環境變數

建議在 `.env` 檔案中設定：
```
OCR_API_URL=your-ocr-api-endpoint
OCR_API_KEY=your-api-key
```

---

## 🚨 錯誤代碼

### OCR 服務錯誤
- `OCR_001`: 網路連接失敗
- `OCR_002`: API 金鑰無效
- `OCR_003`: 圖片格式不支援
- `OCR_004`: 圖片太大
- `OCR_005`: 服務器內部錯誤

### 儲存服務錯誤
- `STORAGE_001`: 儲存空間不足
- `STORAGE_002`: 資料格式錯誤
- `STORAGE_003`: 權限不足

### 相機服務錯誤
- `CAMERA_001`: 相機權限被拒絕
- `CAMERA_002`: 相機不可用
- `CAMERA_003`: 拍攝失敗

---

## 📱 平台特殊 API

### iOS 專用
- 聯絡人整合
- 觸覺反饋
- 深色模式支援

### Android 專用
- 自適應圖標
- 檔案系統權限
- 背景處理

---

## 🔄 版本更新 API

### 檢查更新
```typescript
import { Updates } from 'expo-updates';

const checkForUpdates = async () => {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      Updates.reloadAsync();
    }
  } catch (error) {
    console.error('更新檢查失敗:', error);
  }
};
```

---

## 📞 支援與聯絡

如有 API 相關問題，請聯絡：
- **技術支援**: tech-support@meishibox.com
- **GitHub Issues**: https://github.com/yourusername/MeishiBox/issues
- **文檔更新**: docs@meishibox.com 