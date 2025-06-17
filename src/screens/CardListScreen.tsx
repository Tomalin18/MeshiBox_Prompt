import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { BusinessCard } from '../types';
import { StorageService } from '../services/StorageService';
import LoadingOverlay from '../components/LoadingOverlay';

interface Props {
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

const CardListScreen: React.FC<Props> = ({ navigation }) => {
  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<BusinessCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBusinessCards();
  }, []);

  useEffect(() => {
    filterCards();
  }, [searchQuery, businessCards]);

  const loadBusinessCards = async () => {
    try {
      setIsLoading(true);
      const cards = await StorageService.getAllBusinessCards();
      setBusinessCards(cards);
    } catch (error) {
      console.error('Failed to load business cards:', error);
      Alert.alert('エラー', '名刺の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBusinessCards();
    setRefreshing(false);
  }, []);

  const filterCards = () => {
    if (!searchQuery.trim()) {
      setFilteredCards(businessCards);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = businessCards.filter(card =>
      card.name.toLowerCase().includes(query) ||
      card.company.toLowerCase().includes(query) ||
      card.department?.toLowerCase().includes(query) ||
      card.position?.toLowerCase().includes(query) ||
      card.email?.toLowerCase().includes(query)
    );
    setFilteredCards(filtered);
  };

  const handleCardPress = async (card: BusinessCard) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (navigation) {
      navigation.navigate('CardDetail', { card });
    }
  };

  const handleMenuPress = () => {
    // TODO: Implement menu functionality
    Alert.alert('メニュー', '機能は準備中です');
  };

  // Group cards by first letter
  const groupedCards = React.useMemo(() => {
    const groups: { [key: string]: BusinessCard[] } = {};
    
    filteredCards.forEach(card => {
      const firstLetter = card.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(card);
    });

    // Convert to array and sort
    return Object.keys(groups)
      .sort()
      .map(letter => ({
        letter,
        cards: groups[letter].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [filteredCards]);

  const renderCard = (card: BusinessCard) => (
    <View key={card.id} style={styles.cardItem}>
      <View style={styles.cardContent}>
        {card.imageUri && (
          <Image source={{ uri: card.imageUri }} style={styles.cardImage} />
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {card.name}
          </Text>
          <Text style={styles.cardCompany} numberOfLines={1}>
            {card.company}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => handleCardPress(card)}
        activeOpacity={0.7}
      >
        <Text style={styles.openButtonText}>開く</Text>
        <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderSection = ({ item }: { item: { letter: string; cards: BusinessCard[] } }) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>{item.letter}</Text>
      {item.cards.map(card => renderCard(card))}
    </View>
  );

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
    return <LoadingOverlay visible={true} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>名刺一覧</Text>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <Ionicons name="menu" size={24} color="#FF6B35" />
        </TouchableOpacity>
      </View>

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

      {/* Cards List */}
      {groupedCards.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={groupedCards}
          renderItem={renderSection}
          keyExtractor={(item) => item.letter}
          style={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B35',
  },
  menuButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardImage: {
    width: 40,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  cardCompany: {
    fontSize: 14,
    color: '#666666',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
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
});

export default CardListScreen; 