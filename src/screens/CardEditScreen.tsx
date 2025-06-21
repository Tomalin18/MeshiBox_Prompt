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
    };
  };
}

const CardEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
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
      console.log('🏁 CardEditScreen 初始化');
      console.log('📦 Route params:', route?.params);
      
      if (route?.params?.card) {
        // Editing existing card
        console.log('✏️ 編輯現有名片');
        setCardData(route.params.card);
      } else if (route?.params?.ocrData) {
        // New card from OCR - data already processed
        console.log('🆕 來自OCR的新名片數據:', route.params.ocrData);
        setCardData(route.params.ocrData);
      } else if (route?.params?.imageUri && !route?.params?.ocrData) {
        // New card with image but no OCR data (fallback case)
        // OCR should have been completed during transition animation
        console.log('⚠️ OCR data not available, using empty card data');
      }
    };

    initializeCardData();
  }, [route?.params]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    if (!cardData.name?.trim()) {
      Alert.alert('錯誤', '請輸入姓名');
      return;
    }

    try {
      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const businessCard: BusinessCard = {
        id: route?.params?.card?.id || Date.now().toString(),
        name: cardData.name?.trim() || '',
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
        Alert.alert('成功', '名片已更新');
      } else {
        Alert.alert('成功', '名片已儲存');
      }

      if (navigation) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert('錯誤', '名片儲存失敗');
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
    
    return (
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <Ionicons name={icon as any} size={24} color="#666666" style={styles.inputIcon} />
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
          {hasContent && (
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
            <Text style={styles.headerTitle}>編輯名片</Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>儲存</Text>
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
            </View>
          )}

          {/* Basic Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>基本資料</Text>
            </View>

            {/* Language Selector */}
            <View style={styles.languageSelector}>
              <Text style={styles.languageTab}>繁體中文</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formFields}>
              {renderInputField('person-outline', '姓名', 'name')}
              {renderInputField('text-outline', '姓名讀音', 'nameReading')}
              {renderInputField('briefcase-outline', '職位', 'position')}
              {renderInputField('business-outline', '公司名稱', 'company')}
              {renderInputField('folder-outline', '部門', 'department')}
            </View>
          </View>

          {/* Contact Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call-outline" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>聯絡資訊</Text>
            </View>

            <View style={styles.formFields}>
              {renderInputField('phone-portrait-outline', '攜帶電話', 'mobile', 'phone-pad')}
              {renderInputField('call-outline', '電話號碼', 'phone', 'phone-pad')}
              {renderInputField('print-outline', 'FAX號碼', 'fax', 'phone-pad')}
              {renderInputField('mail-outline', '電子郵件地址', 'email', 'email-address')}
              {renderInputField('mail-outline', '次電子郵件', 'email', 'email-address')}
              {renderInputField('link-outline', '網站', 'website', 'url')}
            </View>
          </View>

          {/* Company Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business-outline" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>公司資訊</Text>
            </View>

            <View style={styles.formFields}>
              {renderInputField('location-outline', '郵遞區號', 'postalCode')}
              {renderInputField('location-outline', '地址', 'address')}
              {renderInputField('grid-outline', '備註', 'memo')}
            </View>
          </View>

          {/* Social Media Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="logo-instagram" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>社交媒體</Text>
            </View>

            <View style={styles.formFields}>
              {renderInputField('chatbubble-outline', 'SNS帳號', 'memo')}
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
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default CardEditScreen; 