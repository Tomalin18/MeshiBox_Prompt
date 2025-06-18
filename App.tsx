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
  const [screenParams, setScreenParams] = useState<any>(null);

  const mockNavigation = {
    goBack: () => {
      if (currentScreen === 'detail' || currentScreen === 'edit') {
        setCurrentScreen('list');
        setScreenParams(null);
      } else if (currentScreen === 'camera') {
        setCurrentScreen('list');
        setScreenParams(null);
      } else if (currentScreen === 'settings') {
        setCurrentScreen('list');
        setScreenParams(null);
      } else {
        setCurrentScreen('list');
        setScreenParams(null);
      }
    },
    navigate: (screen: string, params?: any) => {
      setScreenParams(params || null);
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
        case 'cardEdit':
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
    const route = screenParams ? { params: screenParams } : undefined;
    
    switch (currentScreen) {
      case 'loading':
        return <LoadingScreen navigation={mockNavigation} />;
      case 'subscription':
        return <SubscriptionScreen navigation={mockNavigation} />;
      case 'camera':
        return <CameraScreen navigation={mockNavigation} />;
      case 'detail':
        return <CardDetailScreen navigation={mockNavigation} route={route} />;
      case 'edit':
        return <CardEditScreen navigation={mockNavigation} route={route} />;
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
