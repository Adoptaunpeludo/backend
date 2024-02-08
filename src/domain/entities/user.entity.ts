import { UserResponse } from '../../interfaces/user-response.interface';

export class UserEntity {
  static fromObject(userResponse: UserResponse) {
    let userEntity = {};

    const user = {
      id: userResponse.id,
      email: userResponse.email,
      username: userResponse.username || '',
      emailValidated: userResponse.emailValidated,
      role: userResponse.role,
      verifiedAt: userResponse.verifiedAt,
      createdAt: userResponse.createdAt,
      updatedAt: userResponse.updatedAt,
      avatar: userResponse.avatar,
      phoneNumber: userResponse.contactInfo?.phoneNumber || '',
      address: userResponse.contactInfo?.address || '',
      city: userResponse.contactInfo?.city?.name || null,
    };

    switch (userResponse.role) {
      case 'shelter':
        userEntity = {
          ...user,
          username: userResponse.username,
          description: userResponse.shelter?.description,
          // animals:
          //   userResponse.shelter?.animals.map((media) => ({
          //     name: media.name,
          //     url: media.url,
          //   })) || [],
          socialMedia:
            userResponse.shelter?.socialMedia.map((media) => ({
              name: media.name,
              url: media.url,
            })) || [],
        };
        break;

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
