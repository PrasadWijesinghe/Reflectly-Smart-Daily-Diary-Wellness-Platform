const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const prisma = require("./utils/prisma");
const { generateAISummary } = require("./utils/gemini");
const { analyzeMood } = require("./utils/moodAnalyzer");
const { analyzeStress } = require("./utils/stressAnalyzer");
const { analyzeTopic } = require("./utils/topicAnalyzer");

const DIARY_DATA = [
  {
    daysAgo: 13,
    content: "Decided to start tracking my daily life and wellness. I feel like writing things down will help me process my thoughts better. It's a small step towards better mental clarity.",
    tags: ["Personal"]
  },
  {
    daysAgo: 12,
    content: "Spent most of the day reading course materials. It was quite dense, but I managed to get through the first three chapters. My eyes are tired, but I'm glad I made progress.",
    tags: ["Study"]
  },
  {
    daysAgo: 11,
    content: "Feeling a bit overwhelmed with the upcoming deadlines. It seems like everything is due at the same time. I need to make a solid schedule tomorrow to avoid burning out.",
    tags: ["Stress"]
  },
  {
    daysAgo: 10,
    content: "Took a good break today and went for a long walk to clear my head. The fresh air really helped. Sometimes stepping away from the screen is the most productive thing you can do.",
    tags: ["Personal"]
  },
  {
    daysAgo: 9,
    content: "Back to the grind. The walk yesterday really paid off because I had amazing focus today. I knocked out a huge chunk of my coding project in just a few hours.",
    tags: ["Study", "Win!"]
  },
  {
    daysAgo: 8,
    content: "Working on the group assignment today. The communication is tough and we are struggling to align our schedules. It's frustrating, but we finally agreed on a division of labor.",
    tags: ["Study", "Stress"]
  },
  {
    daysAgo: 7,
    content: "Midterms are approaching fast. I spent the evening organizing my notes and creating flashcards. It feels good to have a structured revision plan in place.",
    tags: ["Exams"]
  },
  {
    daysAgo: 6,
    content: "Did a mock test this morning. The results were okay, but I definitely need to review the third module more thoroughly. At least I know where my weak spots are now.",
    tags: ["Study", "Exams"]
  },
  {
    daysAgo: 5,
    content: "Didn't sleep well last night. Kept waking up thinking about everything I have to do. The anxiety is creeping up again, so I'm trying some deep breathing exercises today.",
    tags: ["Stress"]
  },
  {
    daysAgo: 4,
    content: "Finally finished that huge assignment! What a massive relief. I submitted it hours before the deadline too. Going to treat myself to some good food tonight to celebrate.",
    tags: ["Win!"]
  },
  {
    daysAgo: 3,
    content: "Took the entire day off from studying. Caught up with some friends over coffee and we just chatted for hours. It was exactly what my soul needed right now.",
    tags: ["Personal"]
  },
  {
    daysAgo: 2,
    content: "Did a very light review session today. Just skimming over my highlights and making sure I remember the key concepts. Trying not to overtire myself before the exam.",
    tags: ["Study"]
  },
  {
    daysAgo: 1,
    content: "Final review before the big test tomorrow. I'm feeling a mix of nerves and excitement. I know I've put in the work, so I just need to trust my preparation and get a good night's rest.",
    tags: ["Exams", "Stress"]
  },
  {
    daysAgo: 0,
    content: "The exam was actually easier than I expected! I knew the answers to almost all the essay questions. All the hard work definitely paid off. I'm so proud of myself.",
    tags: ["Win!", "Exams"]
  }
];

async function seed() {
  const email = "lakshika@gmail.com";

  // Ensure user exists
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Lakshika",
      email: email,
      password: "123456",
    },
  });

  console.log(`User seeded: ${user.email} (ID: ${user.id})`);

  // Delete existing diaries for this user
  const deleted = await prisma.dailyDiary.deleteMany({
    where: { userId: user.id },
  });
  console.log(`Deleted ${deleted.count} existing diary entries for user.`);

  // Get all tags from the database to map by name
  const dbTags = await prisma.tag.findMany();
  const tagMap = {};
  for (const t of dbTags) {
    tagMap[t.name] = t.id;
  }

  const now = new Date();

  for (const data of DIARY_DATA) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() - data.daysAgo);
    targetDate.setHours(12, 0, 0, 0);

    const tagConnects = data.tags.filter(name => tagMap[name]).map(name => ({ id: tagMap[name] }));

    // Generate summary from content using AI
    const summary = await generateAISummary(data.content);
    console.log(`  Summary: "${summary}"`);

    // Analyze mood, stress, and topic from the AI-generated summary
    const moodContent = await analyzeMood(summary);
    const stressScore = await analyzeStress(summary);
    const topicValue = await analyzeTopic(summary);

    await prisma.dailyDiary.create({
      data: {
        date: targetDate,
        summary: summary,
        content: data.content,
        mood: moodContent,
        stressLevel: stressScore,
        topic: topicValue,
        userId: user.id,
        tags: {
          connect: tagConnects
        }
      }
    });

    console.log(`Seeded diary for ${targetDate.toDateString()}: ${summary}`);
  }

  console.log("All 14 diary entries have been successfully saved!");
}

seed()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
