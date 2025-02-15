const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        if (!token) return res.status(401).json({ error: "Accès refusé, token manquant !" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: "Token manquant ou invalide" });
    }
};
