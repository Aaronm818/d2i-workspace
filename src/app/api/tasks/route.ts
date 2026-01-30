import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get tasks for a module
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID required' }, { status: 400 });
    }

    const tasks = await prisma.task.findMany({
      where: { moduleId },
      include: { verifiedBy: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// Create a new task
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task, category, moduleId } = await request.json();

    if (!task || !moduleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        task,
        category: category || 'General',
        moduleId,
      },
    });

    // Update module progress
    await updateModuleProgress(moduleId);

    return NextResponse.json({ task: newTask });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// Update a task (toggle complete, etc.)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, completed } = await request.json();

    if (!taskId || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        completed,
        verifiedById: completed ? session.user.id : null,
        completedAt: completed ? new Date() : null,
      },
      include: { verifiedBy: true, module: true },
    });

    // Update module progress
    await updateModuleProgress(task.moduleId);

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// Delete a task
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const task = await prisma.task.delete({
      where: { id: taskId },
    });

    // Update module progress
    await updateModuleProgress(task.moduleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}

// Helper function to update module progress
async function updateModuleProgress(moduleId: string) {
  const tasks = await prisma.task.findMany({
    where: { moduleId },
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Determine status based on progress
  let status = 'pending';
  if (progress > 0 && progress < 100) status = 'in-progress';
  if (progress === 100) status = 'complete';

  await prisma.module.update({
    where: { id: moduleId },
    data: { progress, status },
  });
}
