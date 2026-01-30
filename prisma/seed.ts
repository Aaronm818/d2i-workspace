import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create team members
  const hashedPassword = await bcrypt.hash('password123', 12);

  const aaron = await prisma.user.upsert({
    where: { email: 'aaron@d2i.dev' },
    update: {},
    create: {
      name: 'Aaron Magana',
      email: 'aaron@d2i.dev',
      password: hashedPassword,
      role: 'AI Engineer',
      avatar: '👨‍💻',
      online: true,
    },
  });

  const markH = await prisma.user.upsert({
    where: { email: 'markh@d2i.dev' },
    update: {},
    create: {
      name: 'Mark Hinderliter',
      email: 'markh@d2i.dev',
      password: hashedPassword,
      role: 'Architect',
      avatar: '🧠',
      online: true,
    },
  });

  const michael = await prisma.user.upsert({
    where: { email: 'michael@d2i.dev' },
    update: {},
    create: {
      name: 'Michael Reynolds',
      email: 'michael@d2i.dev',
      password: hashedPassword,
      role: 'Project Lead Dev',
      avatar: '⚡',
      online: true,
    },
  });

  const markT = await prisma.user.upsert({
    where: { email: 'markt@d2i.dev' },
    update: {},
    create: {
      name: 'Mark Thompson',
      email: 'markt@d2i.dev',
      password: hashedPassword,
      role: 'Frontend',
      avatar: '🎨',
      online: false,
    },
  });

  const adam = await prisma.user.upsert({
    where: { email: 'adam@d2i.dev' },
    update: {},
    create: {
      name: 'Adam Hahn',
      email: 'adam@d2i.dev',
      password: hashedPassword,
      role: 'AI Engineer',
      avatar: '📊',
      online: false,
    },
  });

  console.log('✅ Created team members');

  // Create D2I Project
  const project = await prisma.project.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'D2I Platform',
      description: 'Data to Intelligence - Collaborative development platform',
      phase: 'consensus',
    },
  });

  console.log('✅ Created project');

  // Add project members
  const members = [aaron, markH, michael, markT, adam];
  for (const member of members) {
    await prisma.projectMember.upsert({
      where: {
        userId_projectId: {
          userId: member.id,
          projectId: project.id,
        },
      },
      update: {},
      create: {
        userId: member.id,
        projectId: project.id,
        role: member.id === michael.id ? 'lead' : 'member',
      },
    });
  }

  console.log('✅ Added project members');

  // Create modules with tasks
  const dataIngestion = await prisma.module.upsert({
    where: { id: 'data-ingestion' },
    update: {},
    create: {
      id: 'data-ingestion',
      name: 'Data Ingestion',
      description: 'File upload and data parsing module',
      status: 'in-progress',
      progress: 30,
      projectId: project.id,
      assigneeId: aaron.id,
    },
  });

  // Add tasks for Data Ingestion module
  const dataIngestionTasks = [
    { task: 'Set up file upload component', category: 'UI', completed: true },
    { task: 'Add drag-and-drop functionality', category: 'UI', completed: true },
    { task: 'Implement CSV parser', category: 'Backend', completed: true },
    { task: 'Implement JSON parser', category: 'Backend', completed: false },
    { task: 'Implement Excel parser', category: 'Backend', completed: false },
    { task: 'Add file validation & error handling', category: 'Backend', completed: false },
    { task: 'Create progress indicator', category: 'UI', completed: false },
    { task: 'Connect to data pipeline API', category: 'Integration', completed: false },
    { task: 'Write unit tests', category: 'Testing', completed: false },
    { task: 'Documentation', category: 'Docs', completed: false },
  ];

  for (const taskData of dataIngestionTasks) {
    await prisma.task.create({
      data: {
        ...taskData,
        moduleId: dataIngestion.id,
        verifiedById: taskData.completed ? michael.id : null,
        completedAt: taskData.completed ? new Date() : null,
      },
    });
  }

  // Create Data Profiling module
  const dataProfiling = await prisma.module.upsert({
    where: { id: 'data-profiling' },
    update: {},
    create: {
      id: 'data-profiling',
      name: 'Data Profiling',
      description: 'Automated data quality analysis and profiling',
      status: 'review',
      progress: 90,
      projectId: project.id,
      assigneeId: markH.id,
    },
  });

  // Create Response Plan Generator module
  await prisma.module.upsert({
    where: { id: 'response-plan' },
    update: {},
    create: {
      id: 'response-plan',
      name: 'Response Plan Generator',
      description: 'AI-powered response plan documentation',
      status: 'pending',
      progress: 20,
      projectId: project.id,
      assigneeId: michael.id,
    },
  });

  // Create Schema Builder module
  await prisma.module.upsert({
    where: { id: 'schema-builder' },
    update: {},
    create: {
      id: 'schema-builder',
      name: 'Schema Builder',
      description: 'Interactive database schema design tool',
      status: 'pending',
      progress: 0,
      projectId: project.id,
      assigneeId: markT.id,
    },
  });

  // Create Visualization Engine module
  await prisma.module.upsert({
    where: { id: 'visualization' },
    update: {},
    create: {
      id: 'visualization',
      name: 'Visualization Engine',
      description: 'Data visualization and dashboard components',
      status: 'pending',
      progress: 0,
      projectId: project.id,
      assigneeId: null,
    },
  });

  console.log('✅ Created modules with tasks');

  // Add some initial workspace chat messages
  await prisma.workspaceChat.createMany({
    data: [
      {
        role: 'assistant',
        message: "Hey Aaron! I'm here to help you build the Data Ingestion module. What would you like to work on first?",
        moduleId: dataIngestion.id,
        userId: aaron.id,
      },
      {
        role: 'user',
        message: "Let's start with the file upload component. I need to support CSV, JSON, and Excel files.",
        moduleId: dataIngestion.id,
        userId: aaron.id,
      },
      {
        role: 'assistant',
        message: "Great choice! I'll create a drag-and-drop file upload component with format validation. Here's the initial structure...",
        moduleId: dataIngestion.id,
        userId: aaron.id,
      },
    ],
  });

  console.log('✅ Added workspace chat messages');

  // Add some notes
  await prisma.note.createMany({
    data: [
      {
        text: 'Review data profiling module requirements',
        userId: aaron.id,
      },
      {
        text: 'Update checkbox interface based on feedback',
        userId: aaron.id,
      },
    ],
  });

  console.log('✅ Added notes');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Email: aaron@d2i.dev');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
