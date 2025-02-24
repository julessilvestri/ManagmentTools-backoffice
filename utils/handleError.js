/**
 * Fonction pour gérer les erreurs dans les contrôleurs
 * @param {Object} res - L'objet de réponse Express
 * @param {Object} error - L'erreur rencontrée
 * @param {number} statusCode - Le code de statut HTTP à renvoyer (par défaut 500)
 */
const handleError = (res, error, statusCode = 500) => {
    console.error(error);
    res.status(statusCode).json({
        error: error.message || 'Une erreur est survenue, veuillez réessayer plus tard.',
    });
};

module.exports = handleError;
