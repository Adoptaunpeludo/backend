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

export enum statusPet {
  A = 'adopted',
  F = 'fostered',
  R = 'reserved',
  AH = 'awaiting_home',
}

export enum type {
  C = 'cat',
  D = 'dog',
}

export enum gender {
  M = 'male',
  F = 'female',
}

export enum animalSizeEnum {
  S = 'small',
  M = 'medium',
  B = 'big',
  VB = 'very_big',
}

export enum energy {
  L = 'light',
  M = 'moderate',
  H = 'high',
}

export enum potential {
  N = 'none',
  L = 'low',
  M = 'moderate',
  H = 'high',
  E = 'excessive',
}

export enum molting {
  L = 'light',
  M = 'moderate',
  H = 'heavy',
  NS = 'no_shedding',
}

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
  numFavs: number;
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
  shelter?: Shelter;
  city?: City;
  cat: Cat | null;
  dog: Dog | null;
  userFav?: UserFav[];
}

export interface UserFav {
  id: string;
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
  avatar: string[];
  username: string;
  isOnline: boolean;
}

interface Shelter {
  id: string;
  description: string | null;
  cif: string | null;
  legalForms: legalForms | null;
  veterinaryFacilities: boolean | null;
  facilities: string[];
  ownVet: boolean | null;
  images: any[];
  user: User;
}
