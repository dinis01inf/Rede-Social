import { prisma } from '../lib/prisma.js';
import { createNotification } from './notificationServices.js';
import type { ILLMProvider } from "./llm/ILLMProvider.js";

//verifica se userId segue o criador do evento
const isFollowing = async (userId: number, createdBy: number): Promise<boolean> => {
    const follow = await prisma.userFollow.findFirst({
        where: { followerId: userId, followingId: createdBy }
    });
    return follow !== null;
};

//verifica se o utilizador pode ver o evento (público, ou privado e segue o criador)
const canViewEvent = async (userId: number, eventCreatedBy: number, visibility: boolean): Promise<boolean> => {
    if (visibility) return true;
    return isFollowing(userId, eventCreatedBy);
};


export const findAllEvents = async () => {
  const events = await prisma.events.findMany({
    // Ao apagar o 'where', o Prisma traz todos os eventos da base de dados!
    include: {
      categoria: true,
      _count: { select: { followed: true } }
    }
  });
  return events;
};


export const createEvent = async (createdBy: number ,categoria: number ,name: string, local: string | undefined, description: string, startDate: Date, endDate: Date, objectivesList: string[], imageUrl: string) => {
    const objectives = objectivesList.map((s) =>  ({name: s}))
    // "a", "b", "c"
    // {nome: "a"}, {nome: "b"}, {nome: "c"}
    await createNotification({
        userId : createdBy,
        message: `Criaste um evento chamado: ${name}`
    });

    const evento =  await prisma.events.create({
        data: { 
            createdBy: createdBy, 
            categoriaId: categoria, 
            name:name, 
            local: local ?? '',
            description:description,  
            startDate:startDate, 
            endDate:endDate, 
            objectives:  {create : objectives} 
        },
        include:{
            creator:true
        }
    }) 

    //ir buscar os seguidores do criador do evento
    const seguidores = await prisma.userFollow.findMany({
        where: {followingId : createdBy},
        select: { followerId : true},
    })

    //cria uma notificacao para os seguidores do criador do evento
    if(seguidores.length >0) {
        for(const seguidor of seguidores ){
            await prisma.notification.create({
                data :{
                    userId: seguidor.followerId,
                    message: `${evento.creator.fullName} criou um novo evento: ${name}`
                }
            })
        }
    }

    return evento;
};

export const PreencheEvent = async (draftDescription: string, llm: ILLMProvider) => {

  const prompt = `
    Baseando-te na seguinte descrição de um evento: "${draftDescription}"
    Gera os dados estruturados para o evento.
    Deves responder EXCLUSIVAMENTE com um objeto JSON válido (sem blocos de código markdown ou texto explicativo), contendo as seguintes propriedades:
    - "name": Um título curto e apelativo para o evento.
    - "objectives": Um array de strings com 3 a 5 objetivos claros e acionáveis para o utilizador cumprir durante o evento.

    Exemplo de formato de resposta esperado:
    {"name": "Exemplo", "description": "Texto...", "objectives": ["Obj 1", "Obj 2"]}
  `;

  const Response = await llm.generateResponse(prompt);
  try {
    let cleanResponse = Response.trim();

    const backticks = "```";
    if (cleanResponse.startsWith(backticks)) {
        const firstLineBreak = cleanResponse.indexOf('\n');
        if (firstLineBreak !== -1) {
            cleanResponse = cleanResponse.substring(firstLineBreak).trim();
        }

        if (cleanResponse.endsWith(backticks)) {
            cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3).trim();
        }
    }
    
    return JSON.parse(cleanResponse.trim());
  } catch (error) {
    throw new Error("A IA não devolveu um formato JSON válido. Tenta novamente.");
  }
};

export const deleteEvent = async (id: number) => {
    const event = await prisma.events.findUnique({
        where: { id }
    });

    if (!event) {
        throw new Error("EventNotFound");
    }

    return await prisma.events.delete({
        where: { id }
    });
};

export const searchEvent = async (keyword: string) => {
    return await prisma.events.findMany({
        where: { name: { contains: keyword, mode: 'insensitive' } },
        include: { categoria: true }
    });
};

export const getEventById = async (id: number) => {
    return await prisma.events.findUnique({
        where: { id },
        include: {
            categoria: true,
            creator: true,
            objectives: true,
            _count: {
                select: {
                    followed: true }}
        }
    });
};


export const getEventsByUserId = async (userId: number) => {
    return await prisma.events.findMany({
        where:{
            followed:{
                some: {
                    followerId: userId,
                },
            },
        },
        include: {
            categoria: true,
            creator: {
                select: {
                    fullName: true,
                },
            },
            _count: {
                select: {
                    followed: true }}
        },
    });
};

export const logProgress = async (userId: number, eventId: number, objectiveId: number, message: string) => {

    return await prisma.userEventUpdate.upsert({
        where: {
            eventId_userId_objectiveId: {
                eventId,
                userId,
                objectiveId
            }
        },
        update: { message },
        create: {
            eventId,
            userId,
            objectiveId,
            message
        }
    });
};

export const getEventProgress = async (eventId: number) => {
    return await prisma.userEventUpdate.findMany({
        where: { eventId },
        include: {
            user: { select: { fullName: true } },
            objective: { select: { name: true } }
        }
    });
};

export const createProgress = async (userId: number, objectiveId: number, message: string) => {
  const objective = await prisma.objective.findUnique({
    where: { id: objectiveId },
    select: { eventId: true }
  });

  if (!objective) throw new Error("ObjectiveNotFound");

  return await prisma.userEventUpdate.create({
    data: {
      userId: userId,
      eventId: objective.eventId,
      objectiveId: objectiveId,
      message: message,
    }
  });
};

export const updateEvent = async (eventId: number, name: string, description: string) => {
  const eventoAtualizado = await prisma.events.update({
    where: { 
      id: eventId 
    },
    data: {
      name: name,
      description: description
    }
  });

  return eventoAtualizado;
};
