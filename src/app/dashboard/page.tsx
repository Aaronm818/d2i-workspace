import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Icons } from '@/components/ui/Icons';
import Link from 'next/link';
import { FileUploadSection } from '@/components/dashboard/FileUploadSection';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Get stats
  const [modules, users, uploads] = await Promise.all([
    prisma.module.findMany({
      include: { tasks: true, assignee: true },
    }),
    prisma.user.findMany(),
    prisma.upload.findMany({
      where: { projectId: 'default' },
      include: { uploadedBy: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const stats = [
    { label: 'Modules', value: modules.length.toString(), sub: 'Total', icon: '📦' },
    { label: 'In Progress', value: modules.filter(m => m.status === 'in-progress').length.toString(), sub: 'Active', icon: '🔄' },
    { label: 'Completed', value: modules.filter(m => m.status === 'complete').length.toString(), sub: 'Done', icon: '✅' },
    { label: 'Team', value: users.length.toString(), sub: 'Members', icon: '👥' },
  ];

  const phases = [
    { name: 'Discovery', status: 'complete', icon: '🔍' },
    { name: 'Consensus', status: 'active', icon: '🤝' },
    { name: 'Division', status: 'pending', icon: '📦' },
    { name: 'Build', status: 'pending', icon: '🔨' },
    { name: 'Integration', status: 'pending', icon: '🚀' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {session?.user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-d2i-cyan/80">Here's what's happening with your project</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/30 card-hover"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-d2i-teal/20 text-d2i-cyan">
                {stat.sub}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            <p className="text-sm text-white/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Phase Tracker */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20">
        <h2 className="text-lg font-semibold text-white mb-4">Project Phases</h2>
        <div className="flex items-center justify-between">
          {phases.map((phase, i) => (
            <div key={phase.name} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-2 ${
                    phase.status === 'active' ? 'animate-pulse' : ''
                  }`}
                  style={{
                    background:
                      phase.status === 'complete'
                        ? 'linear-gradient(135deg, #00737F 0%, #25E2CC 100%)'
                        : phase.status === 'active'
                        ? 'linear-gradient(135deg, rgba(0,115,127,0.5) 0%, rgba(37,226,204,0.5) 100%)'
                        : '#002d44',
                    border: phase.status === 'pending' ? '2px solid rgba(0,115,127,0.3)' : 'none',
                  }}
                >
                  {phase.icon}
                </div>
                <span
                  className="text-xs"
                  style={{
                    color: phase.status === 'pending' ? 'rgba(255,255,255,0.4)' : '#25E2CC',
                  }}
                >
                  {phase.name}
                </span>
              </div>
              {i < phases.length - 1 && (
                <div
                  className="w-16 h-0.5 mx-2"
                  style={{
                    backgroundColor:
                      phase.status === 'complete' ? '#25E2CC' : 'rgba(0,115,127,0.3)',
                  }}
                />
              )}
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
          className="p-6 rounded-2xl bg-gradient-to-br from-d2i-teal/20 to-d2i-cyan/10 border border-d2i-cyan/30 card-hover group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-d2i-teal to-d2i-cyan text-white">
              <Icons.Workspace />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-d2i-cyan transition-colors">
                Open Workspace
              </h3>
              <p className="text-sm text-white/60">Start coding your assigned module</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/modules"
          className="p-6 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20 card-hover group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-d2i-navy text-d2i-cyan">
              <Icons.Modules />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-d2i-cyan transition-colors">
                View All Modules
              </h3>
              <p className="text-sm text-white/60">See project modules and progress</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20">
        <h2 className="text-lg font-semibold text-white mb-4">Module Overview</h2>
        <div className="space-y-3">
          {modules.slice(0, 5).map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between p-3 rounded-xl bg-d2i-navy-dark/50"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      module.status === 'complete'
                        ? '#10b981'
                        : module.status === 'in-progress'
                        ? '#25E2CC'
                        : module.status === 'review'
                        ? '#f59e0b'
                        : '#64748b',
                  }}
                />
                <span className="text-white">{module.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/50">
                  {module.assignee?.name || 'Unassigned'}
                </span>
                <span className="text-sm text-d2i-cyan">{module.progress}%</span>
              </div>
            </div>
          ))}
          {modules.length === 0 && (
            <p className="text-center text-white/50 py-4">No modules yet. Create one to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
}
