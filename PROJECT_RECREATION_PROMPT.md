# Complete Portfolio Generator Platform - Recreation Prompt

Use this prompt to recreate the entire Signature Portfolio Generator platform from scratch. This is a comprehensive, production-ready portfolio builder with admin panel, multiple themes, OAuth authentication, and real-time preview.

---

## INITIAL REQUEST

```
Create a professional portfolio generator application called "Signature" with the following comprehensive features:

## Core Requirements

### Technology Stack
- Next.js 16 with App Router
- TypeScript 5
- Tailwind CSS 4 with shadcn/ui components
- Prisma ORM (SQLite for dev, PostgreSQL for production)
- Zustand for state management
- Framer Motion for animations
- Three.js for 3D graphics
- bcryptjs for password hashing

### Main Features

1. **User Authentication**
   - Email/password signup and login
   - GitHub OAuth integration
   - Google OAuth integration
   - Persistent sessions with cookies

2. **Portfolio Builder**
   - About Me section with profile image upload
   - Experience timeline with drag-and-drop reordering
   - Education section
   - Projects showcase with GitHub import
   - Skills management with categories
   - Contact information editor
   - Real-time live preview

3. **Theme System (5 Personalities)**
   - Minimal: Clean professional design
   - Developer: Terminal/code-inspired aesthetic
   - Creative: Colorful with animated gradients
   - Elegant: Sophisticated and refined
   - Futuristic: 3D animated background with Three.js

4. **Admin Panel**
   - Dashboard with statistics
   - User management (CRUD, role assignment)
   - Portfolio management
   - Analytics dashboard
   - System settings
   - Setup key protection for first admin

5. **Public Portfolio**
   - Accessible via /{username}
   - Fully responsive
   - SEO optimized
   - Dark/light mode support

### UI Requirements
- Responsive design (mobile-first)
- Dark/light theme toggle
- Toast notifications
- Loading states
- Error boundaries
- Smooth animations

### Database Models
- User (with role: USER/ADMIN)
- Portfolio (with personality settings)
- Content (about, contact info)
- Project, Experience, Education, Skill
- SystemSettings, AuditLog, Analytics

```

---

## DETAILED IMPLEMENTATION GUIDE

### Phase 1: Project Setup

```
Initialize a new Next.js 16 project with the following configuration:

1. Create project with TypeScript and Tailwind CSS
2. Install core dependencies:
   - @prisma/client and prisma
   - zustand (state management)
   - framer-motion (animations)
   - bcryptjs and @types/bcryptjs
   - lucide-react (icons)
   - next-themes (dark mode)
   - sonner (toasts)
   - three, @react-three/fiber, @react-three/drei (3D)
   - @dnd-kit/core, @dnd-kit/sortable (drag-drop)
   - jose (JWT)
   - uuid

3. Setup shadcn/ui with New York style
4. Create folder structure:
   src/app/, src/components/, src/store/, src/hooks/, src/lib/

5. Create Prisma schema with all models
```

### Phase 2: Database Schema

```prisma
// Complete Prisma schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // or "postgresql" for production
  url      = env("DATABASE_URL")
}

model User {
  id           String     @id @default(cuid())
  email        String     @unique
  name         String?
  username     String?    @unique
  password     String?
  githubId     String?    @unique
  githubLogin  String?
  googleId     String?    @unique
  avatarUrl    String?
  bio          String?
  location     String?
  company      String?
  blog         String?
  role         String     @default("USER")
  isActive     Boolean    @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  portfolio    Portfolio?
  auditLogs    AuditLog[]
}

model Portfolio {
  id              String      @id @default(cuid())
  userId          String      @unique
  personalityType String      @default("minimal")
  accentColor     String      @default("#10b981")
  layoutOrder     String      @default("about,experience,projects,skills,contact")
  isPublished     Boolean     @default(false)
  density         String      @default("normal")
  reduceMotion    Boolean     @default(false)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  content         Content?
  projects        Project[]
  experiences     Experience[]
  educations      Education[]
  skills          Skill[]
}

model Content {
  id                String   @id @default(cuid())
  portfolioId       String   @unique
  jobTitle          String?
  aboutText         String?
  resumeUrl         String?
  contactEmail      String?
  linkedinUrl       String?
  githubUrl         String?
  twitterUrl        String?
  websiteUrl        String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  portfolio         Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
}

model Project {
  id              String   @id @default(cuid())
  portfolioId     String
  title           String
  description     String?
  longDescription String?
  url             String?
  imageUrl        String?
  isGithubImport  Boolean  @default(false)
  githubStars     Int?
  githubForks     Int?
  githubLanguage  String?
  githubUrl       String?
  displayOrder    Int      @default(0)
  isVisible       Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  portfolio       Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
}

model Experience {
  id           String   @id @default(cuid())
  portfolioId  String
  company      String
  role         String
  location     String?
  startDate    String
  endDate      String?
  isCurrent    Boolean  @default(false)
  description  String?
  displayOrder Int      @default(0)
  isVisible    Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  portfolio    Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
}

model Education {
  id           String   @id @default(cuid())
  portfolioId  String
  institution  String
  degree       String
  field        String?
  location     String?
  startDate    String
  endDate      String?
  isCurrent    Boolean  @default(false)
  description  String?
  displayOrder Int      @default(0)
  isVisible    Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  portfolio    Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
}

model Skill {
  id           String   @id @default(cuid())
  portfolioId  String
  name         String
  category     String   @default("technical")
  proficiency  Int      @default(3)
  displayOrder Int      @default(0)
  isVisible    Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  portfolio    Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
}

model SystemSettings {
  id                 String   @id @default(cuid())
  siteName           String   @default("Portfolio Generator")
  siteDescription    String?
  maintenanceMode    Boolean  @default(false)
  maintenanceMessage String?
  allowRegistration  Boolean  @default(true)
  defaultAccentColor String   @default("#10b981")
  maxPortfoliosPerUser Int    @default(1)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String
  entityType String
  entityId   String?
  details    String?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
}

model Analytics {
  id                String   @id @default(cuid())
  date              DateTime @unique
  totalUsers        Int      @default(0)
  newUsers          Int      @default(0)
  totalPortfolios   Int      @default(0)
  newPortfolios     Int      @default(0)
  publishedPortfolios Int    @default(0)
  totalViews        Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### Phase 3: Authentication System

Create a complete authentication system with:

1. **Auth Store (Zustand)**
```typescript
// src/store/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  githubId: string | null;
  githubLogin: string | null;
  googleId: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      logout: () => {
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    { name: 'portfolio-auth' }
  )
);
```

2. **Email/Password Authentication API**
```typescript
// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const { name, email, password, username } = await request.json();
  
  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: 'Valid email and password required' }, { status: 400 });
  }
  
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }
  
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const user = await db.user.create({
    data: {
      name: name || username || email.split('@')[0],
      email,
      username: username || email.split('@')[0],
      password: hashedPassword,
      role: 'USER',
    },
  });
  
  return NextResponse.json({ user });
}
```

3. **Login API**
```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  if (!user.isActive) {
    return NextResponse.json({ error: 'Account deactivated' }, { status: 403 });
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  
  return NextResponse.json({ user });
}
```

4. **GitHub OAuth Flow**
```typescript
// src/app/api/auth/github/route.ts
export async function POST(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const appUrl = process.env.APP_URL;
  
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'OAuth not configured' }, { status: 500 });
  }
  
  const state = crypto.randomUUID();
  const origin = appUrl || request.headers.get('origin');
  const redirectUri = `${origin}/api/auth/github/callback`;
  
  const githubUrl = new URL('https://github.com/login/oauth/authorize');
  githubUrl.searchParams.set('client_id', clientId);
  githubUrl.searchParams.set('scope', 'read:user user:email');
  githubUrl.searchParams.set('state', state);
  githubUrl.searchParams.set('redirect_uri', redirectUri);
  
  const response = NextResponse.json({ redirectUrl: githubUrl.toString() });
  response.cookies.set('github_oauth_state', state, { httpOnly: true, maxAge: 600 });
  
  return response;
}
```

5. **GitHub OAuth Callback**
```typescript
// src/app/api/auth/github/callback/route.ts
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  
  // Exchange code for token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const { access_token } = await tokenRes.json();
  
  // Fetch user profile
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const githubUser = await userRes.json();
  
  // Create or update user in database
  const user = await db.user.upsert({
    where: { githubId: String(githubUser.id) },
    create: {
      githubId: String(githubUser.id),
      githubLogin: githubUser.login,
      email: githubUser.email,
      name: githubUser.name || githubUser.login,
      avatarUrl: githubUser.avatar_url,
      bio: githubUser.bio,
      location: githubUser.location,
      company: githubUser.company,
      blog: githubUser.blog,
      username: githubUser.login,
    },
    update: {
      avatarUrl: githubUser.avatar_url,
      name: githubUser.name || githubUser.login,
    },
  });
  
  // Set cookies and redirect
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set('user_data', JSON.stringify(user), { maxAge: 7 * 24 * 60 * 60 });
  
  return response;
}
```

### Phase 4: Portfolio State Management

```typescript
// src/store/portfolio-store.ts
import { create } from 'zustand';

export type PersonalityType = 'minimal' | 'developer' | 'creative' | 'elegant' | 'futuristic';
export type DensityType = 'compact' | 'normal' | 'spacious';

export interface Portfolio {
  id: string;
  userId: string;
  personalityType: PersonalityType;
  accentColor: string;
  layoutOrder: string;
  isPublished: boolean;
  density: DensityType;
  reduceMotion: boolean;
  content: Content | null;
  projects: Project[];
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
}

interface PortfolioState {
  portfolio: Portfolio | null;
  isLoading: boolean;
  setPortfolio: (portfolio: Portfolio | null) => void;
  setPersonality: (personality: PersonalityType) => void;
  setAccentColor: (color: string) => void;
  updateContent: (content: Partial<Content>) => void;
  addProject: (project: Omit<Project, 'id' | 'portfolioId'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  // Similar methods for experiences, educations, skills
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolio: null,
  isLoading: false,
  setPortfolio: (portfolio) => set({ portfolio }),
  setPersonality: (personalityType) =>
    set((state) => ({
      portfolio: state.portfolio ? { ...state.portfolio, personalityType } : null,
    })),
  setAccentColor: (accentColor) =>
    set((state) => ({
      portfolio: state.portfolio ? { ...state.portfolio, accentColor } : null,
    })),
  updateContent: (content) =>
    set((state) => ({
      portfolio: state.portfolio
        ? { ...state.portfolio, content: { ...state.portfolio.content, ...content } }
        : null,
    })),
  addProject: (project) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            projects: [...state.portfolio.projects, { ...project, id: `temp-${Date.now()}`, portfolioId: state.portfolio.id }],
          }
        : null,
    })),
  updateProject: (id, data) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            projects: state.portfolio.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
          }
        : null,
    })),
  deleteProject: (id) =>
    set((state) => ({
      portfolio: state.portfolio
        ? { ...state.portfolio, projects: state.portfolio.projects.filter((p) => p.id !== id) }
        : null,
    })),
}));
```

### Phase 5: Main Application UI

Create the main portfolio builder page with:

1. **Left Sidebar** - Navigation tabs for each section
2. **Main Content Area** - Editor for selected section
3. **Right Preview Panel** - Live portfolio preview
4. **Top Bar** - Logo, theme toggle, preview toggle

The page structure:
```tsx
// src/app/page.tsx
export default function PortfolioBuilder() {
  const { isAuthenticated, user } = useAuthStore();
  const { portfolio } = usePortfolioStore();
  const [activeTab, setActiveTab] = useState('about');
  const [showPreview, setShowPreview] = useState(false);
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  return (
    <div className="h-screen flex flex-col">
      <Header showPreview={showPreview} setShowPreview={setShowPreview} />
      <div className="flex-1 flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto">
          {renderEditor(activeTab)}
        </main>
        {showPreview && <PreviewPanel />}
      </div>
    </div>
  );
}
```

### Phase 6: Portfolio Personalities (Themes)

Create 5 distinct visual themes:

#### 1. Minimal Personality
```tsx
// Clean, professional design
- Hero section with avatar, name, title
- Timeline-based experience
- Card-based projects with images
- Grouped skills by category
- Clean contact grid
```

#### 2. Developer Personality
```tsx
// Terminal-inspired
- Code-style section headers (intro.sh, contact.json)
- Monospace typography
- Syntax-highlighted content display
- Command-line aesthetic
```

#### 3. Creative Personality
```tsx
// Artistic, colorful
- Gradient animated backgrounds
- Floating decorative elements
- Playful card animations with rotation
- Multi-colored skill badges
```

#### 4. Elegant Personality
```tsx
// Sophisticated
- Clean typography
- Subtle animations
- Professional card layouts
- Refined color accents
```

#### 5. Futuristic Personality
```tsx
// Modern 3D
- Three.js animated background with particles
- High-tech aesthetic
- Dynamic visual effects
- Modern glass-morphism effects
```

### Phase 7: Preview System

```tsx
// src/components/preview/preview-panel.tsx
export function PreviewPanel() {
  const { portfolio } = usePortfolioStore();
  const { user } = useAuthStore();
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  
  const renderPersonality = () => {
    switch (portfolio?.personalityType) {
      case 'developer': return <DeveloperPersonality portfolio={portfolio} user={user} />;
      case 'creative': return <CreativePersonality portfolio={portfolio} user={user} />;
      case 'elegant': return <ElegantPersonality portfolio={portfolio} user={user} />;
      case 'futuristic': return <FuturisticPersonality portfolio={portfolio} user={user} />;
      default: return <MinimalPersonality portfolio={portfolio} user={user} />;
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <span>Live Preview</span>
        <div className="flex gap-1">
          <Button variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'} onClick={() => setDeviceMode('desktop')}>
            <Monitor />
          </Button>
          <Button variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'} onClick={() => setDeviceMode('mobile')}>
            <Smartphone />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {renderPersonality()}
      </div>
    </div>
  );
}
```

### Phase 8: Admin Panel System

Create complete admin functionality:

1. **Admin Login with Setup Key**
```tsx
// First admin creation protected by setup key
POST /api/admin/setup
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "securepassword",
  "setupKey": "your-setup-key"
}
```

2. **Admin Dashboard**
```tsx
// Statistics cards showing:
- Total users
- Total portfolios
- Published portfolios
- Active users today
- Content statistics
- Personality distribution chart
- Recent users list
- Recent portfolios list
```

3. **User Management**
```tsx
// Features:
- Paginated user list with search
- Role management (USER/ADMIN)
- Account activation/deactivation
- Create new users
- Delete users
- Filter by role and status
```

4. **Analytics Dashboard**
```tsx
// Time-based statistics:
- User growth
- Portfolio creation trends
- Personality distribution
- Content statistics
```

5. **System Settings**
```tsx
// Configuration:
- Site name and description
- Maintenance mode toggle
- Registration toggle
- Default accent color
- Max portfolios per user
```

### Phase 9: Public Portfolio Access

```tsx
// src/app/[username]/page.tsx
export default function PublicPortfolio({ params }: { params: { username: string } }) {
  const [portfolio, setPortfolio] = useState(null);
  
  useEffect(() => {
    fetch(`/api/portfolio/public/${params.username}`)
      .then(res => res.json())
      .then(data => setPortfolio(data.portfolio));
  }, [params.username]);
  
  if (!portfolio) return <Loading />;
  if (portfolio.notFound) return <NotFound />;
  
  return renderPersonality(portfolio);
}
```

### Phase 10: Drag and Drop Reordering

```tsx
// Use @dnd-kit for reordering
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function ProjectsEditor() {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // Reorder projects locally
      // Save new order to API
    }
  };
  
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={projects} strategy={verticalListSortingStrategy}>
        {projects.map(project => (
          <SortableProject key={project.id} project={project} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### Phase 11: File Upload System

```typescript
// src/app/api/upload/route.ts
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }
  
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }
  
  // Convert to base64 or save to storage
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${file.type};base64,${base64}`;
  
  return NextResponse.json({ url: dataUrl });
}
```

---

## ENVIRONMENT VARIABLES

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio"

# App URL (for OAuth callbacks)
APP_URL="https://your-domain.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"

# Admin Setup Key
ADMIN_SETUP_KEY="your-secure-setup-key"
```

---

## KEY IMPLEMENTATION NOTES

1. **Authentication Flow**
   - OAuth: Redirect to provider → callback → create/update user → set cookies
   - Email: Validate → hash/verify password → set cookies
   - Store user in Zustand with persistence

2. **Portfolio Loading**
   - Fetch portfolio on app load
   - Create default portfolio if none exists
   - Update local state on changes
   - Save to API on explicit save actions

3. **Preview System**
   - Render same components as public portfolio
   - Switch between device modes
   - Fullscreen option
   - Error boundary for crash recovery

4. **Admin Security**
   - Setup key required for first admin
   - Role-based access control
   - Audit logging for admin actions

5. **Theme System**
   - Each personality is a separate component
   - Receives portfolio and user props
   - Handles own styling and animations
   - Respects reduce-motion preference

6. **Responsive Design**
   - Mobile-first approach
   - Collapsible sidebar on small screens
   - Bottom navigation for mobile
   - Adaptive preview panel

---

## FINAL OUTPUT

Build this complete application following the structure and patterns described above. Ensure all features are fully implemented with proper error handling, loading states, and responsive design.
