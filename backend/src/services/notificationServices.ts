import { prisma } from '../lib/prisma.js';

export const createNotification = async (data : { userId: number; message: string}) => {
    return await prisma.notification.create({
        data:{
            userId: data.userId,
            message: data.message,
        },
    });
};

export const getByUserId = async (userId : number) => {
    return await prisma.notification.findMany({
        where: { userId},
        orderBy: {createdAt: 'desc'},
    });
};

export const readNotifById = async (notifId: number) => {
    return prisma.notification.update({
        where:{id: notifId},
        data:{read: true},
    });
}

export const deleteNotification = async (id: number) => {
  return await prisma.notification.delete({
    where: {
      id: id,
    },
  });
};