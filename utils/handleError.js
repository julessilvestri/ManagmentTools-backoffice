/**
 * Fonction pour gérer les erreurs dans les contrôleurs
 * @param {Object} res - L'objet de réponse Express
 * @param {Object} error - L'erreur rencontrée
 * @param {number} statusCode - Le code de statut HTTP à renvoyer (par défaut 500)
 */
module.exports = (res, error, message = "Erreur interne du serveur") => {
    if (error.name === "CastError") {
        return res.status(400).json({ error: "ID fourni invalide." });
    }

    if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: message });
};

