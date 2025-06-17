# MeishiBox - 名片管理應用程式

MeishiBox 是一款用於掃描與管理名片的 React Native / Expo 應用程式。利用 OCR 技術自動擷取名片資訊，讓您方便地數位化並管理聯絡人資料。

## 🚀 主要功能

### 📷 名片掃描
- 使用相機拍攝名片
- 支援橫式與直式名片
- 具備閃光燈功能
- 可從相簿選取圖片

### 🔍 OCR 文字辨識
- 自動辨識繁體中文名片文字
- 自動擷取姓名、公司名稱、部門、職稱
- 辨識電話、電子郵件、網站
- 擷取地址與郵遞區號

### 📝 名片編輯
- 編輯 OCR 擷取的資料
- 可手動新增與修正資訊
- 支援多組聯絡方式
- 可新增社群帳號

### 📋 名片管理
- 顯示名片列表
- 搜尋與篩選功能
- 詳細檢視名片
- 刪除名片

### 📤 匯出功能
- 匯出為 CSV 格式
- 匯出為 vCard 格式
- 可加入系統聯絡人
- 檔案分享功能

### ⚙️ 設定與管理
- 使用者訂閱管理
- 掃描次數限制
- 應用程式設定
- 資料備份與還原

## 🛠️ 技術規格

### 使用技術
- **React Native**: 0.79.3
- **Expo SDK**: 53.0.0+
- **TypeScript**: 完整型別安全
- **AsyncStorage**: 本機資料保存

### 主要依賴
```json
{
  "expo-camera": "相機功能",
  "expo-image-picker": "圖片選取",
  "expo-image-manipulator": "圖片處理",
  "expo-contacts": "聯絡人整合",
  "expo-haptics": "觸覺回饋",
  "expo-file-system": "檔案操作",
  "expo-sharing": "檔案分享",
  "@react-native-async-storage/async-storage": "資料儲存"
}
```

## 📱 安裝與執行

### 前置條件
- Node.js 18+ 
- Expo CLI
- iOS 模擬器或 Android 模擬器

### 安裝步驟
```bash
# 複製專案
git clone <repository-url>
cd MeishiBox

# 安裝相依套件
npm install

# 同步 Expo 相依套件
npx expo install

# 啟動開發伺服器
npx expo start
```

### 執行方式
```bash
# 在 iOS 執行
npx expo run:ios

# 在 Android 執行
npx expo run:android

# 在瀏覽器執行
npx expo start --web
```

## 🏗️ 專案結構

```
MeishiBox/
├── src/
│   ├── components/          # 可重複使用元件
│   │   └── LoadingOverlay.tsx
│   ├── constants/           # 常數定義
│   │   └── Colors.ts
│   ├── screens/            # 畫面元件
│   │   ├── CameraScreen.tsx
│   │   ├── CardDetailScreen.tsx
│   │   ├── CardEditScreen.tsx
│   │   ├── CardListScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # 商業邏輯
│   │   ├── OCRService.ts
│   │   ├── StorageService.ts
│   │   └── ExportService.ts
│   ├── types/              # TypeScript 型別定義
│   │   └── index.ts
│   └── utils/              # 工具函式
│       └── index.ts
├── App.tsx                 # 主應用程式元件
├── app.json               # Expo 設定
└── package.json           # 相依套件
```

## 🎯 使用方式

### 1. 掃描名片
1. 點選相機圖示
2. 將名片放在框內
3. 選擇橫式／直式
4. 按下快門掃描

### 2. 編輯資訊
1. 確認 OCR 自動擷取的資訊
2. 如有需要手動修正或新增
3. 按下「儲存」按鈕

### 3. 管理名片
1. 在名片列表檢視已儲存名片
2. 以搜尋列搜尋名片
3. 點選名片以查看詳細資訊

### 4. 匯出資料
1. 於設定頁面選擇「匯出功能」
2. 選擇格式（CSV、vCard、聯絡人）
3. 分享或儲存檔案

## 🔧 開發者資訊

### OCR 服務
目前為模擬實作，正式環境可整合下列 OCR 服務：
- Google Cloud Vision API
- AWS Textract
- Azure Computer Vision

### 客製化
- `src/constants/Colors.ts`: 更改色彩主題
- `src/services/OCRService.ts`: 實作 OCR 邏輯
- `src/utils/index.ts`: 新增驗證函式

### 測試
```bash
# 執行單元測試
npm test

# 執行 E2E 測試
npx detox test
```

## 📄 授權

本專案採用 MIT 授權條款。

## 🤝 貢獻方式

1. 將此儲存庫 fork
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 建立 Pull Request

## 📞 支援

若有問題或需要協助，請聯繫：
- Email: support@meishibox.com
- 官方網站: https://meishibox.com/support

## 🔄 更新紀錄

### v1.0.4（最新）
- 整合 OCR 功能
- 實作資料持久化
- 新增匯出功能
- 加入觸覺回饋
- 改善 UI/UX

### v1.0.0
- 初始版本
- 基本相機功能
- 名片編輯功能
- 設定頁面

---

Made with ❤️ in Keelung, Taiwan 
