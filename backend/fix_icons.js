const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const prisma = require("./src/utils/prisma");

const iconMap = {
  "briefcase": "💼",
  "heart": "❤️",
  "home": "🏠",
  "moon": "🌙",
  "sprout": "🌱",
  "Study": "📖",
  "Exams": "📝",
  "Stress": "😰",
  "Win!": "🏆",
  "Personal": "💜"
};

async function fixIcons() {
  const tags = await prisma.tag.findMany();
  for (const tag of tags) {
    if (tag.icon && iconMap[tag.icon]) {
      await prisma.tag.update({
        where: { id: tag.id },
        data: { icon: iconMap[tag.icon] }
      });
      console.log(`Updated tag ${tag.name} from '${tag.icon}' to '${iconMap[tag.icon]}'`);
    } else if (iconMap[tag.name] && tag.icon !== iconMap[tag.name]) {
      // Sometimes the icon matches the name map
       await prisma.tag.update({
        where: { id: tag.id },
        data: { icon: iconMap[tag.name] }
      });
      console.log(`Updated tag ${tag.name} icon to '${iconMap[tag.name]}'`);
    }
  }
  console.log("Done fixing emojis!");
}

fixIcons()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
