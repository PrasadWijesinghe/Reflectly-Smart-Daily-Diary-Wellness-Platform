require('dotenv').config();
const prisma = require('../src/utils/prisma');

async function main() {
  const userId = 4;
  console.log(`Seeding past 30 days data for user ${userId}...`);

  // First, verify the user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    console.error(`User with ID ${userId} not found.`);
    process.exit(1);
  }

  // Define some tags
  const tagsToEnsure = [
    { name: "Work", icon: "💼", color: "#3B82F6" },
    { name: "Health", icon: "🏥", color: "#10B981" },
    { name: "Relax", icon: "☕", color: "#8B5CF6" },
    { name: "Study", icon: "📚", color: "#F59E0B" },
    { name: "Family", icon: "👨‍👩‍👧", color: "#EF4444" }
  ];

  for (const tag of tagsToEnsure) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag
    });
  }

  const allTags = await prisma.tag.findMany();

  const getTags = (...names) => {
    return allTags.filter(t => names.includes(t.name)).map(t => ({ id: t.id }));
  };

  const sampleEntries = [
    { content: "Today had a really great flow. I felt productive at work, knocked out most of my to-do list, and still had the energy to catch up with friends. Feeling happy and content.", summary: "Productive and happy.", tags: ["Work", "Relax"] },
    { content: "The pressure from upcoming deadlines is honestly starting to get to me. I felt constantly anxious and stressed throughout the afternoon, trying to multitask but barely making progress.", summary: "Stressful day.", tags: ["Work", "Study"] },
    { content: "I finally took some time for myself today and it made a huge difference. I spent the evening relaxing with a good book, leaving me feeling genuinely calm and centered.", summary: "Calm and peaceful.", tags: ["Relax", "Health"] },
    { content: "This was one of those days that just drags on forever. I am feeling completely exhausted and physically tired right now, all I want to do is grab some sleep and reset for tomorrow.", summary: "Tired out.", tags: ["Work", "Health"] },
    { content: "Just an ordinary, predictable day with no major highs or lows. I spent most of the time tending to regular chores around the house and checking in with family.", summary: "Average day.", tags: ["Family"] },
    { content: "I started working on a new mental health routine today and it feels incredibly promising. I feel really hopeful about my progress and look forward to sticking with the plan.", summary: "Feeling great and hopeful.", tags: ["Health", "Relax"] },
    { content: "A bit of an unsettling evening due to some unexpected delays with a family project. My mind is a bit scattered and I'm feeling rather anxious about how this will play out.", summary: "Anxious.", tags: ["Family", "Work"] },
  ];

  const now = new Date();
  
  // Create an entry for the past 30 days
  for (let i = 0; i < 30; i++) {
    const entryDate = new Date(now);
    entryDate.setDate(entryDate.getDate() - i);

    const sample = sampleEntries[i % sampleEntries.length];
    
    const tagConnect = getTags(...sample.tags);

    // To avoid Unique constraint violation, delete any entries existing for this user on this exact same day
    const startOfDay = new Date(entryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(entryDate);
    endOfDay.setHours(23, 59, 59, 999);

    await prisma.dailyDiary.deleteMany({
      where: {
        userId: userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const cleanDate = new Date(now);
    cleanDate.setDate(cleanDate.getDate() - i);
    cleanDate.setHours(12, 0, 0, 0); // Noon

    await prisma.dailyDiary.create({
      data: {
        userId: userId,
        date: cleanDate,
        content: sample.content,
        summary: sample.summary,
        tags: {
          connect: tagConnect
        }
      }
    });
  }

  console.log(`Successfully seeded 30 diary entries for user ${userId}.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
