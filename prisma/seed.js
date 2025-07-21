import { PrismaClient } from '@prisma/client';
import { PasswordUtils } from '../src/utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpar dados existentes
  await prisma.taskCollaboration.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuários
  const hashedPassword = await PasswordUtils.hash('123456');

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@casewatch.com',
      password: hashedPassword,
      avatar: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=A'
    }
  });

  const john = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@casewatch.com',
      password: hashedPassword,
      avatar: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=J'
    }
  });

  const maria = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@casewatch.com',
      password: hashedPassword,
      avatar: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=M'
    }
  });

  const pedro = await prisma.user.create({
    data: {
      name: 'Pedro Costa',
      email: 'pedro@casewatch.com',
      password: hashedPassword,
      avatar: 'https://via.placeholder.com/150/FFFF00/000000?text=P'
    }
  });

  console.log('✅ Usuários criados');

  // Criar categorias
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Desenvolvimento',
        description: 'Tarefas relacionadas ao desenvolvimento de software',
        color: '#007ACC',
        userId: admin.id
      }
    }),
    prisma.category.create({
      data: {
        name: 'Design',
        description: 'Tarefas de design e UX/UI',
        color: '#FF6B6B',
        userId: admin.id
      }
    }),
    prisma.category.create({
      data: {
        name: 'Marketing',
        description: 'Campanhas e estratégias de marketing',
        color: '#4ECDC4',
        userId: john.id
      }
    }),
    prisma.category.create({
      data: {
        name: 'Vendas',
        description: 'Atividades comerciais e vendas',
        color: '#45B7D1',
        userId: maria.id
      }
    }),
    prisma.category.create({
      data: {
        name: 'Suporte',
        description: 'Atendimento ao cliente e suporte técnico',
        color: '#96CEB4',
        userId: pedro.id
      }
    })
  ]);

  console.log('✅ Categorias criadas');

  // Criar tarefas
  const tasks = await Promise.all([
    // Tarefas de Desenvolvimento
    prisma.task.create({
      data: {
        title: 'Implementar autenticação JWT',
        description: 'Desenvolver sistema completo de autenticação com JWT incluindo registro, login e refresh tokens.',
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: new Date('2024-01-15'),
        ownerId: admin.id,
        categoryId: categories[0].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Criar API de tarefas',
        description: 'Implementar CRUD completo para gerenciamento de tarefas com filtros e paginação.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2024-01-25'),
        ownerId: john.id,
        categoryId: categories[0].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Configurar testes unitários',
        description: 'Configurar Jest e implementar testes para todos os serviços e controllers.',
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: new Date('2024-02-01'),
        ownerId: john.id,
        categoryId: categories[0].id
      }
    }),

    // Tarefas de Design
    prisma.task.create({
      data: {
        title: 'Criar wireframes do dashboard',
        description: 'Desenvolver wireframes detalhados para o dashboard principal da aplicação.',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        dueDate: new Date('2024-01-10'),
        ownerId: maria.id,
        categoryId: categories[1].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Design system components',
        description: 'Criar biblioteca de componentes reutilizáveis seguindo o design system.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2024-01-30'),
        ownerId: maria.id,
        categoryId: categories[1].id
      }
    }),

    // Tarefas de Marketing
    prisma.task.create({
      data: {
        title: 'Campanha de lançamento',
        description: 'Planejar e executar campanha de marketing para o lançamento do produto.',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: new Date('2024-02-15'),
        ownerId: pedro.id,
        categoryId: categories[2].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Análise de concorrência',
        description: 'Realizar análise detalhada dos principais concorrentes no mercado.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date('2024-01-20'),
        ownerId: pedro.id,
        categoryId: categories[2].id
      }
    }),

    // Tarefas de Vendas
    prisma.task.create({
      data: {
        title: 'Apresentação para investidores',
        description: 'Preparar pitch deck e apresentação para rodada de investimento.',
        status: 'PENDING',
        priority: 'URGENT',
        dueDate: new Date('2024-01-18'),
        ownerId: admin.id,
        categoryId: categories[3].id
      }
    }),

    // Tarefas de Suporte
    prisma.task.create({
      data: {
        title: 'Documentação da API',
        description: 'Criar documentação completa da API com exemplos e casos de uso.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date('2024-01-28'),
        ownerId: john.id,
        categoryId: categories[4].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'FAQ do sistema',
        description: 'Desenvolver seção de perguntas frequentes para usuários.',
        status: 'PENDING',
        priority: 'LOW',
        dueDate: new Date('2024-02-05'),
        ownerId: maria.id,
        categoryId: categories[4].id
      }
    })
  ]);

  console.log('✅ Tarefas criadas');

  // Criar atribuições de tarefas
  await Promise.all([
    // João sendo atribuído à tarefa de API
    prisma.taskAssignment.create({
      data: {
        taskId: tasks[1].id, // API de tarefas
        userId: john.id
      }
    }),
    
    // Maria sendo atribuída ao design system
    prisma.taskAssignment.create({
      data: {
        taskId: tasks[4].id, // Design system
        userId: maria.id
      }
    }),

    // Pedro sendo atribuído à campanha
    prisma.taskAssignment.create({
      data: {
        taskId: tasks[5].id, // Campanha de lançamento
        userId: pedro.id
      }
    }),

    // Admin sendo atribuído à documentação
    prisma.taskAssignment.create({
      data: {
        taskId: tasks[8].id, // Documentação da API
        userId: admin.id
      }
    })
  ]);

  console.log('✅ Atribuições criadas');

  // Criar colaborações
  await Promise.all([
    // Colaboração no desenvolvimento da API
    prisma.taskCollaboration.create({
      data: {
        taskId: tasks[1].id,
        userId: maria.id, // Maria colaborando no desenvolvimento
        role: 'EDITOR',
        acceptedAt: new Date()
      }
    }),

    // Colaboração no design system
    prisma.taskCollaboration.create({
      data: {
        taskId: tasks[4].id,
        userId: john.id, // João colaborando no design
        role: 'VIEWER',
        acceptedAt: new Date()
      }
    }),

    // Colaboração na campanha de marketing
    prisma.taskCollaboration.create({
      data: {
        taskId: tasks[5].id,
        userId: maria.id, // Maria colaborando no marketing
        role: 'EDITOR'
        // Não aceita ainda (acceptedAt será null)
      }
    }),

    // Colaboração na apresentação para investidores
    prisma.taskCollaboration.create({
      data: {
        taskId: tasks[7].id,
        userId: john.id, // João colaborando na apresentação
        role: 'EDITOR',
        acceptedAt: new Date()
      }
    }),
    prisma.taskCollaboration.create({
      data: {
        taskId: tasks[7].id,
        userId: maria.id, // Maria colaborando na apresentação
        role: 'VIEWER',
        acceptedAt: new Date()
      }
    }),

    // Colaboração na documentação
    prisma.taskCollaboration.create({
      data: {
        taskId: tasks[8].id,
        userId: pedro.id, // Pedro colaborando na documentação
        role: 'EDITOR'
        // Pendente de aceitação
      }
    }),

    // Admin como admin em várias tarefas
    prisma.taskCollaboration.create({
      data: {
        taskId: tasks[1].id,
        userId: admin.id, // Admin supervisionando API
        role: 'ADMIN',
        acceptedAt: new Date()
      }
    }),
    prisma.taskCollaboration.create({
      data: {
        taskId: tasks[4].id,
        userId: admin.id, // Admin supervisionando design
        role: 'ADMIN',
        acceptedAt: new Date()
      }
    })
  ]);

  console.log('✅ Colaborações criadas');

  // Estatísticas finais
  const userCount = await prisma.user.count();
  const categoryCount = await prisma.category.count();
  const taskCount = await prisma.task.count();
  const assignmentCount = await prisma.taskAssignment.count();
  const collaborationCount = await prisma.taskCollaboration.count();

  console.log('\n📊 Dados criados com sucesso:');
  console.log(`👥 Usuários: ${userCount}`);
  console.log(`📁 Categorias: ${categoryCount}`);
  console.log(`📋 Tarefas: ${taskCount}`);
  console.log(`📌 Atribuições: ${assignmentCount}`);
  console.log(`🤝 Colaborações: ${collaborationCount}`);

  console.log('\n🔐 Credenciais de teste:');
  console.log('Admin: admin@casewatch.com / 123456');
  console.log('João: joao@casewatch.com / 123456');
  console.log('Maria: maria@casewatch.com / 123456');
  console.log('Pedro: pedro@casewatch.com / 123456');

  console.log('\n📋 Status das tarefas:');
  console.log('PENDING: 4 tarefas');
  console.log('IN_PROGRESS: 4 tarefas');  
  console.log('COMPLETED: 2 tarefas');

  console.log('\n🎯 Prioridades:');
  console.log('URGENT: 1 tarefa');
  console.log('HIGH: 4 tarefas');
  console.log('MEDIUM: 4 tarefas');
  console.log('LOW: 1 tarefa');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✅ Seed executado com sucesso!');
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });