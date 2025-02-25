const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const taskController = require('../controllers/TaskController');

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Créer une nouvelle tâche
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspace
 *               - title
 *             properties:
 *               workspace:
 *                 type: string
 *                 description: ID du projet auquel la tâche appartient
 *               title:
 *                 type: string
 *                 description: Titre de la tâche
 *               description:
 *                 type: string
 *                 description: Description de la tâche
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed]
 *                 description: Statut de la tâche
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *                 description: Priorité de la tâche
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Date d'échéance de la tâche
 *               assignedTo:
 *                 type: string
 *                 description: ID de l'utilisateur assigné à la tâche
 *     responses:
 *       201:
 *         description: Tâche créée avec succès
 *       400:
 *         description: Données manquantes ou invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authMiddleware, taskController.createTask);

/**
 * @swagger
 * /tasks?workspace={workspace}:
 *   get:
 *     summary: Récupérer toutes les tâches d'un projet spécifique
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: workspace
 *         required: true
 *         description: ID du projet dont les tâches doivent être récupérées
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des tâches d'un projet récupérées avec succès
 *       400:
 *         description: Paramètre de workspace manquant
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authMiddleware, taskController.getTasksByWorkspace);

/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Récupérer une tâche spécifique par son ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: ID de la tâche à récupérer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la tâche récupérés avec succès
 *       404:
 *         description: Tâche non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:taskId', authMiddleware, taskController.getTaskById);

/**
 * @swagger
 * /tasks/{taskId}:
 *   put:
 *     summary: Mettre à jour une tâche existante
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: ID de la tâche à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre de la tâche
 *               description:
 *                 type: string
 *                 description: Description de la tâche
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed]
 *                 description: Statut de la tâche
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *                 description: Priorité de la tâche
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Date d'échéance de la tâche
 *               assignedTo:
 *                 type: string
 *                 description: ID de l'utilisateur assigné à la tâche
 *     responses:
 *       200:
 *         description: Tâche mise à jour avec succès
 *       400:
 *         description: Données manquantes ou invalides
 *       404:
 *         description: Tâche non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/:taskId', authMiddleware, taskController.updateTask);

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Supprimer une tâche par son ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: ID de la tâche à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tâche supprimée avec succès
 *       404:
 *         description: Tâche non trouvée
 *       403:
 *         description: Accès interdit (vous ne pouvez supprimer que vos propres tâches ou celles de votre projet)
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:taskId', authMiddleware, taskController.deleteTask);

module.exports = router;
