import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import CameraScreen from './src/screens/CameraScreen';
import CardDetailScreen from './src/screens/CardDetailScreen';
import CardEditScreen from './src/screens/CardEditScreen';
import CardListScreen from './src/screens/CardListScreen';
import SettingsScreen from './src/screens/SettingsScreen';

type ScreenType = 'camera' | 'detail' | 'edit' | 'list' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('list');

  const mockNavigation = {
    goBack: () => setCurrentScreen('list'),
    navigate: (screen: string, params?: any) => {
      if (screen === 'CardEdit') {
        setCurrentScreen('edit');
      } else if (screen === 'CardDetail') {
        setCurrentScreen('detail');
      } else if (screen === 'Camera') {
        setCurrentScreen('camera');
      } else if (screen === 'CardList') {
        setCurrentScreen('list');
      }
    },
  };

  const renderScreen = () => {
    switch (currentScreen) {
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
        return <CardListScreen navigation={mockNavigation} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderScreen()}
      
      {/* Development Navigation */}
      <View style={styles.devNav}>
        <TouchableOpacity 
          style={[styles.navButton, currentScreen === 'camera' && styles.activeButton]} 
          onPress={() => setCurrentScreen('camera')}
        >
          <Text style={styles.navText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, currentScreen === 'list' && styles.activeButton]} 
          onPress={() => setCurrentScreen('list')}
        >
          <Text style={styles.navText}>List</Text>
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
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
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
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    paddingVertical: 10,
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },
  activeButton: {
    backgroundColor: '#FF6B35',
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
