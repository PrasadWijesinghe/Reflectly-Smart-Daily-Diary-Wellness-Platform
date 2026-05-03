require('dotenv').config({ path: __dirname + '/.env' });
const prisma = require('./src/utils/prisma');

async function main() {
  const entry = await prisma.dailyDiary.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });
  console.log('Latest entry by:', entry?.user?.name, 'ID:', entry?.userId);
  
  if (!entry?.userId) return;

  const userId = entry.userId;
  const stressfulEntries = [
    {
      content: "Today was absolutely overwhelming. My boss yelled at me in front of everyone and I feel like quitting. Everything is going wrong.",
      moodScore: 10,
      tags: ["work", "stress", "anxiety"]
    },
    {
      content: "I didn't sleep at all last night. The pressure is too much. I have so many deadlines and I feel completely burnt out.",
      moodScore: 20,
      tags: ["sleep", "stress", "exhaustion"]
    },
    {
      content: "Another terrible day. I had a massive argument with my partner. I feel so alone and misunderstood. Just want to cry.",
      moodScore: 15,
      tags: ["family", "argument", "sadness"]
    },
    {
      content: "Work is piling up. I can't catch a break. My chest feels tight from all this anxiety. When will this end?",
      moodScore: 25,
      tags: ["work", "anxiety", "health"]
    },
    {
      content: "Failed an important presentation today. I feel like a complete failure. Imposter syndrome is hitting really hard right now.",
      moodScore: 18,
      tags: ["failure", "career", "depression"]
    },
    {
      content: "Feeling incredibly drained. Commute was awful, work was awful, and I have no energy left for anything else.",
      moodScore: 30,
      tags: ["tired", "commute", "stress"]
    },
    {
      content: "Everything feels pointless today. So much pressure from every side. I just want to disappear for a while.",
      moodScore: 12,
      tags: ["pressure", "overwhelmed", "hopeless"]
    }
  ];

  const today = new Date();
  
  for (let i = 0; i < stressfulEntries.length; i++) {
    const entryDate = new Date(today);
    entryDate.setDate(today.getDate() - (6 - i)); // Past 7 days up to today
    entryDate.setUTCHours(0, 0, 0, 0);
    
    const tagConnectOrCreate = stressfulEntries[i].tags.map(tagName => ({
      where: { name: tagName },
      create: { name: tagName, icon: "sad-outline", color: "#EF4444" }
    }));

    await prisma.dailyDiary.upsert({
      where: {
        userId_date: {
          userId,
          date: entryDate
        }
      },
      update: {
        content: stressfulEntries[i].content,
        summary: "The user is experiencing severe stress and anxiety.",
        moodScore: stressfulEntries[i].moodScore,
        tags: {
          connectOrCreate: tagConnectOrCreate
        }
      },
      create: {
        userId,
        date: entryDate,
        content: stressfulEntries[i].content,
        summary: "The user is experiencing severe stress and anxiety.",
        moodScore: stressfulEntries[i].moodScore,
        tags: {
          connectOrCreate: tagConnectOrCreate
        }
      }
    });
    console.log(`Created/Updated entry for ${entryDate.toDateString()}`);
  }
  
  console.log("Successfully injected 7 stressful days!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
