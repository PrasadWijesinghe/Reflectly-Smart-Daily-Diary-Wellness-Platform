const prisma = require("../utils/prisma");

async function getTags(req, res) {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });

    res.json({ tags });
  } catch (err) {
    console.error("GetTags error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function createTag(req, res) {
  try {
    const { name, icon, color } = req.body;

    if (!name || !icon || !color) {
      return res.status(400).json({ error: "name, icon, and color are required." });
    }

    const existing = await prisma.tag.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: "Tag already exists." });
    }

    const tag = await prisma.tag.create({
      data: { name, icon, color },
    });

    res.status(201).json({ message: "Tag created.", tag });
  } catch (err) {
    console.error("CreateTag error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function updateTag(req, res) {
  try {
    const { name, icon, color } = req.body;
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Tag not found." });
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
      },
    });

    res.json({ message: "Tag updated.", tag });
  } catch (err) {
    console.error("UpdateTag error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function deleteTag(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Tag not found." });
    }

    await prisma.tag.delete({ where: { id } });

    res.json({ message: "Tag deleted." });
  } catch (err) {
    console.error("DeleteTag error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = { getTags, createTag, updateTag, deleteTag };
