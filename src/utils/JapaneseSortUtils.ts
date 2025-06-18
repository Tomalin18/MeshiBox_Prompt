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
  // 常見姓氏 - あ行
  '青木': 'あおき',
  '赤木': 'あかぎ',
  '秋田': 'あきた',
  '浅田': 'あさだ',
  '安藤': 'あんどう',
  '飯山': 'いいやま',
  '石田': 'いしだ',
  '石川': 'いしかわ',
  '石井': 'いしい',
  '伊藤': 'いとう',
  '井上': 'いのうえ',
  '今井': 'いまい',
  '岩田': 'いわた',
  '上田': 'うえだ',
  '植田': 'うえだ',
  '内田': 'うちだ',
  '江藤': 'えとう',
  '榎本': 'えのもと',
  '栄田': 'えいだ',
  '遠藤': 'えんどう',
  '大川': 'おおかわ',
  '大木': 'おおき',
  '大野': 'おおの',
  '大田': 'おおた',
  '岡田': 'おかだ',
  '岡本': 'おかもと',
  '小川': 'おがわ',
  '小野': 'おの',
  
  // 常見姓氏 - か行
  '加藤': 'かとう',
  '金田': 'かねだ',
  '金子': 'かねこ',
  '川田': 'かわた',
  '川本': 'かわもと',
  '菊地': 'きくち',
  '北川': 'きたがわ',
  '木村': 'きむら',
  '木下': 'きのした',
  '清水': 'しみず',
  '栗原': 'くりはら',
  '栗屋野': 'くりやの',
  '黒田': 'くろだ',
  '小林': 'こばやし',
  '小島': 'こじま',
  '近藤': 'こんどう',
  
  // 常見姓氏 - さ行
  '佐藤': 'さとう',
  '佐々木': 'ささき',
  '佐野': 'さの',
  '斎藤': 'さいとう',
  '坂本': 'さかもと',
  '櫻井': 'さくらい',
  '桜井': 'さくらい',
  '篠原': 'しのはら',
  '島田': 'しまだ',
  '清田': 'きよた',
  '杉本': 'すぎもと',
  '鈴木': 'すずき',
  '関口': 'せきぐち',
  
  // 常見姓氏 - た行
  '高橋': 'たかはし',
  '高田': 'たかだ',
  '田中': 'たなか',
  '田村': 'たむら',
  '谷口': 'たにぐち',
  '千葉': 'ちば',
  '中川': 'なかがわ',
  '中島': 'なかじま',
  '中田': 'なかた',
  '中村': 'なかむら',
  '永田': 'ながた',
  '長谷川': 'はせがわ',
  '西川': 'にしかわ',
  '西田': 'にしだ',
  '野田': 'のだ',
  
  // 常見姓氏 - は行
  '橋本': 'はしもと',
  '林': 'はやし',
  '原田': 'はらだ',
  '東': 'ひがし',
  '平田': 'ひらた',
  '藤田': 'ふじた',
  '藤井': 'ふじい',
  '藤原': 'ふじわら',
  '古川': 'ふるかわ',
  '本田': 'ほんだ',
  
  // 常見姓氏 - ま行
  '前田': 'まえだ',
  '松本': 'まつもと',
  '松田': 'まつだ',
  '松井': 'まつい',
  '丸山': 'まるやま',
  '水野': 'みずの',
  '宮田': 'みやた',
  '宮本': 'みやもと',
  '村上': 'むらかみ',
  '村田': 'むらた',
  '森': 'もり',
  '森田': 'もりた',
  '諸本': 'もろもと',
  
  // 常見姓氏 - や行
  '山田': 'やまだ',
  '山本': 'やまもと',
  '山口': 'やまぐち',
  '山崎': 'やまざき',
  '吉田': 'よしだ',
  '吉川': 'よしかわ',
  
  // 常見姓氏 - ら行
  '渡辺': 'わたなべ',
  '渡邊': 'わたなべ',
  
  // 常見名字
  '太郎': 'たろう',
  '次郎': 'じろう',
  '三郎': 'さぶろう',
  '一郎': 'いちろう',
  '盛一郎': 'せいいちろう',
  '隆幸': 'たかゆき',
  '智明': 'ともあき',
  '源': 'げん',
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
  '龍太': 'りゅうた',
  '正史': 'まさふみ',
  '正男': 'まさお',
  '正子': 'まさこ',
  '正一': 'まさかず',
  '正義': 'まさよし',
  '正雄': 'まさお',
  '正美': 'まさみ',
  '正明': 'まさあき',
  '正治': 'まさはる',
  '正人': 'まさと',
  
  // 常見公司名
  '株式会社': 'かぶしきがいしゃ',
  '有限会社': 'ゆうげんがいしゃ',
  '合同会社': 'ごうどうがいしゃ',
  'ハンドトラスト': 'はんどとらすと',
  'Genics': 'じぇにくす',
  '川崎市産業振興財団': 'かわさきしさんぎょうしんこうざいだん',
  '公益財団法人': 'こうえきざいだんほうじん',
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
    
    // 嘗試分割姓名（例如：栗屋野 盛一郎）
    const parts = text.trim().split(/\s+/);
    if (parts.length === 2) {
      const [surname, firstname] = parts;
      const surnameReading = KANJI_READING_MAP[surname];
      const firstnameReading = KANJI_READING_MAP[firstname];
      
      if (surnameReading && firstnameReading) {
        return `${surnameReading} ${firstnameReading}`;
      }
      if (surnameReading) {
        return surnameReading;
      }
      if (firstnameReading) {
        return firstnameReading;
      }
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
   * 獲取分組標籤（精細五十音分組）
   * 支援讀音參數，按照具體音節分組（あ、い、う、え、お、か、き、く等）
   */
  static getGroupLabel(text: string, reading?: string): string {
    let kana: string;
    
    // 如果有讀音，使用讀音的第一個字符
    if (reading && reading.trim()) {
      kana = reading.trim();
    } else {
      // 嘗試分割姓名，只使用姓氏部分進行分組
      const parts = text.trim().split(/\s+/);
      if (parts.length >= 2) {
        const surname = parts[0];
        const surnameReading = this.getKanjiReading(surname);
        if (surnameReading) {
          kana = surnameReading;
        } else {
          kana = this.getKanaForSorting(surname);
        }
      } else {
        kana = this.getKanaForSorting(text, reading);
      }
    }
    
    if (!kana) return '#';
    
    const firstChar = kana[0];
    
    // 精細平假名分組 - 每個音節一個分組
    // あ行
    if (firstChar === 'あ') return 'あ';
    if (firstChar === 'い') return 'い';
    if (firstChar === 'う') return 'う';
    if (firstChar === 'え') return 'え';
    if (firstChar === 'お') return 'お';
    
    // か行
    if (firstChar === 'か' || firstChar === 'が') return 'か';
    if (firstChar === 'き' || firstChar === 'ぎ') return 'き';
    if (firstChar === 'く' || firstChar === 'ぐ') return 'く';
    if (firstChar === 'け' || firstChar === 'げ') return 'け';
    if (firstChar === 'こ' || firstChar === 'ご') return 'こ';
    
    // さ行
    if (firstChar === 'さ' || firstChar === 'ざ') return 'さ';
    if (firstChar === 'し' || firstChar === 'じ') return 'し';
    if (firstChar === 'す' || firstChar === 'ず') return 'す';
    if (firstChar === 'せ' || firstChar === 'ぜ') return 'せ';
    if (firstChar === 'そ' || firstChar === 'ぞ') return 'そ';
    
    // た行
    if (firstChar === 'た' || firstChar === 'だ') return 'た';
    if (firstChar === 'ち' || firstChar === 'ぢ') return 'ち';
    if (firstChar === 'つ' || firstChar === 'づ') return 'つ';
    if (firstChar === 'て' || firstChar === 'で') return 'て';
    if (firstChar === 'と' || firstChar === 'ど') return 'と';
    
    // な行
    if (firstChar === 'な') return 'な';
    if (firstChar === 'に') return 'に';
    if (firstChar === 'ぬ') return 'ぬ';
    if (firstChar === 'ね') return 'ね';
    if (firstChar === 'の') return 'の';
    
    // は行
    if (firstChar === 'は' || firstChar === 'ば' || firstChar === 'ぱ') return 'は';
    if (firstChar === 'ひ' || firstChar === 'び' || firstChar === 'ぴ') return 'ひ';
    if (firstChar === 'ふ' || firstChar === 'ぶ' || firstChar === 'ぷ') return 'ふ';
    if (firstChar === 'へ' || firstChar === 'べ' || firstChar === 'ぺ') return 'へ';
    if (firstChar === 'ほ' || firstChar === 'ぼ' || firstChar === 'ぽ') return 'ほ';
    
    // ま行
    if (firstChar === 'ま') return 'ま';
    if (firstChar === 'み') return 'み';
    if (firstChar === 'む') return 'む';
    if (firstChar === 'め') return 'め';
    if (firstChar === 'も') return 'も';
    
    // や行
    if (firstChar === 'や') return 'や';
    if (firstChar === 'ゆ') return 'ゆ';
    if (firstChar === 'よ') return 'よ';
    
    // ら行
    if (firstChar === 'ら') return 'ら';
    if (firstChar === 'り') return 'り';
    if (firstChar === 'る') return 'る';
    if (firstChar === 'れ') return 'れ';
    if (firstChar === 'ろ') return 'ろ';
    
    // わ行
    if (firstChar === 'わ') return 'わ';
    if (firstChar === 'ゐ') return 'ゐ';
    if (firstChar === 'ゑ') return 'ゑ';
    if (firstChar === 'を') return 'を';
    if (firstChar === 'ん') return 'ん';
    
    // 片假名處理（轉換為對應平假名）
    if (firstChar >= 'ア' && firstChar <= 'ン') {
      const hiraganaChar = String.fromCharCode(firstChar.charCodeAt(0) - 0x30A1 + 0x3041);
      return this.getGroupLabel(hiraganaChar);
    }
    
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
      // 精細五十音分組順序
      const kanaGroups = [
        'あ', 'い', 'う', 'え', 'お',
        'か', 'き', 'く', 'け', 'こ',
        'さ', 'し', 'す', 'せ', 'そ',
        'た', 'ち', 'つ', 'て', 'と',
        'な', 'に', 'ぬ', 'ね', 'の',
        'は', 'ひ', 'ふ', 'へ', 'ほ',
        'ま', 'み', 'む', 'め', 'も',
        'や', 'ゆ', 'よ',
        'ら', 'り', 'る', 'れ', 'ろ',
        'わ', 'ゐ', 'ゑ', 'を', 'ん'
      ];
      
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