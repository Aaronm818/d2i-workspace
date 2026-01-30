# D2I Workspace

A collaborative development platform for building AI-powered solutions. Features real-time task tracking, AI-assisted coding workspace, and team collaboration tools.

![D2I Workspace](https://img.shields.io/badge/D2I-Workspace-25E2CC?style=for-the-badge)

## Features

- 🔐 **Authentication** - Secure login/register with NextAuth.js
- 📊 **Dashboard** - Project overview with phase tracking and stats
- 📦 **Module Management** - Create, assign, and track project modules
- 🤖 **AI Workspace** - Claude-powered coding assistant for vibe coding
- ✅ **Task Checklist** - Real-time task tracking with verification
- 👥 **Team Management** - View team members and their status
- 📝 **Notes** - Personal note-taking system

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **AI**: Claude API (Anthropic)
- **Styling**: Tailwind CSS
- **Deployment**: Railway

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Railway provides this)
- Claude API key from [console.anthropic.com](https://console.anthropic.com)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/d2i-workspace.git
   cd d2i-workspace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your values:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/d2i"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"
   ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)
   
   Login with:
   - Email: `aaron@d2i.dev`
   - Password: `password123`

## Deploy to Railway

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select the `d2i-workspace` repository

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set the `DATABASE_URL` environment variable

### Step 3: Configure Environment Variables

In Railway dashboard, go to your service's "Variables" tab and add:

```env
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-app.railway.app
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

To generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Step 4: Deploy

Railway auto-deploys on every push to your main branch. The build command is already configured in `package.json`.

### Step 5: Initialize Database

After first deploy, you can seed the database by running the seed script. In Railway:

1. Go to your service
2. Click "Settings" → "Run Command"
3. Run: `npm run db:seed`

Or connect to the Railway shell and run the command manually.

## Project Structure

```
d2i-workspace/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # NextAuth endpoints
│   │   │   ├── chat/      # Claude AI chat
│   │   │   ├── modules/   # Module CRUD
│   │   │   ├── tasks/     # Task management
│   │   │   └── team/      # Team endpoints
│   │   ├── dashboard/     # Dashboard pages
│   │   │   ├── modules/
│   │   │   ├── workspace/
│   │   │   ├── team/
│   │   │   └── ...
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── Sidebar.tsx
│   │   └── Providers.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   └── prisma.ts
│   └── types/
│       └── index.ts
├── .env.example
├── package.json
└── README.md
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth authentication |
| `/api/auth/register` | POST | User registration |
| `/api/chat` | GET/POST | AI workspace chat |
| `/api/modules` | GET/POST/PATCH/DELETE | Module management |
| `/api/tasks` | GET/POST/PATCH/DELETE | Task management |
| `/api/team` | GET/PATCH | Team management |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js sessions |
| `NEXTAUTH_URL` | Your app's URL |
| `ANTHROPIC_API_KEY` | Claude API key |

## Default Login Credentials

After running the seed:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Aaron Magana | aaron@d2i.dev | password123 | AI Engineer |
| Mark Hinderliter | markh@d2i.dev | password123 | Architect |
| Michael Reynolds | michael@d2i.dev | password123 | Project Lead Dev |
| Mark Thompson | markt@d2i.dev | password123 | Frontend |
| Adam Hahn | adam@d2i.dev | password123 | AI Engineer |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ by the D2I Team
