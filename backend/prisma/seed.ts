import { prisma } from '../src/lib/prisma.js';

async function main() {
  console.log('🧹 A limpar a base de dados para evitar conflitos...');
  
  // Eliminar dados antigos respeitando a integridade referencial
  await prisma.userEventUpdate.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.objective.deleteMany();
  await prisma.eventFollows.deleteMany();
  await prisma.events.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.userFollow.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 A semear a nova estrutura da base de dados...');

  // ---------------------------------------------------------
  // 1. CRIAR AS 5 CATEGORIAS ANTERIORES
  // ---------------------------------------------------------
  const catMusica = await prisma.categoria.create({ data: { nome: 'Música' } });
  const catWorkshop = await prisma.categoria.create({ data: { nome: 'Workshop' } });
  const catCulinaria = await prisma.categoria.create({ data: { nome: 'Culinária' } });
  const catDesporto = await prisma.categoria.create({ data: { nome: 'Desporto' } });
  const catOutros = await prisma.categoria.create({ data: { nome: 'Outros' } });

  console.log('✅ 5 Categorias base criadas.');

  // ---------------------------------------------------------
  // 2. CRIAR MAIS UTILIZADORES (Ambiente mais populado)
  // ---------------------------------------------------------
  const userAna = await prisma.user.create({
    data: { fullName: 'Ana Silva', email: 'ana@app.pt', password: '123' }
  });
  
  const userCarlos = await prisma.user.create({
    data: { fullName: 'Carlos Mendes', email: 'carlos@app.pt', password: '123' }
  });
  
  const userBeatriz = await prisma.user.create({
    data: { fullName: 'Beatriz Costa', email: 'beatriz@app.pt', password: '123' }
  });

  const userJoao = await prisma.user.create({
    data: { fullName: 'Rui Pedro', email: 'rui@app.pt', password: '123' }
  });

  const userMariana = await prisma.user.create({
    data: { fullName: 'Mariana Rocha', email: 'mariana@app.pt', password: '123' }
  });

  console.log('✅ Utilizadores registados na base de dados.');

  // ---------------------------------------------------------
  // 3. REDE SOCIAL: SEGUIDORES INTERLIGADOS (UserFollow)
  // ---------------------------------------------------------
  await prisma.userFollow.createMany({
    data: [
      // O João segue a Ana e o Carlos
      { followerId: userJoao.id, followingId: userAna.id },
      { followerId: userJoao.id, followingId: userCarlos.id },
      
      // A Ana segue o João de volta e também a Mariana
      { followerId: userAna.id, followingId: userJoao.id },
      { followerId: userAna.id, followingId: userMariana.id },
      
      // O Carlos segue o João
      { followerId: userCarlos.id, followingId: userJoao.id },
      
      // A Beatriz segue a Ana e a Mariana
      { followerId: userBeatriz.id, followingId: userAna.id },
      { followerId: userBeatriz.id, followingId: userMariana.id },
    ]
  });

  console.log('✅ Conexões sociais estabelecidas.');

  // ---------------------------------------------------------
  // 4. CRIAR EVENTOS (Sem o campo de visibilidade)
  // ---------------------------------------------------------
  const eventHackathon = await prisma.events.create({
    data: {
      name: 'Hackathon WebDev 2026',
      description: 'Maratona de programação de 24 horas para construir um sistema distribuído em React e Express.',
      local: 'Campo Grande',
      startDate: new Date('2026-05-30T09:00:00Z'),
      endDate: new Date('2026-05-31T09:00:00Z'),
      categoriaId: catWorkshop.id,
      createdBy: userAna.id
    }
  });

  const eventPadel = await prisma.events.create({
    data: {
      name: 'Torneio de Padel Amigável',
      description: 'Torneio de pares ao final da tarde. Venham treinar os smashs!',
      local: 'Seixal',
      startDate: new Date('2026-05-31T18:00:00Z'),
      endDate: new Date('2026-06-01T21:00:00Z'),
      categoriaId: catDesporto.id,
      createdBy: userCarlos.id
    }
  });

  const eventSushi = await prisma.events.create({
    data: {
      name: 'Workshop de Sushi em Casa',
      description: 'Aprende a preparar peças de h穩定maki, uramaki e nigiri do zero com um chef convidado.',
      local: 'Amora',
      startDate: new Date('2026-07-02T19:30:00Z'),
      endDate: new Date('2026-07-02T22:30:00Z'),
      categoriaId: catCulinaria.id,
      createdBy: userMariana.id
    }
  });

  const eventJazz = await prisma.events.create({
    data: {
      name: 'Jam Session de Jazz ao Vivo',
      description: 'Concerto intimista com músicos locais e palco aberto para improvisação de final de semestre.',
      local: 'Lisboa',
      startDate: new Date('2026-06-28T21:00:00Z'),
      endDate: new Date('2026-06-29T00:00:00Z'),
      categoriaId: catMusica.id,
      createdBy: userJoao.id
    }
  });

  console.log('✅ Eventos criados e mapeados por categorias.');

  // ---------------------------------------------------------
  // 5. ADICIONAR OBJETIVOS AOS EVENTOS
  // ---------------------------------------------------------
  const objDb = await prisma.objective.create({ 
    data: { eventId: eventHackathon.id, name: 'Sincronizar o Schema com a Seed' } 
  });
  const objApi = await prisma.objective.create({ 
    data: { eventId: eventHackathon.id, name: 'Validar os Tokens no Middleware' } 
  });
  const objPadel = await prisma.objective.create({ 
    data: { eventId: eventPadel.id, name: 'Completar a fase de grupos' } 
  });
  const objArroz = await prisma.objective.create({ 
    data: { eventId: eventSushi.id, name: 'Acertar no ponto de cozedura do arroz Shari' } 
  });

  // ---------------------------------------------------------
  // 6. INSCRIÇÕES NOS EVENTOS (eventFollows)
  // ---------------------------------------------------------
  await prisma.eventFollows.createMany({
    data: [
      // Inscrições no Hackathon da Ana
      { followerId: userJoao.id, eventId: eventHackathon.id },
      { followerId: userCarlos.id, eventId: eventHackathon.id },
      { followerId: userBeatriz.id, eventId: eventHackathon.id },
      
      // Inscrições no Padel do Carlos
      { followerId: userJoao.id, eventId: eventPadel.id },
      { followerId: userAna.id, eventId: eventPadel.id },
      
      // Inscrições no Sushi da Mariana
      { followerId: userAna.id, eventId: eventSushi.id },
      { followerId: userBeatriz.id, eventId: eventSushi.id },
      
      // Inscrições no Jazz do João
      { followerId: userCarlos.id, eventId: eventJazz.id },
      { followerId: userMariana.id, eventId: eventJazz.id },
    ]
  });

  console.log('✅ Inscrições e participações associadas.');

  // ---------------------------------------------------------
  // 7. SIMULAR EVOLUÇÃO (Updates e Notificações)
  // ---------------------------------------------------------
  await prisma.userEventUpdate.create({
    data: {
      eventId: eventHackathon.id,
      userId: userJoao.id,
      objectiveId: objDb.id,
      message: 'O script de seed foi totalmente reconfigurado e os dados já aparecem sem erros no frontend!'
    }
  });

  await prisma.notification.create({
    data: {
      userId: userAna.id,
      message: 'João Pedro publicou uma atualização de progresso no teu evento Hackathon WebDev 2026.',
      read: false
    }
  });

  console.log('🚀 Base de dados populada com sucesso com um ecossistema realista!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });