import * as FileSystem from 'expo-file-system';
import { BusinessCard } from '../types';
import { ImageProcessingService } from './ImageProcessingService';

export interface GoogleAIOCRResult {
  name?: string;
  nameReading?: string; // 姓名讀音（ふりがな）
  company?: string;
  companyReading?: string; // 公司名讀音
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
      return await ImageProcessingService.optimizeForOCR(imageUri);
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      return imageUri;
    }
  }

  // 將圖片轉換為 base64
  static async imageToBase64(imageUri: string): Promise<string> {
    try {
      console.log('🖼️ 轉換圖片為 base64:', imageUri);
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('✅ Base64 轉換完成，長度:', base64.length);
      return base64;
    } catch (error) {
      console.error('❌ Failed to convert image to base64:', error);
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
                text: `分析這張名片圖片，提取信息並返回純 JSON 格式，不要包含任何 markdown 標記、代碼塊標記或其他文字。

要提取的欄位：
- name: 姓名
- nameReading: 姓名讀音（ふりがな）
- company: 公司名稱  
- companyReading: 公司名讀音
- department: 部門
- position: 職位
- phone: 固定電話
- mobile: 手機號碼
- fax: 傳真號碼
- email: 電子郵件
- website: 網站地址
- address: 完整地址
- postalCode: 郵遞區號
- memo: 其他信息

重要：請直接返回 JSON 對象，不要使用 \`\`\`json 標記，不要添加任何解釋文字。如果某欄位沒有信息請設為空字符串。

直接返回格式如下：
{"name":"","nameReading":"","company":"","companyReading":"","department":"","position":"","phone":"","mobile":"","fax":"","email":"","website":"","address":"","postalCode":"","memo":""}`
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
      console.log('🌐 發送 API 請求到:', `${this.API_URL}?key=${this.API_KEY.substring(0, 10)}...`);
      console.log('📤 請求體大小:', JSON.stringify(requestBody).length, 'bytes');
      
      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 API 響應狀態:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Google AI API Error:', errorText);
        throw new Error(`API 請求失敗: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📋 API 原始響應:', JSON.stringify(result, null, 2));
      
      if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
        console.error('❌ API 返回格式錯誤:', result);
        throw new Error('API 回傳格式錯誤');
      }

      const textContent = result.candidates[0].content.parts[0].text;
      console.log('📝 提取的文本內容:', textContent);
      
      // 清理和解析 JSON 結果
      try {
        // 清理響應文本，移除可能的 markdown 標記和額外字符
        let cleanedText = textContent.trim();
        
        // 移除可能的 markdown 代碼塊標記
        cleanedText = cleanedText.replace(/```json\s*/g, '');
        cleanedText = cleanedText.replace(/```\s*$/g, '');
        
        // 移除可能的反引號
        cleanedText = cleanedText.replace(/^`+|`+$/g, '');
        
        // 尋找 JSON 對象的開始和結束
        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const jsonString = cleanedText.substring(jsonStart, jsonEnd + 1);
          const ocrResult = JSON.parse(jsonString);
          return ocrResult as GoogleAIOCRResult;
        } else {
          throw new Error('回應中找不到有效的JSON');
        }
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
    
    console.log('Fallback parsing raw text:', text);
    
    // 更智能的正則表達式匹配
    const patterns = {
      email: /[\w\.-]+@[\w\.-]+\.\w+/gi,
      phone: /(?:TEL|電話|Tel|Phone)[:\s]*(\d{2,4}[-\s]\d{4}[-\s]\d{4})/gi,
      mobile: /(?:Mobile|携帯|手機)[:\s]*((?:070|080|090)[-\s]\d{4}[-\s]\d{4})/gi,
      fax: /(?:FAX|传真|ファックス)[:\s]*(\d{2,4}[-\s]\d{4}[-\s]\d{4})/gi,
      website: /(https?:\/\/[\w\.-]+|www\.[\w\.-]+|[\w\.-]+\.(?:com|co\.jp|org|net))/gi,
      postalCode: /(?:〒|郵便番号|Postal)[:\s]*(\d{3}[-\s]\d{4})/gi,
    };

    // 嘗試提取結構化信息
    try {
      // 提取郵件
      const emailMatch = text.match(patterns.email);
      if (emailMatch) result.email = emailMatch[0];

      // 提取電話
      const phoneMatch = text.match(patterns.phone);
      if (phoneMatch) result.phone = phoneMatch[1] || phoneMatch[0];

      // 提取手機
      const mobileMatch = text.match(patterns.mobile);
      if (mobileMatch) result.mobile = mobileMatch[1] || mobileMatch[0];

      // 提取傳真
      const faxMatch = text.match(patterns.fax);
      if (faxMatch) result.fax = faxMatch[1] || faxMatch[0];

      // 提取網站
      const websiteMatch = text.match(patterns.website);
      if (websiteMatch) result.website = websiteMatch[0];

      // 提取郵遞區號
      const postalMatch = text.match(patterns.postalCode);
      if (postalMatch) result.postalCode = postalMatch[1] || postalMatch[0];

      // 嘗試從文本中提取姓名（通常在開頭）
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        // 假設第一行可能是姓名
        const firstLine = lines[0].trim();
        if (firstLine && firstLine.length < 20 && !patterns.email.test(firstLine)) {
          result.name = firstLine;
        }
      }

      console.log('Fallback parsing result:', result);
    } catch (error) {
      console.error('Fallback parsing error:', error);
    }

    return result;
  }

  // 主要 OCR 處理方法
  static async processBusinessCard(imageUri: string): Promise<Partial<BusinessCard>> {
    try {
      console.log('📸 開始處理名片 OCR...', imageUri);
      
      // 使用 Google AI Studio API 進行 OCR
      const ocrResult = await this.extractTextFromImage(imageUri);
      
      console.log('🔍 OCR 原始結果:', ocrResult);

      // 轉換為 BusinessCard 格式
      const businessCard: Partial<BusinessCard> = {
        name: ocrResult.name || '',
        nameReading: ocrResult.nameReading || '',
        company: ocrResult.company || '',
        companyReading: ocrResult.companyReading || '',
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

      console.log('📋 轉換後的名片數據:', businessCard);
      return businessCard;
    } catch (error) {
      console.error('OCR processing failed:', error);
      
      // 如果 OCR 失敗，返回空的名片數據但保留圖片
      return {
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
    }
  }
} 