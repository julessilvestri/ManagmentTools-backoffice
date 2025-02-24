const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const taskController = require('../controllers/TaskController');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gestion des tâches d'un projet
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Créer une nouvelle tâche pour un projet
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - title
 *             properties:
 *               projectId:
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
 *               comments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                       description: ID de l'utilisateur ayant commenté
 *                     message:
 *                       type: string
 *                       description: Contenu du commentaire
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Date de création du commentaire
 *     responses:
 *       201:
 *         description: Tâche créée avec succès
 *       400:
 *         description: Données manquantes ou invalides
 *       500:
 *         description: Erreur serveur
 */
router.post("/", authMiddleware, taskController.createTask);

/**
 * @swagger
 * /tasks/{projectId}:
 *   get:
 *     summary: Récupérer toutes les tâches d'un projet
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID du projet dont les tâches doivent être récupérées
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des tâches récupérées avec succès
 *       401:
 *         description: Accès interdit ou token invalide
 *       500:
 *         description: Erreur serveur
 */
router.get("/:projectId", authMiddleware, taskController.getTasksByProject);

/**
 * @swagger
 * /tasks/task/{taskId}:
 *   get:
 *     summary: Récupérer une tâche spécifique par son ID
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
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
router.get("/task/:taskId", authMiddleware, taskController.getTaskById);

/**
 * @swagger
 * /tasks/task/{taskId}:
 *   put:
 *     summary: Mettre à jour une tâche existante
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
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
 *               comments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                       description: ID de l'utilisateur ayant commenté
 *                     message:
 *                       type: string
 *                       description: Contenu du commentaire
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Date de création du commentaire
 *     responses:
 *       200:
 *         description: Tâche mise à jour avec succès
 *       400:
 *         description: Données manquantes ou invalides
 *       403:
 *         description: Accès interdit
 *       500:
 *         description: Erreur serveur
 */
router.put("/task/:taskId", authMiddleware, taskController.updateTask);

/**
 * @swagger
 * /tasks/task/{taskId}:
 *   delete:
 *     summary: Supprimer une tâche par son ID
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
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
 *       403:
 *         description: Accès interdit (vous ne pouvez supprimer que vos propres tâches ou celles de votre projet)
 *       404:
 *         description: Tâche non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete("/task/:taskId", authMiddleware, taskController.deleteTask);

module.exports = router;
