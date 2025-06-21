import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Contacts from 'expo-contacts';
import { BusinessCard } from '../types';

export class ExportService {
  // 導出為 CSV 格式
  static async exportToCSV(businessCards: BusinessCard[]): Promise<string> {
    try {
      // CSV 標題行
      const headers = [
        '姓名',
        '公司',
        '部門',
        '職位',
        '電話',
        '手機',
        '傳真',
        '電子郵件',
        '網站',
        '地址',
        '備註',
        '創建日期',
        '更新日期'
      ];

      // CSV 數據行
      const rows = businessCards.map(card => [
        card.name || '',
        card.company || '',
        card.department || '',
        card.position || '',
        card.phone || '',
        card.mobile || '',
        card.fax || '',
        card.email || '',
        card.website || '',
        card.address || '',
        card.memo || '',
        card.createdAt.toLocaleDateString('ja-JP'),
        card.updatedAt.toLocaleDateString('ja-JP')
      ]);

      // 組合 CSV 內容
      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      // 添加 BOM 以支持日文字符
      const bom = '\uFEFF';
      return bom + csvContent;
    } catch (error) {
      console.error('Failed to export to CSV:', error);
      throw new Error('CSV 匯出失敗');
    }
  }

  // 輔助方法：確保文件目錄存在
  private static async ensureDirectoryExists(): Promise<string> {
    try {
      const documentDirectory = FileSystem.documentDirectory;
      if (!documentDirectory) {
        throw new Error('Document directory not available');
      }

      // 檢查目錄是否存在
      const dirInfo = await FileSystem.getInfoAsync(documentDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(documentDirectory, { intermediates: true });
      }

      return documentDirectory;
    } catch (error) {
      console.error('Failed to ensure directory exists:', error);
      // 降級到緩存目錄
      const cacheDirectory = FileSystem.cacheDirectory;
      if (cacheDirectory) {
        const dirInfo = await FileSystem.getInfoAsync(cacheDirectory);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(cacheDirectory, { intermediates: true });
        }
        return cacheDirectory;
      }
      throw new Error('No available directory for file storage');
    }
  }

  // 保存 CSV 文件並分享
  static async saveAndShareCSV(businessCards: BusinessCard[]): Promise<void> {
    try {
      const csvContent = await this.exportToCSV(businessCards);
      const fileName = `MeishiBox_名片數據_${new Date().toISOString().split('T')[0]}.csv`;
      
      const baseDirectory = await this.ensureDirectoryExists();
      const fileUri = baseDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: '分享名片數據',
        });
      } else {
        throw new Error('分享功能不可用');
      }
    } catch (error) {
      console.error('Failed to save and share CSV:', error);
      throw new Error('CSV 檔案儲存或分享失敗');
    }
  }

  // 導出到系統聯絡人
  static async exportToContacts(businessCards: BusinessCard[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    try {
      // 檢查聯絡人權限
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('需要聯絡人權限才能導出');
      }

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const card of businessCards) {
        try {
          const contact: Contacts.Contact = {
            name: card.name,
            firstName: this.extractFirstName(card.name),
            lastName: this.extractLastName(card.name),
            company: card.company,
            jobTitle: card.position,
            department: card.department,
            phoneNumbers: this.buildPhoneNumbers(card),
            emails: this.buildEmails(card),
            addresses: this.buildAddresses(card),
            note: this.buildNoteWithWebsite(card),
            contactType: Contacts.ContactTypes.Person,
          };

          await Contacts.addContactAsync(contact);
          success++;
        } catch (error) {
          failed++;
          errors.push(`${card.name}: ${error}`);
          console.error(`Failed to add contact for ${card.name}:`, error);
        }
      }

      return { success, failed, errors };
    } catch (error) {
      console.error('Failed to export to contacts:', error);
      throw new Error('聯絡人匯出失敗');
    }
  }

  // 導出為 vCard 格式
  static async exportToVCard(businessCards: BusinessCard[]): Promise<string> {
    try {
      const vCards = businessCards.map(card => this.buildVCard(card));
      return vCards.join('\n\n');
    } catch (error) {
      console.error('Failed to export to vCard:', error);
      throw new Error('vCard 匯出失敗');
    }
  }

  // 保存 vCard 文件並分享
  static async saveAndShareVCard(businessCards: BusinessCard[]): Promise<void> {
    try {
      const vCardContent = await this.exportToVCard(businessCards);
      const fileName = `MeishiBox_聯絡人_${new Date().toISOString().split('T')[0]}.vcf`;
      
      const baseDirectory = await this.ensureDirectoryExists();
      const fileUri = baseDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, vCardContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/vcard',
          dialogTitle: '分享聯絡人',
        });
      } else {
        throw new Error('分享功能不可用');
      }
    } catch (error) {
      console.error('Failed to save and share vCard:', error);
      throw new Error('vCard 檔案儲存或分享失敗');
    }
  }

  // 導出單個名片的圖片和數據
  static async exportSingleCard(card: BusinessCard): Promise<void> {
    try {
      const cardData = {
        name: card.name,
        company: card.company,
        department: card.department,
        position: card.position,
        phone: card.phone,
        mobile: card.mobile,
        fax: card.fax,
        email: card.email,
        website: card.website,
        address: card.address,
        memo: card.memo,
        exportDate: new Date().toISOString(),
      };

      const jsonContent = JSON.stringify(cardData, null, 2);
      const fileName = `${card.name || 'unnamed'}_名片數據.json`;
      
      const baseDirectory = await this.ensureDirectoryExists();
      const fileUri = baseDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const filesToShare = [fileUri];

      // 如果有圖片，也一起分享
      if (card.imageUri) {
        filesToShare.push(card.imageUri);
      }

      if (await Sharing.isAvailableAsync()) {
        for (const file of filesToShare) {
          await Sharing.shareAsync(file);
        }
      } else {
        throw new Error('分享功能不可用');
      }
    } catch (error) {
      console.error('Failed to export single card:', error);
      throw new Error('名片匯出失敗');
    }
  }

  // 輔助方法：提取名字
  private static extractFirstName(fullName: string): string {
    // 對於日文姓名，通常最後一個字符是名
    if (fullName.length > 1) {
      return fullName.slice(-1);
    }
    return fullName;
  }

  // 輔助方法：提取姓氏
  private static extractLastName(fullName: string): string {
    // 對於日文姓名，除了最後一個字符外都是姓
    if (fullName.length > 1) {
      return fullName.slice(0, -1);
    }
    return '';
  }

  // 輔助方法：建立電話號碼數組
  private static buildPhoneNumbers(card: BusinessCard): Contacts.PhoneNumber[] {
    const phoneNumbers: Contacts.PhoneNumber[] = [];

    if (card.mobile) {
      phoneNumbers.push({
        number: card.mobile,
        isPrimary: true,
        label: 'mobile',
      });
    }

    if (card.phone) {
      phoneNumbers.push({
        number: card.phone,
        isPrimary: false,
        label: 'work',
      });
    }

    if (card.fax) {
      phoneNumbers.push({
        number: card.fax,
        isPrimary: false,
        label: 'work fax',
      });
    }

    return phoneNumbers;
  }

  // 輔助方法：建立電子郵件數組
  private static buildEmails(card: BusinessCard): Contacts.Email[] {
    const emails: Contacts.Email[] = [];

    if (card.email) {
      emails.push({
        email: card.email,
        isPrimary: true,
        label: 'work',
      });
    }

    return emails;
  }

  // 輔助方法：建立備註（包含網站資訊）
  private static buildNoteWithWebsite(card: BusinessCard): string {
    const notes: string[] = [];

    if (card.department) {
      notes.push(`部門: ${card.department}`);
    }

    if (card.website) {
      notes.push(`網站: ${card.website}`);
    }

    if (card.memo) {
      notes.push(`備註: ${card.memo}`);
    }

    notes.push(`由 MeishiBox 導入於 ${new Date().toLocaleDateString('ja-JP')}`);

    return notes.join('\n');
  }

  // 輔助方法：建立地址數組
  private static buildAddresses(card: BusinessCard): Contacts.Address[] {
    const addresses: Contacts.Address[] = [];

    if (card.address) {
      addresses.push({
        street: card.address,
        label: 'work',
      });
    }

    return addresses;
  }

  // 輔助方法：建立備註
  private static buildNote(card: BusinessCard): string {
    const notes: string[] = [];

    if (card.department) {
      notes.push(`部門: ${card.department}`);
    }

    if (card.memo) {
      notes.push(`備註: ${card.memo}`);
    }

    notes.push(`由 MeishiBox 導入於 ${new Date().toLocaleDateString('ja-JP')}`);

    return notes.join('\n');
  }

  // 輔助方法：建立 vCard
  private static buildVCard(card: BusinessCard): string {
    const vCardLines: string[] = [];

    vCardLines.push('BEGIN:VCARD');
    vCardLines.push('VERSION:3.0');

    // 姓名
    if (card.name) {
      const lastName = this.extractLastName(card.name);
      const firstName = this.extractFirstName(card.name);
      vCardLines.push(`N:${lastName};${firstName};;;`);
      vCardLines.push(`FN:${card.name}`);
    }

    // 公司和職位
    if (card.company) {
      vCardLines.push(`ORG:${card.company}${card.department ? `;${card.department}` : ''}`);
    }

    if (card.position) {
      vCardLines.push(`TITLE:${card.position}`);
    }

    // 電話號碼
    if (card.mobile) {
      vCardLines.push(`TEL;TYPE=CELL:${card.mobile}`);
    }

    if (card.phone) {
      vCardLines.push(`TEL;TYPE=WORK:${card.phone}`);
    }

    if (card.fax) {
      vCardLines.push(`TEL;TYPE=FAX:${card.fax}`);
    }

    // 電子郵件
    if (card.email) {
      vCardLines.push(`EMAIL;TYPE=WORK:${card.email}`);
    }

    // 網站
    if (card.website) {
      vCardLines.push(`URL:${card.website}`);
    }

    // 地址
    if (card.address) {
      vCardLines.push(`ADR;TYPE=WORK:;;${card.address};;;;`);
    }

    // 備註
    const note = this.buildNote(card);
    if (note) {
      vCardLines.push(`NOTE:${note.replace(/\n/g, '\\n')}`);
    }

    vCardLines.push('END:VCARD');

    return vCardLines.join('\n');
  }
} 