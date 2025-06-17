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

  const handleEditCard = async (card: BusinessCard) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (navigation) {
      navigation.navigate('CardEdit', { card });
    }
  };

  const handleDeleteCard = async (card: BusinessCard) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      '名刺を削除',
      `${card.name}の名刺を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteBusinessCard(card.id);
              await loadBusinessCards();
              Alert.alert('成功', '名刺が削除されました');
            } catch (error) {
              console.error('Failed to delete card:', error);
              Alert.alert('エラー', '名刺の削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  const renderCard = ({ item }: { item: BusinessCard }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => handleCardPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardCompany} numberOfLines={1}>
            {item.company}
          </Text>
          {item.department && (
            <Text style={styles.cardDepartment} numberOfLines={1}>
              {item.department}
            </Text>
          )}
          {item.position && (
            <Text style={styles.cardPosition} numberOfLines={1}>
              {item.position}
            </Text>
          )}
          <Text style={styles.cardDate}>
            {item.updatedAt.toLocaleDateString('ja-JP')}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditCard(item)}
        >
          <Ionicons name="create-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteCard(item)}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="card-outline" size={64} color={Colors.gray} />
      <Text style={styles.emptyTitle}>名刺がありません</Text>
      <Text style={styles.emptySubtitle}>
        カメラで名刺をスキャンして開始しましょう
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation?.navigate('Camera')}
      >
        <Ionicons name="camera" size={24} color={Colors.white} />
        <Text style={styles.addButtonText}>名刺をスキャン</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>名刺一覧</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation?.navigate('Camera')}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="名刺を検索..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredCards.length} 件の名刺
          {searchQuery && businessCards.length !== filteredCards.length && 
            ` (${businessCards.length} 件中)`
          }
        </Text>
      </View>

      <FlatList
        data={filteredCards}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <LoadingOverlay visible={isLoading} message="名刺を読み込み中..." />
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
  searchContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
  },
  statsContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  cardItem: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 60,
    height: 40,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  cardCompany: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  cardDepartment: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  cardPosition: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 11,
    color: Colors.gray,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: 8,
  },
});

export default CardListScreen; 