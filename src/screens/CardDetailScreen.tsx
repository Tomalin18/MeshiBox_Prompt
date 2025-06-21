import React, { useState, useEffect } from 'react';
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
  Share,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BusinessCard } from '../types';
import { StorageService } from '../services/StorageService';
import { JapaneseSortUtils } from '../utils/JapaneseSortUtils';

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
  const [cardData, setCardData] = useState<BusinessCard | undefined>(card);

  useEffect(() => {
    if (card) {
      // 自動生成缺失的讀音
      const updatedCard = { ...card };
      let needsUpdate = false;

      // 如果沒有姓名讀音（完全沒有或為空字符串），嘗試自動生成
      if ((!updatedCard.nameReading || updatedCard.nameReading.trim() === '') && updatedCard.name) {
        const generatedReading = JapaneseSortUtils.getKanjiReadingRomaji(updatedCard.name);
        if (generatedReading) {
          updatedCard.nameReading = generatedReading;
          needsUpdate = true;
          console.log(`自動生成姓名讀音: ${updatedCard.name} → ${generatedReading}`);
        }
      }

      // 如果沒有公司讀音（完全沒有或為空字符串），嘗試自動生成
      if ((!updatedCard.companyReading || updatedCard.companyReading.trim() === '') && updatedCard.company) {
        const generatedReading = JapaneseSortUtils.getKanjiReadingRomaji(updatedCard.company);
        if (generatedReading) {
          updatedCard.companyReading = generatedReading;
          needsUpdate = true;
          console.log(`自動生成公司讀音: ${updatedCard.company} → ${generatedReading}`);
        }
      }

      // 如果生成了新的讀音，更新數據和存儲
      if (needsUpdate) {
        setCardData(updatedCard);
        // 異步更新存儲中的數據
        StorageService.saveBusinessCard(updatedCard).catch((error: any) => {
          console.error('Failed to update card with generated readings:', error);
        });
      } else {
        setCardData(card);
      }
    }
  }, [card]);

  if (!cardData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>名片信息不存在</Text>
      </View>
    );
  }

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (navigation && cardData) {
      navigation.navigate('CardEdit', { card: cardData });
    }
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // 構建分享內容
      let shareContent = `📇 ${cardData.name}\n`;
      
      if (cardData.nameReading) {
        shareContent += `(${cardData.nameReading})\n`;
      }
      
      shareContent += `🏢 ${cardData.company}\n`;
      
      if (cardData.companyReading) {
        shareContent += `(${cardData.companyReading})\n`;
      }
      
      if (cardData.department) {
        shareContent += `📋 ${cardData.department}\n`;
      }
      
      if (cardData.position) {
        shareContent += `💼 ${cardData.position}\n`;
      }
      
      if (cardData.phone) {
        shareContent += `📞 ${cardData.phone}\n`;
      }
      
      if (cardData.mobile) {
        shareContent += `📱 ${cardData.mobile}\n`;
      }
      
      if (cardData.email) {
        shareContent += `📧 ${cardData.email}\n`;
      }
      
      if (cardData.website) {
        shareContent += `🌐 ${cardData.website}\n`;
      }
      
      if (cardData.address) {
        shareContent += `📍 ${cardData.address}\n`;
      }
      
      if (cardData.memo) {
        shareContent += `📝 ${cardData.memo}\n`;
      }
      
      const result = await Share.share({
        message: shareContent,
        title: `${cardData.name}的名片`,
      });
      
      if (result.action === Share.sharedAction) {
        console.log('名片已分享');
      }
    } catch (error) {
      console.error('共享錯誤:', error);
      Alert.alert('錯誤', '名片分享失敗');
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      '刪除名片',
      `確定要刪除「${cardData.name}」的名片嗎？此操作無法復原。`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteBusinessCard(cardData.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              Alert.alert(
                '名片已刪除',
                '名片已成功刪除',
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
              console.error('刪除錯誤:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('錯誤', '名片刪除失敗');
            }
          },
        },
      ]
    );
  };

  const handleMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      '其他選項',
      '請選擇操作',
      [
        { text: '共享', onPress: handleShare },
        { text: '刪除', style: 'destructive', onPress: handleDelete },
        { text: '取消', style: 'cancel' },
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
            <Text style={styles.headerTitle}>名片詳細資料</Text>
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
        {/* Business Card Image */}
        {cardData.imageUri && (
          <View style={styles.cardImageSection}>
            <Image source={{ uri: cardData.imageUri }} style={styles.cardImage} resizeMode="contain" />
          </View>
        )}

        {/* Card Basic Information */}
        <View style={styles.cardInfoSection}>
          <View style={styles.cardInfoContainer}>
            <Text style={styles.cardName}>
              {cardData.name}
              {cardData.nameReading && (
                <Text style={styles.cardNameReadingInline}>（{cardData.nameReading}）</Text>
              )}
            </Text>
            <Text style={styles.cardCompany}>
              {cardData.company}
              {cardData.companyReading && (
                <Text style={styles.cardCompanyReadingInline}>（{cardData.companyReading}）</Text>
              )}
            </Text>
            {cardData.department && (
              <Text style={styles.cardDepartment}>{cardData.department}</Text>
            )}
            {cardData.position && (
              <Text style={styles.cardPosition}>{cardData.position}</Text>
            )}
          </View>
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>連絡先資料</Text>
          </View>

          <View style={styles.cardContainer}>
            {/* Mobile Phone */}
            {cardData.mobile && renderContactItem(
              'phone-portrait-outline',
              cardData.mobile,
              'call',
              () => handlePhoneCall(cardData.mobile!)
            )}

            {/* Office Phone */}
            {cardData.phone && renderContactItem(
              'call-outline',
              cardData.phone,
              'call',
              () => handlePhoneCall(cardData.phone!)
            )}

            {/* Fax */}
            {cardData.fax && renderContactItem(
              'print-outline',
              cardData.fax,
              'call',
              () => handlePhoneCall(cardData.fax!)
            )}

            {/* Email */}
            {cardData.email && renderContactItem(
              'mail-outline',
              cardData.email,
              'mail',
              () => handleEmail(cardData.email!)
            )}

            {/* Sub Email */}
            {cardData.subEmail && renderContactItem(
              'mail-outline',
              cardData.subEmail,
              'mail',
              () => handleEmail(cardData.subEmail!)
            )}

            {/* Website */}
            {cardData.website && renderContactItem(
              'globe-outline',
              cardData.website,
              'open-outline',
              () => handleWebsite(cardData.website!)
            )}
          </View>
        </View>

        {/* Company Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business-outline" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>公司資料</Text>
          </View>

          <View style={styles.cardContainer}>
            {/* Address */}
            {cardData.address && renderCompanyItem(
              'location-outline',
              cardData.address,
              () => handleMapOpen(cardData.address!)
            )}

            {/* Postal Code */}
            {cardData.postalCode && renderCompanyItem(
              'location-outline',
              `〒${cardData.postalCode}`,
              () => handleMapOpen(cardData.postalCode!)
            )}

            {/* Company */}
            {cardData.company && renderCompanyItem(
              'business-outline',
              cardData.company
            )}

            {/* Department */}
            {cardData.department && renderCompanyItem(
              'folder-outline',
              cardData.department
            )}

            {/* Position */}
            {cardData.position && renderCompanyItem(
              'briefcase-outline',
              cardData.position
            )}
          </View>
        </View>

        {/* Memo Section */}
        {cardData.memo && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>備註</Text>
            </View>

            <View style={styles.cardContainer}>
              {renderMemoItem(
                'document-outline',
                cardData.memo
              )}
            </View>
          </View>
        )}
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
  cardInfoSection: {
    marginTop: 24,
  },
  cardInfoContainer: {
    marginHorizontal: 16,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B35',
  },
  cardNameReadingInline: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  cardCompany: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
  },
  cardCompanyReadingInline: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
  cardDepartment: {
    fontSize: 16,
    color: '#666666',
  },
  cardPosition: {
    fontSize: 16,
    color: '#666666',
  },
  cardImageSection: {
    marginBottom: 24,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
});

export default CardDetailScreen; 