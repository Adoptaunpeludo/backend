import { prisma } from '../../data/postgres';
import { NotFoundError } from '../../domain';
import { PayloadUser } from '../../domain/interfaces';

export class ChatService {
  constructor() {}

  userChats = async (user: PayloadUser) => {
    const chats = await prisma.adoptionChat.findMany({
      where: {
        OR: [
          {
            adopterUsername: user.role === 'adopter' ? user.name : undefined,
          },
          {
            shelterUsername: user.role === 'shelter' ? user.name : undefined,
          },
        ],
      },
      include: {
        messages: true,
        users: {
          where: {
            role: {
              not: user.role,
            },
          },
          select: {
            avatar: true,
            username: true,
          },
        },
        animal: {
          select: {
            name: true,
            images: true,
          },
        },
      },
    });

    return chats;
  };

  getChat = async (user: PayloadUser, slug: string) => {
    const chat = await prisma.adoptionChat.findUnique({
      where: {
        slug,
      },
      include: {
        users: {
          where: {
            role: {
              not: user.role,
            },
          },
          select: { username: true, avatar: true },
        },
      },
    });

    if (!chat) throw new NotFoundError('Chat not found');

    return chat;
  };
}