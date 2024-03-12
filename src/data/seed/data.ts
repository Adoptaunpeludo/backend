import { BcryptAdapter } from '../../config';
import {
  facilities,
  legalForms,
} from '../../domain/interfaces/user-response.interface';

interface Cat {
  playLevel: 'none' | 'low' | 'moderate' | 'high' | 'excessive';
  kidsFriendly: boolean;
  scratchPotential: 'none' | 'low' | 'moderate' | 'high' | 'excessive';
  toiletTrained: boolean;
}

interface Dog {
  departmentAdapted: boolean;
  droolingPotential: 'none' | 'low' | 'moderate' | 'high' | 'excessive';
  bark: 'none' | 'low' | 'moderate' | 'high' | 'excessive';
}

interface Animal {
  name: string;
  age: number;
  description: string;
  breed: string;
  size: 'small' | 'medium' | 'big' | 'very_big';
  publishStatus: 'pending' | 'rejected' | 'published';
  cityId: number;
  easyTrain: boolean;
  energyLevel: 'light' | 'moderate' | 'high';
  moltingAmount: 'light' | 'moderate' | 'heavy' | 'no_shedding';
  status: 'adopted' | 'fostered' | 'reserved' | 'awaiting_home';
  type: 'cat' | 'dog';
  gender: 'male' | 'female';
  images: string[];
  cat?: Cat;
  dog?: Dog;
}

interface ContactInfo {
  phoneNumber: string;
  cityId: number;
}

interface SocialMedia {
  name: 'facebook' | 'xtweet' | 'instagram';
  url: string;
}

interface Shelter {
  description: string;
  cif: string;
  facilities:
    | 'foster_homes'
    | 'municipal_or_public_facilities'
    | 'leased_facilities'
    | 'owned_facilities'
    | 'private_residences';
  legalForms:
    | 'association'
    | 'public_utility_association'
    | 'autonomous_foundation'
    | 'national_foundation'
    | 'other';
  ownVet: boolean;
  veterinaryFacilities: boolean;
  socialMedia: SocialMedia[];
}

interface User {
  email: string;
  password: string;
  username: string;
  emailValidated: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  avatar?: string;
  role: 'shelter' | 'adopter' | 'admin';
  dni?: string;
  firstName?: string;
  lastName?: string;
  verifiedAt?: string | Date | null;
  contactInfo: ContactInfo;
  shelter?: Shelter;
}

export const animals: Animal[] = [
  {
    name: 'Felix',
    age: 2,
    description: 'Friendly and playful',
    breed: 'Siamese',
    size: 'small',
    publishStatus: 'published',
    cityId: 1,
    easyTrain: true,
    energyLevel: 'moderate',
    moltingAmount: 'light',
    status: 'awaiting_home',
    type: 'cat',
    gender: 'male',
    images: [
      'siamese/felix1.webp',
      'siamese/felix2.webp',
      'siamese/felix3.webp',
      'siamese/felix4.webp',
    ],
    cat: {
      playLevel: 'moderate',
      kidsFriendly: true,
      scratchPotential: 'moderate',
      toiletTrained: true,
    },
  },
  {
    name: 'Luna',
    age: 1.5,
    description: 'Sweet and affectionate',
    breed: 'Maine Coon',
    size: 'medium',
    publishStatus: 'published',
    cityId: 2,
    easyTrain: false,
    energyLevel: 'high',
    moltingAmount: 'moderate',
    status: 'awaiting_home',
    type: 'cat',
    gender: 'female',
    images: [
      'maine-coon/luna1.webp',
      'maine-coon/luna2.webp',
      'maine-coon/luna3.webp',
    ],
    cat: {
      playLevel: 'low',
      kidsFriendly: false,
      scratchPotential: 'high',
      toiletTrained: false,
    },
  },
  {
    name: 'Simba',
    age: 3,
    description: 'Independent and curious',
    breed: 'Bengal',
    size: 'medium',
    publishStatus: 'published',
    cityId: 3,
    easyTrain: true,
    energyLevel: 'moderate',
    moltingAmount: 'light',
    status: 'awaiting_home',
    type: 'cat',
    gender: 'male',
    images: ['bengal/simba1.webp', 'bengal/simba2.webp', 'bengal/simba3.webp'],
    cat: {
      playLevel: 'high',
      kidsFriendly: true,
      scratchPotential: 'low',
      toiletTrained: true,
    },
  },
  {
    name: 'Milo',
    age: 1,
    description: 'Playful and adventurous',
    breed: 'Persian',
    size: 'small',
    publishStatus: 'published',
    cityId: 4,
    easyTrain: true,
    energyLevel: 'high',
    moltingAmount: 'light',
    status: 'awaiting_home',
    type: 'cat',
    gender: 'male',
    images: ['persian/milo1.webp', 'persian/milo2.webp', 'persian/milo3.webp'],
    cat: {
      playLevel: 'moderate',
      kidsFriendly: false,
      scratchPotential: 'high',
      toiletTrained: true,
    },
  },
  {
    name: 'Whiskers',
    age: 2.5,
    description: 'Gentle and calm',
    breed: 'Sphynx',
    size: 'big',
    publishStatus: 'published',
    cityId: 5,
    easyTrain: false,
    energyLevel: 'moderate',
    moltingAmount: 'no_shedding',
    status: 'awaiting_home',
    type: 'cat',
    gender: 'female',
    images: [
      'sphynx/whiskers1.webp',
      'sphynx/whiskers2.webp',
      'sphynx/whiskers3.webp',
    ],
    cat: {
      playLevel: 'low',
      kidsFriendly: true,
      scratchPotential: 'moderate',
      toiletTrained: false,
    },
  },
  {
    name: 'Buddy',
    age: 2,
    description: 'Friendly and loyal',
    breed: 'Boxer',
    size: 'big',
    publishStatus: 'published',
    cityId: 6,
    easyTrain: true,
    energyLevel: 'high',
    moltingAmount: 'moderate',
    status: 'awaiting_home',
    type: 'dog',
    gender: 'male',
    images: [
      'boxer/buddy1.webp',
      'boxer/buddy2.webp',
      'boxer/buddy3.webp',
      'boxer/buddy4.webp',
    ],
    dog: {
      departmentAdapted: true,
      droolingPotential: 'none',
      bark: 'moderate',
    },
  },
  {
    name: 'Daisy',
    age: 3,
    description: 'Energetic and playful',
    breed: 'Dachshund',
    size: 'big',
    publishStatus: 'published',
    cityId: 7,
    easyTrain: false,
    energyLevel: 'high',
    moltingAmount: 'heavy',
    status: 'awaiting_home',
    type: 'dog',
    gender: 'female',
    images: ['dachshund/daisy1.webp', 'dachshund/daisy2.webp'],
    dog: {
      departmentAdapted: false,
      droolingPotential: 'low',
      bark: 'excessive',
    },
  },
  {
    name: 'Rocky',
    age: 2,
    description: 'Adventurous and playful',
    breed: 'Golden Retriever',
    size: 'big',
    publishStatus: 'published',
    cityId: 8,
    easyTrain: true,
    energyLevel: 'high',
    moltingAmount: 'moderate',
    status: 'awaiting_home',
    type: 'dog',
    gender: 'male',
    images: ['golden/rocky1.webp', 'golden/rocky2.webp', 'golden/rocky3.webp'],
    dog: {
      departmentAdapted: true,
      droolingPotential: 'none',
      bark: 'low',
    },
  },
  {
    name: 'Lucy',
    age: 1.5,
    description: 'Affectionate and friendly',
    breed: 'Beagle',
    size: 'medium',
    publishStatus: 'published',
    cityId: 9,
    easyTrain: true,
    energyLevel: 'moderate',
    moltingAmount: 'moderate',
    status: 'awaiting_home',
    type: 'dog',
    gender: 'female',
    images: ['beagle/lucy1.webp', 'beagle/lucy2.webp', 'beagle/lucy3.webp'],
    dog: {
      departmentAdapted: false,
      droolingPotential: 'moderate',
      bark: 'moderate',
    },
  },
  {
    name: 'Max',
    age: 2,
    description: 'Playful and energetic',
    breed: 'Siberian Husky',
    size: 'big',
    publishStatus: 'published',
    cityId: 10,
    easyTrain: false,
    energyLevel: 'high',
    moltingAmount: 'heavy',
    status: 'awaiting_home',
    type: 'dog',
    gender: 'male',
    images: [
      'husky/max1.webp',
      'husky/max2.webp',
      'husky/max3.webp',
      'husky/max4.webp',
    ],
    dog: {
      departmentAdapted: true,
      droolingPotential: 'low',
      bark: 'low',
    },
  },
];

export const users: User[] = [
  {
    email: 'shelter1@example.com',
    password: 'shelter1password',
    username: 'shelter1',
    emailValidated: true,
    createdAt: '2024-03-12T00:00:00Z',
    updatedAt: '2024-03-12T00:00:00Z',
    role: 'shelter',
    dni: '77777777X',
    firstName: 'Shelter',
    lastName: 'One',
    verifiedAt: null,
    contactInfo: {
      phoneNumber: '+3466666667',
      cityId: 7,
    },
    shelter: {
      description: 'Description Shelter One',
      cif: 'N77777777',
      facilities: 'foster_homes',
      legalForms: 'association',
      ownVet: true,
      veterinaryFacilities: false,
      socialMedia: [
        {
          name: 'facebook',
          url: 'shelter1.facebook.com',
        },
        {
          name: 'xtweet',
          url: 'shelter1.xteet.com',
        },
        {
          name: 'instagram',
          url: 'shelter1.instagram.com',
        },
      ],
    },
  },
  {
    email: 'shelter2@example.com',
    password: 'shelter2password',
    username: 'shelter2',
    emailValidated: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'shelter',
    dni: '77777778X',
    firstName: 'Shelter',
    lastName: 'Two',
    verifiedAt: new Date(),
    contactInfo: {
      phoneNumber: '+34666666666',
      cityId: 27,
    },
    shelter: {
      description: 'Description Shelter Two',
      cif: 'N77777778',
      facilities: 'leased_facilities',
      legalForms: 'public_utility_association',
      ownVet: false,
      veterinaryFacilities: true,
      socialMedia: [
        {
          name: 'facebook',
          url: 'shelter2.facebook.com',
        },
        {
          name: 'xtweet',
          url: 'shelter2.xteet.com',
        },
        {
          name: 'instagram',
          url: 'shelter2.instagram.com',
        },
      ],
    },
  },
  {
    email: 'adopter1@example.com',
    password: 'adopter1password',
    username: 'adopter1',
    emailValidated: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    avatar: 'avatar.png',
    role: 'adopter',
    dni: '77777779X',
    firstName: 'Adopter',
    lastName: 'One',
    verifiedAt: new Date(),
    contactInfo: {
      phoneNumber: '+34666666668',
      cityId: 32,
    },
  },
  {
    email: 'adopter2@example.com',
    password: 'adopter2password',
    username: 'adopter2',
    emailValidated: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    avatar: 'avatar.png',
    role: 'adopter',
    dni: '77777770X',
    firstName: 'Adopter',
    lastName: 'Two',
    verifiedAt: new Date(),
    contactInfo: {
      phoneNumber: '+34666666669',
      cityId: 40,
    },
  },
];

export const citiesData = [
  {
    parent_code: '01',
    code: '04',
    label: 'Almería',
  },
  {
    parent_code: '01',
    code: '11',
    label: 'Cádiz',
  },
  {
    parent_code: '01',
    code: '14',
    label: 'Córdoba',
  },
  {
    parent_code: '01',
    code: '18',
    label: 'Granada',
  },
  {
    parent_code: '01',
    code: '21',
    label: 'Huelva',
  },
  {
    parent_code: '01',
    code: '23',
    label: 'Jaén',
  },
  {
    parent_code: '01',
    code: '29',
    label: 'Málaga',
  },
  {
    parent_code: '01',
    code: '41',
    label: 'Sevilla',
  },
  {
    parent_code: '02',
    code: '22',
    label: 'Huesca',
  },
  {
    parent_code: '02',
    code: '44',
    label: 'Teruel',
  },
  {
    parent_code: '02',
    code: '50',
    label: 'Zaragoza',
  },
  {
    parent_code: '03',
    code: '33',
    label: 'Asturias',
  },
  {
    parent_code: '04',
    code: '07',
    label: 'Balears, Illes',
  },
  {
    parent_code: '05',
    code: '35',
    label: 'Palmas, Las',
  },
  {
    parent_code: '05',
    code: '38',
    label: 'Santa Cruz de Tenerife',
  },
  {
    parent_code: '06',
    code: '39',
    label: 'Cantabria',
  },
  {
    parent_code: '07',
    code: '05',
    label: 'Ávila',
  },
  {
    parent_code: '07',
    code: '09',
    label: 'Burgos',
  },
  {
    parent_code: '07',
    code: '24',
    label: 'León',
  },
  {
    parent_code: '07',
    code: '34',
    label: 'Palencia',
  },
  {
    parent_code: '07',
    code: '37',
    label: 'Salamanca',
  },
  {
    parent_code: '07',
    code: '40',
    label: 'Segovia',
  },
  {
    parent_code: '07',
    code: '42',
    label: 'Soria',
  },
  {
    parent_code: '07',
    code: '47',
    label: 'Valladolid',
  },
  {
    parent_code: '07',
    code: '49',
    label: 'Zamora',
  },
  {
    parent_code: '08',
    code: '02',
    label: 'Albacete',
  },
  {
    parent_code: '08',
    code: '13',
    label: 'Ciudad Real',
  },
  {
    parent_code: '08',
    code: '16',
    label: 'Cuenca',
  },
  {
    parent_code: '08',
    code: '19',
    label: 'Guadalajara',
  },
  {
    parent_code: '08',
    code: '45',
    label: 'Toledo',
  },
  {
    parent_code: '09',
    code: '08',
    label: 'Barcelona',
  },
  {
    parent_code: '09',
    code: '17',
    label: 'Girona',
  },
  {
    parent_code: '09',
    code: '25',
    label: 'Lleida',
  },
  {
    parent_code: '09',
    code: '43',
    label: 'Tarragona',
  },
  {
    parent_code: '10',
    code: '03',
    label: 'Alicante/Alacant',
  },
  {
    parent_code: '10',
    code: '12',
    label: 'Castellón/Castelló',
  },
  {
    parent_code: '10',
    code: '46',
    label: 'Valencia/València',
  },
  {
    parent_code: '11',
    code: '06',
    label: 'Badajoz',
  },
  {
    parent_code: '11',
    code: '10',
    label: 'Cáceres',
  },
  {
    parent_code: '12',
    code: '15',
    label: 'Coruña, A',
  },
  {
    parent_code: '12',
    code: '27',
    label: 'Lugo',
  },
  {
    parent_code: '12',
    code: '32',
    label: 'Ourense',
  },
  {
    parent_code: '12',
    code: '36',
    label: 'Pontevedra',
  },
  {
    parent_code: '13',
    code: '28',
    label: 'Madrid',
  },
  {
    parent_code: '14',
    code: '30',
    label: 'Murcia',
  },
  {
    parent_code: '15',
    code: '31',
    label: 'Navarra',
  },
  {
    parent_code: '16',
    code: '01',
    label: 'Araba/Álava',
  },
  {
    parent_code: '16',
    code: '48',
    label: 'Bizkaia',
  },
  {
    parent_code: '16',
    code: '20',
    label: 'Gipuzkoa',
  },
  {
    parent_code: '17',
    code: '26',
    label: 'Rioja, La',
  },
  {
    parent_code: '18',
    code: '51',
    label: 'Ceuta',
  },
  {
    parent_code: '19',
    code: '52',
    label: 'Melilla',
  },
];
