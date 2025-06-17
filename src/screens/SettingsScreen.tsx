import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StorageService } from '../services/StorageService';
import { ExportService } from '../services/ExportService';

interface Props {
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

interface UserSubscription {
  status: 'free' | 'trial' | 'premium';
  remainingScans: number;
  maxScans: number;
  features: string[];
  expiryDate?: Date;
  trialDays?: number;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [subscription, setSubscription] = useState<UserSubscription>({
    status: 'free',
    remainingScans: 50,
    maxScans: 50,
    features: [],
  });
  const [scanCount, setScanCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const appVersion = '1.0.04';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentScanCount = await StorageService.getScanCount();
      setScanCount(currentScanCount);
      
      // Update remaining scans
      setSubscription(prev => ({
        ...prev,
        remainingScans: Math.max(0, prev.maxScans - currentScanCount),
      }));
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleRestorePurchase = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      Alert.alert(
        '購入を復元',
        '購入の復元を開始しています...',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: 'OK',
            onPress: () => {
              setTimeout(() => {
                Alert.alert('成功', '購入が復元されました');
                setSubscription({ ...subscription, status: 'premium' });
              }, 1000);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('エラー', '購入の復元に失敗しました');
    }
  };

  const handleExportFeatures = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (subscription.status === 'free') {
      Alert.alert(
        'Pro機能',
        'この機能を使用するにはPro版にアップグレードしてください',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: 'アップグレード',
            onPress: () => {
              if (navigation) {
                navigation.navigate('Subscription');
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'エクスポート',
        'エクスポート形式を選択してください',
        [
          { text: 'CSV', onPress: () => handleExport('csv') },
          { text: 'vCard', onPress: () => handleExport('vcard') },
          { text: '連絡先に追加', onPress: () => handleExport('contacts') },
          { text: 'キャンセル', style: 'cancel' },
        ]
      );
    }
  };

  const handleExport = async (format: string) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const businessCards = await StorageService.getAllBusinessCards();
      
      if (businessCards.length === 0) {
        Alert.alert('エラー', '保存された名刺がありません');
        return;
      }

      switch (format) {
        case 'csv':
          await ExportService.saveAndShareCSV(businessCards);
          Alert.alert('成功', 'CSV ファイルが作成されました');
          break;
        case 'vcard':
          await ExportService.saveAndShareVCard(businessCards);
          Alert.alert('成功', 'vCard ファイルが作成されました');
          break;
        case 'contacts':
          const result = await ExportService.exportToContacts(businessCards);
          Alert.alert('連絡先に追加完了', `成功: ${result.success}件\n失敗: ${result.failed}件`);
          break;
        default:
          Alert.alert('エラー', 'サポートされていない形式です');
      }
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('エラー', 'エクスポートに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateApp = () => {
    Alert.alert(
      'アプリを評価',
      'App Storeでアプリを評価しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '評価する',
          onPress: () => {
            Linking.openURL('https://apps.apple.com/app/id123456789');
          },
        },
      ]
    );
  };

  const handleContact = () => {
    Alert.alert(
      'お問い合わせ',
      'お問い合わせ方法を選択してください',
      [
        {
          text: 'メール',
          onPress: () => {
            Linking.openURL('mailto:support@meishibox.com?subject=MeishiBox お問い合わせ');
          },
        },
        {
          text: 'ウェブサイト',
          onPress: () => {
            Linking.openURL('https://meishibox.com/support');
          },
        },
        { text: 'キャンセル', style: 'cancel' },
      ]
    );
  };

  const getMembershipStatusText = () => {
    switch (subscription.status) {
      case 'free':
        return 'メンバーシップの状態 無料版';
      case 'trial':
        return 'メンバーシップの状態 無料トライアル';
      case 'premium':
        return 'メンバーシップの状態 プレミアム';
      default:
        return 'メンバーシップの状態 無料版';
    }
  };

  const getMembershipIcon = () => {
    switch (subscription.status) {
      case 'premium':
        return 'crown';
      case 'trial':
        return 'diamond';
      default:
        return 'person-circle-outline';
    }
  };

  const renderMenuItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    showArrow: boolean = true
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color="#FF6B35" />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>設定</Text>
        </View>

        {/* Membership Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>メンバーシップ</Text>
          
          <View style={styles.membershipCard}>
            <View style={styles.membershipInfo}>
              <Ionicons name={getMembershipIcon() as any} size={24} color="#FF6B35" />
              <View style={styles.membershipText}>
                <Text style={styles.membershipStatus}>{getMembershipStatusText()}</Text>
                <Text style={styles.membershipSubtitle}>
                  残りスキャン回数: {subscription.remainingScans}
                </Text>
              </View>
            </View>
          </View>

          {renderMenuItem(
            'refresh',
            '購入を復元',
            undefined,
            handleRestorePurchase,
            true
          )}
        </View>

        {/* Pro Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>settings.section.pro_features</Text>
          
          {renderMenuItem(
            'document-text',
            'settings.pro_features.export_to_...',
            undefined,
            handleExportFeatures,
            true
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>サポート</Text>
          
          {renderMenuItem(
            'thumbs-up',
            '評価する',
            undefined,
            handleRateApp,
            true
          )}
          
          {renderMenuItem(
            'chatbubble-ellipses',
            'お問い合わせ',
            undefined,
            handleContact,
            true
          )}
        </View>

        {/* App Info Section */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appVersion}>Ver. {appVersion} Made in Keelung ❤️</Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  membershipCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  membershipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membershipText: {
    marginLeft: 12,
    flex: 1,
  },
  membershipStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  membershipSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SettingsScreen; 