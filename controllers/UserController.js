const mongoose = require("mongoose");
const UserService = require("../services/UserService");

/**
 * Contrôleur pour rechercher des utilisateurs en fonction d'une requête.
 * @route GET /users/search
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {void} - Renvoie la liste des utilisateurs trouvés ou un message d'erreur.
 */
exports.searchUser = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim() === "") {
            return res.status(400).json({ error: "Veuillez fournir un terme de recherche valide." });
        }

        const users = await UserService.searchUser(query);
        res.status(200).json(users);
    } catch (error) {
        console.error("Erreur lors de la recherche de l'utilisateur :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

/**
 * Contrôleur pour récupérer un utilisateur par son ID.
 * @route GET /users/:userId
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {void} - Renvoie l'utilisateur trouvé ou un message d'erreur.
 */
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "ID utilisateur invalide." });
        }

        const user = await UserService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);

        if (error.message === "ID utilisateur invalide.") {
            return res.status(400).json({ error: "ID utilisateur invalide." });
        }

        if (error.message === "Utilisateur non trouvé.") {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        return res.status(500).json({ error: "Erreur interne du serveur." });
    }
};
