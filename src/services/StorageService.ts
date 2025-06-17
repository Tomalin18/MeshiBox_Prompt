import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessCard } from '../types';
import { UserSubscription } from '../utils';

const STORAGE_KEYS = {
  BUSINESS_CARDS: '@MeishiBox:businessCards',
  USER_SUBSCRIPTION: '@MeishiBox:userSubscription',
  SCAN_COUNT: '@MeishiBox:scanCount',
  APP_SETTINGS: '@MeishiBox:appSettings',
};

export interface AppSettings {
  language: 'ja' | 'en';
  theme: 'light' | 'dark';
  autoBackup: boolean;
  hapticFeedback: boolean;
}

export class StorageService {
  // 名片 CRUD 操作
  static async getAllBusinessCards(): Promise<BusinessCard[]> {
    try {
      const cardsJson = await AsyncStorage.getItem(STORAGE_KEYS.BUSINESS_CARDS);
      if (cardsJson) {
        const cards = JSON.parse(cardsJson);
        // 轉換日期字符串為 Date 對象
        return cards.map((card: any) => ({
          ...card,
          createdAt: new Date(card.createdAt),
          updatedAt: new Date(card.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load business cards:', error);
      return [];
    }
  }

  static async saveBusinessCard(card: BusinessCard): Promise<void> {
    try {
      const existingCards = await this.getAllBusinessCards();
      const cardIndex = existingCards.findIndex(c => c.id === card.id);
      
      if (cardIndex >= 0) {
        // 更新現有名片
        existingCards[cardIndex] = { ...card, updatedAt: new Date() };
      } else {
        // 添加新名片
        existingCards.push(card);
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.BUSINESS_CARDS,
        JSON.stringify(existingCards)
      );
    } catch (error) {
      console.error('Failed to save business card:', error);
      throw new Error('名片保存失敗');
    }
  }

  static async deleteBusinessCard(cardId: string): Promise<void> {
    try {
      const existingCards = await this.getAllBusinessCards();
      const filteredCards = existingCards.filter(card => card.id !== cardId);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.BUSINESS_CARDS,
        JSON.stringify(filteredCards)
      );
    } catch (error) {
      console.error('Failed to delete business card:', error);
      throw new Error('名片刪除失敗');
    }
  }

  static async getBusinessCard(cardId: string): Promise<BusinessCard | null> {
    try {
      const cards = await this.getAllBusinessCards();
      return cards.find(card => card.id === cardId) || null;
    } catch (error) {
      console.error('Failed to get business card:', error);
      return null;
    }
  }

  // 搜索和過濾
  static async searchBusinessCards(query: string): Promise<BusinessCard[]> {
    try {
      const allCards = await this.getAllBusinessCards();
      const lowercaseQuery = query.toLowerCase();
      
      return allCards.filter(card => 
        card.name.toLowerCase().includes(lowercaseQuery) ||
        card.company.toLowerCase().includes(lowercaseQuery) ||
        card.department?.toLowerCase().includes(lowercaseQuery) ||
        card.email?.toLowerCase().includes(lowercaseQuery) ||
        card.memo?.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Failed to search business cards:', error);
      return [];
    }
  }

  // 用戶訂閱管理
  static async getUserSubscription(): Promise<UserSubscription | null> {
    try {
      const subscriptionJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_SUBSCRIPTION);
      if (subscriptionJson) {
        const subscription = JSON.parse(subscriptionJson);
        // 轉換日期字符串為 Date 對象
        if (subscription.expiryDate) {
          subscription.expiryDate = new Date(subscription.expiryDate);
        }
        return subscription;
      }
      return null;
    } catch (error) {
      console.error('Failed to load user subscription:', error);
      return null;
    }
  }

  static async saveUserSubscription(subscription: UserSubscription): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_SUBSCRIPTION,
        JSON.stringify(subscription)
      );
    } catch (error) {
      console.error('Failed to save user subscription:', error);
      throw new Error('訂閱狀態保存失敗');
    }
  }

  // 掃描次數管理
  static async getScanCount(): Promise<number> {
    try {
      const countStr = await AsyncStorage.getItem(STORAGE_KEYS.SCAN_COUNT);
      return countStr ? parseInt(countStr, 10) : 0;
    } catch (error) {
      console.error('Failed to get scan count:', error);
      return 0;
    }
  }

  static async incrementScanCount(): Promise<number> {
    try {
      const currentCount = await this.getScanCount();
      const newCount = currentCount + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.SCAN_COUNT, newCount.toString());
      return newCount;
    } catch (error) {
      console.error('Failed to increment scan count:', error);
      throw new Error('掃描次數更新失敗');
    }
  }

  static async resetScanCount(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SCAN_COUNT, '0');
    } catch (error) {
      console.error('Failed to reset scan count:', error);
      throw new Error('掃描次數重置失敗');
    }
  }

  // 應用設定
  static async getAppSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      // 默認設定
      return {
        language: 'ja',
        theme: 'light',
        autoBackup: true,
        hapticFeedback: true,
      };
    } catch (error) {
      console.error('Failed to load app settings:', error);
      return {
        language: 'ja',
        theme: 'light',
        autoBackup: true,
        hapticFeedback: true,
      };
    }
  }

  static async saveAppSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.APP_SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Failed to save app settings:', error);
      throw new Error('設定保存失敗');
    }
  }

  // 數據備份和恢復
  static async exportAllData(): Promise<string> {
    try {
      const businessCards = await this.getAllBusinessCards();
      const userSubscription = await this.getUserSubscription();
      const appSettings = await this.getAppSettings();
      const scanCount = await this.getScanCount();

      const exportData = {
        businessCards,
        userSubscription,
        appSettings,
        scanCount,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('數據導出失敗');
    }
  }

  static async importAllData(dataJson: string): Promise<void> {
    try {
      const importData = JSON.parse(dataJson);
      
      // 驗證數據格式
      if (!importData.businessCards || !Array.isArray(importData.businessCards)) {
        throw new Error('無效的備份數據格式');
      }

      // 導入名片數據
      await AsyncStorage.setItem(
        STORAGE_KEYS.BUSINESS_CARDS,
        JSON.stringify(importData.businessCards)
      );

      // 導入用戶訂閱（如果存在）
      if (importData.userSubscription) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_SUBSCRIPTION,
          JSON.stringify(importData.userSubscription)
        );
      }

      // 導入應用設定（如果存在）
      if (importData.appSettings) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.APP_SETTINGS,
          JSON.stringify(importData.appSettings)
        );
      }

      // 導入掃描次數（如果存在）
      if (importData.scanCount !== undefined) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.SCAN_COUNT,
          importData.scanCount.toString()
        );
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('數據導入失敗');
    }
  }

  // 清除所有數據
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.BUSINESS_CARDS,
        STORAGE_KEYS.USER_SUBSCRIPTION,
        STORAGE_KEYS.SCAN_COUNT,
        STORAGE_KEYS.APP_SETTINGS,
      ]);
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error('數據清除失敗');
    }
  }

  // 獲取存儲統計信息
  static async getStorageStats(): Promise<{
    totalCards: number;
    totalSize: string;
    lastBackup?: Date;
  }> {
    try {
      const businessCards = await this.getAllBusinessCards();
      const allDataJson = await this.exportAllData();
      const sizeInBytes = new Blob([allDataJson]).size;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);

      return {
        totalCards: businessCards.length,
        totalSize: `${sizeInKB} KB`,
        lastBackup: businessCards.length > 0 
          ? new Date(Math.max(...businessCards.map(card => card.updatedAt.getTime())))
          : undefined,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalCards: 0,
        totalSize: '0 KB',
      };
    }
  }
} 