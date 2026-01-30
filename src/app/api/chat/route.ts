import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, moduleId, history } = await request.json();

    if (!message || !moduleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get module details for context
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        tasks: true,
        project: true,
      },
    });

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Build conversation history for Claude
    const messages = history?.map((msg: { role: string; message: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.message,
    })) || [];

    // Add current message
    messages.push({
      role: 'user' as const,
      content: message,
    });

    // Create system prompt with module context
    const systemPrompt = `You are an AI coding assistant helping build the "${module.name}" module for the D2I (Data to Intelligence) project.

Project: ${module.project.name}
Module: ${module.name}
Description: ${module.description || 'No description provided'}
Current Progress: ${module.progress}%
Status: ${module.status}

Tasks for this module:
${module.tasks.map(t => `- [${t.completed ? 'x' : ' '}] ${t.task} (${t.category})`).join('\n')}

You are helping the developer build this module through "vibe coding" - conversational development where they describe what they want and you help implement it.

Guidelines:
1. Be helpful, concise, and provide working code
2. Use modern best practices (TypeScript, React, Tailwind CSS)
3. Break down complex tasks into manageable steps
4. Suggest improvements and catch potential issues
5. Reference the task list when relevant to track progress
6. Provide complete, runnable code snippets
7. Explain your reasoning briefly

Remember: You're pair programming, not lecturing. Keep responses focused and actionable.`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages,
    });

    // Extract text response
    const assistantMessage = response.content
      .filter(block => block.type === 'text')
      .map(block => block.type === 'text' ? block.text : '')
      .join('');

    // Save messages to database
    await prisma.workspaceChat.createMany({
      data: [
        {
          role: 'user',
          message: message,
          moduleId: moduleId,
          userId: session.user.id,
        },
        {
          role: 'assistant',
          message: assistantMessage,
          moduleId: moduleId,
          userId: session.user.id,
        },
      ],
    });

    return NextResponse.json({
      message: assistantMessage,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

// Get chat history for a module
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID required' },
        { status: 400 }
      );
    }

    const messages = await prisma.workspaceChat.findMany({
      where: {
        moduleId,
        userId: session.user.id,
      },
      orderBy: { createdAt: 'asc' },
      take: 50, // Limit history
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
