const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware pour vérifier le token dans les requêtes HTTP
 */
module.exports = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", ""); // Récupère le token depuis l'en-tête Authorization
        if (!token) return res.status(401).json({ error: "Accès refusé, token manquant !" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Vérifie et décode le token

        const user = await User.findById(decoded.userId);  // Recherche l'utilisateur par son ID extrait du token
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

        req.user = user;  // Stocke l'utilisateur dans req.user pour l'utiliser dans les routes suivantes
        next();
    } catch (error) {
        res.status(401).json({ error: "Token manquant ou invalide" });
    }
};
