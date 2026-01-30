import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FileUploadSection } from '@/components/dashboard/FileUploadSection';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const [modules, users, uploads] = await Promise.all([
    prisma.module.findMany({
      include: {
        assignee: { select: { name: true } },
        tasks: true,
      },
    }),
    prisma.user.findMany({ select: { id: true } }),
    prisma.upload.findMany({
      where: { projectId: 'default' },
      include: {
        uploadedBy: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const inProgress = modules.filter(m => m.status === 'in_progress').length;
  const completed = modules.filter(m => m.status === 'completed').length;

  const moduleProgress = modules.map(m => {
    const totalTasks = m.tasks.length;
    const completedTasks = m.tasks.filter(t => t.completed).length;
    return {
      ...m,
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0] || 'there'}!</h1>
        <p className="text-d2i-cyan/80">Here&apos;s what&apos;s happening with your project</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📦</span>
            <span className="text-xs text-d2i-cyan">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">{modules.length}</p>
          <p className="text-xs text-white/50">Modules</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔄</span>
            <span className="text-xs text-d2i-cyan">Active</span>
          </div>
          <p className="text-2xl font-bold text-white">{inProgress}</p>
          <p className="text-xs text-white/50">In Progress</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✅</span>
            <span className="text-xs text-d2i-cyan">Done</span>
          </div>
          <p className="text-2xl font-bold text-white">{completed}</p>
          <p className="text-xs text-white/50">Completed</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">👥</span>
            <span className="text-xs text-d2i-cyan">Members</span>
          </div>
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <p className="text-xs text-white/50">Team</p>
        </div>
      </div>

      {/* Project Phases */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20">
        <h2 className="text-lg font-semibold text-white mb-4">Project Phases</h2>
        <div className="flex items-center justify-between gap-4">
          {['Discovery', 'Consensus', 'Division', 'Build', 'Integration'].map((phase, i) => (
            <div key={phase} className="flex-1 text-center">
              <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${i < 2 ? 'bg-gradient-to-br from-d2i-teal to-d2i-cyan' : 'bg-d2i-navy-dark'}`}>
                {['🔍', '💬', '📋', '🔧', '🔗'][i]}
              </div>
              <p className={`text-xs ${i < 2 ? 'text-d2i-cyan' : 'text-white/50'}`}>{phase}</p>
            </div>
          ))}
        </div>
      </div>

      {/* File Upload Section */}
      <FileUploadSection initialUploads={uploads} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/dashboard/workspace"
          className="p-5 rounded-2xl bg-gradient-to-br from-d2i-teal/20 to-d2i-cyan/10 border border-d2i-cyan/30 hover:border-d2i-cyan/50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-d2i-teal to-d2i-cyan flex items-center justify-center">
              💻
            </div>
            <div>
              <h3 className="font-semibold text-white">Open Workspace</h3>
              <p className="text-sm text-white/50">Start coding your assigned module</p>
            </div>
          </div>
        </Link>
        <Link
          href="/dashboard/modules"
          className="p-5 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20 hover:border-d2i-teal/40 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-d2i-navy-dark flex items-center justify-center">
              📦
            </div>
            <div>
              <h3 className="font-semibold text-white">View All Modules</h3>
              <p className="text-sm text-white/50">See project modules and progress</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Module Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20">
        <h2 className="text-lg font-semibold text-white mb-4">Module Overview</h2>
        <div className="space-y-3">
          {moduleProgress.map((m) => (
            <div key={m.id} className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${m.progress > 50 ? 'bg-d2i-cyan' : 'bg-yellow-500'}`} />
              <span className="flex-1 text-white/80">{m.name}</span>
              <span className="text-sm text-white/50">{m.assignee?.name || 'Unassigned'}</span>
              <span className={`text-sm ${m.progress > 50 ? 'text-d2i-cyan' : 'text-yellow-500'}`}>{m.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
