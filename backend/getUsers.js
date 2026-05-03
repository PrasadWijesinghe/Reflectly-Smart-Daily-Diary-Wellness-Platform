require('dotenv').config({ path: __dirname + '/.env' });
const prisma = require('./src/utils/prisma');

async function main() {
  const users = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
