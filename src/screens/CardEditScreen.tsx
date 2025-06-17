import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { BusinessCard } from '../types';
import { validateEmail, validatePhone, validateUrl, generateCardId } from '../utils';
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
      ocrData?: BusinessCard;
    };
  };
}

interface FormField {
  id: string;
  value: string;
  placeholder: string;
  icon: string;
}

const CardEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const [language, setLanguage] = useState('日本語');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Contact fields
  const [contactFields, setContactFields] = useState<FormField[]>([
    { id: '1', value: '', placeholder: '携帯電話', icon: 'call' },
    { id: '2', value: '', placeholder: '会社電話', icon: 'call' },
    { id: '3', value: '', placeholder: 'FAX', icon: 'print' },
    { id: '4', value: '', placeholder: 'メール', icon: 'mail' },
    { id: '5', value: '', placeholder: 'サブメール', icon: 'mail' },
    { id: '6', value: '', placeholder: 'ウェブサイト', icon: 'link' },
  ]);

  // Company fields
  const [companyFields, setCompanyFields] = useState<FormField[]>([
    { id: '1', value: '', placeholder: '郵便番号', icon: 'location' },
    { id: '2', value: '', placeholder: '住所', icon: 'location' },
    { id: '3', value: '', placeholder: '会社ID', icon: 'pricetag' },
  ]);

  // Social media fields
  const [socialFields, setSocialFields] = useState<FormField[]>([
    { id: '1', value: '', placeholder: 'LINEアカウント', icon: 'chatbubble' },
  ]);

  const imageUri = route?.params?.imageUri;

  // Auto-populate fields from OCR data or existing card
  useEffect(() => {
    const ocrData = route?.params?.ocrData;
    const existingCard = route?.params?.card;
    
    if (ocrData) {
      // Populate from OCR data
      setName(ocrData.name || '');
      setCompany(ocrData.company || '');
      setDepartment(ocrData.department || '');
      setPosition(ocrData.position || '');
      
      // Update contact fields with OCR data
      setContactFields(prev => prev.map(field => {
        if (field.placeholder === '携帯電話') return { ...field, value: ocrData.mobile || '' };
        if (field.placeholder === '会社電話') return { ...field, value: ocrData.phone || '' };
        if (field.placeholder === 'FAX') return { ...field, value: ocrData.fax || '' };
        if (field.placeholder === 'メール') return { ...field, value: ocrData.email || '' };
        if (field.placeholder === 'サブメール') return { ...field, value: ocrData.subEmail || '' };
        if (field.placeholder === 'ウェブサイト') return { ...field, value: ocrData.website || '' };
        return field;
      }));
      
      // Update company fields with OCR data
      setCompanyFields(prev => prev.map(field => {
        if (field.placeholder === '郵便番号') return { ...field, value: ocrData.postalCode || '' };
        if (field.placeholder === '住所') return { ...field, value: ocrData.address || '' };
        if (field.placeholder === '会社ID') return { ...field, value: ocrData.companyId || '' };
        return field;
      }));
      
      // Update social fields with OCR data
      setSocialFields(prev => prev.map(field => {
        if (field.placeholder === 'LINEアカウント') return { ...field, value: ocrData.lineAccount || '' };
        return field;
      }));
    } else if (existingCard) {
      // Populate from existing card data
      setName(existingCard.name || '');
      setCompany(existingCard.company || '');
      setDepartment(existingCard.department || '');
      setPosition(existingCard.position || '');
      
      // Update contact fields with existing card data
      setContactFields(prev => prev.map(field => {
        if (field.placeholder === '携帯電話') return { ...field, value: existingCard.mobile || '' };
        if (field.placeholder === '会社電話') return { ...field, value: existingCard.phone || '' };
        if (field.placeholder === 'FAX') return { ...field, value: existingCard.fax || '' };
        if (field.placeholder === 'メール') return { ...field, value: existingCard.email || '' };
        if (field.placeholder === 'サブメール') return { ...field, value: existingCard.subEmail || '' };
        if (field.placeholder === 'ウェブサイト') return { ...field, value: existingCard.website || '' };
        return field;
      }));
      
      // Update company fields with existing card data
      setCompanyFields(prev => prev.map(field => {
        if (field.placeholder === '郵便番号') return { ...field, value: existingCard.postalCode || '' };
        if (field.placeholder === '住所') return { ...field, value: existingCard.address || '' };
        if (field.placeholder === '会社ID') return { ...field, value: existingCard.companyId || '' };
        return field;
      }));
      
      // Update social fields with existing card data
      setSocialFields(prev => prev.map(field => {
        if (field.placeholder === 'LINEアカウント') return { ...field, value: existingCard.lineAccount || '' };
        return field;
      }));
    }
  }, [route?.params?.ocrData, route?.params?.card]);

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      // 觸覺反饋
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Validate required fields
      if (!name.trim()) {
        Alert.alert('エラー', '名前を入力してください');
        return;
      }

      // Validate email fields
      const emailFields = contactFields.filter(field => 
        field.placeholder.includes('メール') && field.value.trim() !== ''
      );
      for (const field of emailFields) {
        if (!validateEmail(field.value)) {
          Alert.alert('エラー', `正しいメールアドレスを入力してください: ${field.value}`);
          return;
        }
      }

      // Validate phone fields
      const phoneFields = contactFields.filter(field => 
        (field.placeholder.includes('電話') || field.placeholder.includes('FAX')) && 
        field.value.trim() !== ''
      );
      for (const field of phoneFields) {
        if (!validatePhone(field.value)) {
          Alert.alert('エラー', `正しい電話番号を入力してください: ${field.value}`);
          return;
        }
      }

      // Validate website fields
      const websiteFields = contactFields.filter(field => 
        field.placeholder.includes('ウェブサイト') && field.value.trim() !== ''
      );
      for (const field of websiteFields) {
        if (!validateUrl(field.value)) {
          Alert.alert('エラー', `正しいURLを入力してください: ${field.value}`);
          return;
        }
      }

      // Extract field values
      const mobileField = contactFields.find(f => f.placeholder === '携帯電話');
      const phoneField = contactFields.find(f => f.placeholder === '会社電話');
      const faxField = contactFields.find(f => f.placeholder === 'FAX');
      const emailField = contactFields.find(f => f.placeholder === 'メール');
      const subEmailField = contactFields.find(f => f.placeholder === 'サブメール');
      const websiteField = contactFields.find(f => f.placeholder === 'ウェブサイト');
      
      const postalCodeField = companyFields.find(f => f.placeholder === '郵便番号');
      const addressField = companyFields.find(f => f.placeholder === '住所');
      const companyIdField = companyFields.find(f => f.placeholder === '会社ID');
      
      const lineField = socialFields.find(f => f.placeholder === 'LINEアカウント');

      // Create business card object
      const existingCard = route?.params?.card;
      const businessCard: BusinessCard = {
        id: existingCard?.id || generateCardId(),
        name: name.trim(),
        company: company.trim(),
        department: department.trim(),
        position: position.trim(),
        phone: phoneField?.value.trim() || '',
        mobile: mobileField?.value.trim() || '',
        fax: faxField?.value.trim() || '',
        email: emailField?.value.trim() || '',
        subEmail: subEmailField?.value.trim() || '',
        website: websiteField?.value.trim() || '',
        address: addressField?.value.trim() || '',
        postalCode: postalCodeField?.value.trim() || '',
        companyId: companyIdField?.value.trim() || '',
        lineAccount: lineField?.value.trim() || '',
        memo: '',
        imageUri: imageUri || existingCard?.imageUri || '',
        createdAt: existingCard?.createdAt || new Date(),
        updatedAt: new Date(),
        isRedCarpet: false,
        language: 'ja',
        tags: [],
      };

      // Save to storage
      await StorageService.saveBusinessCard(businessCard);
      
      console.log('Business card saved successfully:', businessCard);
      Alert.alert('成功', '名刺が保存されました', [
        { text: 'OK', onPress: () => navigation?.goBack() }
      ]);
    } catch (error) {
      console.error('Failed to save business card:', error);
      Alert.alert('エラー', '名刺の保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const updateContactField = (id: string, value: string) => {
    setContactFields(prev => 
      prev.map(field => field.id === id ? { ...field, value } : field)
    );
  };

  const updateCompanyField = (id: string, value: string) => {
    setCompanyFields(prev => 
      prev.map(field => field.id === id ? { ...field, value } : field)
    );
  };

  const updateSocialField = (id: string, value: string) => {
    setSocialFields(prev => 
      prev.map(field => field.id === id ? { ...field, value } : field)
    );
  };

  const clearContactField = (id: string) => {
    updateContactField(id, '');
  };

  const clearCompanyField = (id: string) => {
    updateCompanyField(id, '');
  };

  const clearSocialField = (id: string) => {
    updateSocialField(id, '');
  };

  const addContactField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      value: '',
      placeholder: '新しい連絡先',
      icon: 'call'
    };
    setContactFields(prev => [...prev, newField]);
  };

  const addCompanyField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      value: '',
      placeholder: '新しい会社情報',
      icon: 'business'
    };
    setCompanyFields(prev => [...prev, newField]);
  };

  const addSocialField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      value: '',
      placeholder: '新しいSNS',
      icon: 'logo-twitter'
    };
    setSocialFields(prev => [...prev, newField]);
  };

  const renderFormField = (
    field: FormField,
    onChangeText: (id: string, value: string) => void,
    onClear: (id: string) => void
  ) => (
    <View key={field.id} style={styles.formField}>
      <Ionicons name={field.icon as any} size={20} color={Colors.gray} />
      <TextInput
        style={styles.textInput}
        value={field.value}
        placeholder={field.placeholder}
        placeholderTextColor={Colors.textSecondary}
        onChangeText={(text) => onChangeText(field.id, text)}
        multiline={field.placeholder.includes('住所')}
        numberOfLines={field.placeholder.includes('住所') ? 2 : 1}
      />
      {field.value.length > 0 && (
        <TouchableOpacity onPress={() => onClear(field.id)} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>名刺を編集</Text>
        
        <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
          <Text style={styles.saveButton}>保存</Text>
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>基本情報</Text>
          </View>
          
          <View style={styles.sectionContent}>
            {/* Language Selector */}
            <View style={styles.formField}>
              <Ionicons name="language" size={20} color={Colors.gray} />
              <TouchableOpacity style={styles.languageSelector}>
                <Text style={styles.languageText}>{language}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.gray} />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View style={styles.formField}>
              <Ionicons name="person" size={20} color={Colors.gray} />
              <TextInput
                style={styles.textInput}
                value={name}
                placeholder="名前"
                placeholderTextColor={Colors.textSecondary}
                onChangeText={setName}
              />
              {name.length > 0 && (
                <TouchableOpacity onPress={() => setName('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Position */}
            <View style={styles.formField}>
              <Ionicons name="briefcase" size={20} color={Colors.gray} />
              <TextInput
                style={styles.textInput}
                value={position}
                placeholder="役職"
                placeholderTextColor={Colors.textSecondary}
                onChangeText={setPosition}
              />
              {position.length > 0 && (
                <TouchableOpacity onPress={() => setPosition('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Company */}
            <View style={styles.formField}>
              <Ionicons name="business" size={20} color={Colors.gray} />
              <TextInput
                style={styles.textInput}
                value={company}
                placeholder="会社名"
                placeholderTextColor={Colors.textSecondary}
                onChangeText={setCompany}
              />
              {company.length > 0 && (
                <TouchableOpacity onPress={() => setCompany('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Department */}
            <View style={styles.formField}>
              <Ionicons name="folder" size={20} color={Colors.gray} />
              <TextInput
                style={styles.textInput}
                value={department}
                placeholder="部門"
                placeholderTextColor={Colors.textSecondary}
                onChangeText={setDepartment}
              />
              {department.length > 0 && (
                <TouchableOpacity onPress={() => setDepartment('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>連絡先情報</Text>
            <TouchableOpacity onPress={addContactField} style={styles.addButton}>
              <Ionicons name="add" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.sectionContent}>
            {contactFields.map(field => 
              renderFormField(field, updateContactField, clearContactField)
            )}
          </View>
        </View>

        {/* Company Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>会社情報</Text>
            <TouchableOpacity onPress={addCompanyField} style={styles.addButton}>
              <Ionicons name="add" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.sectionContent}>
            {companyFields.map(field => 
              renderFormField(field, updateCompanyField, clearCompanyField)
            )}
          </View>
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="logo-twitter" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>ソーシャルメディア</Text>
            <TouchableOpacity onPress={addSocialField} style={styles.addButton}>
              <Ionicons name="add" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.sectionContent}>
            {socialFields.map(field => 
              renderFormField(field, updateSocialField, clearSocialField)
            )}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      <LoadingOverlay 
        visible={isSaving} 
        message="名刺を保存中..." 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  imageContainer: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardImage: {
    width: 280,
    height: 180,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  sectionContent: {
    paddingVertical: 8,
  },
  formField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  languageSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
    paddingVertical: 4,
  },
  languageText: {
    fontSize: 14,
    color: Colors.text,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CardEditScreen; 