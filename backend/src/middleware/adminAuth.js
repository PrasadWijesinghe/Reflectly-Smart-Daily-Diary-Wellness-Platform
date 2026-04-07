const jwt = require("jsonwebtoken");

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No admin token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }

    req.admin = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired admin token." });
  }
}

module.exports = authenticateAdmin;
