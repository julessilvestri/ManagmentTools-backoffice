const Task = require('../models/Task');
const Workspace = require('../models/Workspace');

/**
 * Crée une nouvelle tâche.
 * 
 * @param {Object} taskData - Les données de la tâche.
 * @returns {Object} - La tâche créée.
 */
const createTask = async (taskData) => {
    const { title, description, status, priority, dueDate, workspaceId, assignedTo, ownerId } = taskData;

    const task = new Task({
        title,
        description,
        status,
        priority,
        dueDate,
        workspace: workspaceId,
        owner: ownerId,
        assignedTo
    });

    await task.save();
    return task;
};

/**
 * Récupère toutes les tâches.
 * 
 * @returns {Array} - La liste des tâches.
 */
const getAllTasks = async () => {
    return await Task.find().populate('workspace owner assignedTo');
};

/**
 * Récupère une tâche par ID.
 * 
 * @param {ObjectId} taskId - L'ID de la tâche.
 * @returns {Object} - La tâche trouvée.
 */
const getTaskById = async (taskId) => {
    return await Task.findById(taskId).populate('workspace owner assignedTo');
};

/**
 * Récupère toutes les tâches d'un projet spécifique.
 * 
 * @param {ObjectId} workspaceId - L'ID du projet.
 * @returns {Array} - La liste des tâches du projet.
 */
const getTasksByWorkspace = async (workspaceId) => {
    const workspaceExist = await Workspace.findById(workspaceId);

    if (!workspaceExist) throw new Error("Projet introuvable");
    
    return await Task.find({ workspace: workspaceId });
};

/**
 * Met à jour une tâche spécifique.
 * 
 * @param {ObjectId} taskId - L'ID de la tâche.
 * @param {Object} updates - Les données à mettre à jour.
 * @returns {Object} - La tâche mise à jour.
 */
const updateTask = async (taskId, updates) => {
    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true }).populate('workspace owner assignedTo');

    if (!task) throw new Error("Tâche introuvable");

    return task;
};

/**
 * Supprime une tâche spécifique.
 * 
 * @param {ObjectId} taskId - L'ID de la tâche.
 * @returns {Object} - La tâche supprimée.
 */
const deleteTask = async (taskId) => {
    const task = await Task.findByIdAndDelete(taskId);

    if (!task) throw new Error("Tâche introuvable");

    return task;
};

module.exports = { createTask, getAllTasks, getTaskById, getTasksByWorkspace, updateTask, deleteTask };
