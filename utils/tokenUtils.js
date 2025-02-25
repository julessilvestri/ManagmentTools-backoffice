const jwt = require('jsonwebtoken');

module.exports = (req) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        throw new Error('Token manquant ou invalide');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Token invalide');
    }
};
