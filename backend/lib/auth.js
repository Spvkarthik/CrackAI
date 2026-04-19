const jwt = require("jsonwebtoken");

function authMiddleware(secret) {
  return (req, res, next) => {
    const header = String(req.headers.authorization || "");
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Missing token" });

    try {
      const payload = jwt.verify(token, secret);
      req.user = { id: payload.sub, email: payload.email, name: payload.name };
      return next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

module.exports = { authMiddleware };

