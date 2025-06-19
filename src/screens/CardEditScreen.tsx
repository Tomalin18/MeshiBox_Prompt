import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BusinessCard } from '../types';
import { StorageService } from '../services/StorageService';
import LoadingOverlay from '../components/LoadingOverlay';
import SkeletonLoader from '../components/SkeletonLoader';

interface Props {
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
  route?: {
    params?: {
      card?: BusinessCard;
      imageUri?: string;
      ocrData?: Partial<BusinessCard>;
      isProcessing?: boolean;
      fromCamera?: boolean;
      fromGallery?: boolean;
      orientation?: 'landscape' | 'portrait';
    };
  };
}

const CardEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [cardData, setCardData] = useState<Partial<BusinessCard>>({
    name: '',
    company: '',
    department: '',
    position: '',
    phone: '',
    mobile: '',
    fax: '',
    email: '',
    website: '',
    address: '',
    postalCode: '',
    memo: '',
  });

  const isEditing = !!route?.params?.card;
  const imageUri = route?.params?.imageUri || route?.params?.card?.imageUri;

  useEffect(() => {
    const initializeCardData = async () => {
      if (route?.params?.card) {
        // Editing existing card
        setCardData(route.params.card);
      } else if (route?.params?.ocrData) {
        // New card from OCR - data already processed
        setCardData(route.params.ocrData);
      } else if (route?.params?.isProcessing && route?.params?.imageUri) {
        // New card with processing flag - start background OCR
        setIsProcessingOCR(true);
        try {
          const { GoogleAIOCRService } = await import('../services/GoogleAIOCRService');
          const ocrData = await GoogleAIOCRService.processBusinessCard(route.params.imageUri);
          
          // 漸進式填入OCR結果
          await fillFormProgressively(ocrData);
        } catch (error) {
          console.error('OCR processing failed:', error);
          // Keep empty data if OCR fails
        } finally {
          setIsProcessingOCR(false);
        }
      } else if (route?.params?.imageUri && !route?.params?.ocrData) {
        // New card with image but no OCR data - need to process (legacy)
        setIsProcessingOCR(true);
        try {
          const { GoogleAIOCRService } = await import('../services/GoogleAIOCRService');
          const ocrData = await GoogleAIOCRService.processBusinessCard(route.params.imageUri);
          setCardData(ocrData);
        } catch (error) {
          console.error('OCR processing failed:', error);
          // Keep empty data if OCR fails
        } finally {
          setIsProcessingOCR(false);
        }
      }
    };

    initializeCardData();
  }, [route?.params]);

  const fillFormProgressively = async (ocrData: Partial<BusinessCard>) => {
    const fields = [
      'name', 'company', 'department', 'position', 
      'phone', 'mobile', 'email', 'website', 'address'
    ];
    
    for (const field of fields) {
      if (ocrData[field as keyof BusinessCard]) {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms間隔
        setCardData(prev => ({ 
          ...prev, 
          [field]: ocrData[field as keyof BusinessCard] 
        }));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    if (!cardData.name?.trim()) {
      Alert.alert('エラー', '名前を入力してください');
      return;
    }

    try {
      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const businessCard: BusinessCard = {
        id: route?.params?.card?.id || Date.now().toString(),
        name: cardData.name.trim(),
        nameReading: cardData.nameReading?.trim() || '',
        company: cardData.company?.trim() || '',
        companyReading: cardData.companyReading?.trim() || '',
        department: cardData.department?.trim() || '',
        position: cardData.position?.trim() || '',
        phone: cardData.phone?.trim() || '',
        mobile: cardData.mobile?.trim() || '',
        fax: cardData.fax?.trim() || '',
        email: cardData.email?.trim() || '',
        subEmail: cardData.subEmail?.trim() || '',
        website: cardData.website?.trim() || '',
        address: cardData.address?.trim() || '',
        postalCode: cardData.postalCode?.trim() || '',
        memo: cardData.memo?.trim() || '',
        imageUri: imageUri || '',
        createdAt: route?.params?.card?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await StorageService.saveBusinessCard(businessCard);
      if (isEditing) {
        Alert.alert('成功', '名刺が更新されました');
      } else {
        Alert.alert('成功', '名刺が保存されました');
      }

      if (navigation) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to save card:', error);
      Alert.alert('エラー', '名刺の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof BusinessCard, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const clearField = (field: keyof BusinessCard) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateField(field, '');
  };

  const renderInputField = (
    icon: string,
    placeholder: string,
    field: keyof BusinessCard,
    keyboardType: 'default' | 'email-address' | 'phone-pad' | 'url' = 'default'
  ) => {
    const value = cardData[field] as string || '';
    const hasContent = value.length > 0;
    const isFieldProcessing = isProcessingOCR && !value;
    
    return (
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <Ionicons name={icon as any} size={24} color="#666666" style={styles.inputIcon} />
          {isFieldProcessing ? (
            <View style={styles.skeletonContainer}>
              <SkeletonLoader width="60%" height={16} borderRadius={4} />
            </View>
          ) : (
            <TextInput
              style={styles.textInput}
              placeholder={placeholder}
              placeholderTextColor="#999999"
              value={value}
              onChangeText={(text) => updateField(field, text)}
              keyboardType={keyboardType}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
          {hasContent && !isFieldProcessing && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => clearField(field)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#FF6B35" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>名刺を編集</Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Business Card Image */}
          {imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="contain" />
              {isProcessingOCR && (
                <View style={styles.ocrOverlay}>
                  <Text style={styles.ocrText}>正在分析名片...</Text>
                  <Text style={styles.ocrSubText}>請稍候，AI 正在識別文字信息</Text>
                </View>
              )}
            </View>
          )}

          {/* Basic Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>基本情報</Text>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={24} color="#FF6B35" />
              </TouchableOpacity>
            </View>

            {/* Language Selector */}
            <View style={styles.languageSelector}>
              <Text style={styles.languageTab}>日本語</Text>
              <TouchableOpacity style={styles.languageAddButton}>
                <Ionicons name="add" size={24} color="#FF6B35" />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formFields}>
              {renderInputField('person-outline', '姓名 (例: 鴨山かほり)', 'name')}
              {renderInputField('text-outline', '姓名讀音 (統一使用羅馬字，例: Go Masatoshi)', 'nameReading')}
              {renderInputField('briefcase-outline', '役職', 'position')}
              {renderInputField('business-outline', '會社名', 'company')}
              {renderInputField('text-outline', '會社名讀音 (統一使用羅馬字)', 'companyReading')}
              {renderInputField('folder-outline', '部門', 'department')}
            </View>
          </View>

          {/* Contact Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call-outline" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>連絡先情報</Text>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={24} color="#FF6B35" />
              </TouchableOpacity>
            </View>

            <View style={styles.formFields}>
              {renderInputField('phone-portrait-outline', '070-1319-4481', 'mobile', 'phone-pad')}
              {renderInputField('call-outline', '03-6264-9166', 'phone', 'phone-pad')}
              {renderInputField('print-outline', '03-6264-9195', 'fax', 'phone-pad')}
              {renderInputField('mail-outline', 'k_shigiyama88@ptm-tokyo.co.jp', 'email', 'email-address')}
              {renderInputField('mail-outline', 'サブメール', 'email', 'email-address')}
              {renderInputField('link-outline', 'http://ptm-tokyo.co.jp', 'website', 'url')}
            </View>
          </View>

          {/* Company Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business-outline" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>会社情報</Text>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={24} color="#FF6B35" />
              </TouchableOpacity>
            </View>

            <View style={styles.formFields}>
              {renderInputField('location-outline', '103-0016', 'postalCode')}
              {renderInputField('location-outline', '東京都中央区日本橋小網町 3-11 日本橋...', 'address')}
              {renderInputField('grid-outline', '会社ID', 'memo')}
            </View>
          </View>

          {/* Social Media Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="logo-instagram" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>ソーシャルメディア</Text>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={24} color="#FF6B35" />
              </TouchableOpacity>
            </View>

            <View style={styles.formFields}>
              {renderInputField('chatbubble-outline', 'LINE アカウント', 'memo')}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} />
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
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B35',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  ocrOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  ocrText: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  ocrSubText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.9,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
    flex: 1,
  },
  addButton: {
    padding: 4,
    marginRight: 20,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  languageTab: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B35',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
    paddingBottom: 4,
  },
  languageAddButton: {
    padding: 4,
  },
  formFields: {
    marginHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    padding: 4,
  },
  skeletonContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 16,
  },
});

export default CardEditScreen; 