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
import ScanTransitionOverlay from '../components/ScanTransitionOverlay';

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
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [ocrData, setOcrData] = useState<any>(null);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isOcrComplete, setIsOcrComplete] = useState(false);
  const cameraRef = useRef<CameraView>(null);

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

  // 監聽動畫和OCR完成狀態，當兩者都完成時導航
  useEffect(() => {
    if (isAnimationComplete && isOcrComplete && capturedImageUri && ocrData && isMounted) {
      console.log('🎯 useEffect觸發：動畫和OCR都完成，立即導航');
      navigation.navigate('cardEdit', { 
        imageUri: capturedImageUri,
        ocrData: ocrData,
        fromCamera: true,
        orientation: orientation,
      });
      
      // 清理狀態
      setShowTransition(false);
      setCapturedImageUri(null);
      setOcrData(null);
      setIsAnimationComplete(false);
      setIsOcrComplete(false);
    }
  }, [isAnimationComplete, isOcrComplete, capturedImageUri, ocrData, isMounted, navigation, orientation]);

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
      
      // 顯示 OCR 處理狀態 - 從相簿選擇不需要動畫
      console.log('📁 從相簿選擇，直接處理OCR');
      
      try {
        // 進行 OCR 分析
        const ocrData = await GoogleAIOCRService.processBusinessCard(imageUri);
        
        if (!isMounted) return;
        
        // 導航到編輯頁面並帶入 OCR 結果
        navigation.navigate('cardEdit', { 
          imageUri: imageUri,
          ocrData: ocrData,
          fromGallery: true 
        });
      } catch (error) {
        console.error('OCR processing failed:', error);
        if (isMounted) {
          // 即使 OCR 失敗，仍然導航到編輯頁面
          navigation.navigate('cardEdit', { 
            imageUri: imageUri,
            fromGallery: true 
          });
        }
      } finally {
        console.log('📁 相簿選擇OCR處理完成');
      }
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing || !isMounted) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: false,
      });

      if (!isMounted) return;

      if (photo) {
        // 計算裁剪區域
        const cropData = ImageProcessingService.getCropArea(orientation);
        const originalImageUri = photo.uri;
        
        // 先裁剪圖片
        try {
          const croppedImageUri = await ImageProcessingService.cropBusinessCard(
            originalImageUri, 
            cropData, 
            orientation
          );
          
          if (!isMounted) return;
          
          // 儲存圖片URI並顯示動畫
          setCapturedImageUri(croppedImageUri);
          setShowTransition(true);
          setIsAnimationComplete(false);
          setIsOcrComplete(false);
          
          // 立即開始OCR處理（與動畫並行）
          processOCRInParallel(croppedImageUri);
          
        } catch (cropError) {
          console.error('Crop failed, using original image:', cropError);
          setCapturedImageUri(originalImageUri);
          setShowTransition(true);
          setIsAnimationComplete(false);
          setIsOcrComplete(false);
          
          // 立即開始OCR處理（與動畫並行）
          processOCRInParallel(originalImageUri);
        }
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      if (isMounted) {
        Alert.alert('エラー', '写真の撮影に失敗しました');
      }
    } finally {
      if (isMounted) {
        setIsCapturing(false);
      }
    }
  };

  // 並行處理OCR，不立即導航
  const processOCRInParallel = async (imageUri: string) => {
    try {
      console.log('🔍 開始並行 OCR 處理:', imageUri);
      
      const ocrResult = await GoogleAIOCRService.processBusinessCard(imageUri);
      console.log('✅ OCR 處理完成:', ocrResult);
      
      if (isMounted) {
        setOcrData(ocrResult);
        setIsOcrComplete(true);
        // 檢查是否可以導航
        checkAndNavigate(imageUri, ocrResult);
      }
    } catch (error) {
      console.error('❌ OCR processing failed:', error);
      
      if (isMounted) {
        // OCR 失敗時使用空數據
        const emptyData = {
          name: '',
          nameReading: '',
          company: '',
          companyReading: '',
          department: '',
          position: '',
          phone: '',
          mobile: '',
          fax: '',
          email: '',
          website: '',
          address: '',
          postalCode: '',
          memo: '',
          imageUri: imageUri,
        };
        setOcrData(emptyData);
        setIsOcrComplete(true);
        checkAndNavigate(imageUri, emptyData);
      }
    }
  };

  // OCR完成後的檢查（useEffect會處理實際導航）
  const checkAndNavigate = (imageUri: string, ocrResult: any) => {
    console.log('🔍 OCR完成，檢查動畫狀態 - isAnimationComplete:', isAnimationComplete);
    // useEffect會自動處理導航，這裡只需要確保狀態正確
  };

  const handleTransitionComplete = () => {
    console.log('🎬 動畫完成');
    setIsAnimationComplete(true);
    console.log('🔍 動畫完成，檢查OCR狀態 - isOcrComplete:', isOcrComplete);
    // useEffect會自動處理導航，這裡只需要設置狀態
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
          <Text style={styles.settingsButtonText}>繼續</Text>
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

      {/* 魔法過場動畫 */}
      <ScanTransitionOverlay
        visible={showTransition}
        onComplete={handleTransitionComplete}
        capturedImageUri={capturedImageUri || undefined}
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