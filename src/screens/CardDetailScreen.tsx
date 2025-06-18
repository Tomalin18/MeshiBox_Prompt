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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (navigation) {
      navigation.navigate('CardEdit', { card });
    }
  };

  const handleMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const handleMapOpen = (address: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`maps://app?q=${encodedAddress}`);
  };

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

  const renderCompanyItem = (
    icon: string,
    text: string,
    onPress?: () => void
  ) => (
    <View style={styles.contactItem}>
      <View style={styles.contactLeft}>
        <Ionicons name={icon as any} size={24} color="#666666" />
        <Text style={styles.contactText}>{text}</Text>
      </View>
      {onPress && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Ionicons name="map" size={16} color="#666666" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMemoItem = (
    icon: string,
    text: string
  ) => (
    <View style={styles.contactItem}>
      <View style={styles.contactLeft}>
        <Ionicons name={icon as any} size={24} color="#666666" />
        <Text style={styles.contactText}>{text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>連絡先情報</Text>
          </View>

          <View style={styles.cardContainer}>
            {/* Mobile Phone */}
            {renderContactItem(
              'phone-portrait-outline',
              '070-1319-4481',
              'call',
              () => handlePhoneCall('070-1319-4481')
            )}

            {/* Office Phone */}
            {renderContactItem(
              'call-outline',
              '03-6264-9166',
              'call',
              () => handlePhoneCall('03-6264-9166')
            )}

            {/* Fax */}
            {renderContactItem(
              'print-outline',
              '03-6264-9195',
              'call',
              () => handlePhoneCall('03-6264-9195')
            )}

            {/* Email */}
            {renderContactItem(
              'mail-outline',
              'k_shigiyama88@ptm-tokyo.co.jp',
              'mail',
              () => handleEmail('k_shigiyama88@ptm-tokyo.co.jp')
            )}

            {/* Website */}
            {renderContactItem(
              'globe-outline',
              'http://ptm-tokyo.co.jp',
              'open-outline',
              () => handleWebsite('http://ptm-tokyo.co.jp')
            )}
          </View>
        </View>

        {/* Company Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business-outline" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>会社情報</Text>
          </View>

          <View style={styles.cardContainer}>
            {/* Address */}
            {renderCompanyItem(
              'location-outline',
              '東京都中央区日本橋小網町3-11 日本橋SOYIC4階',
              () => handleMapOpen('東京都中央区日本橋小網町3-11 日本橋SOYIC4階')
            )}

            {/* Postal Code */}
            {renderCompanyItem(
              'location-outline',
              '103-0016',
              () => handleMapOpen('103-0016')
            )}
          </View>
        </View>

        {/* Memo Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>メモ</Text>
          </View>

          <View style={styles.cardContainer}>
            {renderMemoItem(
              'document-outline',
              'lopenmall.JP'
            )}
          </View>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerSafeArea: {
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B35',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 4,
  },
  moreButton: {
    padding: 4,
    marginLeft: 12,
    marginRight: 4,
  },
  content: {
    flex: 1,
  },
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
  cardContainer: {
    marginHorizontal: 16,
  },
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
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
    marginLeft: 16,
    flex: 1,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default CardDetailScreen; 