require("dotenv").config();

const prisma = require("../src/utils/prisma");

const TARGET_EMAIL = "prasad@gmail.com";
const DAYS_TO_SEED = 21;

const moodPlan = [
  {
    mood: "happy",
    text: "I felt good after getting through my tasks and catching up with a friend.",
    tags: ["productive", "social"],
  },
  {
    mood: "tired",
    text: "Long day. I got things done, but I felt mentally drained by the evening.",
    tags: ["study", "rest"],
  },
  {
    mood: "stressed",
    text: "Deadlines stacked up today and I could feel the pressure building.",
    tags: ["deadlines", "stress"],
  },
  {
    mood: "calm",
    text: "A quieter day. I took things slowly and felt more grounded than usual.",
    tags: ["rest", "balance"],
  },
  {
    mood: "depressed",
    text: "I felt low and unmotivated today, and it was hard to enjoy anything.",
    tags: ["low", "mental-health"],
  },
  {
    mood: "great",
    text: "One of the better days this week. I felt confident and energized.",
    tags: ["win", "energy"],
  },
  {
    mood: "overwhelmed",
    text: "Too many thoughts at once today. I struggled to focus on one thing.",
    tags: ["focus", "stress"],
  },
  {
    mood: "sad",
    text: "I felt off and emotionally heavy for most of the day.",
    tags: ["emotions"],
  },
  {
    mood: "okay",
    text: "Nothing major happened today. It was steady and manageable.",
    tags: ["steady"],
  },
  {
    mood: "anxious",
    text: "I kept overthinking a few things and felt tense throughout the afternoon.",
    tags: ["anxiety"],
  },
];

function atNoonUtc(daysAgo) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date;
}

async function main() {
  const user =
    (await prisma.user.findUnique({ where: { email: TARGET_EMAIL } })) ||
    (await prisma.user.findFirst({ orderBy: { id: "asc" } }));

  if (!user) {
    throw new Error("No user found to seed diary data for.");
  }

  const rows = Array.from({ length: DAYS_TO_SEED }, (_, index) => {
    const plan = moodPlan[index % moodPlan.length];
    const createdAt = atNoonUtc(DAYS_TO_SEED - index - 1);
    return {
      text: plan.text,
      mood: plan.mood,
      tags: plan.tags,
      createdAt,
      updatedAt: createdAt,
      userId: user.id,
    };
  });

  await prisma.diaryEntry.deleteMany({
    where: {
      userId: user.id,
      createdAt: { gte: rows[0].createdAt },
    },
  });

  await prisma.diaryEntry.createMany({ data: rows });

  console.log(
    `Seeded ${rows.length} dummy diary entries for ${user.email} from ${rows[0].createdAt.toISOString().split("T")[0]} to ${rows[rows.length - 1].createdAt.toISOString().split("T")[0]}.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
