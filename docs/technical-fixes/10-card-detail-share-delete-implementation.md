# 名片詳情頁面共有和削除功能實現

## 修復概述

實現名片詳情頁面右上角三個點按鈕展開的「共有」和「削除」功能，提供完整的名片管理體驗。

## 問題分析

### 1. 功能缺失
- **問題**：右上角菜單的「共有」和「削除」選項只是 console.log 輸出
- **影響**：用戶無法分享名片信息或刪除不需要的名片
- **用戶期望**：點擊「共有」能分享名片內容，點擊「削除」能永久刪除名片

### 2. 缺少必要模組
- **問題**：未導入 React Native 的 Share API
- **問題**：未導入 StorageService 進行數據操作

## 技術解決方案

### 1. 導入必要模組

#### 添加 Share API
```typescript
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Alert,
  Image,
  Share, // 新增
} from 'react-native';
```

#### 添加 StorageService
```typescript
import { StorageService } from '../services/StorageService';
```

### 2. 實現共有功能

#### 構建分享內容
```typescript
const handleShare = async () => {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // 構建分享內容
    let shareContent = `📇 ${card.name}\n`;
    
    if (card.nameReading) {
      shareContent += `(${card.nameReading})\n`;
    }
    
    shareContent += `🏢 ${card.company}\n`;
    
    if (card.companyReading) {
      shareContent += `(${card.companyReading})\n`;
    }
    
    if (card.department) {
      shareContent += `📋 ${card.department}\n`;
    }
    
    if (card.position) {
      shareContent += `💼 ${card.position}\n`;
    }
    
    if (card.phone) {
      shareContent += `📞 ${card.phone}\n`;
    }
    
    if (card.mobile) {
      shareContent += `📱 ${card.mobile}\n`;
    }
    
    if (card.email) {
      shareContent += `📧 ${card.email}\n`;
    }
    
    if (card.website) {
      shareContent += `🌐 ${card.website}\n`;
    }
    
    if (card.address) {
      shareContent += `📍 ${card.address}\n`;
    }
    
    if (card.memo) {
      shareContent += `📝 ${card.memo}\n`;
    }
    
    const result = await Share.share({
      message: shareContent,
      title: `${card.name}の名刺`,
    });
    
    if (result.action === Share.sharedAction) {
      console.log('名刺が共有されました');
    }
  } catch (error) {
    console.error('共有エラー:', error);
    Alert.alert('エラー', '名刺の共有に失敗しました');
  }
};
```

#### 分享內容格式
```
📇 田中太郎
(たなか たろう)
🏢 株式会社ABC
📋 営業部
💼 部長
📞 03-1234-5678
📱 090-1234-5678
📧 tanaka@abc.co.jp
🌐 www.abc.co.jp
📍 東京都渋谷区...
📝 重要なクライアント
```

### 3. 實現削除功能

#### 二次確認對話框
```typescript
const handleDelete = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
  Alert.alert(
    '名刺を削除',
    `「${card.name}」の名刺を削除しますか？この操作は取り消せません。`,
    [
      {
        text: 'キャンセル',
        style: 'cancel',
      },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            await StorageService.deleteBusinessCard(card.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            Alert.alert(
              '削除完了',
              '名刺が削除されました',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    if (navigation) {
                      navigation.goBack();
                    }
                  },
                },
              ]
            );
          } catch (error) {
            console.error('削除エラー:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('エラー', '名刺の削除に失敗しました');
          }
        },
      },
    ]
  );
};
```

#### 安全性考慮
- **二次確認**：刪除前顯示確認對話框
- **不可逆警告**：明確告知操作無法取消
- **錯誤處理**：捕獲並處理刪除失敗的情況
- **用戶反饋**：使用觸覺反饋和通知提供操作反饋

### 4. 更新菜單處理器

#### 連接實際功能
```typescript
const handleMore = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  Alert.alert(
    'その他のオプション',
    '操作を選択してください',
    [
      { text: '共有', onPress: handleShare },
      { text: '削除', style: 'destructive', onPress: handleDelete },
      { text: 'キャンセル', style: 'cancel' },
    ]
  );
};
```

## 實現效果

### 1. 共有功能
- **多平台支援**：支援各種社交應用和通訊工具
- **格式化內容**：使用表情符號和結構化格式
- **完整信息**：包含所有可用的名片字段
- **用戶友好**：清晰的標題和內容組織

### 2. 削除功能
- **安全刪除**：二次確認防止誤操作
- **即時反饋**：觸覺反饋和視覺通知
- **錯誤處理**：完善的錯誤捕獲和用戶提示
- **導航處理**：刪除後自動返回上一頁

### 3. 用戶體驗
- **觸覺反饋**：每個操作都有適當的觸覺反饋
- **視覺反饋**：成功/失敗的明確提示
- **操作流程**：直觀的操作步驟和確認流程

## 使用場景

### 1. 分享名片
```
用戶操作：詳情頁 → 三個點 → 共有
系統行為：
1. 構建格式化的名片內容
2. 調用系統分享功能
3. 用戶選擇分享目標（微信、郵件、簡訊等）
4. 完成分享
```

### 2. 刪除名片
```
用戶操作：詳情頁 → 三個點 → 削除
系統行為：
1. 顯示確認對話框
2. 用戶確認刪除
3. 調用 StorageService.deleteBusinessCard()
4. 顯示成功提示
5. 自動返回列表頁
```

### 3. 錯誤處理
```
共有失敗：顯示 "名刺の共有に失敗しました"
刪除失敗：顯示 "名刺の削除に失敗しました"
觸覺反饋：錯誤時使用 NotificationFeedbackType.Error
```

## 技術亮點

1. **React Native Share API**：使用原生分享功能
2. **格式化輸出**：表情符號增強可讀性
3. **條件渲染**：只顯示有值的字段
4. **錯誤邊界**：完善的 try-catch 處理
5. **用戶體驗**：觸覺反饋和視覺提示
6. **安全操作**：刪除前二次確認

## 後續優化

1. **分享選項**：支援分享為 vCard 格式
2. **批量操作**：支援批量分享和刪除
3. **分享統計**：記錄分享頻率和偏好
4. **回收站**：實現軟刪除和恢復功能
5. **分享模板**：自定義分享內容格式

## 總結

成功實現了名片詳情頁面的共有和削除功能，提供了完整的名片管理體驗。用戶現在可以：
- 通過系統分享功能將名片信息分享給他人
- 安全地刪除不需要的名片
- 享受流暢的操作體驗和明確的反饋

這些功能大大提升了應用的實用性和用戶滿意度。 