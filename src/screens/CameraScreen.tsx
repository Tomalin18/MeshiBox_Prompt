import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { GoogleAIOCRService } from '../services/GoogleAIOCRService';
import { ImageProcessingService } from '../services/ImageProcessingService';
import CameraTransition from '../components/CameraTransition';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Props {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const processedImageRef = useRef<string | null>(null);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#000000', true);
    setIsMounted(true);
    
    return () => {
      setIsMounted(false);
      setIsCapturing(false);
      // 清理相機資源
      if (cameraRef.current) {
        console.log('Cleaning up camera resources');
      }
    };
  }, []);

  const handleClose = () => {
    if (!isMounted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleGalleryPress = async () => {
    if (!isMounted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('権限が必要です', 'ギャラリーにアクセスするには権限が必要です');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: orientation === 'landscape' ? [16, 10] : [10, 16],
      quality: 1,
    });

    if (!isMounted) return;
    
    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      // 直接導航到編輯頁面，OCR處理將在背景進行
      navigation.navigate('cardEdit', { 
        imageUri: imageUri,
        isProcessing: true,
        fromGallery: true 
      });
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing || !isMounted) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCapturing(true);

    try {
      // 只拍一次照片
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: false,
      });

      if (!isMounted || !photo) return;

      // 顯示快門動畫，同時處理圖片
      setShowTransition(true);
      
      // 並行處理圖片裁剪
      const cropData = ImageProcessingService.getCropArea(orientation);
      const originalImageUri = photo.uri;
      
      try {
        // 裁剪圖片（只保留名片部分）
        const croppedImageUri = await ImageProcessingService.cropBusinessCard(
          originalImageUri, 
          cropData, 
          orientation
        );
        
        // 儲存處理好的圖片URI供動畫完成後使用
        processedImageRef.current = croppedImageUri;
      } catch (cropError) {
        // 如果裁剪失敗，使用原圖
        processedImageRef.current = originalImageUri;
      }
      
    } catch (error) {
      console.error('Camera capture error:', error);
      if (isMounted) {
        Alert.alert('エラー', '写真の撮影に失敗しました');
        setIsCapturing(false);
      }
    }
  };

  const handleTransitionComplete = async () => {
    setShowTransition(false);
    
    if (!isMounted) return;

    // 使用已處理好的圖片
    const processedImageUri = processedImageRef.current;
    
    if (processedImageUri) {
      // 立即導航到編輯頁面，OCR處理將在背景進行
      navigation.navigate('cardEdit', { 
        imageUri: processedImageUri,
        isProcessing: true,  // 告訴編輯頁面需要進行OCR
        fromCamera: true,
        orientation: orientation,
      });
    }
    
    setIsCapturing(false);
  };



  const handleFlashToggle = () => {
    if (!isMounted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
  };

  const handleOrientationChange = (newOrientation: 'landscape' | 'portrait') => {
    if (!isMounted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOrientation(newOrientation);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.permissionText}>カメラの許可が必要です</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={requestPermission}>
          <Text style={styles.settingsButtonText}>許可する</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Camera Preview - Full Screen */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        flash={flashMode}
      />

      {/* 修復：Full Screen Overlay Container */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* Top Spacer with Controls and Guide Text */}
        <View style={styles.topSpacer}>
          <SafeAreaView style={styles.topSafeArea}>
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.topLine} />
          </SafeAreaView>
          
          {/* Guide Content in Black Area */}
          <View style={styles.guideContent}>
            {/* Instruction Text */}
            <Text style={styles.instructionText}>枠内に名刺を置いてください</Text>
            
            {/* Orientation Toggle */}
            <View style={styles.orientationToggle}>
              <TouchableOpacity
                style={[
                  styles.orientationButton,
                  orientation === 'landscape' && styles.orientationButtonSelected
                ]}
                onPress={() => handleOrientationChange('landscape')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.orientationButtonText,
                  orientation === 'landscape' && styles.orientationButtonTextSelected
                ]}>
                  横向き
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.orientationButton,
                  orientation === 'portrait' && styles.orientationButtonSelected
                ]}
                onPress={() => handleOrientationChange('portrait')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.orientationButtonText,
                  orientation === 'portrait' && styles.orientationButtonTextSelected
                ]}>
                  縦向き
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Middle Row - Only Card Frame Area (Transparent) */}
        <View style={styles.middleRow}>
          {/* Left Overlay */}
          <View style={styles.sideOverlay} />
          
          {/* Center - Only Card Frame (Transparent) */}
          <View style={styles.cardFrameContainer}>
            <View style={[
              styles.cardFrame,
              orientation === 'landscape' ? styles.landscapeFrame : styles.portraitFrame
            ]} />
          </View>
          
          {/* Right Overlay */}
          <View style={styles.sideOverlay} />
        </View>
        
        {/* Bottom Spacer with Controls */}
        <View style={styles.bottomSpacer}>
          <SafeAreaView style={styles.bottomSafeArea}>
            <View style={styles.controlsContainer}>
              {/* Gallery Button */}
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={handleGalleryPress}
                activeOpacity={0.7}
              >
                <View style={styles.galleryIcon} />
              </TouchableOpacity>

              {/* Capture Button */}
              <TouchableOpacity
                style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
                onPress={handleCapture}
                activeOpacity={0.8}
                disabled={isCapturing}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              {/* Flash Button */}
              <TouchableOpacity
                style={styles.flashButton}
                onPress={handleFlashToggle}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={flashMode === 'off' ? "flash-off" : "flash"}
                  size={32}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
      
      {/* Camera Transition Effect */}
      <CameraTransition 
        visible={showTransition} 
        onComplete={handleTransitionComplete} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Camera Styles
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  // 修復：Full Screen Overlay Container
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  
  // Top Spacer with Controls
  topSpacer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-start',
  },
  
  // Top Bar Styles
  topSafeArea: {
    backgroundColor: 'transparent',
  },
  topBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topLine: {
    height: 2,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    opacity: 0.8,
  },
  
  // Guide Content Styles
  guideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Instruction Text
  instructionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 40,
  },
  
  // OCR Processing Styles
  processingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  processingText: {
    color: '#FF6B35',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  processingSubText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.8,
  },
  
  // Orientation Toggle Styles
  orientationToggle: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 16,
  },
  orientationButton: {
    width: 80,
    height: 36,
    backgroundColor: '#666666',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orientationButtonSelected: {
    backgroundColor: '#FF6B35',
  },
  orientationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  orientationButtonTextSelected: {
    color: '#FFFFFF',
  },
  
  // Middle Row
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Side Overlays
  sideOverlay: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  
  // Center Content Area - Card Frame Container
  cardFrameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Card Frame Styles
  cardFrame: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  landscapeFrame: {
    width: 280,
    height: 180,
  },
  portraitFrame: {
    width: 180,
    height: 280,
  },
  
  // Bottom Spacer with Controls
  bottomSpacer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  
  // Bottom Controls Styles
  bottomSafeArea: {
    backgroundColor: 'transparent',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 40,
    height: 120,
  },
  
  // Gallery Button Styles
  galleryButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryIcon: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  
  // Capture Button Styles
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  
  // Flash Button Styles
  flashButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Permission Styles
  permissionText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  settingsButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CameraScreen; 