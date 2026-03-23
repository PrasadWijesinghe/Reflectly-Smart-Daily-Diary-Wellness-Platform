const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const prisma = require("./utils/prisma");

const DEFAULT_TAGS = [
  { name: "Study", icon: "📖", color: "#3B82F6" },
  { name: "Exams", icon: "📝", color: "#8B5CF6" },
  { name: "Stress", icon: "😰", color: "#F59E0B" },
  { name: "Win!", icon: "🏆", color: "#EF4444" },
  { name: "Personal", icon: "💜", color: "#EC4899" },
];

async function seed() {
  for (const tag of DEFAULT_TAGS) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
    console.log(`Tag "${tag.name}" seeded.`);
  }
  console.log("All default tags seeded.");
}

seed()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
