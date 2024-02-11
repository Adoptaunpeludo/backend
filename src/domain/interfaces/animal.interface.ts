import { facilities, legalForms } from './user-response.interface';

export type animalSize = 'small' | 'medium' | 'big' | 'very_big';
export type animalEnergy = 'light' | 'moderate' | 'high';
export type animalPotential =
  | 'none'
  | 'low'
  | 'moderate'
  | 'high'
  | 'excessive';

export type animalMolting = 'light' | 'moderate' | 'heavy' | 'no_shedding';

export type animalType = 'cat' | 'dog';

export type animalGender = 'female' | 'male';

export type animalPublishStatus = 'pending' | 'rejected' | 'published';

export interface AnimalResponse {
  id: string;
  gender: animalGender;
  name: string;
  type: animalType;
  slug: string;
  age: number;
  description: string;
  breed: string;
  size: animalSize;
  publishStatus: animalPublishStatus;
  status: string;
  easyTrain: boolean;
  energyLevel: animalEnergy;
  moltingAmount: animalMolting;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  adoptedBy: string | null;
  createdBy: string;
  cityId: number;
  shelter: Shelter;
  city: City;
  cat: Cat | null;
  dog: Dog | null;
}

export interface Cat {
  id: string;
  playLevel: string;
  kidsFriendly: boolean;
  toiletTrained: boolean;
  scratchPotential: string;
}

interface City {
  id: number;
  name: string;
}

export interface Dog {
  id: string;
  departmentAdapted: boolean;
  droolingPotential: string;
  bark: string;
}

export interface User {
  avatar: string;
  username: string;
}

interface Shelter {
  id: string;
  description: string;
  cif: string;
  legalForms: legalForms | null;
  veterinaryFacilities: boolean | null;
  facilities: facilities | null;
  ownVet: boolean | null;
  images: any[];
  user: User;
}
