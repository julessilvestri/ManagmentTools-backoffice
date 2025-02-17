const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // Récupérer le token du header Authorization ou du cookie
        const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies.token;

        if (!token) return res.status(401).json({ error: "Accès refusé, token manquant !" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Chercher l'utilisateur par userId décodé du token
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

        // Attacher l'utilisateur à la requête pour l'accès dans d'autres middleware/routes
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: "Token manquant ou invalide" });
    }
};
