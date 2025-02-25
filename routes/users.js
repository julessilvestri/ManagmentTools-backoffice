const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const userController = require('../controllers/UserController');

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Rechercher un utilisateur par nom ou email
 *     description: Permet de rechercher un utilisateur en fonction de son nom ou email.
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Le nom ou l'email de l'utilisateur à rechercher.
 *     responses:
 *       200:
 *         description: Liste des utilisateurs correspondant à la recherche.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Test User
 *                   email:
 *                     type: string
 *                     example: test@example.com
 *       400:
 *         description: Paramètre `query` manquant.
 *       401:
 *         description: Token manquant ou invalide.
 *       500:
 *         description: Erreur serveur.
 */
router.get("/search", authMiddleware, userController.searchUser);


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     description: Permet de récupérer la liste de tous les utilisateurs.
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "65f0b8e2e7b3f5d123456780"
 *                   lastname:
 *                     type: string
 *                     example: "Dupont"
 *                   firstname:
 *                     type: string
 *                     example: "Jean"
 *                   username:
 *                     type: string
 *                     example: "jeandupont"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-02-15T14:35:00.000Z"
 *       500:
 *         description: Erreur serveur.
 */
router.get("/", authMiddleware, userController.getUsers);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Récupérer un utilisateur par son ID
 *     description: Retourne les informations d'un utilisateur spécifique en fonction de son ID.
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur à récupérer.
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "65f0b8e2e7b3f5d123456780"
 *                 lastname:
 *                   type: string
 *                   example: "Dupont"
 *                 firstname:
 *                   type: string
 *                   example: "Jean"
 *                 username:
 *                   type: string
 *                   example: "jeandupont"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-02-15T14:35:00.000Z"
 *       400:
 *         description: ID utilisateur manquant ou invalide.
 *       401:
 *         description: Token manquant ou invalide.
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
router.get("/:userId", authMiddleware, userController.getUserById);

module.exports = router;