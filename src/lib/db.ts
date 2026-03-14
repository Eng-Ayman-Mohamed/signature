import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get DATABASE_URL - system env may have SQLite, force PostgreSQL
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  // If URL doesn't start with postgresql, use the correct PostgreSQL URL
  if (!url || !url.startsWith('postgresql')) {
    return "postgresql://neondb_owner:npg_NAW7iEwzPsq0@ep-winter-heart-a1u1ob4p-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
  }
  return url;
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
