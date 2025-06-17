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
    if (route?.params?.card) {
      // Editing existing card
      setCardData(route.params.card);
    } else if (route?.params?.ocrData) {
      // New card from OCR
      setCardData(route.params.ocrData);
    }
  }, [route?.params]);

  const handleBack = () => {
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
        company: cardData.company?.trim() || '',
        department: cardData.department?.trim() || '',
        position: cardData.position?.trim() || '',
        phone: cardData.phone?.trim() || '',
        mobile: cardData.mobile?.trim() || '',
        fax: cardData.fax?.trim() || '',
        email: cardData.email?.trim() || '',
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

  const renderInputField = (
    icon: string,
    placeholder: string,
    field: keyof BusinessCard,
    keyboardType: 'default' | 'email-address' | 'phone-pad' | 'url' = 'default'
  ) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputRow}>
        <Ionicons name={icon as any} size={20} color="#666666" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          value={cardData[field] as string || ''}
          onChangeText={(text) => updateField(field, text)}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.clearButton} onPress={() => updateField(field, '')}>
          <Ionicons name="close-circle" size={20} color="#CCCCCC" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSection = (title: string, icon: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={20} color="#FF6B35" />
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#FF6B35" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>名刺を編集</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>保存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Business Card Image */}
          {imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.cardImage} />
            </View>
          )}

          {/* Basic Information Section */}
          {renderSection('基本情報', 'person', (
            <>
              <Text style={styles.languageTab}>日本語</Text>
              <View style={styles.languageUnderline} />
              
              {renderInputField('person', '鴨山かほり', 'name')}
              {renderInputField('briefcase', '役職', 'position')}
              {renderInputField('business', '統一企業集團', 'company')}
              {renderInputField('briefcase', '輸入国内事業部', 'department')}
            </>
          ))}

          {/* Contact Information Section */}
          {renderSection('連絡先情報', 'call', (
            <>
              {renderInputField('phone-portrait', '070-1319-4481', 'mobile', 'phone-pad')}
              {renderInputField('call', '03-6264-9166', 'phone', 'phone-pad')}
              {renderInputField('print', '03-6264-9195', 'fax', 'phone-pad')}
              {renderInputField('mail', 'k_shigiyama88@ptm-tokyo.co.jp', 'email', 'email-address')}
              {renderInputField('mail', 'サブメール', 'email', 'email-address')}
              {renderInputField('link', 'http://ptm-tokyo.co.jp', 'website', 'url')}
            </>
          ))}

          {/* Company Information Section */}
          {renderSection('会社情報', 'business', (
            <>
              {renderInputField('location', '103-0016', 'postalCode')}
              {renderInputField('location', '東京都中央区日本橋小網町 3-11 日本橋...', 'address')}
              {renderInputField('grid', '会社ID', 'memo')}
            </>
          ))}

          {/* Social Media Section */}
          {renderSection('ソーシャルメディア', 'logo-instagram', (
            <>
              {renderInputField('chatbubble', 'LINE アカウント', 'memo')}
            </>
          ))}
        </ScrollView>

        <LoadingOverlay visible={isLoading} />
      </KeyboardAvoidingView>
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
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  section: {
    marginBottom: 30,
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
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  languageTab: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 8,
  },
  languageUnderline: {
    height: 2,
    backgroundColor: '#FF6B35',
    width: 60,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  inputIcon: {
    marginRight: 12,
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