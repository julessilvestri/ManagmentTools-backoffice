const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // Récupérer le token et l'ID utilisateur depuis les cookies
        const token = req.cookies.token;
        const userId = req.cookies.userId;

        // Vérifier que le token et l'userId sont présents
        if (!token || !userId) {
            return res.status(401).json({ error: "Accès non autorisé, veuillez vous connecter" });
        }

        // Vérifier la validité du token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Vérifier si le userId du token correspond à celui dans les cookies
        if (decoded.userId !== userId) {
            return res.status(401).json({ error: "Utilisateur non valide" });
        }

        // Ajouter l'ID de l'utilisateur à la requête
        req.userId = decoded.userId;

        // Passer au middleware suivant
        next();
    } catch (error) {
        // Gestion des erreurs lors de la vérification du token ou de son expiration
        return res.status(401).json({ error: "Token invalide ou expiré" });
    }
};
