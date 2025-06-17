# MeishiBox - 名刺管理アプリ

MeishiBox は、名刺をスキャンして管理するための React Native / Expo アプリケーションです。OCR 技術を使用して名刺の情報を自動的に抽出し、デジタル形式で保存・管理できます。

## 🚀 主な機能

### 📷 名刺スキャン
- カメラを使用した名刺の撮影
- 横向き・縦向きの名刺に対応
- フラッシュ機能付き
- ギャラリーからの画像選択も可能

### 🔍 OCR 文字認識
- 日本語名刺の自動文字認識
- 名前、会社名、部署、職位の自動抽出
- 電話番号、メールアドレス、ウェブサイトの認識
- 住所、郵便番号の抽出

### 📝 名刺編集
- OCR で抽出されたデータの編集
- 手動での情報追加・修正
- 複数の連絡先情報に対応
- ソーシャルメディアアカウントの追加

### 📋 名刺管理
- 名刺一覧の表示
- 検索・フィルタリング機能
- 名刺の詳細表示
- 名刺の削除機能

### 📤 エクスポート機能
- CSV 形式でのエクスポート
- vCard 形式でのエクスポート
- システム連絡先への追加
- ファイル共有機能

### ⚙️ 設定・管理
- ユーザー購読管理
- スキャン回数制限
- アプリ設定
- データバックアップ・復元

## 🛠️ 技術仕様

### 使用技術
- **React Native**: 0.79.3
- **Expo SDK**: 53.0.0+
- **TypeScript**: 完全型安全
- **AsyncStorage**: ローカルデータ保存

### 主要依存関係
```json
{
  "expo-camera": "カメラ機能",
  "expo-image-picker": "画像選択",
  "expo-image-manipulator": "画像処理",
  "expo-contacts": "連絡先統合",
  "expo-haptics": "触覚フィードバック",
  "expo-file-system": "ファイル操作",
  "expo-sharing": "ファイル共有",
  "@react-native-async-storage/async-storage": "データ保存"
}
```

## 📱 インストールと実行

### 前提条件
- Node.js 18+ 
- Expo CLI
- iOS Simulator または Android Emulator

### セットアップ
```bash
# プロジェクトのクローン
git clone <repository-url>
cd MeishiBox

# 依存関係のインストール
npm install

# Expo 依存関係の同期
npx expo install

# 開発サーバーの起動
npx expo start
```

### 実行
```bash
# iOS での実行
npx expo run:ios

# Android での実行
npx expo run:android

# Web での実行
npx expo start --web
```

## 🏗️ プロジェクト構造

```
MeishiBox/
├── src/
│   ├── components/          # 再利用可能なコンポーネント
│   │   └── LoadingOverlay.tsx
│   ├── constants/           # 定数定義
│   │   └── Colors.ts
│   ├── screens/            # 画面コンポーネント
│   │   ├── CameraScreen.tsx
│   │   ├── CardDetailScreen.tsx
│   │   ├── CardEditScreen.tsx
│   │   ├── CardListScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # ビジネスロジック
│   │   ├── OCRService.ts
│   │   ├── StorageService.ts
│   │   └── ExportService.ts
│   ├── types/              # TypeScript 型定義
│   │   └── index.ts
│   └── utils/              # ユーティリティ関数
│       └── index.ts
├── App.tsx                 # メインアプリコンポーネント
├── app.json               # Expo 設定
└── package.json           # 依存関係
```

## 🎯 使用方法

### 1. 名刺のスキャン
1. カメラアイコンをタップ
2. 名刺を枠内に配置
3. 横向き/縦向きを選択
4. シャッターボタンでスキャン

### 2. 情報の編集
1. OCR で自動抽出された情報を確認
2. 必要に応じて手動で修正・追加
3. 「保存」ボタンで保存

### 3. 名刺の管理
1. 名刺一覧で保存された名刺を確認
2. 検索バーで名刺を検索
3. 名刺をタップして詳細表示

### 4. データのエクスポート
1. 設定画面から「エクスポート機能」を選択
2. 形式を選択（CSV、vCard、連絡先）
3. ファイルを共有または保存

## 🔧 開発者向け情報

### OCR サービス
現在はモック実装を使用していますが、本番環境では以下の OCR サービスと統合可能：
- Google Cloud Vision API
- AWS Textract
- Azure Computer Vision

### カスタマイズ
- `src/constants/Colors.ts`: カラーテーマの変更
- `src/services/OCRService.ts`: OCR ロジックの実装
- `src/utils/index.ts`: バリデーション関数の追加

### テスト
```bash
# 単体テストの実行
npm test

# E2E テストの実行
npx detox test
```

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📞 サポート

質問やサポートが必要な場合は、以下までお問い合わせください：
- Email: support@meishibox.com
- Website: https://meishibox.com/support

## 🔄 更新履歴

### v1.0.4 (最新)
- OCR 機能の統合
- データ永続化の実装
- エクスポート機能の追加
- 触覚フィードバックの実装
- UI/UX の改善

### v1.0.0
- 初期リリース
- 基本的なカメラ機能
- 名刺編集機能
- 設定画面

---

Made with ❤️ in Keelung, Taiwan 