import * as ImageManipulator from 'expo-image-manipulator';
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ImageProcessingService {
  /**
   * 根據相機取景框裁剪圖片
   * @param imageUri 原始圖片 URI
   * @param cropArea 裁剪區域（屏幕座標）
   * @param orientation 拍攝方向
   * @returns 裁剪後的圖片 URI
   */
  static async cropBusinessCard(
    imageUri: string, 
    cropArea: CropArea, 
    orientation: 'landscape' | 'portrait'
  ): Promise<string> {
    try {
      // 獲取原始圖片尺寸
      const imageInfo = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { format: ImageManipulator.SaveFormat.JPEG }
      );

      // 計算圖片和屏幕的比例
      const imageWidth = imageInfo.width;
      const imageHeight = imageInfo.height;
      
      // 計算縮放比例
      const scaleX = imageWidth / screenWidth;
      const scaleY = imageHeight / screenHeight;
      
      // 將屏幕座標轉換為圖片座標
      const cropX = cropArea.x * scaleX;
      const cropY = cropArea.y * scaleY;
      const cropWidth = cropArea.width * scaleX;
      const cropHeight = cropArea.height * scaleY;
      
      // 確保裁剪區域在圖片範圍內
      const finalCropX = Math.max(0, Math.min(cropX, imageWidth - 1));
      const finalCropY = Math.max(0, Math.min(cropY, imageHeight - 1));
      const finalCropWidth = Math.min(cropWidth, imageWidth - finalCropX);
      const finalCropHeight = Math.min(cropHeight, imageHeight - finalCropY);

      console.log('圖片裁剪參數:', {
        original: { width: imageWidth, height: imageHeight },
        screen: { width: screenWidth, height: screenHeight },
        scale: { x: scaleX, y: scaleY },
        cropArea: cropArea,
        finalCrop: {
          x: finalCropX,
          y: finalCropY,
          width: finalCropWidth,
          height: finalCropHeight
        }
      });

      // 執行裁剪
      const croppedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: finalCropX,
              originY: finalCropY,
              width: finalCropWidth,
              height: finalCropHeight,
            },
          },
        ],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('圖片裁剪完成:', croppedImage.uri);
      return croppedImage.uri;

    } catch (error) {
      console.error('圖片裁剪失敗:', error);
      // 如果裁剪失敗，返回原圖
      return imageUri;
    }
  }

  /**
   * 計算相機取景框的裁剪區域
   * @param orientation 拍攝方向
   * @returns 裁剪區域座標
   */
  static getCropArea(orientation: 'landscape' | 'portrait'): CropArea {
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
  }

  /**
   * 優化圖片品質（用於 OCR 分析）
   * @param imageUri 圖片 URI
   * @returns 優化後的圖片 URI
   */
  static async optimizeForOCR(imageUri: string): Promise<string> {
    try {
      const optimizedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1200 } }, // 調整大小以提高 OCR 準確性
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return optimizedImage.uri;
    } catch (error) {
      console.error('圖片優化失敗:', error);
      return imageUri;
    }
  }

  /**
   * 為顯示優化圖片（較小尺寸）
   * @param imageUri 圖片 URI
   * @returns 優化後的圖片 URI
   */
  static async optimizeForDisplay(imageUri: string): Promise<string> {
    try {
      const optimizedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 800 } }, // 顯示用的較小尺寸
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return optimizedImage.uri;
    } catch (error) {
      console.error('圖片顯示優化失敗:', error);
      return imageUri;
    }
  }
} 