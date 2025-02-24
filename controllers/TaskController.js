const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware de vérification du token
const verifyToken = (req) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Token manquant ou invalide");
    return jwt.verify(token, process.env.JWT_SECRET);
};

// Fonction de gestion des erreurs
const handleError = (res, error, statusCode = 500) => {
    console.error(error);
    res.status(statusCode).json({ error: error.message || "Erreur serveur" });
};

// Créer une nouvelle tâche
exports.createTask = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        const userId = decoded.userId;
        const { projectId, title, description, status, assignedTo, attachments, comments } = req.body;

        if (!title || !projectId) throw new Error("Le titre et l'ID du projet sont requis");

        // Vérifier si l'utilisateur est membre du projet
        const project = await Project.findById(projectId);
        if (!project) throw new Error("Projet introuvable");

        if (!project.members.includes(userId)) {
            throw new Error("Accès interdit : Vous n'êtes pas membre de ce projet");
        }

        // Création de la tâche
        const newTask = new Task({
            title,
            description,
            status: status || "Pending", // "Pending" par défaut
            project: projectId,
            creator: userId,
            assignedTo, // Affectation à un utilisateur
            attachments, // Fichiers joints
            comments // Commentaires (si nécessaire)
        });

        await newTask.save();
        res.status(201).json({ message: "Tâche créée avec succès", data: newTask });
    } catch (error) {
        handleError(res, error, 400);
    }
};

// Récupérer toutes les tâches d'un projet
exports.getTasksByProject = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        const userId = decoded.userId;
        const projectId = req.params.projectId;

        const project = await Project.findById(projectId);
        if (!project) throw new Error("Projet introuvable");

        if (!project.members.includes(userId)) {
            throw new Error("Accès interdit : Vous n'êtes pas membre de ce projet");
        }

        // Récupérer toutes les tâches associées à ce projet
        const tasks = await Task.find({ project: projectId })
            .populate('creator', 'firstname lastname username')
            .sort({ createdAt: -1 }); // Tri des tâches par date décroissante

        res.status(200).json(tasks);
    } catch (error) {
        handleError(res, error, 401);
    }
};

// Récupérer une tâche par son ID
exports.getTaskById = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        const userId = decoded.userId;
        const taskId = req.params.taskId;

        const task = await Task.findById(taskId)
            .populate('creator', 'firstname lastname username')
            .populate('assignedTo', 'firstname lastname username'); // Ajout de l'utilisateur assigné
        if (!task) throw new Error("Tâche introuvable");

        const project = await Project.findById(task.project);
        if (!project) throw new Error("Projet associé introuvable");

        if (!project.members.includes(userId)) {
            throw new Error("Accès interdit : Vous n'êtes pas membre de ce projet");
        }

        res.status(200).json(task);
    } catch (error) {
        handleError(res, error, 404);
    }
};


// Mettre à jour une tâche
exports.updateTask = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        const userId = decoded.userId;
        const taskId = req.params.taskId;
        const { title, description, status, assignedTo, attachments, comments } = req.body;

        const task = await Task.findById(taskId);
        if (!task) throw new Error("Tâche introuvable");

        const project = await Project.findById(task.project);
        if (!project) throw new Error("Projet associé introuvable");

        // Vérification des permissions : l'utilisateur doit être le créateur ou un membre du projet
        if (task.creator.toString() !== userId && !project.members.includes(userId)) {
            throw new Error("Accès interdit : Vous n'êtes pas autorisé à modifier cette tâche");
        }

        // Mise à jour de la tâche
        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.assignedTo = assignedTo || task.assignedTo; // Met à jour l'utilisateur assigné
        task.attachments = attachments || task.attachments; // Met à jour les fichiers joints
        task.comments = comments || task.comments; // Met à jour les commentaires

        await task.save();
        res.status(200).json({ message: "Tâche mise à jour avec succès", data: task });
    } catch (error) {
        handleError(res, error, 400);
    }
};

// Supprimer une tâche
exports.deleteTask = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        const userId = decoded.userId;
        const taskId = req.params.taskId;

        const task = await Task.findById(taskId);
        if (!task) throw new Error("Tâche introuvable");

        const project = await Project.findById(task.project);
        if (!project) throw new Error("Projet associé introuvable");

        // Vérification des permissions : l'utilisateur doit être le créateur ou un membre du projet
        if (task.creator.toString() !== userId && !project.members.includes(userId)) {
            throw new Error("Accès interdit : Vous n'êtes pas autorisé à supprimer cette tâche");
        }

        await Task.findByIdAndDelete(taskId);
        res.status(200).json({ message: "Tâche supprimée avec succès" });
    } catch (error) {
        handleError(res, error, 403);
    }
};

