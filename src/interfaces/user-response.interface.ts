export type AllowedMedia = 'facebook' | 'xtweet' | 'instagram';
export type UserRoles = 'admin' | 'adopter' | 'shelter';

export interface UserResponse {
  id: string;
  email: string;
  password: string;
  username: string;
  emailValidated: boolean;
  role: UserRoles;
  verified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  avatar: string;
  admin?: Admin | null;
  adopter?: Adopter | null;
  contactInfo?: ContactInfo | null;
  shelter?: Shelter | null;
}

export interface Admin {
  id: string;
  name: string;
}

export interface Adopter {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ContactInfo {
  id: string;
  phoneNumber: string | null;
  address: string | null;
  cityId: number | null;
  city: City | null;
}

export interface City {
  id: number;
  name: string;
}

export interface Shelter {
  id: string;
  name: string;
  description: string;
  socialMedia: SocialMedia[];
}

export interface SocialMedia {
  id: number;
  name: AllowedMedia;
  url: string;
  shelterId: string;
}
