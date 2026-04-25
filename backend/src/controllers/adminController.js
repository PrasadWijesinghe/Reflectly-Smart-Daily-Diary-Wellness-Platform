const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

async function login(req, res) {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Invalid admin credentials." });
    }

    const token = jwt.sign(
      {
        role: "admin",
        username: ADMIN_USERNAME,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      message: "Admin login successful.",
      token,
      admin: { username: ADMIN_USERNAME },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ error: "Failed to login as admin." });
  }
}

async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            diaries: true,
          },
        },
      },
    });

    const totalUsers = users.length;
    const totalDiaryEntries = users.reduce((sum, user) => sum + user._count.diaries, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = users.filter((user) => new Date(user.createdAt) >= weekAgo).length;

    return res.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        diaryCount: user._count.diaries,
      })),
      summary: {
        totalUsers,
        totalDiaryEntries,
        newUsersThisWeek,
      },
    });
  } catch (err) {
    console.error("Get admin users error:", err);
    return res.status(500).json({ error: "Failed to fetch users." });
  }
}

async function getTags(req, res) {
  try {
    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        _count: {
          select: {
            diaries: true,
          },
        },
      },
    });

    return res.json({
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        icon: tag.icon,
        color: tag.color,
        usageCount: tag._count.diaries,
      })),
    });
  } catch (err) {
    console.error("Get admin tags error:", err);
    return res.status(500).json({ error: "Failed to fetch tags." });
  }
}

async function createTag(req, res) {
  try {
    const name = String(req.body?.name || "").trim();
    const icon = String(req.body?.icon || "").trim();
    const color = String(req.body?.color || "").trim();

    if (!name || !icon || !color) {
      return res.status(400).json({ error: "Name, icon, and color are required." });
    }

    const existing = await prisma.tag.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: "Tag already exists." });
    }

    const tag = await prisma.tag.create({
      data: { name, icon, color },
    });

    return res.status(201).json({ message: "Tag created.", tag });
  } catch (err) {
    console.error("Create admin tag error:", err);
    return res.status(500).json({ error: "Failed to create tag." });
  }
}

async function getFeedbacks(req, res) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.json({ feedbacks });
  } catch (err) {
    console.error("Get admin feedbacks error:", err);
    return res.status(500).json({ error: "Failed to fetch feedbacks." });
  }
}

module.exports = {
  login,
  getUsers,
  getTags,
  createTag,
  getFeedbacks,
};
