import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface CameraTransitionProps {
  visible: boolean;
  onComplete: () => void;
}

const CameraTransition: React.FC<CameraTransitionProps> = ({ visible, onComplete }) => {
  const shutterAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // 專業相機快門效果
      Animated.parallel([
        // 快門閃光效果
        Animated.sequence([
          Animated.timing(shutterAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(shutterAnim, {
            toValue: 0,
            duration: 120,
            useNativeDriver: true,
          }),
        ]),
        // 輕微縮放效果模擬快門機械動作
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.98,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // 延遲一點時間讓用戶感受到快門效果
        setTimeout(() => {
          onComplete();
        }, 100);
      });
    }
  }, [visible, shutterAnim, scaleAnim, onComplete]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 快門縮放效果 */}
      <Animated.View 
        style={[
          styles.scaleOverlay, 
          { 
            transform: [{ scale: scaleAnim }] 
          }
        ]} 
      />
      {/* 快門閃光效果 */}
      <Animated.View 
        style={[
          styles.flashOverlay, 
          { 
            opacity: shutterAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.8],
            })
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  scaleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
});

export default CameraTransition; 