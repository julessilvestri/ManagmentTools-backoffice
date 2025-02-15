const User = require("../models/User");

exports.searchUser = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Veuillez fournir un username ou un email à rechercher." });
        }

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ]
        }).select("name email");

        res.status(200).json(users);
    } catch (error) {
        console.error("Erreur lors de la recherche de l'utilisateur :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
