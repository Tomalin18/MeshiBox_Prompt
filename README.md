# MeishiBox 名刺管理應用

<div align="center">
  <img src="./assets/icon.png" width="120" height="120" alt="MeishiBox Logo">
  <h3>智能名刺掃描與管理應用</h3>
  <p>使用 AI 技術快速掃描、識別並管理您的名刺</p>
</div>

## 📱 應用介紹

MeishiBox 是一款專為商務人士設計的智能名刺管理應用程式。透過先進的 OCR（光學字符識別）技術，您可以快速掃描名刺，自動提取聯絡資訊，並輕鬆管理您的商務聯絡人。

### ✨ 主要功能

- **📷 智能掃描**：使用相機快速掃描名刺
- **🤖 AI 識別**：自動識別並提取名刺上的文字資訊
- **✏️ 資料編輯**：手動編輯和完善識別結果
- **💾 資料儲存**：安全儲存名刺資訊到本地
- **📱 聯絡人整合**：直接匯出到系統聯絡人
- **🌟 流暢動畫**：專業的掃描過場動畫效果

### 🎯 適用對象

- 商務人士
- 銷售人員
- 企業主
- 需要管理大量名刺的專業人士

## 🚀 技術架構

### 核心技術
- **React Native** - 跨平台移動應用開發
- **Expo** - 開發工具鏈和平台
- **TypeScript** - 類型安全的 JavaScript
- **OCR API** - 文字識別服務

### 主要依賴
```json
{
  "expo": "~53.0.11",
  "react": "19.0.0",
  "react-native": "0.79.3",
  "expo-camera": "~16.1.8",
  "expo-image-picker": "~16.1.4",
  "@react-navigation/native": "^7.0.13"
}
```

## 📁 專案結構

```
MeishiBox/
├── src/
│   ├── components/          # 可重用組件
│   │   ├── LoadingOverlay.tsx
│   │   └── ScanTransitionOverlay.tsx
│   ├── screens/            # 應用畫面
│   │   ├── CameraScreen.tsx
│   │   ├── CardEditScreen.tsx
│   │   ├── CardListScreen.tsx
│   │   └── LoadingScreen.tsx
│   ├── services/           # 服務層
│   │   └── ocrService.ts
│   ├── types/              # 類型定義
│   │   └── BusinessCard.ts
│   ├── utils/              # 工具函數
│   ├── constants/          # 常數定義
│   └── navigation/         # 導航配置
├── assets/                 # 靜態資源
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
├── docs/                   # 文檔
└── app.json               # Expo 配置
```

## 🛠️ 開發環境設置

### 系統需求
- Node.js 18.0.0 或更高版本
- npm 或 yarn
- Expo CLI
- iOS 模擬器（macOS）或 Android 模擬器

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/yourusername/MeishiBox.git
cd MeishiBox
```

2. **安裝依賴**
```bash
npm install
# 或
yarn install
```

3. **啟動開發服務器**
```bash
npm start
# 或
expo start
```

4. **在設備上運行**
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📱 使用方法

### 1. 掃描名刺
1. 開啟應用程式
2. 點擊相機按鈕
3. 將名刺放置在取景框內
4. 點擊拍照按鈕
5. 等待 AI 識別完成

### 2. 編輯資訊
1. 在識別完成後的編輯頁面
2. 檢查並修正自動識別的資訊
3. 補充遺漏的資料
4. 點擊「保存」按鈕

### 3. 管理名刺
1. 在名刺列表中查看所有已保存的名刺
2. 點擊任一名刺查看詳細資訊
3. 可以編輯或刪除現有名刺
4. 匯出聯絡人到系統通訊錄

## 🔧 配置說明

### 權限設置
應用程式需要以下權限：
- **相機權限**：用於拍攝名刺
- **相冊權限**：選擇已有的名刺圖片
- **聯絡人權限**：匯出到系統聯絡人
- **儲存權限**：保存名刺資料

### OCR 服務配置
在 `src/services/ocrService.ts` 中配置 OCR API：
```typescript
const OCR_API_URL = 'your-ocr-api-endpoint';
const API_KEY = 'your-api-key';
```

## 🚀 部署與發布

### 建置應用程式
```bash
# 建置 Android APK
eas build --platform android

# 建置 iOS IPA
eas build --platform ios

# 建置所有平台
eas build --platform all
```

### 發布到應用商店
```bash
# 提交到 App Store
eas submit --platform ios

# 提交到 Google Play
eas submit --platform android
```

## 🐛 故障排除

### 常見問題

1. **相機無法開啟**
   - 檢查相機權限是否已授予
   - 重新安裝應用程式

2. **OCR 識別不準確**
   - 確保名刺光線充足
   - 保持名刺平整
   - 檢查網路連接

3. **應用程式崩潰**
   - 查看開發者控制台的錯誤日誌
   - 清除應用程式快取
   - 重新安裝應用程式

### 調試模式
```bash
# 開啟調試模式
expo start --dev-client

# 查看日誌
expo logs
```

## 📊 版本歷史

### v1.0.4 (最新版本)
- ✨ 新增專業掃描過場動畫
- 🔧 優化 OCR 識別準確度
- 🐛 修復編輯頁面 UI 問題
- 🚀 改善應用程式啟動速度

### v1.0.3
- 📱 優化相機掃描體驗
- 🎨 改善使用者介面設計
- 🔒 增強資料安全性

### v1.0.2
- 🐛 修復已知錯誤
- 📈 提升應用程式穩定性

### v1.0.1
- 🚀 首次發布版本

## 🤝 貢獻指南

我們歡迎社群貢獻！請遵循以下步驟：

1. Fork 此專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 開發規範
- 使用 TypeScript
- 遵循 ESLint 規則
- 編寫單元測試
- 更新相關文檔

## 📄 授權條款

此專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件。

## 📞 聯絡資訊

- **專案維護者**：[您的姓名]
- **電子郵件**：your.email@example.com
- **GitHub**：https://github.com/yourusername/MeishiBox
- **問題回報**：https://github.com/yourusername/MeishiBox/issues

## 🙏 致謝

感謝以下開源專案和服務：
- [Expo](https://expo.dev/) - 優秀的開發平台
- [React Native](https://reactnative.dev/) - 跨平台框架
- [OCR API 服務提供商] - 文字識別技術

---

<div align="center">
  <p>如果這個專案對您有幫助，請給我們一個 ⭐️</p>
  <p>© 2024 MeishiBox. All rights reserved.</p>
</div>
