import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load .env file explicitly to override system env
config()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use the DATABASE_URL from .env file (loaded by dotenv)
const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_NAW7iEwzPsq0@ep-winter-heart-a1u1ob4p-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
