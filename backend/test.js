const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const prisma = require("./src/utils/prisma");

prisma.tag.findMany().then(res => console.log(JSON.stringify(res, null, 2))).finally(() => prisma.$disconnect());
