import { UserResponse } from '../interfaces/user-response.interface';

export class UserEntity {
  static fromObject(userResponse: UserResponse) {
    const {
      password,
      verificationToken,
      passwordToken,
      shelter,
      contactInfo,
      admin,
      ...commonUser
    } = userResponse;

    let userEntity = {};

    const user = {
      ...commonUser,
      phoneNumber: contactInfo?.phoneNumber,
      address: contactInfo?.address,
      city: contactInfo?.city?.name,
    };

    switch (userResponse.role) {
      case 'shelter':
        userEntity = {
          ...user,
          description: shelter?.description,
          cif: shelter?.cif,
          legalForms: shelter?.legalForms,
          veterinaryFacilities: shelter?.veterinaryFacilities,
          facilities: shelter?.facilities,
          ownVet: shelter?.ownVet,
          images: shelter?.images,
          socialMedia:
            shelter?.socialMedia.map((media) => ({
              name: media.name,
              url: media.url,
            })) || [],

          animals: shelter?.animals.map((animal) => ({
            ...animal,
          })),
        };
        break;

      case 'adopter':
        userEntity = user;

      case 'admin':
        userEntity = {
          ...user,
          name: userResponse.admin?.name,
        };
        break;
    }

    return userEntity;
  }
}
