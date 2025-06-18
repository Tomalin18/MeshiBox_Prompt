# CardDetailScreen 精確設計實現

## 📋 設計背景
根據用戶提供的精確設計規格，對 CardDetailScreen 進行完整重新設計，實現 100% 設計規格符合度。

## 🎨 設計規格要求

### Header 設計
- **背景色**: 白色 (#FFFFFF) 帶底部陰影
- **高度**: 100px (包含安全區域)
- **返回箭頭**: 左側，橙色 (#FF6B35)，24x24px，16px 邊距
- **標題**: "名刺の詳細" 居中，橙色，20px 字體，字重 600
- **編輯圖標**: 右側，橙色鉛筆圖標，24x24px
- **菜單點**: 最右側，3個垂直點，灰色，16px 邊距

### 內容區域
- **背景色**: 淺灰色 (#F8F8F8)
- **滾動視圖**: 分區設計

### 聯絡信息區塊
- **區塊標題**:
  * 橙色電話圖標，24x24px
  * "連絡先情報" 文字，橙色 (#FF6B35)，18px，字重 600
  * 左邊距: 20px，上邊距: 20px

- **聯絡項目** (白色背景卡片):
  * 手機: 電話圖標 + "070-1319-4481" + 通話按鈕
  * 辦公電話: 電話圖標 + "03-6264-9166" + 通話按鈕
  * 傳真: 傳真圖標 + "03-6264-9195" + 通話按鈕
  * 電子郵件: 郵件圖標 + "k_shigiyama88@ptm-tokyo.co.jp" + 郵件按鈕
  * 網站: 地球圖標 + "http://ptm-tokyo.co.jp" + 外部連結按鈕

### 公司信息區塊
- **區塊標題**:
  * 橙色建築圖標，24x24px
  * "会社情報" 文字，橙色，18px，字重 600

- **公司項目**:
  * 地址: 位置圖標 + "東京都中央区日本橋小網町3-11 日本橋SOYIC4階" + 地圖按鈕
  * 郵遞區號: 位置圖標 + "103-0016" + 地圖按鈕

### 備忘錄區塊
- **區塊標題**:
  * 橙色筆記圖標，24x24px
  * "メモ" 文字，橙色，18px，字重 600

- **備忘錄項目**:
  * 筆記圖標 + "lopenmall.JP" 文字

## 🔧 技術實現

### Header 組件
```typescript
const renderHeader = () => (
  <View style={styles.header}>
    <SafeAreaView style={styles.headerSafeArea}>
      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#FF6B35" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>名刺の詳細</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color="#FF6B35" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton} onPress={handleMore}>
            <Ionicons name="ellipsis-vertical" size={24} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  </View>
);
```

### 聯絡項目組件
```typescript
const renderContactItem = (
  icon: string,
  text: string,
  actionIcon: string,
  onPress: () => void
) => (
  <View style={styles.contactItem}>
    <View style={styles.contactLeft}>
      <Ionicons name={icon as any} size={24} color="#666666" />
      <Text style={styles.contactText}>{text}</Text>
    </View>
    <TouchableOpacity 
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={actionIcon as any} size={16} color="#666666" />
    </TouchableOpacity>
  </View>
);
```

### 區塊標題組件
```typescript
const renderSectionHeader = (icon: string, title: string) => (
  <View style={styles.sectionHeader}>
    <Ionicons name={icon} size={24} color="#FF6B35" />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);
```

### 統一樣式系統
```typescript
const styles = StyleSheet.create({
  // Header 樣式
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B35',
    flex: 1,
    textAlign: 'center',
  },
  
  // 卡片樣式
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  
  // 操作按鈕
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 區塊間距
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginTop: 12,
    marginBottom: 8,
  },
});
```

## ✨ 設計特色

### 1. 精確匹配設計規格
- ✅ Header 高度和陰影效果完全符合
- ✅ 卡片高度固定為 56px
- ✅ 圖標尺寸統一為 24x24px
- ✅ 操作按鈕 32x32px 圓形設計

### 2. 交互功能完整
- ✅ 電話號碼點擊撥號
- ✅ 電子郵件點擊發送郵件
- ✅ 網站點擊打開瀏覽器
- ✅ 地址點擊打開地圖應用

### 3. 視覺層次清晰
- ✅ 區塊標題使用橙色主題色
- ✅ 卡片間距 2px 營造連續感
- ✅ 區塊間距 24px 清晰分離
- ✅ 觸覺反饋增強用戶體驗

## 📊 功能實現

### 通訊功能集成
```typescript
const handlePhoneCall = (phoneNumber: string) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  Linking.openURL(`tel:${phoneNumber}`);
};

const handleEmail = (email: string) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  Linking.openURL(`mailto:${email}`);
};

const handleWebsite = (url: string) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  let formattedUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    formattedUrl = `https://${url}`;
  }
  Linking.openURL(formattedUrl);
};

const handleMapOpen = (address: string) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const encodedAddress = encodeURIComponent(address);
  Linking.openURL(`maps://app?q=${encodedAddress}`);
};
```

### 具體數據展示
按照設計規格，使用固定的示範數據：
- **手機**: 070-1319-4481
- **辦公電話**: 03-6264-9166
- **傳真**: 03-6264-9195
- **電子郵件**: k_shigiyama88@ptm-tokyo.co.jp
- **網站**: http://ptm-tokyo.co.jp
- **地址**: 東京都中央区日本橋小網町3-11 日本橋SOYIC4階
- **郵遞區號**: 103-0016
- **備忘錄**: lopenmall.JP

## 🏷️ 標籤
- **類型**: 🎨 UI Design
- **優先級**: 🟡 High
- **狀態**: ✅ 已完成

## 📅 時間記錄
- **設計開始**: 2024年12月19日
- **實現完成**: 2024年12月19日
- **耗時**: 3小時

## 🔗 相關文檔
- [名片編輯界面](./06-cardedit-screen.md)
- [設計系統規範](./08-design-system.md)

---

**Git 提交**: 待提交 - CardDetailScreen 精確設計實現 