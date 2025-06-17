import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { OCRService } from '../services/OCRService';
import { StorageService } from '../services/StorageService';
import LoadingOverlay from '../components/LoadingOverlay';

interface Props {
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const [type, setType] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    // 自動請求權限
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  // 清理相機資源
  useEffect(() => {
    return () => {
      // 組件卸載時清理相機資源
      setIsMounted(false);
      setIsProcessing(false);
      if (cameraRef.current) {
        // 停止相機預覽
        console.log('Cleaning up camera resources');
      }
    };
  }, []);

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>カメラの準備中...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Ionicons name="camera-outline" size={64} color="#FFFFFF" />
          <Text style={styles.permissionTitle}>カメラのアクセスが必要です</Text>
          <Text style={styles.permissionSubtitle}>
            名刺をスキャンするためにカメラの使用許可をお願いします
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>許可する</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleClose = () => {
    // 清理處理狀態
    setIsProcessing(false);
    
    if (navigation) {
      navigation.goBack();
    } else {
      console.log('Close camera');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing && isMounted) {
      try {
        setIsProcessing(true);
        
        // 觸覺反饋
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // 檢查掃描次數限制
        const scanCount = await StorageService.getScanCount();
        const subscription = await StorageService.getUserSubscription();
        
        if (!subscription || subscription.status === 'free') {
          if (scanCount >= 50) {
            Alert.alert(
              '掃描次數已達上限',
              '免費用戶每月可掃描 50 張名片。升級到高級版以獲得無限掃描。',
              [
                { text: '取消', style: 'cancel' },
                { text: '升級', onPress: () => console.log('Navigate to upgrade') }
              ]
            );
            setIsProcessing(false);
            return;
          }
        }

        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (photo) {
          // 增加掃描次數
          await StorageService.incrementScanCount();
          
          // OCR 處理
          const businessCard = await OCRService.processBusinessCard(photo.uri);
          
          console.log('Photo captured and processed:', photo.uri);
          if (navigation && isMounted) {
            navigation.navigate('CardEdit', { 
              imageUri: photo.uri,
              ocrData: businessCard
            });
          }
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('エラー', '写真の撮影に失敗しました');
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    }
  };

  const pickImageFromLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('エラー', 'フォトライブラリへのアクセス許可が必要です');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: orientation === 'landscape' ? [16, 10] : [10, 16],
      quality: 0.8,
    });

    if (!result.canceled) {
      console.log('Image selected:', result.assets[0].uri);
      if (navigation) {
        navigation.navigate('CardEdit', { imageUri: result.assets[0].uri });
      }
    }
  };

  const toggleFlash = () => {
    setFlashMode(current => current === 'off' ? 'on' : 'off');
  };

  const toggleOrientation = (newOrientation: 'landscape' | 'portrait') => {
    setOrientation(newOrientation);
  };

  // 名刺ガイドフレームのサイズ計算
  const frameWidth = orientation === 'landscape' ? screenWidth * 0.8 : screenWidth * 0.6;
  const frameHeight = orientation === 'landscape' ? frameWidth * 0.6 : frameWidth * 1.6;

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={type} 
        ref={cameraRef}
        flash={flashMode}
      />
      
      {/* UI Overlay Container */}
      <View style={styles.overlay}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Guide Frame Area */}
        <View style={styles.guideArea}>
          <Text style={styles.guideText}>枠内に名刺を置いてください</Text>
          
          {/* Business Card Frame */}
          <View 
            style={[
              styles.cardFrame,
              {
                width: frameWidth,
                height: frameHeight,
              }
            ]}
          >
            {/* Corner indicators */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {/* Orientation Selector */}
          <View style={styles.orientationSelector}>
            <TouchableOpacity
              style={[
                styles.orientationButton,
                orientation === 'landscape' && styles.orientationButtonActive
              ]}
              onPress={() => toggleOrientation('landscape')}
            >
              <Text style={[
                styles.orientationText,
                orientation === 'landscape' && styles.orientationTextActive
              ]}>
                横向き
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.orientationButton,
                orientation === 'portrait' && styles.orientationButtonActive
              ]}
              onPress={() => toggleOrientation('portrait')}
            >
              <Text style={[
                styles.orientationText,
                orientation === 'portrait' && styles.orientationTextActive
              ]}>
                縦向き
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.controls}>
          {/* Gallery Button */}
          <TouchableOpacity style={styles.controlButton} onPress={pickImageFromLibrary}>
            <Ionicons name="images-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          {/* Flash/Settings Button */}
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <Ionicons 
              name={flashMode === 'on' ? 'flash' : 'flash-off'} 
              size={28} 
              color={flashMode === 'on' ? '#FF6B35' : '#FFFFFF'} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <LoadingOverlay 
        visible={isProcessing} 
        message="名刺を処理中..." 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  permissionSubtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 22,
    zIndex: 10,
  },
  guideArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 40,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardFrame: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    backgroundColor: 'transparent',
    position: 'relative',
    marginBottom: 30,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FF6B35',
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  orientationSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
  orientationButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  orientationButtonActive: {
    backgroundColor: '#FF6B35',
  },
  orientationText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  orientationTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 22,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DDDDDD',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
});

export default CameraScreen; 