import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BusinessCard } from '../types';

interface Props {
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
  route?: {
    params?: {
      card: BusinessCard;
    };
  };
}

const CardDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const card = route?.params?.card;

  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>名刺が見つかりません</Text>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (navigation) {
      navigation.navigate('CardEdit', { card });
    }
  };

  const handleMore = () => {
    Alert.alert(
      'その他のオプション',
      '操作を選択してください',
      [
        { text: '共有', onPress: () => console.log('Share') },
        { text: '削除', style: 'destructive', onPress: () => console.log('Delete') },
        { text: 'キャンセル', style: 'cancel' },
      ]
    );
  };

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

  const renderContactItem = (
    icon: string,
    label: string,
    value: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.contactLeft}>
        <Ionicons name={icon as any} size={20} color="#666666" />
        <View style={styles.contactText}>
          <Text style={styles.contactLabel}>{label}</Text>
          <Text style={styles.contactValue}>{value}</Text>
        </View>
      </View>
      {onPress && (
        <Ionicons name="call" size={20} color="#666666" />
      )}
    </TouchableOpacity>
  );

  const renderCompanyItem = (
    icon: string,
    label: string,
    value: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.companyItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.companyLeft}>
        <Ionicons name={icon as any} size={20} color="#666666" />
        <View style={styles.companyText}>
          <Text style={styles.companyLabel}>{label}</Text>
          <Text style={styles.companyValue}>{value}</Text>
        </View>
      </View>
      {onPress && (
        <Ionicons name="map" size={20} color="#666666" />
      )}
    </TouchableOpacity>
  );

  const renderMemoItem = (
    icon: string,
    label: string,
    value: string
  ) => (
    <View style={styles.memoItem}>
      <Ionicons name={icon as any} size={20} color="#666666" />
      <View style={styles.memoText}>
        <Text style={styles.memoLabel}>{label}</Text>
        <Text style={styles.memoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#FF6B35" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>名刺の詳細</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Ionicons name="create" size={24} color="#FF6B35" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleMore}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>連絡先情報</Text>
          </View>

          {card.mobile && renderContactItem(
            'phone-portrait',
            '携帯電話',
            card.mobile,
            () => handlePhoneCall(card.mobile!)
          )}

          {card.phone && renderContactItem(
            'call',
            '勤務先電話',
            card.phone,
            () => handlePhoneCall(card.phone!)
          )}

          {card.fax && renderContactItem(
            'print',
            'FAX',
            card.fax,
            () => handlePhoneCall(card.fax!)
          )}

          {card.email && renderContactItem(
            'mail',
            'メール',
            card.email,
            () => handleEmail(card.email!)
          )}

          {card.website && renderContactItem(
            'globe',
            'ウェブサイト',
            card.website,
            () => handleWebsite(card.website!)
          )}
        </View>

        {/* Company Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>会社情報</Text>
          </View>

          {card.address && renderCompanyItem(
            'location',
            '住所',
            card.address
          )}

          {card.postalCode && renderCompanyItem(
            'location',
            '住所',
            card.postalCode
          )}
        </View>

        {/* Memo Section */}
        {card.memo && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>メモ</Text>
            </View>

            {renderMemoItem('document', 'メモ', card.memo)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactText: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  companyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  companyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyText: {
    marginLeft: 12,
    flex: 1,
  },
  companyLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  companyValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  memoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  memoText: {
    marginLeft: 12,
    flex: 1,
  },
  memoLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  memoValue: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default CardDetailScreen; 