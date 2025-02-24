const Project = require('../models/Project');
const User = require('../models/User');

/**
 * Récupère les projets auxquels un utilisateur a accès.
 * @param {String} userId - L'ID de l'utilisateur
 * @returns {Array} - Liste des projets
 */
const getProjectsForUser = async (userId) => {
    return await Project.find({ members: userId })
        .populate('owner', 'lastname firstname username')
        .populate('members', 'lastname firstname username');
};

/**
 * Récupère un projet spécifique en vérifiant que l'utilisateur est membre.
 * @param {String} userId - L'ID de l'utilisateur
 * @param {String} projectId - L'ID du projet
 * @returns {Object} - Détails du projet
 */
const getProjectByIdAndValidateMember = async (userId, projectId) => {    
    const project = await Project.findById(projectId)
        .populate('owner', 'lastname firstname username')
        .populate('members', 'lastname firstname username');

    if (!project) throw new Error("Projet introuvable");
    if (!project.members.some(member => member._id.toString() === userId)) {
        throw new Error("Accès interdit : Vous ne faites pas partie de ce projet");
    }

    return project;
};

/**
 * Crée un nouveau projet avec un utilisateur comme propriétaire.
 * @param {String} userId - L'ID de l'utilisateur
 * @param {Object} projectData - Données du projet (nom, description)
 * @returns {Object} - Projet créé
 */
const createProject = async (userId, projectData) => {
    const { name, description } = projectData;
    if (!name) throw new Error("Le nom du projet est requis");
    
    const newProject = new Project({
        name,
        description,
        owner: userId,
        members: [userId]
    });

    await newProject.save();
    return newProject;
};

/**
 * Ajoute un membre à un projet.
 * @param {String} userId - L'ID de l'utilisateur qui veut ajouter un membre
 * @param {String} projectId - L'ID du projet
 * @param {String} memberId - L'ID de l'utilisateur à ajouter
 * @returns {Object} - Projet mis à jour
 */
const addMemberToProject = async (userId, projectId, memberId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error("Projet introuvable");
    if (project.owner.toString() !== userId) throw new Error("Accès interdit : Seul le créateur du projet peut ajouter des membres");

    const member = await User.findById(memberId);
    if (!member) throw new Error("Utilisateur introuvable");

    if (project.members.includes(memberId)) throw new Error("L'utilisateur fait déjà partie du projet");

    project.members.push(memberId);
    await project.save();

    return project;
};

/**
 * Supprime un projet.
 * @param {String} userId - L'ID de l'utilisateur qui veut supprimer le projet
 * @param {String} projectId - L'ID du projet
 * @returns {void} - Aucune valeur retournée si la suppression réussit
 */
const deleteProject = async (userId, projectId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error("Projet introuvable");
    if (project.owner.toString() !== userId) throw new Error("Accès interdit : Seul le créateur du projet peut le supprimer");

    await Project.findByIdAndDelete(projectId);
};

module.exports = { getProjectsForUser, getProjectByIdAndValidateMember, createProject, addMemberToProject, deleteProject };
