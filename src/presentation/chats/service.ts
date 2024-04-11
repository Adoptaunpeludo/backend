import { prisma } from '../../data/postgres';
import { NotFoundError } from '../../domain';
import { CreateChatDto } from '../../domain/dtos/chat/create-chat.dto';
import { PayloadUser } from '../../domain/interfaces';
import { QueueService } from '../shared/services';

export class ChatService {
  constructor(private readonly notificationService: QueueService) {}

  /**
   * Extracts data from the chat room string.
   * @param room - The chat room string.
   * @returns Object containing usernames and animal slug.
   */
  private getDataFromRoom(room: string) {
    const parts = room.split('-');
    const shelterUsername = parts.at(0)!;
    const adopterUsername = parts.at(-1)!;
    const animalSlug = parts.slice(0, 2).join('-');

    return { shelterUsername, adopterUsername, animalSlug };
  }

  /**
   * Creates a new chat or returns an existing one.
   * @param user - The user initiating the chat.
   * @param room - The chat room.
   * @returns The created or existing chat.
   * @throws NotFoundError if any user involved in the chat is not found.
   */
  createChat = async (user: PayloadUser, { room }: CreateChatDto) => {
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
        select: { id: true, slug: true, type: true, name: true },
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

    const chatNotificationExist = await prisma.notification.findFirst({
      where: {
        link: `/private/chat/${room}`,
        isRead: false,
      },
    });

    if (chatNotificationExist) return;

    const notification = await prisma.notification.create({
      data: {
        type: 'new-chat',
        message: `El usuario ${adopterUsername.toUpperCase()} quiere chatear contigo${
          animal ? ` sobre el animal ${animal.name.toUpperCase()}.` : '.'
        }`,
        link: `/private/chat/${room}`,
        data: {
          adopterUsername,
          shelterUsername,
          room,
          animal,
        },
        queue: 'new-chat-push-notification',
        userId: shelter.id,
      },
    });

    this.notificationService.addMessageToQueue(
      {
        ...notification,
        username:
          adopterUsername === user.name ? shelterUsername : adopterUsername,
        queue: 'new-chat-push-notification',
      },
      'new-chat-push-notification'
    );

    return newAdoptionChat;
  };

  /**
   * Retrieves the chat history.
   * @param chat - The chat slug.
   * @returns The chat history.
   */
  chatHistory = async (chat: string) => {
    const history = await prisma.chatMessage.findMany({
      where: {
        adoptionChatSlug: chat,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return history;
  };

  /**
   * Retrieves the chats of a user.
   * @param user - The user.
   * @returns The user's chats.
   */
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
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
              },
            },
          },
        },
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

  /**
   * Retrieves a chat.
   * @param user - The user.
   * @param slug - The chat slug.
   * @returns The chat.
   */
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
