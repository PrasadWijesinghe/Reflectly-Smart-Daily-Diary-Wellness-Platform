require('dotenv').config();
const prisma = require('./src/utils/prisma');

async function test() {
  const diaries = await prisma.dailyDiary.findMany({
    orderBy: { date: 'desc' },
    take: 10
  });
  diaries.forEach(d => {
    console.log(`${d.date.toISOString().split('T')[0]} - ${d.summary} -> Stress: ${d.stressLevel}`);
  });
  process.exit(0);
}

test().catch(console.error);
