const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ error: "Access Denied , No Token Provided" });
}

const token = authHeader.split(" ")[1];
console.log(">>> ATTEMPTING VERIFY. Token starts with:", token?.substring(0, 10));

try {
    if (!process.env.JWT_SECRET) {
        console.error(">>> ERROR: JWT_SECRET IS MISSING IN verifyToken");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.id;      // For product ownership checks
    req.userRole = decoded.role;  // For role-based filtering
    next();
} catch (error) {
    console.log(">>> TOKEN VERIFICATION FAILED:", error.message);
    return res.status(403).json({ error: "invalid or expired token" });
}
};

module.exports = verifyToken;