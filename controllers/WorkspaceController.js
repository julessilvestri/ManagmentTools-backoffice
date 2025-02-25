const { getWorkspacesForUser, getWorkspaceByIdAndValidateMember, createWorkspace, addMemberToWorkspace, deleteWorkspace } = require('../services/WorkspaceService');
const handleError = require('../utils/handleError');

/**
 * Récupère tous les projets auxquels l'utilisateur connecté a accès.
 * Cette méthode récupère la liste des projets dans lesquels l'utilisateur est membre
 * et renvoie cette liste dans la réponse HTTP.
 * 
 * @param {Object} req - L'objet de la requête, contenant les informations de l'utilisateur connecté via `req.user`.
 * @param {Object} res - L'objet de la réponse, utilisé pour renvoyer les projets ou une erreur.
 * 
 * @returns {void} - Retourne une réponse HTTP avec la liste des projets ou une erreur en cas de problème.
 */
exports.getWorkspaces = async (req, res) => {
    try {
        const userId = req.user._id;

        const workspaces = await getWorkspacesForUser(userId);

        res.status(200).json(workspaces);
    } catch (error) {
        handleError(res, error, 401);
    }
};

/**
 * Récupère un projet par son ID et vérifie que l'utilisateur y a accès.
 * Cette méthode vérifie que l'utilisateur connecté est bien membre du projet avant
 * de retourner les informations du projet.
 * 
 * @param {Object} req - L'objet de la requête, contenant l'ID du projet dans les paramètres de l'URL.
 * @param {Object} res - L'objet de la réponse, utilisé pour renvoyer le projet ou une erreur.
 * 
 * @returns {void} - Retourne les informations du projet si l'utilisateur est autorisé à y accéder, sinon une erreur.
 */
exports.getWorkspaceById = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const workspaceId = req.params.id;

        const workspace = await getWorkspaceByIdAndValidateMember(userId, workspaceId);

        res.status(200).json(workspace);
    } catch (error) {
        handleError(res, error, 404);
    }
};

/**
 * Crée un projet et l'associe à l'utilisateur connecté.
 * Cette méthode permet à un utilisateur de créer un projet, en l'associant à son compte 
 * comme propriétaire. Les données du projet sont envoyées dans le corps de la requête.
 * 
 * @param {Object} req - L'objet de la requête, contenant les données du projet dans `req.body`.
 * @param {Object} res - L'objet de la réponse, utilisé pour renvoyer le projet créé ou une erreur.
 * 
 * @returns {void} - Retourne une réponse HTTP avec le projet créé ou une erreur en cas de problème.
 */
exports.createWorkspace = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: "Utilisateur non authentifié" });
        }

        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Le nom du projet est requis" });
        }

        const newWorkspace = await createWorkspace(userId, { name, description });

        res.status(201).json({ message: "Projet créé avec succès", data: newWorkspace });
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Ajoute un membre à un projet.
 * Cette méthode permet d'ajouter un membre à un projet existant, mais elle vérifie d'abord
 * que l'utilisateur connecté est autorisé à ajouter des membres au projet.
 * 
 * @param {Object} req - L'objet de la requête, contenant l'ID du projet et l'ID du membre à ajouter dans `req.params` et `req.body`.
 * @param {Object} res - L'objet de la réponse, utilisé pour renvoyer le projet mis à jour ou une erreur.
 * 
 * @returns {void} - Retourne une réponse HTTP avec le projet mis à jour ou une erreur en cas de problème.
 */
exports.addMember = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { memberId } = req.body;
        const workspace = req.params.id;

        const updatedWorkspace = await addMemberToWorkspace(userId, workspace, memberId);

        res.status(200).json({ message: "Membre ajouté avec succès", data: updatedWorkspace });
    } catch (error) {
        handleError(res, error, 403);
    }
};

/**
 * Supprime un projet.
 * Cette méthode permet de supprimer un projet existant, mais elle vérifie d'abord que l'utilisateur
 * connecté est le propriétaire du projet avant de procéder à la suppression.
 * 
 * @param {Object} req - L'objet de la requête, contenant l'ID du projet à supprimer dans `req.params`.
 * @param {Object} res - L'objet de la réponse, utilisé pour renvoyer un message de succès ou une erreur.
 * 
 * @returns {void} - Retourne une réponse HTTP avec un message de succès ou une erreur en cas de problème.
 */
exports.deleteWorkspace = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const workspace = req.params.id;

        await deleteWorkspace(userId, workspace);

        res.status(200).json({ message: "Projet supprimé avec succès" });
    } catch (error) {
        handleError(res, error, 403);
    }
};
