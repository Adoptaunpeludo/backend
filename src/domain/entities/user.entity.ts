export class UserEntity {
  constructor(
    public readonly email: string,
    public readonly username: string,
    public readonly avatar: [string],
    public readonly emailValidated: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly phoneNumber?: string,
    public readonly address?: string
  ) {}
}

export class ShelterEntity extends UserEntity {
  constructor(
    email: string,
    username: string,
    avatar: [string],
    emailValidated: boolean,
    createdAt: Date,
    updatedAt: Date,
    public readonly name: string,
    public readonly description: string,
    public readonly socialMedia: string[],
    public readonly role: string,
    phoneNumber?: string,
    address?: string
  ) {
    super(
      email,
      username,
      avatar,
      emailValidated,
      createdAt,
      updatedAt,
      phoneNumber,
      address
    );
  }
}

export class AdopterEntity extends UserEntity {
  constructor(
    email: string,
    username: string,
    avatar: [string],
    emailValidated: boolean,
    createdAt: Date,
    updatedAt: Date,
    public readonly first_name: string,
    public readonly last_name: string,
    public readonly role: string,
    phoneNumber?: string,
    address?: string,
    city?: string
  ) {
    super(
      email,
      username,
      avatar,
      emailValidated,
      createdAt,
      updatedAt,
      phoneNumber,
      address
    );
  }
}
