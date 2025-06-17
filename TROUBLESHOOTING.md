# MeishiBox 故障排除指南

## 常見問題與解決方案

### 1. ConfigError: package.json 路徑不存在

**問題描述：**
```
ConfigError: The expected package.json path: /Users/xxx/package.json does not exist
```

**原因：**
在錯誤的目錄中執行 `npx expo start` 命令。

**解決方案：**
1. 確保您在正確的項目目錄中：
   ```bash
   cd /path/to/your/project/MeishiBox
   ```

2. 檢查當前目錄是否包含 `package.json` 文件：
   ```bash
   ls -la | grep package.json
   ```

3. 如果確認在正確目錄，重新運行：
   ```bash
   npx expo start
   ```

**實際案例解決記錄：**
- 用戶在 `/Users/toma/Desktop/Meishibox_prompt` 目錄執行命令
- 正確目錄應該是 `/Users/toma/Desktop/Meishibox_prompt/MeishiBox`
- 解決方法：`cd MeishiBox` 然後執行 `npx expo start`

### 2. iOS 模擬器啟動問題

**問題描述：**
iOS 模擬器無法正常啟動或顯示應用。

**解決方案：**

1. **確保 Xcode 和模擬器已安裝：**
   ```bash
   xcode-select --install
   ```

2. **清理並重新安裝依賴：**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

3. **重新啟動 Metro bundler：**
   ```bash
   npx expo start --clear
   ```

4. **指定 iOS 模擬器：**
   ```bash
   npx expo start --ios
   ```

### 3. 相機權限問題

**問題描述：**
應用無法訪問相機功能。

**解決方案：**

1. **檢查 app.json 配置：**
   確保包含相機權限：
   ```json
   {
     "expo": {
       "plugins": [
         [
           "expo-camera",
           {
             "cameraPermission": "允許 MeishiBox 使用相機來掃描名片"
           }
         ]
       ]
     }
   }
   ```

2. **重新構建應用：**
   ```bash
   npx expo prebuild --clean
   ```

### 4. OCR 功能異常

**問題描述：**
OCR 文字識別功能無法正常工作。

**解決方案：**

1. **檢查圖片處理依賴：**
   ```bash
   npx expo install expo-image-manipulator
   ```

2. **確保圖片格式正確：**
   - 支持的格式：JPEG, PNG
   - 建議解析度：至少 300x300 像素

3. **檢查 OCR 服務配置：**
   在 `src/services/OCRService.ts` 中確認模擬 OCR 功能正常。

### 5. 數據存儲問題

**問題描述：**
名片數據無法保存或讀取。

**解決方案：**

1. **檢查 AsyncStorage 依賴：**
   ```bash
   npx expo install @react-native-async-storage/async-storage
   ```

2. **清理應用數據：**
   在模擬器中重置應用數據或重新安裝應用。

3. **檢查存儲權限：**
   確保應用有足夠的存儲權限。

### 6. 導出功能問題

**問題描述：**
CSV 或 vCard 導出功能失效。

**解決方案：**

1. **檢查文件系統權限：**
   ```bash
   npx expo install expo-file-system expo-sharing
   ```

2. **檢查聯絡人權限：**
   ```bash
   npx expo install expo-contacts
   ```

3. **確保權限配置正確：**
   在 app.json 中添加必要權限：
   ```json
   {
     "expo": {
       "ios": {
         "infoPlist": {
           "NSContactsUsageDescription": "允許 MeishiBox 訪問聯絡人以導出名片數據"
         }
       }
     }
   }
   ```

### 7. 依賴版本衝突

**問題描述：**
安裝依賴時出現版本衝突。

**解決方案：**

1. **使用 Expo CLI 安裝：**
   ```bash
   npx expo install [package-name]
   ```
   而不是使用 `npm install`

2. **檢查 Expo SDK 兼容性：**
   確保所有依賴都與當前 Expo SDK 版本兼容。

3. **清理並重新安裝：**
   ```bash
   rm -rf node_modules package-lock.json
   npx expo install
   ```

**實際案例解決記錄：**
使用 `npx expo-doctor` 診斷發現以下依賴版本問題：
```
expo-camera@16.0.18 - expected version: ~16.1.8
expo-image-picker@16.0.6 - expected version: ~16.1.4
expo-linear-gradient@14.0.2 - expected version: ~14.1.5
react-native-safe-area-context@4.12.0 - expected version: 5.4.0
react-native-screens@4.1.0 - expected version: ~4.11.1
```
解決方法：執行 `npx expo install --check` 自動更新到兼容版本。

### 8. 缺失資源文件錯誤

**問題描述：**
```
Field: Splash.image - cannot access file at './assets/splash.png'
```

**原因：**
app.json 配置中引用的資源文件不存在。

**解決方案：**

1. **檢查 assets 目錄：**
   ```bash
   ls -la assets/
   ```

2. **創建缺失的文件：**
   ```bash
   # 如果有類似的文件，可以複製
   cp assets/splash-icon.png assets/splash.png
   ```

3. **或者更新 app.json 配置：**
   修改 `app.json` 中的路徑指向實際存在的文件。

**實際案例解決記錄：**
- 錯誤：`Field: Splash.image - cannot access file at './assets/splash.png'`
- 發現：assets 目錄中有 `splash-icon.png` 但缺少 `splash.png`
- 解決：執行 `cp assets/splash-icon.png assets/splash.png`

### 9. TypeScript 錯誤

**問題描述：**
TypeScript 編譯錯誤。

**解決方案：**

1. **檢查類型定義：**
   確保所有使用的類型都已正確定義在 `src/types/index.ts`

2. **更新 TypeScript 配置：**
   檢查 `tsconfig.json` 配置是否正確。

3. **重新啟動 TypeScript 服務：**
   在 VS Code 中按 `Cmd+Shift+P`，選擇 "TypeScript: Restart TS Server"

## 調試技巧

### 1. 查看詳細錯誤信息
```bash
npx expo start --dev-client
```

### 2. 清理緩存
```bash
npx expo start --clear
```

### 3. 重新構建
```bash
npx expo prebuild --clean
```

### 4. 檢查日誌
在開發者工具中查看控制台輸出，或使用：
```bash
npx expo logs
```

## 聯繫支援

如果問題仍然存在，請提供以下信息：
1. 錯誤的完整信息
2. 操作系統版本
3. Expo CLI 版本
4. Node.js 版本
5. 重現問題的步驟

---

**更新日期：** 2024年12月19日
**版本：** 1.0.0 