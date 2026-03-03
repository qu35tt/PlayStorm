import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // Path to your schema or a folder containing multiple .prisma files
  schema: './prisma/schema.prisma', 
  
  migrations: {
    path: './prisma/migrations',
    // New: Seed command is now defined here instead of package.json
    seed: 'tsx ./prisma/seed.ts',
  },

  datasource: {
    // Passes the URL from your .env to the Prisma CLI
    url: env('DATABASE_URL'),
  },
});