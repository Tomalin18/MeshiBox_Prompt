import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface ScanTransitionOverlayProps {
  visible: boolean;
  onComplete: () => void;
  capturedImageUri?: string;
}

const ScanTransitionOverlay: React.FC<ScanTransitionOverlayProps> = ({
  visible,
  onComplete,
  capturedImageUri,
}) => {
  // 動畫值
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // 狀態
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    '正在分析名片...',
    '識別文字信息...',
    '智能提取數據...',
    '準備編輯界面...'
  ];

  useEffect(() => {
    if (visible) {
      startAnimation();
    }
  }, [visible]);

  const startAnimation = () => {
    // 重置動畫值
    scaleAnim.setValue(0);
    fadeAnim.setValue(0);
    rotateAnim.setValue(0);
    sparkleAnims.forEach(anim => anim.setValue(0));
    progressAnim.setValue(0);
    setCurrentStep(0);

    // 開始動畫序列
    Animated.sequence([
      // 1. 淡入和縮放效果
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      
      // 2. 開始旋轉和火花效果
      Animated.parallel([
        // 持續旋轉
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ),
        // 火花動畫
        Animated.stagger(
          200,
          sparkleAnims.map(anim =>
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim, {
                  toValue: 1,
                  duration: 800,
                  useNativeDriver: true,
                }),
                Animated.timing(anim, {
                  toValue: 0,
                  duration: 800,
                  useNativeDriver: true,
                }),
              ])
            )
          )
        ),
        // 進度條動畫
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // 步驟文字更新
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          // 動畫完成，延遲一點再關閉
          setTimeout(() => {
            fadeOutAndComplete();
          }, 500);
          return prev;
        }
      });
    }, 600);
  };

  const fadeOutAndComplete = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.9)" />
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.blurContainer}>
          {/* 主要動畫容器 */}
          <Animated.View
            style={[
              styles.animationContainer,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            {/* 魔法圓圈背景 */}
            <View style={styles.magicCircle}>
              <Animated.View
                style={[
                  styles.rotatingRing,
                  {
                    transform: [{ rotate: spin }],
                  }
                ]}
              >
                <Ionicons name="scan" size={60} color="#FF6B35" />
              </Animated.View>
            </View>

            {/* 火花效果 */}
            {sparkleAnims.map((anim, index) => {
              const angle = (index * 45) * Math.PI / 180;
              const radius = 80;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.sparkle,
                    {
                      left: width / 2 + x - 4,
                      top: height / 2 + y - 4,
                      opacity: anim,
                      transform: [{
                        scale: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1.5],
                        })
                      }]
                    }
                  ]}
                >
                  <Ionicons name="star" size={8} color="#FFD700" />
                </Animated.View>
              );
            })}

            {/* 文字和進度 */}
            <View style={styles.textContainer}>
              <Text style={styles.magicText}>✨ AI 魔法識別中 ✨</Text>
              <Text style={styles.stepText}>{steps[currentStep]}</Text>
              
              {/* 進度條 */}
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: progressWidth }
                  ]}
                />
              </View>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  magicCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 2,
    borderColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  rotatingRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: '#FF6B35',
    borderRightColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  magicText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: '#FF6B35',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  stepText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

export default ScanTransitionOverlay; 