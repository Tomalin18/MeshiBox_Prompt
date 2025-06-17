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
    // 隱藏狀態欄
    StatusBar.setHidden(true);
    
    // 淡入動畫
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // 2.5秒後導航到訂閱頁面
    const timer = setTimeout(() => {
      navigation.navigate('Subscription');
    }, 2500);

    return () => {
      clearTimeout(timer);
      StatusBar.setHidden(false);
    };
  }, [navigation, fadeAnim]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" hidden />
      
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
    backgroundColor: '#000000',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardBack: {
    top: 8,
    left: 8,
    opacity: 0.6,
  },
  cardMiddle: {
    top: 4,
    left: 4,
    opacity: 0.8,
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
    color: '#FFFFFF',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#CCCCCC',
    fontFamily: 'System',
    textAlign: 'center',
  },
});

export default LoadingScreen; 