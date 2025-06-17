// Form validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\-\+\(\)\s]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePostalCode = (postalCode: string): boolean => {
  const japanesePostalRegex = /^\d{3}-?\d{4}$/;
  return japanesePostalRegex.test(postalCode);
};

// Data formatting utilities
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const formatPostalCode = (postalCode: string): string => {
  const cleaned = postalCode.replace(/\D/g, '');
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return postalCode;
};

// Japanese text utilities
export const getJapaneseInitial = (name: string): string => {
  if (!name) return '';
  
  const firstChar = name.charAt(0);
  
  // Hiragana ranges
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
  
  // Katakana ranges
  if (firstChar >= 'ア' && firstChar <= 'オ') return 'ア';
  if (firstChar >= 'カ' && firstChar <= 'ゴ') return 'カ';
  if (firstChar >= 'サ' && firstChar <= 'ゾ') return 'サ';
  if (firstChar >= 'タ' && firstChar <= 'ド') return 'タ';
  if (firstChar >= 'ナ' && firstChar <= 'ノ') return 'ナ';
  if (firstChar >= 'ハ' && firstChar <= 'ポ') return 'ハ';
  if (firstChar >= 'マ' && firstChar <= 'モ') return 'マ';
  if (firstChar >= 'ヤ' && firstChar <= 'ヨ') return 'ヤ';
  if (firstChar >= 'ラ' && firstChar <= 'ロ') return 'ラ';
  if (firstChar >= 'ワ' && firstChar <= 'ン') return 'ワ';
  
  // For other characters (kanji, alphabet, etc.)
  return firstChar.toUpperCase();
};

export const sortJapaneseNames = (names: string[]): string[] => {
  return names.sort((a, b) => {
    return a.localeCompare(b, 'ja', { numeric: true });
  });
};

// Business card utilities
export const generateCardId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const extractDomainFromEmail = (email: string): string => {
  const parts = email.split('@');
  return parts.length > 1 ? parts[1] : '';
};

export const generateWebsiteFromEmail = (email: string): string => {
  const domain = extractDomainFromEmail(email);
  return domain ? `https://${domain}` : '';
};

// OCR mock utilities (for development)
export const mockOCRExtraction = (imageUri: string) => {
  // Mock OCR data extraction
  return {
    name: '鴨山かほり',
    company: '統一企業集團',
    department: '輸入國內事業部',
    phone: '03-6264-9166',
    mobile: '070-1319-4481',
    fax: '03-6264-9195',
    email: 'k_shigiyama88@ptm-tokyo.co.jp',
    website: 'http://ptm-tokyo.co.jp',
    address: '東京都中央区日本橋小網町3-11 日本橋SOYIC4階',
    postalCode: '103-0016',
  };
};

// Date utilities
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// User subscription utilities
export interface UserSubscription {
  status: 'free' | 'trial' | 'premium';
  remainingScans: number;
  maxScans: number;
  expiryDate?: Date;
  features: {
    unlimitedScans: boolean;
    exportFeatures: boolean;
    cloudSync: boolean;
    advancedOCR: boolean;
  };
}

export const getDefaultSubscription = (): UserSubscription => ({
  status: 'free',
  remainingScans: 50,
  maxScans: 50,
  features: {
    unlimitedScans: false,
    exportFeatures: false,
    cloudSync: false,
    advancedOCR: false,
  },
});

export const getPremiumSubscription = (): UserSubscription => ({
  status: 'premium',
  remainingScans: 999,
  maxScans: 999,
  features: {
    unlimitedScans: true,
    exportFeatures: true,
    cloudSync: true,
    advancedOCR: true,
  },
});

export const getTrialSubscription = (): UserSubscription => ({
  status: 'trial',
  remainingScans: 200,
  maxScans: 200,
  expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  features: {
    unlimitedScans: true,
    exportFeatures: true,
    cloudSync: false,
    advancedOCR: true,
  },
});

export const canUsePremiumFeature = (subscription: UserSubscription, feature: keyof UserSubscription['features']): boolean => {
  return subscription.features[feature];
};

export const getRemainingTrialDays = (subscription: UserSubscription): number => {
  if (subscription.status !== 'trial' || !subscription.expiryDate) {
    return 0;
  }
  const now = new Date();
  const diffTime = subscription.expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// App store utilities
export const openAppStore = (appId?: string) => {
  const url = appId 
    ? `https://apps.apple.com/app/id${appId}`
    : 'https://apps.apple.com/app/id123456789'; // Placeholder
  return url;
};

export const openGooglePlay = (packageName?: string) => {
  const url = packageName
    ? `https://play.google.com/store/apps/details?id=${packageName}`
    : 'https://play.google.com/store/apps/details?id=com.meishibox.app'; // Placeholder
  return url;
};

// Contact utilities
export const getSupportEmail = () => 'support@meishibox.com';
export const getSupportWebsite = () => 'https://meishibox.com/support';
export const getPrivacyPolicyUrl = () => 'https://meishibox.com/privacy';
export const getTermsOfServiceUrl = () => 'https://meishibox.com/terms'; 