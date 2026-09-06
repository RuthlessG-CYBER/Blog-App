import prisma from '../config/database';

export const getNotifications = async (userId: string, query: any) => {
  const { page = 1, limit = 15 } = query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Math.min(Number(limit), 50);

  const [notifications, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: { id: true, name: true, profileImage: true },
        },
        post: {
          select: { id: true, title: true, imageUrl: true },
        }
      }
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return {
    notifications,
    pagination: {
      page: Number(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
};

export const markAsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
