const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * Récupère les tâches d'un projet si l'utilisateur y a accès.
 */
const getTasksForProject = async (userId, projectId) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error("Projet introuvable");
    if (!project.members.includes(userId)) throw new Error("Accès interdit");

    return await Task.find({ projectId }).populate('assignedTo', 'lastname firstname username');
};

/**
 * Récupère une tâche spécifique si l'utilisateur y a accès.
 */
const getTaskByIdAndValidateAccess = async (userId, taskId) => {
    const task = await Task.findById(taskId).populate('assignedTo', 'lastname firstname username');
    if (!task) throw new Error("Tâche introuvable");

    const project = await Project.findById(task.projectId);
    if (!project || !project.members.includes(userId)) throw new Error("Accès interdit");

    return task;
};

/**
 * Crée une nouvelle tâche dans un projet existant.
 */
const createTask = async (userId, taskData) => {
    const { projectId, title, description, status, priority, dueDate, assignedTo } = taskData;
    if (!title || !projectId) throw new Error("Le titre et le projet sont requis");

    const project = await Project.findById(projectId);
    if (!project || !project.members.includes(userId)) throw new Error("Accès interdit");

    const newTask = new Task({ projectId, title, description, status, priority, dueDate, assignedTo });
    await newTask.save();
    return newTask;
};

/**
 * Met à jour une tâche existante.
 */
const updateTask = async (userId, taskId, updatedData) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error("Tâche introuvable");

    const project = await Project.findById(task.projectId);
    if (!project || !project.members.includes(userId)) throw new Error("Accès interdit");

    Object.assign(task, updatedData);
    await task.save();
    return task;
};

/**
 * Supprime une tâche si l'utilisateur a les permissions.
 */
const deleteTask = async (userId, taskId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error("Tâche introuvable");

    const project = await Project.findById(task.projectId);
    if (!project || !project.members.includes(userId)) throw new Error("Accès interdit");

    await Task.findByIdAndDelete(taskId);
};

module.exports = { getTasksForProject, getTaskByIdAndValidateAccess, createTask, updateTask, deleteTask };
