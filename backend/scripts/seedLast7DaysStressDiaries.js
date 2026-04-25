require("dotenv").config();

const prisma = require("../src/utils/prisma");

const DEFAULT_USER_ID = Number.parseInt(process.env.TARGET_USER_ID || "3", 10);

const TAGS = [
  { name: "Stress", icon: "😰", color: "#EF4444" },
  { name: "Work", icon: "💼", color: "#3B82F6" },
  { name: "Rest", icon: "🛏️", color: "#F59E0B" },
  { name: "Tired", icon: "😴", color: "#64748B" },
  { name: "Angry", icon: "😠", color: "#DC2626" },
  { name: "Calm", icon: "😌", color: "#10B981" },
  { name: "Win!", icon: "🏆", color: "#B45309" },
  { name: "Social", icon: "👥", color: "#8B5CF6" },
];

const ENTRIES = [
  {
    dayOffset: 0,
    summary: "Too much noise and too many demands.",
    content:
      'Too many meetings, too many questions, and way too much noise. I spent the whole day "on," and now my social battery is at 0%. It felt like everyone needed a piece of my time, and I had nothing left for myself by noon. Even the sound of a notification ping makes me flinch right now. Total silence is the only thing that sounds good. Tomorrow, the phone stays on "Do Not Disturb" for at least an hour.',
    tags: ["Stress", "Work"],
  },
  {
    dayOffset: 1,
    summary: "Running on low battery.",
    content:
      "I woke up tired and stayed tired most of the day. The work got done, but it felt like every task used twice as much energy as usual. I skipped anything extra and just tried to make it through in one piece.",
    tags: ["Tired", "Rest"],
  },
  {
    dayOffset: 2,
    summary: "Frustrated and short-tempered.",
    content:
      "A small problem kept turning into a bigger one, and I could feel my patience disappearing. I was irritated with everything, even things that normally would not bother me. By evening I just wanted to be left alone and not answer to anyone.",
    tags: ["Angry", "Stress"],
  },
  {
    dayOffset: 3,
    summary: "A brighter day with one good win.",
    content:
      "Today felt lighter. I got one important task finished early, had a nice conversation with a friend, and managed to laugh a little. It was the first time all week that I felt like myself again.",
    tags: ["Win!", "Social"],
  },
  {
    dayOffset: 4,
    summary: "Quiet, slow, and calm.",
    content:
      "I kept the day simple on purpose. A slow morning, a quiet afternoon, and no pressure to be productive for once. It felt peaceful to breathe without rushing from one thing to the next.",
    tags: ["Calm", "Rest"],
  },
  {
    dayOffset: 5,
    summary: "Deadlines piled up again.",
    content:
      "Work felt heavy today. The deadlines kept stacking up and I could not focus on one thing for long before another message or task appeared. I got through it, but the whole day felt tense and sharp around the edges.",
    tags: ["Work", "Stress"],
  },
  {
    dayOffset: 6,
    summary: "Ended the week on a softer note.",
    content:
      "I caught up with someone I care about and it helped a lot more than I expected. The conversation was easy, the mood was warm, and the day ended feeling a lot more balanced than it started.",
    tags: ["Social", "Calm"],
  },
];

function startOfDayUtc(daysAgo) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date;
}

async function ensureTags() {
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: { icon: tag.icon, color: tag.color },
      create: tag,
    });
  }
}

async function main() {
  const userId = Number.isFinite(DEFAULT_USER_ID) ? DEFAULT_USER_ID : 3;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new Error(
      `User with ID ${userId} was not found. Set TARGET_USER_ID to the correct account.`
    );
  }

  await ensureTags();

  const tagRows = await prisma.tag.findMany({
    where: {
      name: {
        in: TAGS.map((tag) => tag.name),
      },
    },
  });

  const tagIdByName = new Map(tagRows.map((tag) => [tag.name, tag.id]));

  const startDate = startOfDayUtc(6);
  const endDate = startOfDayUtc(0);

  await prisma.dailyDiary.deleteMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  let createdCount = 0;

  for (const entry of ENTRIES) {
    const date = startOfDayUtc(entry.dayOffset);
    const connect = entry.tags
      .map((name) => tagIdByName.get(name))
      .filter(Boolean)
      .map((id) => ({ id }));

    await prisma.dailyDiary.create({
      data: {
        userId: user.id,
        date,
        content: entry.content,
        summary: entry.summary,
        tags: {
          connect,
        },
      },
    });

    createdCount += 1;
  }

  console.log(
    `Seeded ${createdCount} diary entries for ${user.email} covering ${startDate
      .toISOString()
      .split("T")[0]} through ${endDate.toISOString().split("T")[0]}.`
  );
}

main()
  .catch((error) => {
    console.error("Seed last 7 days error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
