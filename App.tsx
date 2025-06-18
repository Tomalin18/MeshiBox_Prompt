import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
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

  const mockNavigation = {
    goBack: () => {
      if (currentScreen === 'detail' || currentScreen === 'edit') {
        setCurrentScreen('list');
      } else if (currentScreen === 'camera') {
        setCurrentScreen('list');
      } else if (currentScreen === 'settings') {
        setCurrentScreen('list');
      } else {
        setCurrentScreen('list');
      }
    },
    navigate: (screen: string, params?: any) => {
      switch (screen) {
        case 'subscription':
          setCurrentScreen('subscription');
          break;
        case 'list':
          setCurrentScreen('list');
          break;
        case 'camera':
          setCurrentScreen('camera');
          break;
        case 'detail':
          setCurrentScreen('detail');
          break;
        case 'edit':
          setCurrentScreen('edit');
          break;
        case 'settings':
          setCurrentScreen('settings');
          break;
        // Legacy support for old navigation calls
        case 'Subscription':
          setCurrentScreen('subscription');
          break;
        case 'CardList':
          setCurrentScreen('list');
          break;
        case 'CardEdit':
          setCurrentScreen('edit');
          break;
        case 'CardDetail':
          setCurrentScreen('detail');
          break;
        case 'Camera':
          setCurrentScreen('camera');
          break;
        case 'Settings':
          setCurrentScreen('settings');
          break;
        default:
          setCurrentScreen('list');
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
      <StatusBar style="dark" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
