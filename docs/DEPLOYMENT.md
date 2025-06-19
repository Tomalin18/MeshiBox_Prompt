# MeishiBox 部署指南

## 📋 概述

本指南詳細說明如何將 MeishiBox 應用程式部署到 App Store 和 Google Play Store。

## 🚀 部署前準備

### 1. 版本更新
在 `app.json` 中更新版本號：
```json
{
  "expo": {
    "version": "1.0.5",
    "ios": {
      "buildNumber": "5"
    },
    "android": {
      "versionCode": 5
    }
  }
}
```

### 2. 檢查配置
確認以下配置正確：
- ✅ 應用程式名稱和描述
- ✅ 圖標和啟動畫面
- ✅ 權限設定
- ✅ Bundle ID / Package Name
- ✅ 隱私政策連結

### 3. 測試確認
- ✅ 功能測試完成
- ✅ UI/UX 測試通過
- ✅ 效能測試正常
- ✅ 在實機上測試成功

## 🍎 iOS App Store 部署

### 步驟 1: 準備 Apple 開發者帳號
1. 確保有有效的 Apple Developer Program 會員資格
2. 在 App Store Connect 中創建應用程式記錄
3. 設定應用程式 ID 和配置文件

### 步驟 2: 建置 iOS 應用程式
```bash
# 安裝 EAS CLI（如果尚未安裝）
npm install -g eas-cli

# 登入 EAS
eas login

# 配置建置
eas build:configure

# 建置 iOS 版本
eas build --platform ios --profile production
```

### 步驟 3: 提交到 App Store
```bash
# 提交到 App Store
eas submit --platform ios
```

### 步驟 4: App Store Connect 設定

#### 應用程式資訊
- **名稱**: MeishiBox
- **副標題**: 智能名刺掃描管理
- **關鍵字**: 名刺,掃描,OCR,商務,聯絡人,管理
- **描述**: 
```
MeishiBox 是一款專為商務人士設計的智能名刺管理應用程式。

主要功能：
• 📷 智能掃描 - 快速拍攝名刺
• 🤖 AI 識別 - 自動提取聯絡資訊
• ✏️ 資料編輯 - 手動完善資訊
• 💾 安全儲存 - 本地資料保護
• 📱 聯絡人整合 - 直接匯出到通訊錄
• 🌟 流暢動畫 - 專業使用體驗

適用於：
- 業務人員
- 企業主管
- 行銷專員
- 所有需要管理名刺的專業人士

立即下載，讓名刺管理變得更簡單高效！
```

#### 應用程式預覽和螢幕截圖
準備以下尺寸的螢幕截圖：
- iPhone 6.7" (1290 x 2796)
- iPhone 6.5" (1242 x 2688)
- iPhone 5.5" (1242 x 2208)
- iPad Pro 12.9" (2048 x 2732)

#### 版本資訊
- **此版本新增功能**:
```
版本 1.0.5 更新内容：

✨ 新功能
• 專業掃描過場動畫效果
• 優化的用戶界面設計
• 改善的 OCR 識別準確度

🔧 改進
• 提升應用程式啟動速度
• 優化記憶體使用效率
• 增強資料安全性

🐛 錯誤修復
• 修復編輯頁面顯示問題
• 解決相機權限問題
• 修正資料儲存異常
```

#### 分級和內容描述
- **年齡分級**: 4+
- **內容描述**: 無需特殊內容警告

### 步驟 5: 審核提交
1. 確認所有資訊正確
2. 提交審核
3. 等待 Apple 審核（通常 24-48 小時）

## 🤖 Android Google Play Store 部署

### 步驟 1: 準備 Google Play Console
1. 確保有 Google Play Console 開發者帳號
2. 創建新的應用程式
3. 完成應用程式設定

### 步驟 2: 建置 Android 應用程式
```bash
# 建置 Android 版本
eas build --platform android --profile production
```

### 步驟 3: 提交到 Google Play
```bash
# 提交到 Google Play
eas submit --platform android
```

### 步驟 4: Google Play Console 設定

#### 應用程式詳細資料
- **應用程式名稱**: MeishiBox
- **簡短說明**: 智能名刺掃描與管理應用程式
- **完整說明**:
```
MeishiBox - 專業名刺管理解決方案

🎯 為什麼選擇 MeishiBox？
在商務場合中，名刺交換是建立聯繫的重要方式。MeishiBox 讓您能夠快速數位化這些珍貴的聯絡資訊，告別手動輸入的繁瑣過程。

✨ 主要功能
📷 智能掃描技術
- 高精度相機掃描
- 自動對焦和光線調整
- 支援各種名刺格式

🤖 AI 文字識別
- 先進的 OCR 技術
- 支援多語言識別
- 高準確率資訊提取

✏️ 靈活編輯功能
- 直觀的編輯界面
- 快速修正識別結果
- 自定義欄位設定

💾 安全資料管理
- 本地資料儲存
- 隱私保護設計
- 資料備份功能

📱 系統整合
- 一鍵匯出到聯絡人
- 支援多種分享方式
- 無縫系統整合

🌟 用戶體驗
- 流暢的動畫效果
- 現代化設計語言
- 直觀的操作流程

🏢 適用場景
- 商務會議和展覽
- 網路活動和研討會
- 日常商務交流
- 客戶關係管理

立即下載 MeishiBox，體驗最智能的名刺管理方式！
```

#### 圖片素材
準備以下素材：
- 應用程式圖標 (512 x 512)
- 特色圖片 (1024 x 500)
- 螢幕截圖 (至少 2 張)
- 手機螢幕截圖 (320dp 到 3840dp)
- 平板螢幕截圖 (600dp 到 3840dp)

#### 分類和標籤
- **應用程式類別**: 商業
- **內容分級**: 適合所有人
- **標籤**: 商業, 生產力, 掃描, OCR

### 步驟 5: 發布設定
1. 選擇發布軌道（內部測試 → 封閉測試 → 開放測試 → 正式發布）
2. 設定發布時間
3. 提交審核

## 🔄 更新版本部署流程

### 1. 準備更新
```bash
# 更新版本號
# 在 app.json 中增加版本號

# 建置新版本
eas build --platform all --profile production
```

### 2. 測試新版本
- 內部測試
- Beta 測試
- 功能驗證

### 3. 提交更新
```bash
# 提交到應用商店
eas submit --platform all
```

### 4. 發布說明
準備詳細的更新說明，包括：
- 新功能介紹
- 改進項目
- 錯誤修復
- 已知問題

## 📊 發布後監控

### 1. 應用程式分析
- 下載量監控
- 使用者評分
- 崩潰報告
- 效能指標

### 2. 用戶反饋
- 應用商店評論
- 支援請求
- 功能建議
- 錯誤回報

### 3. 持續改進
- 定期更新
- 功能優化
- 錯誤修復
- 用戶體驗改善

## 🚨 常見問題解決

### iOS 審核被拒
**常見原因**:
1. 權限說明不清楚
2. 功能描述不準確
3. 測試帳號問題
4. 隱私政策缺失

**解決方案**:
1. 詳細說明每個權限的用途
2. 提供準確的功能描述
3. 確保測試帳號可用
4. 添加隱私政策連結

### Android 審核問題
**常見原因**:
1. 目標 API 級別過低
2. 權限過度申請
3. 內容政策違規
4. 技術問題

**解決方案**:
1. 更新目標 API 級別
2. 移除不必要的權限
3. 檢查內容合規性
4. 修復技術問題

## 📱 建置配置檔案

### eas.json 配置
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "production"
      }
    }
  }
}
```

## 🔐 憑證和金鑰管理

### iOS 憑證
- 開發憑證 (Development Certificate)
- 發布憑證 (Distribution Certificate)
- 配置文件 (Provisioning Profile)

### Android 簽名
- 上傳金鑰 (Upload Key)
- 應用程式簽名金鑰 (App Signing Key)
- Google Play 應用程式簽名

## 📈 發布策略

### 階段性發布
1. **內部測試** (1-2 週)
   - 開發團隊測試
   - 基本功能驗證

2. **封閉測試** (1-2 週)
   - 邀請用戶測試
   - 收集反饋意見

3. **開放測試** (1 週)
   - 公開 Beta 測試
   - 大規模用戶測試

4. **正式發布**
   - 全面上架
   - 市場推廣

### 地區發布
- 先發布到特定地區
- 觀察用戶反應
- 逐步擴展到全球

## 📞 支援資源

### 官方文檔
- [Expo 部署指南](https://docs.expo.dev/distribution/introduction/)
- [App Store Connect 說明](https://help.apple.com/app-store-connect/)
- [Google Play Console 說明](https://support.google.com/googleplay/android-developer/)

### 社群支援
- Expo Discord 社群
- React Native 社群
- Stack Overflow

---

## 🎯 部署檢查清單

### 發布前檢查
- [ ] 版本號已更新
- [ ] 功能測試完成
- [ ] 效能測試通過
- [ ] 隱私政策更新
- [ ] 應用商店資料準備完成
- [ ] 螢幕截圖已準備
- [ ] 發布說明已撰寫

### 發布後檢查
- [ ] 應用程式可正常下載
- [ ] 功能運作正常
- [ ] 監控系統已設置
- [ ] 用戶反饋管道暢通
- [ ] 支援文檔已更新

---

*最後更新: 2024年1月* 