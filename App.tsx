import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import LoadingScreen from './src/screens/LoadingScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import CameraScreen from './src/screens/CameraScreen';
import CardDetailScreen from './src/screens/CardDetailScreen';
import CardEditScreen from './src/screens/CardEditScreen';
import CardListScreen from './src/screens/CardListScreen';
import SettingsScreen from './src/screens/SettingsScreen';

type ScreenType = 'loading' | 'subscription' | 'camera' | 'detail' | 'edit' | 'list' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('loading');
  const [showDevNav, setShowDevNav] = useState(false);

  const mockNavigation = {
    goBack: () => {
      if (currentScreen === 'detail' || currentScreen === 'edit') {
        setCurrentScreen('list');
      } else if (currentScreen === 'camera') {
        setCurrentScreen('list');
      } else {
        setCurrentScreen('list');
      }
    },
    navigate: (screen: string, params?: any) => {
      if (screen === 'Subscription') {
        setCurrentScreen('subscription');
      } else if (screen === 'CardList') {
        setCurrentScreen('list');
      } else if (screen === 'CardEdit') {
        setCurrentScreen('edit');
      } else if (screen === 'CardDetail') {
        setCurrentScreen('detail');
      } else if (screen === 'Camera') {
        setCurrentScreen('camera');
      } else if (screen === 'Settings') {
        setCurrentScreen('settings');
      }
    },
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return <LoadingScreen navigation={mockNavigation} />;
      case 'subscription':
        return <SubscriptionScreen navigation={mockNavigation} />;
      case 'camera':
        return <CameraScreen navigation={mockNavigation} />;
      case 'detail':
        return <CardDetailScreen navigation={mockNavigation} />;
      case 'edit':
        return <CardEditScreen navigation={mockNavigation} />;
      case 'list':
        return <CardListScreen navigation={mockNavigation} />;
      case 'settings':
        return <SettingsScreen navigation={mockNavigation} />;
      default:
        return <LoadingScreen navigation={mockNavigation} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderScreen()}
      
      {/* Development Navigation - 只在非載入和訂閱畫面顯示 */}
      {showDevNav && currentScreen !== 'loading' && currentScreen !== 'subscription' && (
        <View style={styles.devNav}>
          <TouchableOpacity 
            style={[styles.navButton, currentScreen === 'list' && styles.activeButton]} 
            onPress={() => setCurrentScreen('list')}
          >
            <Text style={styles.navText}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navButton, currentScreen === 'camera' && styles.activeButton]} 
            onPress={() => setCurrentScreen('camera')}
          >
            <Text style={styles.navText}>Cam</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navButton, currentScreen === 'detail' && styles.activeButton]} 
            onPress={() => setCurrentScreen('detail')}
          >
            <Text style={styles.navText}>Detail</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navButton, currentScreen === 'edit' && styles.activeButton]} 
            onPress={() => setCurrentScreen('edit')}
          >
            <Text style={styles.navText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navButton, currentScreen === 'settings' && styles.activeButton]} 
            onPress={() => setCurrentScreen('settings')}
          >
            <Text style={styles.navText}>Set</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* 開發者模式切換按鈕 */}
      {currentScreen !== 'loading' && currentScreen !== 'subscription' && (
        <TouchableOpacity 
          style={styles.devToggle}
          onPress={() => setShowDevNav(!showDevNav)}
        >
          <Text style={styles.devToggleText}>{showDevNav ? '隱藏' : '開發'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  devNav: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    paddingVertical: 10,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  activeButton: {
    backgroundColor: '#FF6B35',
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  devToggle: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  devToggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
