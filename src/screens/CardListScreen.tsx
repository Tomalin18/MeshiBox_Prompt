import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BusinessCard } from '../types';
import { StorageService } from '../services/StorageService';
import { JapaneseSortUtils } from '../utils/JapaneseSortUtils';

const { width } = Dimensions.get('window');

interface Props {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const CardListScreen: React.FC<Props> = ({ navigation }) => {
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'date'>('name');

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor('#FFFFFF', true);
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const loadedCards = await StorageService.getAllBusinessCards();
      setCards(loadedCards);
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards;
    return cards.filter(card => 
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cards, searchQuery]);

  const groupedCards = useMemo(() => {
    let sortedCards = [...filteredCards];
    
    // Sort cards based on selected option using Japanese sorting
    switch (sortBy) {
      case 'name':
        sortedCards = JapaneseSortUtils.sortByName(sortedCards);
        break;
      case 'company':
        sortedCards = JapaneseSortUtils.sortByCompany(sortedCards);
        break;
      case 'date':
        sortedCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    
    // Group cards using Japanese grouping
    if (sortBy === 'date') {
      // For date sorting, group by date
      const groups: { [key: string]: BusinessCard[] } = {};
      sortedCards.forEach(card => {
        const dateKey = new Date(card.createdAt).toLocaleDateString('ja-JP', { 
          year: 'numeric', 
          month: 'long' 
        });
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(card);
      });
      
      return Object.keys(groups).sort().map(letter => ({
        letter,
        cards: groups[letter],
      }));
    } else {
      // For name and company sorting, use Japanese grouping
      const groupBy = sortBy === 'name' ? 'name' : 'company';
      const groupedItems = JapaneseSortUtils.groupItems(sortedCards, groupBy);
      
      return groupedItems.map(group => ({
        letter: group.letter,
        cards: group.items,
      }));
    }
  }, [filteredCards, sortBy]);

  const handleCardPress = (card: BusinessCard) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('detail', { card });
  };

  const handleCameraPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('camera');
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('settings');
  };

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSortMenu(true);
  };

  const handleSortSelect = (sortOption: 'name' | 'company' | 'date') => {
    setSortBy(sortOption);
    setShowSortMenu(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderSortMenu = () => (
    <Modal
      visible={showSortMenu}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSortMenu(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowSortMenu(false)}
      >
        <View style={styles.sortMenu}>
          <Text style={styles.sortMenuTitle}>名刺の並び順</Text>
          
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'name' && styles.sortOptionSelected]}
            onPress={() => handleSortSelect('name')}
          >
            <Text style={[styles.sortOptionText, sortBy === 'name' && styles.sortOptionTextSelected]}>
              名前順
            </Text>
            {sortBy === 'name' && <Ionicons name="checkmark" size={20} color="#FF6B35" />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'company' && styles.sortOptionSelected]}
            onPress={() => handleSortSelect('company')}
          >
            <Text style={[styles.sortOptionText, sortBy === 'company' && styles.sortOptionTextSelected]}>
              会社名順
            </Text>
            {sortBy === 'company' && <Ionicons name="checkmark" size={20} color="#FF6B35" />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'date' && styles.sortOptionSelected]}
            onPress={() => handleSortSelect('date')}
          >
            <Text style={[styles.sortOptionText, sortBy === 'date' && styles.sortOptionTextSelected]}>
              追加日順
            </Text>
            {sortBy === 'date' && <Ionicons name="checkmark" size={20} color="#FF6B35" />}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderSectionHeader = (letter: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{letter}</Text>
    </View>
  );

  const renderCard = (card: BusinessCard) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => handleCardPress(card)}
      activeOpacity={0.7}
    >
      <View style={styles.cardThumbnail}>
        {card.imageUri ? (
          <Image source={{ uri: card.imageUri }} style={styles.cardImage} />
        ) : (
          <View style={styles.mockCardImage} />
        )}
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.cardCompany}>{card.company}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFlatListData = () => {
    const data: any[] = [];
    groupedCards.forEach(group => {
      data.push({ type: 'header', letter: group.letter });
      group.cards.forEach(card => {
        data.push({ type: 'card', card });
      });
    });
    return data;
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'header') {
      return renderSectionHeader(item.letter);
    }
    return renderCard(item.card);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="card-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyTitle}>名刺がありません</Text>
      <Text style={styles.emptySubtitle}>
        カメラで名刺をスキャンして開始しましょう
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>名刺一覽</Text>
          <TouchableOpacity 
            style={styles.menuButton} 
            activeOpacity={0.7}
            onPress={handleMenuPress}
          >
            <View style={styles.hamburgerIcon}>
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="連絡先を検索..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      {/* Main Content */}
      <View style={styles.mainContent}>
        {groupedCards.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={renderFlatListData()}
            renderItem={renderItem}
            keyExtractor={(item, index) => 
              item.type === 'header' ? `header-${item.letter}` : `card-${item.card.id}-${index}`
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
      
      {/* Bottom Navbar */}
      <View style={styles.bottomTabs}>
        <View style={styles.tabContainer}>
          {/* 名刺一覽 Tab - Selected */}
          <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
            <View style={styles.tabIconContainer}>
              <Ionicons name="albums" size={24} color="#FF6B35" />
            </View>
            <Text style={[styles.tabText, styles.tabTextSelected]}>名刺一覽</Text>
          </TouchableOpacity>
          
          {/* Camera Tab - Center */}
          <TouchableOpacity
            style={styles.cameraTab}
            onPress={handleCameraPress}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          {/* 設定 Tab */}
          <TouchableOpacity
            style={styles.tab}
            onPress={handleSettingsPress}
            activeOpacity={0.7}
          >
            <View style={styles.tabIconContainer}>
              <Ionicons name="settings" size={24} color="#999999" />
            </View>
            <Text style={styles.tabText}>設定</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {renderSortMenu()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // Header Styles
  headerSafeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B35',
    textAlign: 'center',
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE4D6',
    borderRadius: 8,
  },
  hamburgerIcon: {
    width: 20,
    height: 16,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#FF6B35',
    borderRadius: 1,
  },
  
  // Sort Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: width * 0.8,
    maxWidth: 300,
  },
  sortMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionSelected: {
    backgroundColor: '#FFF4F0',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  sortOptionTextSelected: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  
  // Search Bar Styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    height: 44,
    backgroundColor: '#E8E8E8',
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  
  // Main Content Styles
  mainContent: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  // Section Header Styles
  sectionHeader: {
    height: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    paddingLeft: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  
  // Card Item Styles
  cardItem: {
    height: 80,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardThumbnail: {
    width: 60,
    height: 38,
    marginRight: 16,
  },
  cardImage: {
    width: 60,
    height: 38,
    borderRadius: 6,
  },
  mockCardImage: {
    width: 60,
    height: 38,
    backgroundColor: '#E8E8E8',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  cardCompany: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
  },
  openButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 50,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Bottom Tabs Styles
  bottomTabs: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tabContainer: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },
  tabTextSelected: {
    color: '#FF6B35',
  },
  cameraTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default CardListScreen; 