const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        const token = req.cookies.token; // Accéder au cookie du token
        const userId = req.cookies.userId; // Accéder au cookie de l'ID utilisateur

        if (!token || !userId) {
            return res.status(401).json({ error: "Accès non autorisé, veuillez vous connecter" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.userId !== userId) {
            return res.status(401).json({ error: "Utilisateur non valide" });
        }

        req.userId = decoded.userId; // Vous pouvez également ajouter l'ID de l'utilisateur à `req` pour l'utiliser dans vos routes
        next();
    } catch (error) {
        res.status(401).json({ error: "Token invalide ou expiré" });
    }
};
