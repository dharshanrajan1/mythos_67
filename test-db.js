require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

async function testPrisma() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        accounts: {
          create: {
            type: "oauth",
            provider: "google",
            providerAccountId: "google-12345",
            access_token: "test_token",
          }
        }
      }
    });
    console.log("Created successfully:", user.id);
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    // cleanup
    await prisma.user.deleteMany({ where: { email: "test@example.com" } });
    await prisma.$disconnect();
  }
}

testPrisma();
