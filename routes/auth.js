const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/AuthController');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d'un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastname:
 *                 type: string
 *               firstname:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Erreur de validation ou utilisateur existant
 */
router.post('/register', [
    check('lastname', 'Le nom est requis').not().isEmpty(),
    check('firstname', 'Le prénom est requis').not().isEmpty(),
    check('username', 'Le nom d\'utilisateur est requis').not().isEmpty(),
    check('password', 'Le mot de passe doit faire au moins 8 caractères').isLength({ min: 8 })
], authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie avec un token JWT
 *       400:
 *         description: Identifiants invalides
 */
router.post('/login', [
    check('username', 'Un nom d\'utilisateur valide est requis').exists(),
    check('password', 'Le mot de passe est requis').exists()
], authController.login);

module.exports = router;
