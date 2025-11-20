import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    directUrl: process.env.DIRECT_URL!,
    url: process.env.DATABASE_URL!,
  },
});
