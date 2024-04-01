import { prisma } from '../../data/postgres';
import { NotFoundError } from '../../domain';
import { CreateChatDto } from '../../domain/dtos/chat/create-chat.dto';
import { PayloadUser } from '../../domain/interfaces';

export class ChatService {
  constructor() {}

  private getDataFromRoom(room: string) {
    const parts = room.split('-');
    const shelterUsername = parts.at(0)!;
    const adopterUsername = parts.at(-1)!;
    const animalSlug = parts.slice(0, 2).join('-');

    return { shelterUsername, adopterUsername, animalSlug };
  }

  createChat = async ({ room }: CreateChatDto) => {
    const chatExist = await prisma.adoptionChat.findUnique({
      where: {
        slug: room,
      },
    });

    if (chatExist) return chatExist;

    const { adopterUsername, shelterUsername, animalSlug } =
      this.getDataFromRoom(room);

    const [adopter, shelter, animal] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { username: adopterUsername },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { username: shelterUsername },
        select: { id: true },
      }),
      prisma.animal.findUnique({
        where: { slug: animalSlug },
        select: { id: true },
      }),
    ]);

    if (!adopter || !shelter)
      throw new NotFoundError(
        `User ${adopterUsername} or user ${shelterUsername}not found`
      );

    const newAdoptionChat = await prisma.adoptionChat.create({
      data: {
        slug: room,
        adopterUsername,
        shelterUsername,
        users: { connect: [{ id: adopter.id }, { id: shelter.id }] },
        animal: animal ? { connect: { id: animal.id } } : undefined,
      },
    });

    return newAdoptionChat;
  };

  chatHistory = async (chat: string) => {
    const history = await prisma.chatMessage.findMany({
      where: {
        adoptionChatSlug: chat,
      },
    });

    return history;
  };

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

    return chat;
  };
}
