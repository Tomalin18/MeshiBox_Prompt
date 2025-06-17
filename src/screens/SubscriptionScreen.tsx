import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
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

const { width: screenWidth } = Dimensions.get('window');

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
    // TODO: Implement subscription logic
    console.log('Starting trial with plan:', selectedPlan);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo and Title */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="business" size={32} color="#FF6B35" />
            </View>
            <View style={styles.proLabel}>
              <Text style={styles.proText}>pro</Text>
            </View>
          </View>
          
          <Text style={styles.title}>MeishiBox Pro無料トライアル</Text>
          <Text style={styles.subtitle}>
            最も熱心なユーザーのための、最も高度な{'\n'}機能です。
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <FeatureItem 
            text="月間最大 1,000 件のスキャン"
            included={true}
          />
          <FeatureItem 
            text="アプリ内の広告を削除"
            included={true}
          />
          <FeatureItem 
            text="連絡先にエクスポート可能"
            included={true}
          />
          <FeatureItem 
            text="Excel にエクスポート"
            included={true}
          />
          
          <View style={styles.futureFeatures}>
            <Text style={styles.futureFeaturesTitle}>今後の機能</Text>
            <FeatureItem 
              text="一括名刺認識"
              included={false}
              isUpcoming={true}
            />
          </View>
        </View>

        {/* Pricing Plans */}
        <View style={styles.pricingSection}>
          <Text style={styles.pricingNote}>
            年間プラン：3日間の無料トライアル | 3日後、購読はキャン{'\n'}セルされない限り自動的に更新されます。
          </Text>

          {/* Yearly Plan */}
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}
            onPress={() => handlePlanSelect('yearly')}
          >
            <View style={styles.planHeader}>
              <View style={styles.planInfo}>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>17% 割引!</Text>
                </View>
                <Text style={styles.planTitle}>年間</Text>
                <Text style={styles.planPrice}>¥667 円/月</Text>
                <Text style={styles.planDescription}>
                  無料トライアル後、{'\n'}¥8,000/年で請求され{'\n'}ます。
                </Text>
              </View>
              <View style={styles.radioButton}>
                {selectedPlan === 'yearly' && <View style={styles.radioButtonSelected} />}
              </View>
            </View>
          </TouchableOpacity>

          {/* Monthly Plan */}
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
            onPress={() => handlePlanSelect('monthly')}
          >
            <View style={styles.planHeader}>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>月額</Text>
                <Text style={styles.planPrice}>¥800/月</Text>
                <Text style={styles.planDescription}>
                  ¥800/月で請求され{'\n'}ます
                </Text>
              </View>
              <View style={styles.radioButton}>
                {selectedPlan === 'monthly' && <View style={styles.radioButtonSelected} />}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Start Trial Button */}
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
  included: boolean;
  isUpcoming?: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ text, included, isUpcoming = false }) => (
  <View style={styles.featureItem}>
    <View style={[styles.featureIcon, isUpcoming && styles.featureIconUpcoming]}>
      {isUpcoming ? (
        <Ionicons name="calendar" size={16} color="#FF6B35" />
      ) : (
        <Ionicons name="checkmark" size={16} color="#FF6B35" />
      )}
    </View>
    <Text style={[styles.featureText, isUpcoming && styles.featureTextUpcoming]}>
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  proLabel: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureIconUpcoming: {
    backgroundColor: '#FFF3E0',
  },
  featureText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  featureTextUpcoming: {
    color: '#666666',
  },
  futureFeatures: {
    marginTop: 16,
  },
  futureFeaturesTitle: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 8,
    paddingLeft: 16,
  },
  pricingSection: {
    marginBottom: 32,
  },
  pricingNote: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF3E0',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planInfo: {
    flex: 1,
  },
  discountBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
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
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B35',
  },
  startButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  footerLink: {
    fontSize: 14,
    color: '#FF6B35',
    textDecorationLine: 'underline',
  },
});

export default SubscriptionScreen; 