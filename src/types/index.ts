// src/types/index.ts
export interface Hazard {
  id: string;
  title: string;
  image: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'extreme';
  category?: 'weather' | 'geological' | 'environmental';
}

export interface User {
  id: string;
  name: string;
  email: string;
  location?: string;
  preferences?: {
    notifications: boolean;
    alertTypes: string[];
  };
}

export interface Alert {
  id: string;
  hazardType: string;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  location: string;
  message: string;
  issuedAt: Date;
  expiresAt?: Date;
}