import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Props {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('CardList');
  };

  const handlePlanSelect = (plan: 'yearly' | 'monthly') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
  };

  const handleStartTrial = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('CardList');
  };

  const renderFeatureItem = (text: string, isUpcoming: boolean = false) => (
    <View style={styles.featureItem}>
      {isUpcoming ? (
        <Ionicons name="calendar-outline" size={20} color="#999999" />
      ) : (
        <Ionicons name="checkmark" size={20} color="#FF6B35" />
      )}
      <Text style={[styles.featureText, isUpcoming && styles.upcomingFeatureText]}>
        {text}
      </Text>
    </View>
  );

  const renderPricingCard = (
    type: 'yearly' | 'monthly',
    title: string,
    price: string,
    subtitle: string,
    isSelected: boolean,
    discount?: string
  ) => (
    <TouchableOpacity
      style={[
        styles.pricingCard,
        isSelected ? styles.selectedCard : styles.unselectedCard,
        { width: (width - 48) / 2 }
      ]}
      onPress={() => handlePlanSelect(type)}
      activeOpacity={0.8}
    >
      {discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}</Text>
        </View>
      )}
      
      <Text style={styles.planTitle}>{title}</Text>
      <Text style={styles.planPrice}>{price}</Text>
      
      <View style={styles.radioContainer}>
        <View style={[
          styles.radioButton,
          isSelected ? styles.radioSelected : styles.radioUnselected
        ]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
      
      <Text style={styles.planSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#666666" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.cardStack}>
              <View style={[styles.card, styles.cardBack]} />
              <View style={[styles.card, styles.cardMiddle]} />
              <View style={[styles.card, styles.cardFront]} />
            </View>
            <View style={styles.proBadge}>
              <Text style={styles.proText}>pro</Text>
            </View>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>MeishiBox Pro無料トライアル</Text>
          <Text style={styles.subtitle}>
            最も熱心なユーザーのための、最も高度な機能です。
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {renderFeatureItem('月間最大1,000件のスキャン')}
          {renderFeatureItem('アプリ内の広告を削除')}
          {renderFeatureItem('連絡先にエクスポート可能')}
          {renderFeatureItem('Excelにエクスポート')}
        </View>

        {/* Future Features */}
        <View style={styles.futureSection}>
          <Text style={styles.futureSectionTitle}>今後の機能</Text>
          <View style={styles.futureContainer}>
            {renderFeatureItem('一括名刺認識', true)}
          </View>
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingSection}>
          <View style={styles.pricingRow}>
            {renderPricingCard(
              'yearly',
              '年間',
              '¥667円/月',
              '無料トライアル後、¥8,000/年で請求されます。',
              selectedPlan === 'yearly',
              '17%割引'
            )}
            {renderPricingCard(
              'monthly',
              '月額',
              '¥800/月',
              '¥800/月で請求されます',
              selectedPlan === 'monthly'
            )}
          </View>
        </View>

        {/* Bottom Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartTrial}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>無料で始める</Text>
        </TouchableOpacity>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.footerLink}>購入履歴を復元</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.footerLink}>利用規約</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.footerLink}>プライバシー</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    position: 'relative',
  },
  cardStack: {
    width: 48,
    height: 36,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: 48,
    height: 36,
    backgroundColor: '#666666',
    borderRadius: 3,
  },
  cardBack: {
    top: 6,
    left: 6,
    opacity: 0.7,
  },
  cardMiddle: {
    top: 3,
    left: 3,
    opacity: 0.85,
  },
  cardFront: {
    top: 0,
    left: 0,
    opacity: 1,
  },
  proBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  titleSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF6B35',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
  },
  featuresContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 12,
    flex: 1,
  },
  upcomingFeatureText: {
    color: '#999999',
  },
  futureSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  futureSectionTitle: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  futureContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  pricingSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    position: 'relative',
    minHeight: 140,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  unselectedCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  radioContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#FF6B35',
  },
  radioUnselected: {
    borderColor: '#CCCCCC',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B35',
  },
  planSubtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
  startButton: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 20,
    marginTop: 32,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  footerLink: {
    fontSize: 14,
    color: '#999999',
    marginHorizontal: 8,
  },
});

export default SubscriptionScreen; 