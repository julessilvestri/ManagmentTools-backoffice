const {
    getTasksForProject,
    getTaskByIdAndValidateAccess,
    createTask,
    updateTask,
    deleteTask
} = require('../services/taskService');
const handleError = require('../utils/handleError');

/**
 * Récupère toutes les tâches d'un projet auquel l'utilisateur a accès.
 * @param {Object} req - Requête contenant l'ID du projet.
 * @param {Object} res - Réponse avec la liste des tâches ou une erreur.
 */
exports.getTasksByProject = async (req, res) => {
    try {
        const userId = req.user._id;
        const projectId = req.params.projectId;

        const tasks = await getTasksForProject(userId, projectId);
        res.status(200).json(tasks);
    } catch (error) {
        handleError(res, error, 403);
    }
};

/**
 * Récupère une tâche spécifique par son ID si l'utilisateur y a accès.
 * @param {Object} req - Requête contenant l'ID de la tâche.
 * @param {Object} res - Réponse avec les détails de la tâche ou une erreur.
 */
exports.getTaskById = async (req, res) => {
    try {
        const userId = req.user._id;
        const taskId = req.params.taskId;

        const task = await getTaskByIdAndValidateAccess(userId, taskId);
        res.status(200).json(task);
    } catch (error) {
        handleError(res, error, 404);
    }
};

/**
 * Crée une nouvelle tâche associée à un projet.
 * @param {Object} req - Requête contenant les données de la tâche.
 * @param {Object} res - Réponse avec la tâche créée ou une erreur.
 */
exports.createTask = async (req, res) => {
    try {
        const userId = req.user._id;
        const taskData = req.body;

        const newTask = await createTask(userId, taskData);
        res.status(201).json({ message: "Tâche créée avec succès", data: newTask });
    } catch (error) {
        handleError(res, error, 400);
    }
};

/**
 * Met à jour une tâche existante.
 * @param {Object} req - Requête contenant l'ID de la tâche et les nouvelles données.
 * @param {Object} res - Réponse avec la tâche mise à jour ou une erreur.
 */
exports.updateTask = async (req, res) => {
    try {
        const userId = req.user._id;
        const taskId = req.params.taskId;
        const updatedData = req.body;

        const updatedTask = await updateTask(userId, taskId, updatedData);
        res.status(200).json({ message: "Tâche mise à jour avec succès", data: updatedTask });
    } catch (error) {
        handleError(res, error, 403);
    }
};

/**
 * Supprime une tâche si l'utilisateur en a le droit.
 * @param {Object} req - Requête contenant l'ID de la tâche.
 * @param {Object} res - Réponse avec un message de succès ou une erreur.
 */
exports.deleteTask = async (req, res) => {
    try {
        const userId = req.user._id;
        const taskId = req.params.taskId;

        await deleteTask(userId, taskId);
        res.status(200).json({ message: "Tâche supprimée avec succès" });
    } catch (error) {
        handleError(res, error, 403);
    }
};
