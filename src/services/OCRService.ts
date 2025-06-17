import * as ImageManipulator from 'expo-image-manipulator';
import { BusinessCard } from '../types';
import { generateCardId } from '../utils';

export interface OCRResult {
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
}

export class OCRService {
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

  // 模擬 OCR 文字提取（實際應用中會使用 Google Vision API 或其他 OCR 服務）
  static async extractTextFromImage(imageUri: string): Promise<string[]> {
    // 模擬 OCR 延遲
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模擬提取的文字行
    const mockExtractedText = [
      '鴨山かほり',
      'Kamoyama Kahori',
      '統一企業集團',
      'Uni-President Enterprises Corp.',
      '輸入國內事業部',
      'Import Domestic Business Division',
      'マネージャー',
      'Manager',
      '〒103-0016',
      '東京都中央区日本橋小網町3-11',
      '日本橋SOYIC4階',
      'TEL: 03-6264-9166',
      'Mobile: 070-1319-4481',
      'FAX: 03-6264-9195',
      'E-mail: k_shigiyama88@ptm-tokyo.co.jp',
      'http://ptm-tokyo.co.jp',
      'lopenmall.JP',
    ];

    return mockExtractedText;
  }

  // 解析提取的文字並結構化數據
  static parseExtractedText(textLines: string[]): OCRResult {
    const result: OCRResult = {};

    for (const line of textLines) {
      const trimmedLine = line.trim();
      
      // 解析姓名（日文）
      if (this.isJapaneseName(trimmedLine) && !result.name) {
        result.name = trimmedLine;
      }

      // 解析公司名稱
      if (this.isCompanyName(trimmedLine) && !result.company) {
        result.company = trimmedLine;
      }

      // 解析部門
      if (this.isDepartment(trimmedLine) && !result.department) {
        result.department = trimmedLine;
      }

      // 解析職位
      if (this.isPosition(trimmedLine) && !result.position) {
        result.position = trimmedLine;
      }

      // 解析電話號碼
      if (trimmedLine.includes('TEL:') || trimmedLine.includes('Tel:')) {
        result.phone = this.extractPhoneNumber(trimmedLine);
      }

      // 解析手機號碼
      if (trimmedLine.includes('Mobile:') || trimmedLine.includes('携帯:')) {
        result.mobile = this.extractPhoneNumber(trimmedLine);
      }

      // 解析傳真
      if (trimmedLine.includes('FAX:') || trimmedLine.includes('Fax:')) {
        result.fax = this.extractPhoneNumber(trimmedLine);
      }

      // 解析電子郵件
      if (this.isEmail(trimmedLine)) {
        result.email = trimmedLine.replace(/^E-mail:\s*/, '');
      }

      // 解析網站
      if (this.isWebsite(trimmedLine)) {
        result.website = trimmedLine;
      }

      // 解析郵遞區號
      if (this.isPostalCode(trimmedLine)) {
        result.postalCode = trimmedLine.replace(/^〒/, '');
      }

      // 解析地址
      if (this.isAddress(trimmedLine) && !result.address) {
        result.address = trimmedLine;
      }
    }

    return result;
  }

  // 輔助方法：判斷是否為日文姓名
  private static isJapaneseName(text: string): boolean {
    const japaneseNamePattern = /^[ひらがなカタカナ漢字]{2,10}$/;
    return japaneseNamePattern.test(text) && 
           !text.includes('株式会社') && 
           !text.includes('会社') &&
           !text.includes('部') &&
           !text.includes('課');
  }

  // 輔助方法：判斷是否為公司名稱
  private static isCompanyName(text: string): boolean {
    return text.includes('株式会社') || 
           text.includes('有限会社') || 
           text.includes('Corp') || 
           text.includes('Company') ||
           text.includes('企業') ||
           text.includes('集團');
  }

  // 輔助方法：判斷是否為部門
  private static isDepartment(text: string): boolean {
    return text.includes('部') || 
           text.includes('課') || 
           text.includes('Division') ||
           text.includes('Department');
  }

  // 輔助方法：判斷是否為職位
  private static isPosition(text: string): boolean {
    return text.includes('マネージャー') || 
           text.includes('部長') || 
           text.includes('課長') ||
           text.includes('Manager') ||
           text.includes('Director') ||
           text.includes('Chief');
  }

  // 輔助方法：提取電話號碼
  private static extractPhoneNumber(text: string): string {
    const phonePattern = /[\d\-\+\(\)\s]+/;
    const match = text.match(phonePattern);
    return match ? match[0].trim() : '';
  }

  // 輔助方法：判斷是否為電子郵件
  private static isEmail(text: string): boolean {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    return emailPattern.test(text);
  }

  // 輔助方法：判斷是否為網站
  private static isWebsite(text: string): boolean {
    return text.includes('http') || 
           text.includes('www.') || 
           text.includes('.com') ||
           text.includes('.co.jp') ||
           text.includes('.jp');
  }

  // 輔助方法：判斷是否為郵遞區號
  private static isPostalCode(text: string): boolean {
    const postalPattern = /^〒?\d{3}-?\d{4}$/;
    return postalPattern.test(text);
  }

  // 輔助方法：判斷是否為地址
  private static isAddress(text: string): boolean {
    return (text.includes('都') || text.includes('府') || text.includes('県')) &&
           (text.includes('区') || text.includes('市') || text.includes('町'));
  }

  // 主要 OCR 處理方法
  static async processBusinessCard(imageUri: string): Promise<BusinessCard> {
    try {
      // 1. 預處理圖片
      const processedImageUri = await this.preprocessImage(imageUri);

      // 2. 提取文字
      const extractedText = await this.extractTextFromImage(processedImageUri);

      // 3. 解析結構化數據
      const ocrResult = this.parseExtractedText(extractedText);

      // 4. 創建 BusinessCard 對象
      const businessCard: BusinessCard = {
        id: generateCardId(),
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
        memo: '',
        imageUri: processedImageUri,
        createdAt: new Date(),
        updatedAt: new Date(),
        isRedCarpet: false,
      };

      return businessCard;
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('名片處理失敗，請重試');
    }
  }
} 