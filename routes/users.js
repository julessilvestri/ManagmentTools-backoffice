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
 *     security:
 *       - bearerAuth: []
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

module.exports = router;