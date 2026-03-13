# 📝 Signature — Professional Portfolio Generator

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-yellow.svg?style=flat-square)](https://opensource.org/licenses/GPL-3.0)

---

### 📖 Documentation & Help
[🚀 Platform User Guide](./SUPPORT.md) | [⚖️ License](./LICENSE)

---
**Signature** is a high-performance, full-stack portfolio builder that empowers developers and creatives to launch a professional online presence in minutes. With 5 distinct visual "Personalities"—ranging from terminal-inspired code themes to immersive 3D futuristic designs—your portfolio will never look generic again.

---

## ✨ Features

### For Users
* **5 Unique Personalities:** Minimal, Developer (Terminal), Creative, Elegant, and Futuristic (3D).
* **GitHub Integration:** Sync your repositories and display live stars and stats.
* **Real-time Editor:** See changes instantly with a live desktop/mobile preview.
* **Drag-and-Drop:** Intuitive reordering of projects, skills, and work experience.
* **Custom URL:** Claim your unique `/username` profile link.

### For Developers
* **Modern Stack:** Built with Next.js 15 (App Router), React 19, and Tailwind CSS 4.
* **Database:** Prisma ORM for seamless data management (PostgreSQL/SQLite).
* **State Management:** Zustand with persistent client-side storage.
* **Auth:** Secure authentication via NextAuth.js (GitHub, Google, or Email).

---

## 🚀 User Guide: How to Use

Launching your portfolio is a simple 4-step process:

1.  **Sign Up:** Create an account via Email, GitHub, or Google.
2.  **Fill Your Content:** Head to the **Editor** to add your bio, experience, and skills. Use the **GitHub Sync** to pull in your best coding projects.
3.  **Select Your Vibe:** Choose a **Personality** in the Theme Settings and pick an **Accent Color** that matches your style.
4.  **Go Live:** Preview your site, set your custom username, and hit **Publish**. Your professional link is ready to share!

---

## 🛠️ Technical Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (Recommended) or Node.js
- A PostgreSQL database (or use SQLite for local testing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Eng-Ayman-Mohamed/signature.git](https://github.com/Eng-Ayman-Mohamed/signature.git)
   cd signature

```

2. **Install dependencies:**
```bash
bun install

```


3. **Environment Setup:**
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

```


4. **Database Sync:**
```bash
bun prisma generate
bun prisma db push

```


5. **Start Development:**
```bash
bun dev

```



---

## 📁 Project Structure

```text
src/
├── app/             # App Router (Pages & API Routes)
├── components/      # UI, Editor, and "Personality" Themes
├── store/           # Zustand State Stores
├── lib/             # Prisma Client & Utility Functions
├── hooks/           # Custom React Hooks
└── prisma/          # Database Schema

```

---

## 🤝 Contributing

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **GPL-3.0 License**. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

---

**Developed with ❤️ by [Ayman Mohamed](https://github.com/Eng-Ayman-Mohamed)**
