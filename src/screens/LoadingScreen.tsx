import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const LoadingScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 設置狀態欄為深色內容（適合白色背景）
    StatusBar.setBarStyle('dark-content');
    
    // 淡入動畫
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // 2.5秒後導航到名片列表頁面（隱藏訂閱功能）
    const timer = setTimeout(() => {
      navigation.navigate('CardList');
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [navigation, fadeAnim]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* 卡片堆疊圖標 */}
        <View style={styles.logoContainer}>
          <View style={styles.cardStack}>
            {/* 後面的卡片 */}
            <View style={[styles.card, styles.cardBack]} />
            {/* 中間的卡片 */}
            <View style={[styles.card, styles.cardMiddle]} />
            {/* 前面的卡片 */}
            <View style={[styles.card, styles.cardFront]} />
          </View>
        </View>

        {/* 文字區域 */}
        <View style={styles.textContainer}>
          <Text style={styles.appName}>MeishiBox</Text>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardStack: {
    width: 80,
    height: 60,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: 80,
    height: 60,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardBack: {
    top: 8,
    left: 8,
    opacity: 0.7,
  },
  cardMiddle: {
    top: 4,
    left: 4,
    opacity: 0.85,
  },
  cardFront: {
    top: 0,
    left: 0,
    opacity: 1,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#999999',
    fontFamily: 'System',
    textAlign: 'center',
  },
});

export default LoadingScreen; 