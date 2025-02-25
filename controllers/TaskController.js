const TaskService = require('../services/TaskService');

/**
 * Crée une nouvelle tâche.
 * Cette méthode permet de créer une tâche en utilisant les données envoyées dans la requête.
 * Elle passe ensuite les données au service pour la création réelle de la tâche et renvoie la tâche créée.
 * 
 * @param {Object} req - L'objet de la requête, contenant les informations sur la tâche dans `req.body`.
 * @param {Object} res - L'objet de la réponse, utilisé pour renvoyer la tâche créée ou une erreur.
 * 
 * @returns {void} - Retourne une réponse HTTP avec un message de succès ou une erreur en cas de problème.
 */
exports.createTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, workspaceId, assignedTo } = req.body;
        const taskData = {
            title,
            description,
            status,
            priority,
            dueDate,
            workspaceId,
            assignedTo,
            ownerId: req.user._id
        };

        const task = await TaskService.createTask(taskData);
        return res.status(201).json({ message: "Tâche créée avec succès", data: task });
    } catch (error) {
        return res.status(400).json({ error: "Erreur lors de la création de la tâche", details: error.message });
    }
};

/**
 * Récupère toutes les tâches.
 * Cette méthode récupère toutes les tâches existantes en appelant la fonction `getAllTasks` du service
 * et renvoie la liste des tâches dans la réponse.
 * 
 * @param {Object} req - L'objet de la requête.
 * @param {Object} res - L'objet de la réponse, utilisé pour renvoyer les tâches récupérées ou une erreur.
 * 
 * @returns {void} - Retourne une réponse HTTP avec la liste des tâches ou une erreur en cas de problème.
 */
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await TaskService.getAllTasks();
        return res.status(200).json(tasks);
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la récupération des tâches" });
    }
};

/**
 * Récupère une tâche spécifique par ID.
 * Cette méthode recherche une tâche par son ID, si la tâche est trouvée, elle renvoie la tâche en réponse.
 * Si la tâche n'est pas trouvée, une erreur 404 est renvoyée.
 * 
 * @param {Object} req - L'objet de la requête, contenant l'ID de la tâche dans `req.params.taskId`.
 * @param {Object} res - L'objet de la réponse, utilisé pour renvoyer la tâche ou une erreur si elle est introuvable.
 * 
 * @returns {void} - Retourne une réponse HTTP avec la tâche demandée ou une erreur en cas de tâche introuvable.
 */
exports.getTaskById = async (req, res) => {
    try {
        const task = await TaskService.getTaskById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ error: "Tâche introuvable" });
        }
        return res.status(200).json(task);
    } catch (error) {
        return res.status(400).json({ error: "ID de tâche invalide" });
    }
};

/**
 * Récupère les tâches d'un projet spécifique.
 * Cette méthode permet de récupérer toutes les tâches associées à un projet donné par `workspace` dans les requêtes.
 * Si le projet existe, les tâches associées sont retournées, sinon une erreur est renvoyée.
 * 
 * @param {Object} req - L'objet de la requête, contenant l'ID du projet dans `req.query.workspace`.
 * @param {Object} res - L'objet de la réponse, utilisé pour renvoyer les tâches ou une erreur si le projet est introuvable.
 * 
 * @returns {void} - Retourne une réponse HTTP avec la liste des tâches ou une erreur en cas de projet introuvable.
 */
exports.getTasksByWorkspace = async (req, res) => {
    try {
        const { workspace } = req.query;
        const tasks = await TaskService.getTasksByWorkspace(workspace);
        return res.status(200).json(tasks);
    } catch (error) {
        return res.status(404).json({ error: error.message || "Projet introuvable" });
    }
};

/**
 * Met à jour une tâche spécifique.
 * Cette méthode permet de mettre à jour les informations d'une tâche en utilisant son ID et les nouvelles données envoyées.
 * La tâche mise à jour est ensuite renvoyée.
 * 
 * @param {Object} req - L'objet de la requête, contenant l'ID de la tâche dans `req.params.taskId` et les données mises à jour dans `req.body`.
 * @param {Object} res - L'objet de la réponse, utilisé pour renvoyer la tâche mise à jour ou une erreur si la tâche est introuvable.
 * 
 * @returns {void} - Retourne une réponse HTTP avec la tâche mise à jour ou une erreur si la tâche n'a pas été trouvée.
 */
exports.updateTask = async (req, res) => {
    try {
        const task = await TaskService.updateTask(req.params.taskId, req.body);
        return res.status(200).json({ message: "Tâche mise à jour avec succès", data: task });
    } catch (error) {
        return res.status(404).json({ error: "Erreur lors de la mise à jour de la tâche" });
    }
};

/**
 * Supprime une tâche spécifique.
 * Cette méthode permet de supprimer une tâche en utilisant son ID. Si la tâche est introuvable, une erreur 404 est renvoyée.
 * En cas d'erreur générale, une erreur 500 est renvoyée.
 * 
 * @param {Object} req - L'objet de la requête, contenant l'ID de la tâche à supprimer dans `req.params.taskId`.
 * @param {Object} res - L'objet de la réponse, utilisé pour renvoyer un message de succès ou une erreur.
 * 
 * @returns {void} - Retourne une réponse HTTP avec un message de succès ou une erreur si la tâche n'a pas été trouvée.
 */
exports.deleteTask = async (req, res) => {
    try {
        await TaskService.deleteTask(req.params.taskId);
        return res.status(200).json({ message: "Tâche supprimée avec succès" });
    } catch (error) {
        // Si l'erreur est liée à une tâche introuvable, renvoyer 404
        if (error.message === "Tâche introuvable") {
            return res.status(404).json({ error: "Tâche introuvable" });
        }
        // Sinon, renvoyer une erreur serveur générique
        return res.status(500).json({ error: "Erreur lors de la suppression de la tâche" });
    }
};
