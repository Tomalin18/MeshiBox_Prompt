import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Props {
  navigation?: {
    goBack: () => void;
  };
}

const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');

  const handleClose = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handlePlanSelect = (plan: 'yearly' | 'monthly') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
  };

  const handleStartTrial = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Starting trial with plan:', selectedPlan);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Close Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <View style={styles.closeButtonCircle}>
            <Ionicons name="close" size={20} color="#666666" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="business-outline" size={48} color="#666666" />
            <View style={styles.proLabel}>
              <Text style={styles.proText}>pro</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>MeishiBox Pro無料トライアル</Text>
        <Text style={styles.subtitle}>
          最も熱心なユーザーのための、最も高度な{'\n'}機能です。
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem text="月間最大 1,000 件のスキャン" />
          <FeatureItem text="アプリ内の広告を削除" />
          <FeatureItem text="連絡先にエクスポート可能" />
          <FeatureItem text="Excel にエクスポート" />
          
          <Text style={styles.upcomingTitle}>今後の機能</Text>
          <FeatureItem text="一括名刺認識" isUpcoming />
        </View>

        {/* Pricing Note */}
        <Text style={styles.pricingNote}>
          年間プラン：3日間の無料トライアル｜3日後、購読はキャン{'\n'}セルされない限り自動的に更新されます。
        </Text>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {/* Yearly Plan */}
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.selectedPlan]}
            onPress={() => handlePlanSelect('yearly')}
          >
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>17% 割引!</Text>
            </View>
            <View style={styles.planContent}>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>年間</Text>
                <Text style={styles.planPrice}>¥667 円/月</Text>
                <Text style={styles.planDescription}>
                  無料トライアル後、{'\n'}¥8,000/年で請求され{'\n'}ます。
                </Text>
              </View>
              <View style={styles.radioContainer}>
                <View style={[styles.radioButton, selectedPlan === 'yearly' && styles.radioSelected]}>
                  {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Monthly Plan */}
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.selectedPlan]}
            onPress={() => handlePlanSelect('monthly')}
          >
            <View style={styles.planContent}>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>月額</Text>
                <Text style={styles.planPrice}>¥800/月</Text>
                <Text style={styles.planDescription}>
                  ¥800/月で請求され{'\n'}ます
                </Text>
              </View>
              <View style={styles.radioContainer}>
                <View style={[styles.radioButton, selectedPlan === 'monthly' && styles.radioSelected]}>
                  {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStartTrial}>
          <Text style={styles.startButtonText}>無料で始める</Text>
        </TouchableOpacity>

        {/* Footer Links */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>購入履歴を復元</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.footerLink}>利用規約</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.footerLink}>プライバシー</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Feature Item Component
interface FeatureItemProps {
  text: string;
  isUpcoming?: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ text, isUpcoming = false }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      {isUpcoming ? (
        <Ionicons name="calendar-outline" size={18} color="#FF6B35" />
      ) : (
        <Ionicons name="checkmark" size={18} color="#FF6B35" />
      )}
    </View>
    <Text style={[styles.featureText, isUpcoming && styles.upcomingText]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  proLabel: {
    position: 'absolute',
    top: -5,
    right: -20,
    backgroundColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 16,
    color: '#999999',
    marginTop: 10,
    marginBottom: 10,
  },
  upcomingText: {
    color: '#999999',
  },
  pricingNote: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  plansContainer: {
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedPlan: {
    borderColor: '#FF6B35',
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  radioContainer: {
    marginLeft: 16,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#FF6B35',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B35',
  },
  startButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 30,
  },
  footerLink: {
    fontSize: 14,
    color: '#FF6B35',
    textDecorationLine: 'underline',
  },
});

export default SubscriptionScreen; 