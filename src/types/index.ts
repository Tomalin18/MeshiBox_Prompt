export interface BusinessCard {
  id: string;
  name: string;
  nameReading?: string;
  company: string;
  companyReading?: string;
  department?: string;
  position?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  email?: string;
  subEmail?: string;
  website?: string;
  address?: string;
  postalCode?: string;
  companyId?: string;
  lineAccount?: string;
  memo?: string;
  imageUri?: string;
  thumbnailUri?: string;
  createdAt: Date;
  updatedAt: Date;
  isRedCarpet?: boolean;
  language?: 'ja' | 'en' | 'zh';
  tags?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionStatus: 'free' | 'trial' | 'premium';
  subscriptionEndDate?: Date;
  createdAt: Date;
}

export interface CameraSettings {
  flashMode: 'off' | 'on' | 'auto';
  orientation: 'landscape' | 'portrait';
  quality: number;
}

export interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
    push: (screen: string, params?: any) => void;
    pop: () => void;
    replace: (screen: string, params?: any) => void;
  };
  route: {
    params?: any;
    name: string;
  };
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ExportOptions {
  format: 'csv' | 'vcard' | 'json' | 'contacts';
  includeImages: boolean;
  selectedCards?: string[];
}

export interface SearchFilters {
  query?: string;
  company?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
} 