import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const prismaDir = path.join(projectRoot, 'prisma');
const skeletonPath = path.join(prismaDir, 'skeleton.db');

console.log('🏗️  Generating fresh skeleton database...');

// 1. Remove existing skeleton.db
if (fs.existsSync(skeletonPath)) {
  console.log('🗑️  Removing existing skeleton.db...');
  fs.unlinkSync(skeletonPath);
}

// 2. Generate new database using Prisma
// We use a temporary env var for the connection string to point to the skeleton file
const connectionString = `file:${skeletonPath}`;

try {
  console.log('⚙️  Running prisma db push...');
  execSync(`npx prisma db push --schema=${path.join(prismaDir, 'schema.prisma')} --skip-generate`, {
    env: { ...process.env, DATABASE_URL: connectionString },
    stdio: 'inherit',
    cwd: projectRoot,
  });
  console.log('✅  Fresh skeleton.db created successfully!');
} catch (error) {
  console.error('❌  Failed to generate skeleton database:', error);
  process.exit(1);
}
