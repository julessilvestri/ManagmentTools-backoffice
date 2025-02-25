const { validationResult } = require('express-validator');
const { registerUser, loginUser } = require('../services/AuthService');

const handleError = (res, error, statusCode = 500) => {
    console.error(error);
    res.status(statusCode).json({ error: error.message || "Erreur serveur" });
};

/**
 * Inscription d'un utilisateur.
 * Cette méthode permet de créer un nouvel utilisateur, après avoir validé les données envoyées par la requête.
 * Si des erreurs de validation sont détectées, elle retourne une erreur 400. Si l'inscription est réussie, 
 * elle renvoie un message de succès avec un code de statut 201.
 * 
 * @param {Object} req - L'objet de la requête, contenant les données de l'utilisateur à inscrire dans `req.body`.
 * @param {Object} res - L'objet de la réponse, utilisé pour renvoyer un message de succès ou une erreur.
 * 
 * @returns {void} - Retourne une réponse HTTP avec un message de succès ou une erreur en cas de problème.
 */
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { lastname, firstname, username, password } = req.body;

        const user = await registerUser({ lastname, firstname, username, password });

        res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        handleError(res, error, error.message.includes("email") ? 400 : 500);
    }
};

/**
 * Connexion d'un utilisateur.
 * Cette méthode permet à un utilisateur de se connecter en utilisant son nom d'utilisateur et son mot de passe.
 * Si les informations d'identification sont incorrectes ou l'utilisateur n'existe pas, une erreur 400 est retournée.
 * Si la connexion est réussie, un token JWT et l'ID de l'utilisateur sont renvoyés avec un code 200.
 * Les informations sont également stockées dans des cookies pour maintenir la session de l'utilisateur.
 * 
 * @param {Object} req - L'objet de la requête, contenant les informations de connexion dans `req.body`.
 * @param {Object} res - L'objet de la réponse, utilisé pour renvoyer un token, l'ID de l'utilisateur ou une erreur.
 * 
 * @returns {void} - Retourne une réponse HTTP avec le token et l'ID de l'utilisateur, ou une erreur en cas d'échec.
 */
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        const { token, user } = await loginUser(username, password);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: 'None'
        });

        res.cookie('userId', user._id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: 'None'
        });

        res.status(200).json({ token, userId: user._id });
    } catch (error) {
        console.error("Erreur lors de la connexion : ", error);
        if (error.message === "Identifiants invalides" || error.message === "Nom d'utilisateur inconnu") {
            return handleError(res, error, 400);
        }
        handleError(res, error);
    }
};

