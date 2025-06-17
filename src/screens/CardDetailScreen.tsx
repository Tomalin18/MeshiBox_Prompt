import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface Props {
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
  route?: {
    params?: {
      card?: any;
    };
  };
}

const CardDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  // Mock data - in real app this would come from route params or API
  const cardData = route?.params?.card || {
    id: '1',
    name: '鴨山かほり',
    company: '統一企業集團',
    department: '輸入國內事業部',
    mobile: '070-1319-4481',
    phone: '03-6264-9166',
    fax: '03-6264-9195',
    email: 'k_shigiyama88@ptm-tokyo.co.jp',
    website: 'http://ptm-tokyo.co.jp',
    address: '東京都中央区日本橋小網町3-11 日本橋SOYIC4階',
    postalCode: '103-0016',
    memo: 'lopenmall.JP',
  };

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (navigation) {
      navigation.navigate('CardEdit', { card: cardData });
    }
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url);
  };

  const handleMenu = () => {
    // Handle menu options (delete, share, etc.)
    console.log('Menu pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>名刺の詳細</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleMenu}>
            <Ionicons name="ellipsis-vertical" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>連絡先情報</Text>
          </View>
          
          <View style={styles.sectionContent}>
            {/* Mobile Phone */}
            <TouchableOpacity 
              style={styles.contactItem} 
              onPress={() => handleCall(cardData.mobile)}
            >
              <Ionicons name="phone-portrait" size={20} color={Colors.gray} />
              <Text style={styles.contactLabel}>携帯電話</Text>
              <Text style={styles.contactValue}>{cardData.mobile}</Text>
              <Ionicons name="call" size={16} color={Colors.primary} />
            </TouchableOpacity>

            {/* Office Phone */}
            <TouchableOpacity 
              style={styles.contactItem} 
              onPress={() => handleCall(cardData.phone)}
            >
              <Ionicons name="call" size={20} color={Colors.gray} />
              <Text style={styles.contactLabel}>会社電話</Text>
              <Text style={styles.contactValue}>{cardData.phone}</Text>
              <Ionicons name="call" size={16} color={Colors.primary} />
            </TouchableOpacity>

            {/* Fax */}
            <View style={styles.contactItem}>
              <Ionicons name="print" size={20} color={Colors.gray} />
              <Text style={styles.contactLabel}>FAX</Text>
              <Text style={styles.contactValue}>{cardData.fax}</Text>
            </View>

            {/* Email */}
            <TouchableOpacity 
              style={styles.contactItem} 
              onPress={() => handleEmail(cardData.email)}
            >
              <Ionicons name="mail" size={20} color={Colors.gray} />
              <Text style={styles.contactLabel}>メール</Text>
              <Text style={styles.contactValue}>{cardData.email}</Text>
              <Ionicons name="mail" size={16} color={Colors.primary} />
            </TouchableOpacity>

            {/* Website */}
            <TouchableOpacity 
              style={styles.contactItem} 
              onPress={() => handleWebsite(cardData.website)}
            >
              <Ionicons name="globe" size={20} color={Colors.gray} />
              <Text style={styles.contactLabel}>ウェブサイト</Text>
              <Text style={styles.contactValue}>{cardData.website}</Text>
              <Ionicons name="open" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Company Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>会社情報</Text>
          </View>
          
          <View style={styles.sectionContent}>
            {/* Address */}
            <View style={styles.contactItem}>
              <Ionicons name="location" size={20} color={Colors.gray} />
              <View style={styles.addressContainer}>
                <Text style={styles.contactLabel}>住所</Text>
                <Text style={styles.contactValue}>{cardData.address}</Text>
                <Text style={styles.postalCode}>〒{cardData.postalCode}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Memo Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>メモ</Text>
          </View>
          
          <View style={styles.sectionContent}>
            <View style={styles.memoContainer}>
              <Text style={styles.memoText}>{cardData.memo}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  headerRight: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
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
  },
  sectionContent: {
    paddingVertical: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  contactLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 12,
    minWidth: 80,
  },
  contactValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    marginLeft: 8,
  },
  addressContainer: {
    flex: 1,
    marginLeft: 12,
  },
  postalCode: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  memoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  memoText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});

export default CardDetailScreen; 