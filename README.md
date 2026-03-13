# Signature - Professional Portfolio Generator

A modern, full-featured portfolio builder application that allows users to create stunning, personality-based portfolios with multiple themes, real-time preview, and comprehensive admin management. Built with Next.js 16, TypeScript, Prisma, and Tailwind CSS.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Components](#components)
- [State Management](#state-management)
- [Authentication](#authentication)
- [Admin Panel](#admin-panel)
- [Portfolio Personalities](#portfolio-personalities)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Deployment](#deployment)

---

## Overview

Signature is a professional portfolio generator that enables users to create beautiful, personalized portfolios with:

- **Multiple Personality Themes**: 5 unique visual themes (Minimal, Developer, Creative, Elegant, Futuristic)
- **Real-time Preview**: See changes instantly with live preview
- **Drag & Drop Reordering**: Organize content with intuitive drag and drop
- **GitHub Integration**: Import projects directly from GitHub
- **Responsive Design**: Works beautifully on all devices
- **Dark/Light Mode**: Full theme support
- **Admin Dashboard**: Complete admin management system

---

## Features

### For Users

#### Portfolio Editor
- **About Me Section**: Profile image upload, name, job title, location, company, bio
- **Experience Timeline**: Add work experiences with company, role, dates, descriptions
- **Education Section**: Add educational background with degree, institution, dates
- **Projects Showcase**: Add projects with images, descriptions, GitHub stats
- **Skills Section**: Categorize skills (technical, soft, tools) with proficiency levels
- **Contact Information**: Email, LinkedIn, GitHub, Twitter, website, resume links

#### Theme Customization
- **Personality Types**: 5 distinct visual themes
  - **Minimal**: Clean, professional design
  - **Developer**: Terminal-inspired code aesthetic
  - **Creative**: Colorful, artistic design with gradient accents
  - **Elegant**: Sophisticated, refined appearance
  - **Futuristic**: 3D animated background with modern aesthetics
- **Accent Colors**: Customizable color scheme
- **Layout Options**: Rearrangeable sections
- **Density Settings**: Compact, normal, or spacious spacing
- **Motion Preferences**: Reduce motion for accessibility

#### Live Preview
- **Desktop/Mobile Views**: Preview in different device sizes
- **Fullscreen Mode**: Distraction-free preview
- **Real-time Updates**: See changes instantly

#### Publishing
- **Custom Username URL**: `/{username}` for public portfolio access
- **Publish/Unpublish**: Control portfolio visibility
- **Shareable Links**: Direct links to portfolio

### For Administrators

#### Dashboard
- **Overview Statistics**: Total users, portfolios, published portfolios, active users
- **Content Statistics**: Projects, experiences, skills, education entries
- **Personality Distribution**: Visual breakdown of theme usage
- **Recent Activity**: Latest users and portfolios

#### User Management
- **User List**: Paginated list with search and filters
- **Role Management**: Promote users to admin or demote
- **Account Status**: Activate/deactivate user accounts
- **User Creation**: Create new users directly
- **User Deletion**: Remove users with confirmation

#### Portfolio Management
- **Portfolio Overview**: All portfolios with owner info
- **Filtering**: By personality type, publish status
- **Content Overview**: Projects, experiences, skills counts

#### Analytics
- **Time Range Selection**: 7, 30, 90 days, or 1 year
- **Growth Metrics**: New users, new portfolios
- **Content Statistics**: Aggregate content counts

#### System Settings
- **Site Configuration**: Name, description
- **Maintenance Mode**: Toggle maintenance with custom message
- **Registration Control**: Enable/disable new registrations
- **Portfolio Limits**: Max portfolios per user

---

## Technology Stack

### Core Framework
- **Next.js 16** - React framework with App Router
- **TypeScript 5** - Type-safe JavaScript
- **React 19** - UI library

### Styling
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Component library (New York style)
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **next-themes** - Theme management

### State Management
- **Zustand** - Client state management with persistence
- **TanStack Query** - Server state (available)

### Database
- **Prisma** - ORM for database operations
- **SQLite** (development) / **PostgreSQL** (production)

### Authentication
- **NextAuth.js v4** - Authentication framework
- **bcryptjs** - Password hashing
- **jose** - JWT handling

### UI Components
- **Radix UI** - Headless UI primitives
- **@dnd-kit** - Drag and drop functionality
- **Sonner** - Toast notifications

### 3D Graphics
- **Three.js** - 3D rendering
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main portfolio builder page
│   ├── layout.tsx                # Root layout with providers
│   ├── globals.css               # Global styles
│   ├── admin/                    # Admin panel pages
│   │   └── page.tsx              # Admin dashboard
│   ├── [username]/               # Dynamic public portfolio route
│   │   ├── page.tsx              # Public portfolio view
│   │   ├── public-portfolio.tsx  # Portfolio renderer
│   │   └── not-found.tsx         # 404 page
│   └── api/                      # API routes
│       ├── auth/                 # Authentication endpoints
│       │   ├── route.ts          # Email/password auth
│       │   ├── login/            # Login endpoint
│       │   ├── signup/           # Registration endpoint
│       │   ├── github/           # GitHub OAuth
│       │   │   ├── route.ts      # Initiate OAuth
│       │   │   └── callback/     # OAuth callback
│       │   └── google/           # Google OAuth
│       │       ├── route.ts      # Initiate OAuth
│       │       └── callback/     # OAuth callback
│       ├── admin/                # Admin API endpoints
│       │   ├── check/            # Check if admin exists
│       │   ├── login/            # Admin login
│       │   ├── setup/            # Create first admin
│       │   ├── users/            # User management
│       │   │   ├── route.ts      # List users
│       │   │   ├── create/       # Create user
│       │   │   └── [id]/         # User CRUD
│       │   ├── portfolios/       # Portfolio management
│       │   ├── analytics/        # Analytics data
│       │   └── settings/         # System settings
│       ├── portfolio/            # Portfolio CRUD
│       │   ├── route.ts          # Get/update portfolio
│       │   ├── content/          # Content management
│       │   ├── projects/         # Project CRUD
│       │   ├── experiences/      # Experience CRUD
│       │   ├── educations/       # Education CRUD
│       │   ├── skills/           # Skills CRUD
│       │   ├── publish/          # Publish portfolio
│       │   ├── delete/           # Delete portfolio
│       │   ├── resume/           # Resume upload
│       │   └── public/           # Public portfolio access
│       ├── user/                 # User profile endpoints
│       ├── upload/               # File upload handler
│       └── github/               # GitHub API integration
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── avatar.tsx
│   │   └── ...                   # Many more UI components
│   ├── auth/                     # Authentication components
│   │   ├── github-login.tsx      # Login/signup page
│   │   └── auth-modal.tsx        # Auth modal
│   ├── admin/                    # Admin components
│   │   ├── admin-panel.tsx       # Main admin dashboard
│   │   └── admin-login.tsx       # Admin login page
│   ├── editor/                   # Portfolio editor components
│   │   ├── about-editor.tsx      # About section editor
│   │   ├── experience-editor.tsx # Experience editor
│   │   ├── education-editor.tsx  # Education editor
│   │   ├── projects-editor.tsx   # Projects editor
│   │   ├── skills-editor.tsx     # Skills editor
│   │   ├── contact-editor.tsx    # Contact editor
│   │   ├── theme-settings.tsx    # Personality selector
│   │   ├── layout-editor.tsx     # Layout customization
│   │   └── settings-panel.tsx    # General settings
│   ├── personalities/            # Portfolio themes
│   │   ├── minimal-personality.tsx
│   │   ├── developer-personality.tsx
│   │   ├── creative-personality.tsx
│   │   ├── elegant-personality.tsx
│   │   └── futuristic-personality.tsx
│   ├── preview/                  # Preview components
│   │   └── preview-panel.tsx     # Live preview component
│   ├── 3d/                       # 3D components
│   │   └── animated-background.tsx
│   ├── theme-provider.tsx        # Theme context provider
│   └── theme-toggle.tsx          # Theme switcher
│
├── store/                        # Zustand stores
│   ├── auth-store.ts             # Authentication state
│   ├── portfolio-store.ts        # Portfolio state
│   ├── admin-store.ts            # Admin panel state
│   └── alert-store.ts            # Alert modal state
│
├── hooks/                        # Custom React hooks
│   ├── use-toast.ts              # Toast notifications
│   ├── use-mobile.ts             # Mobile detection
│   └── use-alert.ts              # Alert modal
│
└── lib/                          # Utility libraries
    ├── db.ts                     # Prisma client
    └── utils.ts                  # Utility functions
```

---

## Database Schema

### User Model
```prisma
model User {
  id           String     @id @default(cuid())
  email        String     @unique
  name         String?
  username     String?    @unique
  password     String?              // Hashed password
  githubId     String?    @unique
  githubLogin  String?
  googleId     String?    @unique
  avatarUrl    String?
  bio          String?
  location     String?
  company      String?
  blog         String?
  role         String     @default("USER")   // USER or ADMIN
  isActive     Boolean    @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  portfolio    Portfolio?
  auditLogs    AuditLog[]
}
```

### Portfolio Model
```prisma
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
  user            User        @relation(...)
  content         Content?
  projects        Project[]
  experiences     Experience[]
  educations      Education[]
  skills          Skill[]
}
```

### Content Model
```prisma
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
  portfolio         Portfolio @relation(...)
}
```

### Project Model
```prisma
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
  portfolio       Portfolio @relation(...)
}
```

### Experience Model
```prisma
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
  portfolio    Portfolio @relation(...)
}
```

### Education Model
```prisma
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
  portfolio    Portfolio @relation(...)
}
```

### Skill Model
```prisma
model Skill {
  id           String   @id @default(cuid())
  portfolioId  String
  name         String
  category     String   @default("technical")  // technical, soft, tools
  proficiency  Int      @default(3)            // 1-5
  displayOrder Int      @default(0)
  isVisible    Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  portfolio    Portfolio @relation(...)
}
```

### SystemSettings Model
```prisma
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
```

### AuditLog Model
```prisma
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
  user       User?    @relation(...)
}
```

### Analytics Model
```prisma
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

---

## API Reference

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... }
}
```

#### POST `/api/auth/github`
Initiate GitHub OAuth flow.

**Response:**
```json
{
  "redirectUrl": "https://github.com/login/oauth/authorize?..."
}
```

#### POST `/api/auth/google`
Initiate Google OAuth flow.

**Response:**
```json
{
  "redirectUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### Portfolio Endpoints

#### GET `/api/portfolio?userId={userId}`
Fetch portfolio for a user.

**Response:**
```json
{
  "portfolio": {
    "id": "...",
    "userId": "...",
    "personalityType": "minimal",
    "accentColor": "#10b981",
    "isPublished": false,
    "content": { ... },
    "projects": [ ... ],
    "experiences": [ ... ],
    "educations": [ ... ],
    "skills": [ ... ]
  }
}
```

#### PUT `/api/portfolio`
Update portfolio settings.

**Request Body:**
```json
{
  "userId": "...",
  "personalityType": "developer",
  "accentColor": "#6366f1",
  "layoutOrder": "about,projects,experience,education,skills,contact",
  "density": "spacious",
  "reduceMotion": false,
  "isPublished": true
}
```

#### PUT `/api/portfolio/content`
Update portfolio content.

**Request Body:**
```json
{
  "portfolioId": "...",
  "aboutText": "About me text...",
  "jobTitle": "Software Engineer",
  "contactEmail": "me@example.com",
  "linkedinUrl": "https://linkedin.com/in/...",
  "githubUrl": "https://github.com/...",
  "twitterUrl": "https://twitter.com/...",
  "websiteUrl": "https://...",
  "resumeUrl": "https://..."
}
```

#### POST `/api/portfolio/projects`
Add a new project.

**Request Body:**
```json
{
  "portfolioId": "...",
  "title": "My Project",
  "description": "Project description",
  "url": "https://...",
  "imageUrl": "https://..."
}
```

#### PUT `/api/portfolio/projects`
Update a project.

#### DELETE `/api/portfolio/projects?id={projectId}`
Delete a project.

### Admin Endpoints

#### GET `/api/admin/check`
Check if any admin exists.

**Response:**
```json
{
  "hasAdmin": true,
  "adminCount": 1
}
```

#### POST `/api/admin/setup`
Create first admin account (requires setup key).

**Request Body:**
```json
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "admin123",
  "setupKey": "setup-admin-2024"
}
```

#### POST `/api/admin/login`
Admin login.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

#### GET `/api/admin/users?page=1&limit=10&role=USER&status=active`
List users with pagination and filters.

#### POST `/api/admin/users/create`
Create a new user.

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "USER"
}
```

#### PATCH `/api/admin/users/{id}`
Update user (role, isActive status).

#### DELETE `/api/admin/users/{id}`
Delete a user.

#### GET `/api/admin/portfolios`
List all portfolios.

#### GET `/api/admin/analytics?range=30`
Get analytics data.

#### GET/PATCH `/api/admin/settings`
Get or update system settings.

---

## Components

### Core Components

#### `GitHubLogin`
Main authentication page with:
- GitHub OAuth button
- Google OAuth button
- Email/password signup form
- Email/password login form
- Password strength indicator
- Error handling with alerts

#### `AdminPanel`
Full admin dashboard with:
- Sidebar navigation
- Dashboard overview
- User management table
- Portfolio management
- Analytics charts
- System settings

#### `PreviewPanel`
Live portfolio preview with:
- Desktop/mobile view toggle
- Fullscreen mode
- Refresh capability
- Error boundary

### Editor Components

Each editor component follows a consistent pattern:
1. Form state management with local useState
2. Auto-save functionality
3. Toast notifications for feedback
4. Responsive design with cards
5. Loading states

---

## State Management

### Auth Store (`useAuthStore`)
```typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}
```

### Portfolio Store (`usePortfolioStore`)
```typescript
interface PortfolioState {
  portfolio: Portfolio | null;
  isLoading: boolean;
  previewMode: boolean;
  
  // Setters
  setPortfolio: (portfolio: Portfolio | null) => void;
  setLoading: (loading: boolean) => void;
  setPreviewMode: (mode: boolean) => void;
  
  // Theme
  setPersonality: (personality: PersonalityType) => void;
  setAccentColor: (color: string) => void;
  setDensity: (density: DensityType) => void;
  setLayoutOrder: (order: string) => void;
  
  // Content updates
  updateContent: (content: Partial<Content>) => void;
  
  // CRUD operations for projects, experiences, educations, skills
  addProject: (project: Omit<Project, 'id' | 'portfolioId'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  // ... similar for other entities
}
```

### Admin Store (`useAdminStore`)
```typescript
interface AdminState {
  users: AdminUser[];
  portfolios: AdminPortfolio[];
  analytics: AnalyticsData;
  settings: SystemSettings;
  // Pagination states
  // Loading states
}
```

---

## Authentication

### OAuth Flow (GitHub/Google)

1. User clicks OAuth button
2. Frontend calls `/api/auth/{provider}`
3. Backend generates state token and redirect URL
4. User redirected to OAuth provider
5. Provider redirects to callback URL
6. Backend exchanges code for access token
7. Backend fetches user profile
8. Backend creates/updates user in database
9. Backend sets auth cookies
10. User redirected to main app

### Email/Password Flow

1. User submits signup/login form
2. Backend validates input
3. Backend hashes password (signup) or verifies (login)
4. Backend creates session
5. Backend sets auth cookies
6. Frontend updates auth store

---

## Admin Panel

### Access Control

1. First admin created via setup key (`ADMIN_SETUP_KEY` env var)
2. Existing admins can create new admins
3. Admins can promote users to admin role
4. Role-based access control on all admin endpoints

### Features

- **Dashboard**: Overview statistics and recent activity
- **Users**: Full CRUD with role management
- **Portfolios**: View all portfolios with filtering
- **Analytics**: Time-based statistics
- **Settings**: System configuration

---

## Portfolio Personalities

### 1. Minimal
Clean, professional design with:
- Hero section with avatar and bio
- Timeline-based experience
- Card-based projects
- Tag-style skills
- Clean contact grid

### 2. Developer
Terminal-inspired aesthetic with:
- Code-style headers (e.g., `intro.sh`, `contact.json`)
- Monospace typography
- Syntax-highlighted content
- Command-line UI elements

### 3. Creative
Artistic, colorful design with:
- Gradient backgrounds
- Animated decorative elements
- Playful card animations
- Colorful skill badges

### 4. Elegant
Sophisticated, refined appearance with:
- Clean typography
- Subtle animations
- Professional layout
- Minimal color accents

### 5. Futuristic
Modern 3D design with:
- Three.js animated background
- High-tech aesthetic
- Dynamic visual effects
- Modern card designs

---

## Environment Variables

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

## Getting Started

### Prerequisites
- Node.js 18+
- Bun (recommended) or npm
- PostgreSQL (production) or SQLite (development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/portfolio-generator.git
cd portfolio-generator

# Install dependencies
bun install

# Setup database
bun run db:push

# Start development server
bun run dev
```

### Creating First Admin

1. Navigate to `/admin`
2. Click "Create new admin account"
3. Enter your details and the setup key
4. Login to admin panel

---

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Manual Deployment

```bash
# Build for production
bun run build

# Start production server
bun start
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT License - feel free to use for personal or commercial projects.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
