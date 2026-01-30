import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get modules for a project or user's assigned modules
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const assignedOnly = searchParams.get('assigned') === 'true';

    const where: any = {};
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (assignedOnly) {
      where.assigneeId = session.user.id;
    }

    const modules = await prisma.module.findMany({
      where,
      include: {
        assignee: true,
        tasks: true,
        project: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error('Get modules error:', error);
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 });
  }
}

// Create a new module
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, projectId, assigneeId, tasks } = await request.json();

    if (!name || !projectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const module = await prisma.module.create({
      data: {
        name,
        description,
        projectId,
        assigneeId,
        tasks: tasks?.length > 0 ? {
          create: tasks.map((t: { task: string; category: string }) => ({
            task: t.task,
            category: t.category || 'General',
          })),
        } : undefined,
      },
      include: {
        assignee: true,
        tasks: true,
      },
    });

    return NextResponse.json({ module });
  } catch (error) {
    console.error('Create module error:', error);
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
  }
}

// Update a module
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleId, name, description, status, assigneeId } = await request.json();

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID required' }, { status: 400 });
    }

    const module = await prisma.module.update({
      where: { id: moduleId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(assigneeId !== undefined && { assigneeId }),
      },
      include: {
        assignee: true,
        tasks: true,
      },
    });

    return NextResponse.json({ module });
  } catch (error) {
    console.error('Update module error:', error);
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
  }
}

// Delete a module
export async function DELETE(request: Request) {
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

    await prisma.module.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete module error:', error);
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });
  }
}
