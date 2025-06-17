# GitHub 上傳指南

## 將 MeishiBox 項目上傳到 GitHub

### 步驟 1: 在 GitHub 上創建新倉庫

1. 登入 [GitHub](https://github.com)
2. 點擊右上角的 "+" 號，選擇 "New repository"
3. 填寫倉庫信息：
   - **Repository name**: `MeishiBox`
   - **Description**: `Business card management app with OCR functionality - 名片管理應用程式，具備 OCR 文字識別功能`
   - **Visibility**: 選擇 Public 或 Private
   - **不要** 勾選 "Add a README file"（我們已經有了）
   - **不要** 勾選 "Add .gitignore"（我們已經有了）
   - **不要** 選擇 License（可以之後再添加）

4. 點擊 "Create repository"

### 步驟 2: 連接本地倉庫到 GitHub

在終端中執行以下命令（替換 `YOUR_USERNAME` 為您的 GitHub 用戶名）：

```bash
# 添加 remote origin
git remote add origin https://github.com/YOUR_USERNAME/MeishiBox.git

# 設置主分支名稱
git branch -M main

# 推送代碼到 GitHub
git push -u origin main
```

### 步驟 3: 驗證上傳成功

1. 刷新您的 GitHub 倉庫頁面
2. 確認所有文件都已成功上傳
3. 檢查 README.md 是否正確顯示

### 步驟 4: 設置倉庫描述和標籤

在 GitHub 倉庫頁面：

1. 點擊倉庫名稱下方的 "Edit" 按鈕
2. 添加描述：`Business card management app with OCR functionality`
3. 添加標籤：`react-native`, `expo`, `ocr`, `business-cards`, `mobile-app`, `typescript`
4. 設置網站 URL（如果有的話）
5. 點擊 "Save changes"

### 後續開發工作流程

#### 提交新更改：
```bash
# 查看更改狀態
git status

# 添加更改的文件
git add .

# 提交更改
git commit -m "描述您的更改"

# 推送到 GitHub
git push origin main
```

#### 創建功能分支：
```bash
# 創建並切換到新分支
git checkout -b feature/new-feature-name

# 進行開發...

# 提交更改
git add .
git commit -m "Add new feature"

# 推送分支
git push origin feature/new-feature-name
```

然後在 GitHub 上創建 Pull Request。

### 常見問題解決

#### 問題 1: 認證失敗
如果推送時遇到認證問題：

1. **使用個人訪問令牌（推薦）：**
   - 前往 GitHub Settings > Developer settings > Personal access tokens
   - 生成新的 token
   - 使用 token 作為密碼

2. **使用 SSH（推薦）：**
   ```bash
   # 生成 SSH 密鑰
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # 添加到 ssh-agent
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   
   # 複製公鑰到 GitHub
   cat ~/.ssh/id_ed25519.pub
   ```
   
   然後在 GitHub Settings > SSH and GPG keys 中添加公鑰。
   
   更改 remote URL：
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/MeishiBox.git
   ```

#### 問題 2: 推送被拒絕
如果遇到 "Updates were rejected" 錯誤：

```bash
# 拉取遠程更改
git pull origin main --rebase

# 解決任何衝突後推送
git push origin main
```

#### 問題 3: 大文件問題
如果有大文件（>100MB）：

1. 使用 Git LFS：
   ```bash
   git lfs install
   git lfs track "*.png"
   git lfs track "*.jpg"
   git add .gitattributes
   ```

2. 或者移除大文件：
   ```bash
   git rm --cached large-file.png
   echo "large-file.png" >> .gitignore
   git add .gitignore
   git commit -m "Remove large file"
   ```

### 項目結構說明

上傳後，您的 GitHub 倉庫將包含以下結構：

```
MeishiBox/
├── README.md                 # 項目說明文檔
├── TROUBLESHOOTING.md        # 故障排除指南
├── GITHUB_SETUP.md          # 本文檔
├── package.json             # 依賴管理
├── app.json                 # Expo 配置
├── App.tsx                  # 主應用組件
├── tsconfig.json            # TypeScript 配置
├── .gitignore               # Git 忽略文件
├── assets/                  # 應用資源
├── src/
│   ├── components/          # 可重用組件
│   ├── screens/            # 應用畫面
│   ├── services/           # 業務邏輯服務
│   ├── types/              # TypeScript 類型定義
│   ├── constants/          # 常數定義
│   └── utils/              # 工具函數
└── node_modules/           # 依賴包（自動忽略）
```

---

**創建日期：** 2024年12月19日
**版本：** 1.0.0 