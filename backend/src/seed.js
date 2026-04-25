const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const prisma = require("./utils/prisma");

const DEFAULT_TAGS = [
  { name: "Study", icon: "📖", color: "#3B82F6" },
  { name: "Exams", icon: "📝", color: "#06B6D4" },
  { name: "Stress", icon: "😰", color: "#EF4444" },
  { name: "Win!", icon: "🏆", color: "#B45309" },
  { name: "Growth", icon: "🌱", color: "#EAB308" },
  { name: "Rest", icon: "🛏️", color: "#FDBA74" },
  { name: "Health", icon: "💚", color: "#22C55E" },
  { name: "Work", icon: "💼", color: "#4B5563" },
];

async function seed() {
  for (const tag of DEFAULT_TAGS) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: { icon: tag.icon, color: tag.color },
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
