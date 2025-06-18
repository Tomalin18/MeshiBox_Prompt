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
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#000000', true);
  }, []);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleGalleryPress = async () => {
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

    if (!result.canceled && result.assets[0]) {
      navigation.navigate('cardEdit', { 
        imageUri: result.assets[0].uri,
        fromGallery: true 
      });
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: false,
      });

      if (photo) {
        // 計算裁剪區域
        const cropData = getCropArea();
        
        navigation.navigate('cardEdit', { 
          imageUri: photo.uri,
          fromCamera: true,
          cropArea: cropData,
          orientation: orientation,
        });
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      Alert.alert('エラー', '写真の撮影に失敗しました');
    } finally {
      setIsCapturing(false);
    }
  };

  const getCropArea = () => {
    // 計算導引框在屏幕中的位置和大小
    const frameWidth = orientation === 'landscape' ? 280 : 180;
    const frameHeight = orientation === 'landscape' ? 180 : 280;
    
    // 計算框架在屏幕中的中心位置
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    // 計算裁剪區域的左上角座標
    const cropX = centerX - frameWidth / 2;
    const cropY = centerY - frameHeight / 2;
    
    return {
      x: cropX,
      y: cropY,
      width: frameWidth,
      height: frameHeight,
    };
  };



  const handleFlashToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
  };

  const handleOrientationChange = (newOrientation: 'landscape' | 'portrait') => {
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
      >
        {/* Top Bar */}
        <SafeAreaView style={styles.topSafeArea}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* Loading Bar Style Line */}
          <View style={styles.topLine} />
        </SafeAreaView>

        {/* Guide Frame Section with Overlay */}
        <View style={styles.guideSection}>
          <Text style={styles.instructionText}>枠内に名刺を置いてください</Text>
          
          {/* Overlay Container using Flexbox */}
          <View style={styles.overlayContainer}>
            {/* Top Spacer */}
            <View style={styles.topSpacer} />
            
            {/* Middle Row */}
            <View style={styles.middleRow}>
              {/* Left Overlay */}
              <View style={styles.sideOverlay} />
              
              {/* Card Frame */}
              <View style={[
                styles.cardFrame,
                orientation === 'landscape' ? styles.landscapeFrame : styles.portraitFrame
              ]} />
              
              {/* Right Overlay */}
              <View style={styles.sideOverlay} />
            </View>
            
            {/* Bottom Spacer */}
            <View style={styles.bottomSpacer} />
          </View>
          
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

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
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
       </CameraView>
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
    justifyContent: 'space-between',
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
  
  // Guide Section Styles
  guideSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60, // 120px from safe area top minus top bar
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 40,
  },
  
  // Overlay Styles - Using Flexbox for responsive layout
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  topSpacer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  bottomSpacer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideOverlay: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
  
  // Bottom Controls Styles
  bottomControls: {
    backgroundColor: 'transparent',
  },
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