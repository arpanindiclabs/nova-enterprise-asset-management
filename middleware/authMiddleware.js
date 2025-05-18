const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET; // Should match your login JWT secret

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization']; // Log the headers for debugging
    console.log('Authorization header:', authHeader); // Log the Authorization header

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // attach decoded payload to request
        console.log('Decoded JWT:', decoded); // Log the decoded JWT for debugging
        next(); // proceed to the next middleware/route
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}

module.exports = verifyToken;
