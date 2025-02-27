const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const workspaceController = require('../controllers/WorkspaceController');

/**
 * @swagger
 * /workspaces:
 *   get:
 *     summary: Récupère tous les projets auxquels l'utilisateur a accès
 *     tags: [Workspaces]
 *     responses:
 *       200:
 *         description: Liste des projets récupérée avec succès
 *       401:
 *         description: Token manquant ou invalide
 *       500:
 *         description: Erreur serveur
 */
router.get("/", authMiddleware, workspaceController.getWorkspaces);

/**
 * @swagger
 * /workspaces:
 *   post:
 *     summary: Crée un nouveau projet
 *     tags: [Workspaces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du projet
 *               description:
 *                 type: string
 *                 description: Description du projet
 *     responses:
 *       201:
 *         description: Projet créé avec succès
 *       400:
 *         description: Nom du projet requis
 *       401:
 *         description: Token invalide
 *       500:
 *         description: Erreur serveur
 */
router.post("/", authMiddleware, workspaceController.createWorkspace);

/**
 * @swagger
 * /workspaces/{id}:
 *   get:
 *     summary: Récupère un projet par ID
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du projet à récupérer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projet trouvé avec succès
 *       404:
 *         description: Projet non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", authMiddleware, workspaceController.getWorkspaceById);

/**
 * @swagger
 * /workspaces/{id}/add-member:
 *   put:
 *     summary: Ajoute un membre à un projet (seul le créateur peut le faire)
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du projet
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId:
 *                 type: string
 *                 description: ID de l'utilisateur à ajouter
 *     responses:
 *       200:
 *         description: Membre ajouté avec succès
 *       403:
 *         description: Accès refusé (seul le créateur peut ajouter des membres)
 *       404:
 *         description: Projet non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id/add-member", authMiddleware, workspaceController.addMember);

/**
 * @swagger
 * /workspaces/{id}:
 *   delete:
 *     summary: Supprime un projet (seul le créateur peut le faire)
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du projet à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projet supprimé avec succès
 *       403:
 *         description: Accès refusé (seul le créateur peut supprimer un projet)
 *       404:
 *         description: Projet non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", authMiddleware, workspaceController.deleteWorkspace);

module.exports = router;
