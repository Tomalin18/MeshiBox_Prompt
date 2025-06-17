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
import { Colors } from '../constants/Colors';
import { 
  UserSubscription, 
  getDefaultSubscription, 
  getPremiumSubscription,
  canUsePremiumFeature,
  getRemainingTrialDays,
  openAppStore,
  getSupportEmail,
  getSupportWebsite
} from '../utils';
import { StorageService } from '../services/StorageService';
import { ExportService } from '../services/ExportService';

interface Props {
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}



const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [subscription, setSubscription] = useState<UserSubscription>(getDefaultSubscription());
  const [scanCount, setScanCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const appVersion = '1.0.04';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userSubscription = await StorageService.getUserSubscription();
      const currentScanCount = await StorageService.getScanCount();
      
      if (userSubscription) {
        setSubscription(userSubscription);
      }
      setScanCount(currentScanCount);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleRestorePurchase = async () => {
    try {
      // Mock restore purchase functionality
      Alert.alert(
        '購入を復元',
        '購入の復元を開始しています...',
        [
          {
            text: 'キャンセル',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              // Simulate restore process
                             setTimeout(() => {
                 Alert.alert('成功', '購入が復元されました');
                 setSubscription(getPremiumSubscription());
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
    
    if (!canUsePremiumFeature(subscription, 'exportFeatures')) {
      Alert.alert(
        'Pro機能',
        'この機能を使用するにはPro版にアップグレードしてください',
        [
          {
            text: 'キャンセル',
            style: 'cancel',
          },
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
      // Show export options
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
      
      // Get all business cards
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
          Alert.alert(
            '連絡先に追加完了',
            `成功: ${result.success}件\n失敗: ${result.failed}件`
          );
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
             // In real app, this would open the App Store
             Linking.openURL(openAppStore());
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
             Linking.openURL(`mailto:${getSupportEmail()}?subject=MeishiBox お問い合わせ`);
           },
         },
         {
           text: 'ウェブサイト',
           onPress: () => {
             Linking.openURL(getSupportWebsite());
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

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderMenuItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    showArrow: boolean = true,
    rightIcon?: string
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon as any} size={24} color={Colors.gray} />
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {rightIcon && (
          <Ionicons name={rightIcon as any} size={20} color={Colors.gray} style={styles.rightIcon} />
        )}
        {showArrow && (
          <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設定</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Membership Section */}
        <View style={styles.section}>
          {renderSectionHeader('メンバーシップ')}
          <View style={styles.sectionContent}>
            {renderMenuItem(
              getMembershipIcon(),
              getMembershipStatusText(),
              `残りスキャン回数: ${subscription.remainingScans}`,
              undefined,
              false
            )}
            {renderMenuItem(
              'refresh',
              '購入を復元',
              undefined,
              handleRestorePurchase,
              true,
              'refresh'
            )}
          </View>
        </View>

        {/* Pro Features Section */}
        <View style={styles.section}>
          {renderSectionHeader('Pro機能')}
          <View style={styles.sectionContent}>
            {renderMenuItem(
              'document-text',
              'エクスポート機能',
              'CSV, Excel, PDF形式で出力',
              handleExportFeatures,
              true
            )}
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          {renderSectionHeader('サポート')}
          <View style={styles.sectionContent}>
            {renderMenuItem(
              'thumbs-up',
              '評価する',
              'App Storeで評価',
              handleRateApp,
              true
            )}
            {renderMenuItem(
              'chatbubble-ellipses',
              'お問い合わせ',
              'ヘルプとサポート',
              handleContact,
              true
            )}
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appVersion}>Ver. {appVersion}</Text>
          <Text style={styles.madeIn}>Made in Keelung ❤️</Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    backgroundColor: Colors.white,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightIcon: {
    marginRight: 8,
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  madeIn: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SettingsScreen; 