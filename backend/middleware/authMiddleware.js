const jwt = require('jsonwebtoken');

// 4. SECURITY GUARD MIDDLEWARE (Put this right before your protected routes)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; 
        next(); 
    } catch (err) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
}

const requireOrganizer = (req,res,next) => {
    if (req.user.role !== "organizer"){
        return res.status(403).json({
            error:"Organizer access required."
        });
    }
    next();
};

module.exports = {
    verifyToken,
    requireOrganizer
}