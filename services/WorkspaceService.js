const Workspace = require('../models/Workspace');
const User = require('../models/User');

/**
 * Récupère les projets auxquels un utilisateur a accès.
 * @param {String} userId - L'ID de l'utilisateur
 * @returns {Array} - Liste des projets
 */
const getWorkspacesForUser = async (userId) => {
    return await Workspace.find({ members: userId })
        .populate('owner', 'lastname firstname username')
        .populate('members', 'lastname firstname username');
};

/**
 * Récupère un projet spécifique en vérifiant que l'utilisateur est membre.
 * @param {String} userId - L'ID de l'utilisateur
 * @param {String} workspaceId - L'ID du projet
 * @returns {Object} - Détails du projet
 */
const getWorkspaceByIdAndValidateMember = async (userId, workspaceId) => {    
    const workspace = await Workspace.findById(workspaceId)
        .populate('owner', 'lastname firstname username')
        .populate('members', 'lastname firstname username');

    if (!workspace) throw new Error("Projet introuvable");
    if (!workspace.members.some(member => member._id.toString() === userId)) {
        throw new Error("Accès interdit : Vous ne faites pas partie de ce projet");
    }

    return workspace;
};

/**
 * Crée un nouveau projet avec un utilisateur comme propriétaire.
 * @param {String} userId - L'ID de l'utilisateur
 * @param {Object} workspaceData - Données du projet (nom, description)
 * @returns {Object} - Projet créé
 */
const createWorkspace = async (userId, workspaceData) => {
    const { name, description } = workspaceData;
    if (!name) throw new Error("Le nom du projet est requis");
    
    const newWorkspace = new Workspace({
        name,
        description,
        owner: userId,
        members: [userId]
    });

    await newWorkspace.save();
    return newWorkspace;
};

/**
 * Ajoute un membre à un projet.
 * @param {String} userId - L'ID de l'utilisateur qui veut ajouter un membre
 * @param {String} workspaceId - L'ID du projet
 * @param {String} memberId - L'ID de l'utilisateur à ajouter
 * @returns {Object} - Projet mis à jour
 */
const addMemberToWorkspace = async (userId, workspaceId, memberId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error("Projet introuvable");
    if (workspace.owner.toString() !== userId) throw new Error("Accès interdit : Seul le créateur du projet peut ajouter des membres");

    const member = await User.findById(memberId);
    if (!member) throw new Error("Utilisateur introuvable");

    if (workspace.members.includes(memberId)) throw new Error("L'utilisateur fait déjà partie du projet");

    workspace.members.push(memberId);
    await workspace.save();

    return workspace;
};

/**
 * Supprime un projet.
 * @param {String} userId - L'ID de l'utilisateur qui veut supprimer le projet
 * @param {String} workspaceId - L'ID du projet
 * @returns {void} - Aucune valeur retournée si la suppression réussit
 */
const deleteWorkspace = async (userId, workspaceId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error("Projet introuvable");
    if (workspace.owner.toString() !== userId) throw new Error("Accès interdit : Seul le créateur du projet peut le supprimer");

    await Workspace.findByIdAndDelete(workspace);
};

module.exports = { getWorkspacesForUser, getWorkspaceByIdAndValidateMember, createWorkspace, addMemberToWorkspace, deleteWorkspace };
