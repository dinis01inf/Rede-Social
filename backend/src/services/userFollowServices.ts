import { prisma } from '../lib/prisma.js';
import {createNotification } from './notificationServices.js';

//https://www.prisma.io/docs/v6/orm/prisma-client/queries/relation-queries
// parte de connect single records no link!!!!

export const followUser = async (followerId: number, followingId: number) => {
    //notificacao de seguir pessoa
    const follower = await prisma.user.findUnique({where: {id:followerId}});

    await createNotification({
        userId : followingId,
        message: `${follower?.fullName} começou a seguir-te!`
    });

    //seguir pessoa em si
    return await prisma.userFollow.create({
        data: { follower: { connect: {id:followerId}}, following:  { connect: {id:followingId}} }
    });
};

//https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints
//Deleting records by a compound ID or unique constraint
export const unfollowUser = async(followerId: number, followingId:number) =>{
    //notificacao de parar de seguir pessoa
    const follower = await prisma.user.findUnique({where: {id:followerId}});

    await createNotification({
        userId : followingId,
        message: `${follower?.fullName} deixou de seguir-te!`
    });

    //parar de seguir pessoa em si
    return await prisma.userFollow.delete({
        where: { 
            followerId_followingId :{
                followerId: followerId, 
                followingId: followingId,
            } }
    })
}

export const checkUserFollow = async (followerId: number, followingId: number) => {
  return await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId }
    }
  });
};
