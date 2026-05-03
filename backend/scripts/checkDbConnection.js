const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const prisma = require("../src/utils/prisma");

async function main() {
  await prisma.$connect();
  console.log("DB_OK");
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("DB_CONNECTION_FAILED:", error.message);
  try {
    await prisma.$disconnect();
  } catch (_) {
    // ignore secondary disconnect failures
  }
  process.exit(1);
});
