import { prisma } from '../lib/prisma.js';
import { createNotification } from './notificationServices.js';

//https://www.prisma.io/docs/v6/orm/prisma-client/queries/relation-queries
// parte de connect single records no link!!!!

export const followEvent = async (userId: number, eventId: number) => {
    //notificacao de seguir evento e de aviso de começo e fim de evento
    const event = await prisma.events.findUnique({where: {id:eventId}});
    if (!event) return;
    const dia = 24 * 60 * 60* 1000;
    const agora = Date.now();

    const data1 = new Date(event.startDate).getTime() - dia - agora;
    const data2 = new Date(event.startDate).getTime()  + (new Date(event.endDate).getTime() - new Date(event.startDate).getTime())/2;
    const data3 = new Date(event.endDate).getTime() - dia - agora;

    if (agora === data1){
      await createNotification({
          userId : userId,
          message: `Faltam 24h para o evento: ${event?.name} começar! Prepara-te!`
      });
    }
    if (agora === data2){
      await createNotification({
          userId : userId,
          message: `Já vais a meio do evento: ${event?.name}! Continua o bom trabalho!`
      });
    }
    if (agora === data3){
      await createNotification({
          userId : userId,
          message: `Só faltam 24h para o evento: ${event?.name} acabar! Últimos esforços!`
      });
    }

    await createNotification({
          userId : userId,
          message: `Começas-te a seguir o evento ${event?.name}`
    });

    //notificacao que avisa o criador do evento que alguem começou a seguir o seu evento
    const creatorID = event.createdBy;
    const user = await prisma.user.findUnique({where:{id: userId}});

    await createNotification({
        userId : creatorID,
        message: `${user?.fullName} começou a seguir o teu evento ${event.name}`
    });
    
    //seguir evento
    return await prisma.eventFollows.create({
        data: { follower: { connect: {id:userId}}, event:  { connect: {id:eventId}} }
    });
};
//https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints
//Deleting records by a compound ID or unique constraint
export const unfollowEvent = async(userId: number, eventId:number) =>{
    // notificacao de parar de seguir evento
    const event = await prisma.events.findUnique({where: {id:eventId}});

    await createNotification({
          userId : userId,
          message: `Deixas-te de seguir o evento ${event?.name}`
    });

    //notificacao que avisa o criador do evento que alguem parou de seguir o seu evento
    if(event !== null){
      const creatorID = event.createdBy;
      const user = await prisma.user.findUnique({where:{id: userId}});

      await createNotification({
          userId : creatorID,
          message: `${user?.fullName} deixou de seguir o teu evento ${event.name}`
      });

    }
    
    //parar de seguir evento
    return await prisma.eventFollows.delete({
        where: {
            followerId_eventId: { //nome base que prisma faz de compound ids
                followerId: userId, 
                eventId: eventId, }}
    })
}


//checka se o user ja segue o evento
export const checkEventFollow = async (userId: number, eventId: number) => {
  return await prisma.eventFollows.findUnique({
    where: {
      followerId_eventId: { 
        followerId: userId, 
        eventId: eventId 
      }
    }
  });
};
