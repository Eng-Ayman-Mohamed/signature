Here is an enhanced version of your README. It’s designed to be more professional, visually structured, and informative for both recruiters and developers.

I've added badges, a cleaner feature breakdown, and clear installation instructions tailored to your stack (Next.js, Prisma, and Bun).

---

# 📝 Signature — Professional Portfolio Generator

**Signature** is a high-performance, full-stack portfolio builder that empowers developers and creatives to launch a professional online presence in minutes. Built with a focus on "Personalities," it offers 5 unique visual identities ranging from terminal-inspired code themes to immersive 3D futuristic designs.

---

## ✨ Key Features

### 🎨 Five Unique "Personalities"

* **Minimal:** Clean, high-contrast, professional focus.
* **Developer:** A terminal-inspired aesthetic for the code-obsessed.
* **Creative:** Artistic, vibrant, and gradient-heavy.
* **Elegant:** Sophisticated typography and refined layouts.
* **Futuristic:** Immersive 3D animated backgrounds powered by **Three.js**.

### 🛠️ Powerful Editor & Dashboard

* **Live Preview:** Toggle between Mobile and Desktop views with real-time updates.
* **Drag-and-Drop:** Intuitive reordering for experiences, projects, and skills.
* **GitHub Integration:** Import repository data and stats directly.
* **Full Admin Panel:** Manage users, monitor platform analytics, and toggle maintenance modes.

### ⚙️ Technical Highlights

* **Responsive:** Fully optimized for all screen sizes using Tailwind CSS.
* **Persistence:** State management via **Zustand** with persistent storage.
* **Security:** NextAuth.js integration with BCrypt hashing and JWT protection.
* **Modern Stack:** Leverages Next.js 15 App Router and React 19.

---

## 🚀 Tech Stack

* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Database:** PostgreSQL (Production) / SQLite (Dev) via Prisma ORM
* **Styling:** Tailwind CSS 4 & shadcn/ui
* **Animations:** Framer Motion & Three.js (React Three Fiber)
* **Auth:** NextAuth.js
* **State Management:** Zustand

---

## 🛠️ Getting Started

### Prerequisites

* [Bun](https://bun.sh/) (Recommended) or Node.js
* A PostgreSQL database (or use the default SQLite for local dev)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Eng-Ayman-Mohamed/signature.git
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


4. **Database Migration:**
```bash
bun prisma generate
bun prisma db push

```


5. **Run Development Server:**
```bash
bun dev

```



Visit `http://localhost:3000` to see your app running.

---

## 📁 Project Structure

```text
src/
├── app/             # Next.js App Router (Pages & API Routes)
├── components/      # UI, Auth, Editor, and "Personality" Themes
├── store/           # Zustand State Management
├── lib/             # Prisma Client & Utilities
├── hooks/           # Custom React Hooks (Toasts, Alerts)
└── prisma/          # Database Schema & Migrations

```

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn and create.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **GPL-3.0 License**. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

---

**Developed with ❤️ by [Ayman Mohamed**](https://github.com/Eng-Ayman-Mohamed)
