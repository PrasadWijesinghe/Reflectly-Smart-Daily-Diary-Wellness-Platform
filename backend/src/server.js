const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const app = require("./app");
const prisma = require("./utils/prisma");

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log("✅ Database connection established");

    app.listen(PORT, "0.0.0.0", (err) => {
      if (err) {
        console.error(`❌ Failed to start server: ${err.message}`);
        process.exit(1);
      }
      console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    process.exit(1);
  }
}

bootstrap();
