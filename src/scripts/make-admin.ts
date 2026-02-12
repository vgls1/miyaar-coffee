import { PrismaClient, Role } from '@prisma/client';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config({ path: 'g:\\commercial websites\\src\\.env' });

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'khaled@gmail.com'; // Or allow passing via args
  
  // Try to find the user first
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`User ${email} not found. Creating admin user...`);
    // Create new admin user if not exists
    // Note: Password should be hashed in real app, but for this script we might need to use AuthService
    // We will just update if exists, or pick the first user.
    const firstUser = await prisma.user.findFirst();
    if (firstUser) {
        user = firstUser;
        console.log(`Found user ${user.email}, promoting to ADMIN.`);
    } else {
        console.error("No users found to promote.");
        return;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { email: user.email },
    data: { role: Role.ADMIN },
  });

  console.log(`User ${updatedUser.email} is now ${updatedUser.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

