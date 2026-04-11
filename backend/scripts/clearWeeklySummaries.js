require("dotenv").config({ path: __dirname + "/../.env" });
const prisma = require("../src/utils/prisma");

async function clearWeeklySummaries() {
  try {
    await prisma.weeklySummary.deleteMany({});
    console.log("All WeeklySummary records cleared.");
  } catch (error) {
    console.error("Error clearing WeeklySummary:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearWeeklySummaries();