import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    avatar: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    avatar: string;
  }
}

// App Types
export interface Module {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'review' | 'complete';
  progress: number;
  projectId: string;
  assigneeId?: string;
  assignee?: User;
  tasks?: Task[];
}

export interface Task {
  id: string;
  task: string;
  category: string;
  completed: boolean;
  moduleId: string;
  verifiedById?: string;
  verifiedBy?: User;
  completedAt?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  online: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  phase: string;
  modules?: Module[];
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: string;
  user?: User;
}

export interface ChatMessage {
  id: string;
  message: string;
  userId: string;
  user?: User;
  projectId: string;
  createdAt: Date;
}

export interface WorkspaceMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  moduleId: string;
  userId: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  text: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
