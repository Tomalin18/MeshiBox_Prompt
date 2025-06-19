import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StorageService } from '../services/StorageService';
import { ExportService } from '../services/ExportService';

interface Props {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [scanCount, setScanCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor('#FFFFFF', true);
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const count = await StorageService.getScanCount();
      setScanCount(count);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      '購入の復元',
      '購入履歴を確認しています...',
      [{ text: 'OK' }]
    );
  };

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      // 取得所有名片資料
      const businessCards = await StorageService.getAllBusinessCards();
      
      if (businessCards.length === 0) {
        Alert.alert(
          '匯出CSV',
          '目前沒有名片資料可以匯出',
          [{ text: 'OK' }]
        );
        return;
      }

      // 匯出CSV並分享
      await ExportService.saveAndShareCSV(businessCards);
      
      Alert.alert(
        '匯出成功',
        `已成功匯出 ${businessCards.length} 張名片的資料`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert(
        '匯出失敗',
        '匯出CSV時發生錯誤，請重試',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'アプリを評価',
      'App Storeで評価していただけますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '評価する', onPress: () => {
          // App Store URL would go here
          console.log('Opening App Store for rating');
        }}
      ]
    );
  };

  const handleContact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'お問い合わせ',
      'サポートチームにご連絡いたします',
      [{ text: 'OK' }]
    );
  };

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleCardListPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('cardList');
  };

  const handleCameraPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('camera');
  };

  const renderSectionTitle = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderCard = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Ionicons name={icon as any} size={24} color="#666666" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const remainingScans = Math.max(0, 50 - scanCount);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>設定</Text>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Membership Section */}
        <View style={styles.section}>
          {renderSectionTitle('メンバーシップ')}
          
          {renderCard(
            'diamond',
            'メンバーシップの状態 無料版',
            `残りスキャン回数: ${remainingScans}`,
            () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('subscription');
            }
          )}
          
          {renderCard(
            'refresh',
            '購入を復元',
            undefined,
            handleRestorePurchases
          )}
        </View>

        {/* Pro Features Section */}
        <View style={styles.section}>
          {renderSectionTitle('settings.section.pro_features')}
          
          {renderCard(
            'document-text',
            'settings.pro_features.export_to_...',
            undefined,
            handleExport
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          {renderSectionTitle('サポート')}
          
          {renderCard(
            'thumbs-up',
            '評価する',
            undefined,
            handleRate
          )}
          
          {renderCard(
            'chatbubble',
            'お問い合わせ',
            undefined,
            handleContact
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Ver. 1.0.00 Made by NeoBase</Text>
        </View>
      </ScrollView>

      {/* Bottom Navbar */}
      <View style={styles.bottomTabs}>
        <View style={styles.tabContainer}>
          {/* 名刺一覽 Tab */}
          <TouchableOpacity
            style={styles.tab}
            onPress={handleCardListPress}
            activeOpacity={0.7}
          >
            <View style={styles.tabIconContainer}>
              <Ionicons name="albums" size={24} color="#999999" />
            </View>
            <Text style={styles.tabText}>名刺一覽</Text>
          </TouchableOpacity>
          
          {/* Camera Tab - Center */}
          <TouchableOpacity
            style={styles.cameraTab}
            onPress={handleCameraPress}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          {/* 設定 Tab - Selected */}
          <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
            <View style={styles.tabIconContainer}>
              <Ionicons name="settings" size={24} color="#FF6B35" />
            </View>
            <Text style={[styles.tabText, styles.tabTextSelected]}>設定</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  
  // Header Styles
  headerSafeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  
  // Content Styles
  content: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  
  // Section Styles
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  
  // Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 1,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  cardIcon: {
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  
  // Footer Styles
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  versionText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  
  // Bottom Tabs Styles
  bottomTabs: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tabContainer: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },
  tabTextSelected: {
    color: '#FF6B35',
  },
  cameraTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
});

export default SettingsScreen; 