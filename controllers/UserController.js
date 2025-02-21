const User = require("../models/User");

exports.searchUser = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Veuillez fournir un nom, un prénom ou un nom d'utilisateur à rechercher." });
        }

        const users = await User.find({
            $or: [
                { lastname: { $regex: query, $options: "i" } },
                { firstname: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } }
            ]
        }).select("lastname firstname username createdAt");

        res.status(200).json(users);
    } catch (error) {
        console.error("Erreur lors de la recherche de l'utilisateur :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params; // Récupération de l'ID depuis l'URL

        if (!userId) {
            return res.status(400).json({ error: "Veuillez fournir un ID d'utilisateur valide." });
        }

        const user = await User.findById(userId).select("lastname firstname username createdAt");

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la recherche de l'utilisateur :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

