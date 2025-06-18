/**
 * 日文假名排序工具
 * 支援あいうえお順序排列
 */

// 平假名排序表
const HIRAGANA_ORDER = [
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ', 'が', 'ぎ', 'ぐ', 'げ', 'ご',
  'さ', 'し', 'す', 'せ', 'そ', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
  'た', 'ち', 'つ', 'て', 'と', 'だ', 'ぢ', 'づ', 'で', 'ど',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ', 'ば', 'び', 'ぶ', 'べ', 'ぼ', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
  'ま', 'み', 'む', 'め', 'も',
  'や', 'ゆ', 'よ',
  'ら', 'り', 'る', 'れ', 'ろ',
  'わ', 'ゐ', 'ゑ', 'を', 'ん'
];

// 片假名排序表
const KATAKANA_ORDER = [
  'ア', 'イ', 'ウ', 'エ', 'オ',
  'カ', 'キ', 'ク', 'ケ', 'コ', 'ガ', 'ギ', 'グ', 'ゲ', 'ゴ',
  'サ', 'シ', 'ス', 'セ', 'ソ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ',
  'タ', 'チ', 'ツ', 'テ', 'ト', 'ダ', 'ヂ', 'ヅ', 'デ', 'ド',
  'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
  'ハ', 'ヒ', 'フ', 'ヘ', 'ホ', 'バ', 'ビ', 'ブ', 'ベ', 'ボ', 'パ', 'ピ', 'プ', 'ペ', 'ポ',
  'マ', 'ミ', 'ム', 'メ', 'モ',
  'ヤ', 'ユ', 'ヨ',
  'ラ', 'リ', 'ル', 'レ', 'ロ',
  'ワ', 'ヰ', 'ヱ', 'ヲ', 'ン'
];

// 漢字讀音對照表（常見名字和公司名）
const KANJI_READING_MAP: { [key: string]: string } = {
  // 常見姓氏
  '田中': 'たなか',
  '佐藤': 'さとう',
  '鈴木': 'すずき',
  '高橋': 'たかはし',
  '伊藤': 'いとう',
  '渡辺': 'わたなべ',
  '山本': 'やまもと',
  '中村': 'なかむら',
  '小林': 'こばやし',
  '加藤': 'かとう',
  '吉田': 'よしだ',
  '山田': 'やまだ',
  '佐々木': 'ささき',
  '山口': 'やまぐち',
  '松本': 'まつもと',
  '井上': 'いのうえ',
  '木村': 'きむら',
  '林': 'はやし',
  '清水': 'しみず',
  '山崎': 'やまざき',
  '森': 'もり',
  '池田': 'いけだ',
  '橋本': 'はしもと',
  '斎藤': 'さいとう',
  '石川': 'いしかわ',
  '前田': 'まえだ',
  '藤田': 'ふじた',
  '後藤': 'ごとう',
  '岡田': 'おかだ',
  '長谷川': 'はせがわ',
  
  // 常見名字
  '太郎': 'たろう',
  '次郎': 'じろう',
  '三郎': 'さぶろう',
  '一郎': 'いちろう',
  '花子': 'はなこ',
  '美子': 'よしこ',
  '和子': 'かずこ',
  '幸子': 'さちこ',
  '恵子': 'けいこ',
  '裕子': 'ゆうこ',
  '智子': 'ともこ',
  '直子': 'なおこ',
  '真由美': 'まゆみ',
  '由美': 'ゆみ',
  '美穂': 'みほ',
  '麻衣': 'まい',
  '愛': 'あい',
  '翔': 'しょう',
  '拓海': 'たくみ',
  '健太': 'けんた',
  '雄大': 'ゆうだい',
  
  // 常見公司名
  '株式会社': 'かぶしきがいしゃ',
  '有限会社': 'ゆうげんがいしゃ',
  '合同会社': 'ごうどうがいしゃ',
  'トヨタ': 'とよた',
  'ホンダ': 'ほんだ',
  'ソニー': 'そにー',
  'パナソニック': 'ぱなそにっく',
  '日立': 'ひたち',
  '東芝': 'とうしば',
  '富士通': 'ふじつう',
  'キヤノン': 'きやのん',
  'ニコン': 'にこん',
  '任天堂': 'にんてんどう',
  'セガ': 'せが',
  'カプコン': 'かぷこん',
  'スクウェア': 'すくうぇあ',
  '楽天': 'らくてん',
  'ソフトバンク': 'そふとばんく',
  'ドコモ': 'どこも',
  'KDDI': 'けーでぃーでぃーあい',
  '三菱': 'みつびし',
  '三井': 'みつい',
  '住友': 'すみとも',
  '野村': 'のむら',
  '大和': 'だいわ',
  '伊藤忠': 'いとうちゅう',
  '丸紅': 'まるべに',
  '双日': 'そうじつ',
  '商船三井': 'しょうせんみつい',
  '日本郵船': 'にっぽんゆうせん',
  'JR': 'じぇいあーる',
  'ANA': 'えーえぬえー',
  'JAL': 'じゃる',
  'NTT': 'えぬてぃーてぃー',
};

export class JapaneseSortUtils {
  /**
   * 將文字轉換為假名進行排序比較
   * 優先使用提供的讀音，如果沒有則嘗試自動轉換
   */
  static getKanaForSorting(text: string, reading?: string): string {
    if (!text) return '';
    
    // 如果提供了讀音，直接使用
    if (reading && reading.trim()) {
      return this.normalizeKana(reading.trim());
    }
    
    // 移除空格和特殊字符
    const cleanText = text.trim();
    
    // 檢查是否已經是假名
    if (this.isKana(cleanText)) {
      return this.normalizeKana(cleanText);
    }
    
    // 嘗試從漢字讀音對照表查找
    const autoReading = this.getKanjiReading(cleanText);
    if (autoReading) {
      return autoReading;
    }
    
    // 如果是英文或其他字符，返回原文
    return cleanText.toLowerCase();
  }
  
  /**
   * 檢查文字是否為假名
   */
  static isKana(text: string): boolean {
    const kanaPattern = /^[あ-んア-ンー]+$/;
    return kanaPattern.test(text);
  }
  
  /**
   * 標準化假名（片假名轉平假名）
   */
  static normalizeKana(text: string): string {
    return text.replace(/[ア-ン]/g, (match) => {
      const code = match.charCodeAt(0) - 0x30A1 + 0x3041;
      return String.fromCharCode(code);
    });
  }
  
  /**
   * 從漢字讀音對照表獲取讀音
   */
  static getKanjiReading(text: string): string | null {
    // 完全匹配
    if (KANJI_READING_MAP[text]) {
      return KANJI_READING_MAP[text];
    }
    
    // 部分匹配（查找包含的片段）
    for (const [kanji, reading] of Object.entries(KANJI_READING_MAP)) {
      if (text.includes(kanji)) {
        return reading;
      }
    }
    
    return null;
  }
  
  /**
   * 獲取假名的排序權重
   */
  static getKanaWeight(char: string): number {
    // 平假名權重
    const hiraganaIndex = HIRAGANA_ORDER.indexOf(char);
    if (hiraganaIndex !== -1) {
      return hiraganaIndex;
    }
    
    // 片假名權重（轉換為平假名後查找）
    const normalizedChar = this.normalizeKana(char);
    const normalizedIndex = HIRAGANA_ORDER.indexOf(normalizedChar);
    if (normalizedIndex !== -1) {
      return normalizedIndex;
    }
    
    // 其他字符權重（排在最後）
    return 9999;
  }
  
  /**
   * 比較兩個文字的假名順序
   * 支援讀音參數
   */
  static compareKana(a: string, b: string, readingA?: string, readingB?: string): number {
    const kanaA = this.getKanaForSorting(a, readingA);
    const kanaB = this.getKanaForSorting(b, readingB);
    
    // 逐字符比較
    const maxLength = Math.max(kanaA.length, kanaB.length);
    
    for (let i = 0; i < maxLength; i++) {
      const charA = kanaA[i] || '';
      const charB = kanaB[i] || '';
      
      if (charA === charB) continue;
      
      const weightA = this.getKanaWeight(charA);
      const weightB = this.getKanaWeight(charB);
      
      if (weightA !== weightB) {
        return weightA - weightB;
      }
    }
    
    // 長度比較
    return kanaA.length - kanaB.length;
  }
  
  /**
   * 獲取分組標籤（あいうえお分組）
   * 支援讀音參數
   */
  static getGroupLabel(text: string, reading?: string): string {
    const kana = this.getKanaForSorting(text, reading);
    if (!kana) return '#';
    
    const firstChar = kana[0];
    
    // 平假名分組
    if (firstChar >= 'あ' && firstChar <= 'お') return 'あ';
    if (firstChar >= 'か' && firstChar <= 'ご') return 'か';
    if (firstChar >= 'さ' && firstChar <= 'ぞ') return 'さ';
    if (firstChar >= 'た' && firstChar <= 'ど') return 'た';
    if (firstChar >= 'な' && firstChar <= 'の') return 'な';
    if (firstChar >= 'は' && firstChar <= 'ぽ') return 'は';
    if (firstChar >= 'ま' && firstChar <= 'も') return 'ま';
    if (firstChar >= 'や' && firstChar <= 'よ') return 'や';
    if (firstChar >= 'ら' && firstChar <= 'ろ') return 'ら';
    if (firstChar >= 'わ' && firstChar <= 'ん') return 'わ';
    
    // 英文字母
    if (/[a-zA-Z]/.test(firstChar)) {
      return firstChar.toUpperCase();
    }
    
    // 其他字符
    return '#';
  }
  
  /**
   * 排序名片數組（按姓名）
   * 使用nameReading欄位
   */
  static sortByName<T extends { name: string; nameReading?: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => this.compareKana(a.name, b.name, a.nameReading, b.nameReading));
  }
  
  /**
   * 排序名片數組（按公司名）
   * 使用companyReading欄位
   */
  static sortByCompany<T extends { company: string; companyReading?: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => this.compareKana(a.company, b.company, a.companyReading, b.companyReading));
  }
  
  /**
   * 分組名片數組
   * 使用對應的讀音欄位
   */
  static groupItems<T extends { name: string; nameReading?: string; company?: string; companyReading?: string }>(
    items: T[], 
    groupBy: 'name' | 'company' = 'name'
  ): Array<{ letter: string; items: T[] }> {
    const groups: { [key: string]: T[] } = {};
    
    items.forEach(item => {
      let text: string;
      let reading: string | undefined;
      
      if (groupBy === 'name') {
        text = item.name;
        reading = item.nameReading;
      } else {
        text = (item as any).company;
        reading = (item as any).companyReading;
      }
      
      const groupLabel = this.getGroupLabel(text, reading);
      
      if (!groups[groupLabel]) {
        groups[groupLabel] = [];
      }
      groups[groupLabel].push(item);
    });
    
    // 按假名順序排序分組
    const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
      // あいうえお 分組排在前面
      const kanaGroups = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'];
      const indexA = kanaGroups.indexOf(a);
      const indexB = kanaGroups.indexOf(b);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return a.localeCompare(b);
    });
    
    return sortedGroupKeys.map(letter => ({
      letter,
      items: groups[letter],
    }));
  }
} 