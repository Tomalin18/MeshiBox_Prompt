import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { OCRService } from '../services/OCRService';
import LoadingOverlay from '../components/LoadingOverlay';

interface Props {
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  const handleClose = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current || isLoading || !isMounted) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsLoading(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo || !isMounted) return;

      // Process the image with OCR
      const ocrResult = await OCRService.processBusinessCard(photo.uri);
      
      if (isMounted && navigation) {
        navigation.navigate('CardEdit', { 
          imageUri: photo.uri,
          ocrData: ocrResult 
        });
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
      if (isMounted) {
        Alert.alert('エラー', '写真の撮影に失敗しました');
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  const handlePickImage = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && isMounted) {
        setIsLoading(true);
        
        const ocrResult = await OCRService.processBusinessCard(result.assets[0].uri);
        
        if (isMounted && navigation) {
          navigation.navigate('CardEdit', { 
            imageUri: result.assets[0].uri,
            ocrData: ocrResult 
          });
        }
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      if (isMounted) {
        Alert.alert('エラー', '画像の選択に失敗しました');
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  const handleToggleOrientation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement orientation toggle
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>カメラの許可が必要です</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>許可する</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <LoadingOverlay visible={isLoading} />
      
      {/* Close Button */}
      <SafeAreaView style={styles.topOverlay}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />

      {/* Instruction Text */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>枠内に名刺を置いてください</Text>
      </View>

      {/* Capture Frame */}
      <View style={styles.captureFrame} />

      {/* Bottom Controls */}
      <View style={styles.bottomOverlay}>
        <View style={styles.controlsContainer}>
          {/* Gallery Button */}
          <TouchableOpacity style={styles.galleryButton} onPress={handlePickImage}>
            <Ionicons name="images" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity style={styles.captureButton} onPress={handleTakePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          {/* Orientation Button */}
          <TouchableOpacity style={styles.orientationButton} onPress={handleToggleOrientation}>
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Orientation Toggle Buttons */}
        <View style={styles.orientationToggle}>
          <TouchableOpacity style={[styles.orientationOption, styles.orientationActive]}>
            <Text style={styles.orientationText}>横向き</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.orientationOption}>
            <Text style={[styles.orientationText, styles.orientationInactive]}>縦向き</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 40,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  camera: {
    flex: 1,
  },
  instructionContainer: {
    position: 'absolute',
    top: '25%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  captureFrame: {
    position: 'absolute',
    top: '35%',
    left: '10%',
    right: '10%',
    height: '25%',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    zIndex: 5,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  galleryButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  orientationButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orientationToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 4,
  },
  orientationOption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  orientationActive: {
    backgroundColor: '#FF6B35',
  },
  orientationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  orientationInactive: {
    color: '#CCCCCC',
  },
});

export default CameraScreen; 