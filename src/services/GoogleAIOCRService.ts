import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { BusinessCard } from '../types';

export interface GoogleAIOCRResult {
  name?: string;
  company?: string;
  department?: string;
  position?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  email?: string;
  website?: string;
  address?: string;
  postalCode?: string;
  memo?: string;
}

export class GoogleAIOCRService {
  private static readonly API_KEY = 'AIzaSyBrKZZTEzwrV_ic0BPOI5MycvTkDvM_VpY';
  private static readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  // 圖片預處理
  static async preprocessImage(imageUri: string): Promise<string> {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1200 } }, // 調整大小以提高 OCR 準確性
          { rotate: 0 }, // 確保圖片方向正確
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      return imageUri;
    }
  }

  // 將圖片轉換為 base64
  static async imageToBase64(imageUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      throw new Error('圖片轉換失敗');
    }
  }

  // 使用 Google AI Studio API 進行 OCR 分析
  static async extractTextFromImage(imageUri: string): Promise<GoogleAIOCRResult> {
    try {
      // 預處理圖片
      const processedImageUri = await this.preprocessImage(imageUri);
      
      // 轉換為 base64
      const base64Image = await this.imageToBase64(processedImageUri);

      // 構建 API 請求
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `請分析這張名片圖片，提取以下信息並以 JSON 格式返回：
                
                要提取的欄位：
                - name: 姓名（日文或中文或英文）
                - company: 公司名稱
                - department: 部門
                - position: 職位
                - phone: 電話號碼（固定電話）
                - mobile: 手機號碼
                - fax: 傳真號碼
                - email: 電子郵件
                - website: 網站地址
                - address: 地址
                - postalCode: 郵遞區號
                - memo: 其他備註信息
                
                請只返回 JSON 格式的結果，不要包含其他文字。如果某個欄位沒有找到對應信息，請設為空字符串。
                
                範例格式：
                {
                  "name": "鴨山かほり",
                  "company": "統一企業集團",
                  "department": "輸入國內事業部",
                  "position": "マネージャー",
                  "phone": "03-6264-9166",
                  "mobile": "070-1319-4481",
                  "fax": "03-6264-9195",
                  "email": "k_shigiyama88@ptm-tokyo.co.jp",
                  "website": "http://ptm-tokyo.co.jp",
                  "address": "東京都中央区日本橋小網町3-11 日本橋SOYIC4階",
                  "postalCode": "103-0016",
                  "memo": "lopenmall.JP"
                }`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        }
      };

      // 發送 API 請求
      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google AI API Error:', errorText);
        throw new Error(`API 請求失敗: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
        throw new Error('API 返回格式錯誤');
      }

      const textContent = result.candidates[0].content.parts[0].text;
      
      // 解析 JSON 結果
      try {
        const ocrResult = JSON.parse(textContent);
        return ocrResult as GoogleAIOCRResult;
      } catch (parseError) {
        console.error('Failed to parse OCR result:', parseError);
        console.log('Raw response:', textContent);
        
        // 如果 JSON 解析失敗，嘗試從文本中提取信息
        return this.fallbackTextParsing(textContent);
      }

    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('名片分析失敗，請重試');
    }
  }

  // 備用文本解析方法
  static fallbackTextParsing(text: string): GoogleAIOCRResult {
    const result: GoogleAIOCRResult = {};
    
    // 簡單的正則表達式匹配
    const patterns = {
      email: /[\w\.-]+@[\w\.-]+\.\w+/g,
      phone: /(\d{2,4}-\d{4}-\d{4}|\d{3}-\d{3}-\d{4})/g,
      mobile: /(070|080|090)-\d{4}-\d{4}/g,
      website: /(https?:\/\/[\w\.-]+|www\.[\w\.-]+|[\w\.-]+\.com|[\w\.-]+\.co\.jp)/g,
      postalCode: /〒?\s*(\d{3}-\d{4})/g,
    };

    // 提取郵件
    const emailMatch = text.match(patterns.email);
    if (emailMatch) result.email = emailMatch[0];

    // 提取電話
    const phoneMatch = text.match(patterns.phone);
    if (phoneMatch) result.phone = phoneMatch[0];

    // 提取手機
    const mobileMatch = text.match(patterns.mobile);
    if (mobileMatch) result.mobile = mobileMatch[0];

    // 提取網站
    const websiteMatch = text.match(patterns.website);
    if (websiteMatch) result.website = websiteMatch[0];

    // 提取郵遞區號
    const postalMatch = text.match(patterns.postalCode);
    if (postalMatch) result.postalCode = postalMatch[1];

    return result;
  }

  // 主要 OCR 處理方法
  static async processBusinessCard(imageUri: string): Promise<Partial<BusinessCard>> {
    try {
      console.log('開始處理名片 OCR...');
      
      // 使用 Google AI Studio API 進行 OCR
      const ocrResult = await this.extractTextFromImage(imageUri);
      
      console.log('OCR 結果:', ocrResult);

      // 轉換為 BusinessCard 格式
      const businessCard: Partial<BusinessCard> = {
        name: ocrResult.name || '',
        company: ocrResult.company || '',
        department: ocrResult.department || '',
        position: ocrResult.position || '',
        phone: ocrResult.phone || '',
        mobile: ocrResult.mobile || '',
        fax: ocrResult.fax || '',
        email: ocrResult.email || '',
        website: ocrResult.website || '',
        address: ocrResult.address || '',
        postalCode: ocrResult.postalCode || '',
        memo: ocrResult.memo || '',
        imageUri: imageUri,
      };

      return businessCard;
    } catch (error) {
      console.error('OCR processing failed:', error);
      
      // 如果 OCR 失敗，返回空的名片數據但保留圖片
      return {
        name: '',
        company: '',
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
    }
  }
} 