const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const messageController = require('../controllers/MessageController');

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Récupère les messages de l'utilisateur connecté (expéditeur ou destinataire)
 *     tags: [Messages]
 *     responses:
 *       200:
 *         description: Liste des messages récupérée avec succès
 *       401:
 *         description: Token manquant ou invalide
 *       500:
 *         description: Erreur serveur
 */
router.get("/", authMiddleware, messageController.getMessages);

/**
 * @swagger
 * /messages/contacts:
 *   get:
 *     summary: Récupère les contacts de l'utilisateur connecté (message envoyé ou reçu d'un au utilisateur)
 *     tags: [Messages]
 *     responses:
 *       200:
 *         description: Liste des contacts récupérée avec succès
 *       401:
 *         description: Token manquant ou invalide
 *       500:
 *         description: Erreur serveur
 */
router.get("/contacts", authMiddleware, messageController.getContacts);

/**
 * @swagger
 * /messages/conversation/{userId}:
 *   get:
 *     summary: Récupérer tous les messages d'une conversation entre deux utilisateurs
 *     description: Retourne tous les messages échangés entre l'utilisateur connecté et un autre utilisateur spécifique.
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'autre utilisateur avec qui on veut récupérer la conversation.
 *     responses:
 *       200:
 *         description: Liste des messages de la conversation.
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
 *                   message:
 *                     type: string
 *                     example: "Hello!"
 *                   sender:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65f0b7c2e7b3f5d123456789"
 *                       name:
 *                         type: string
 *                         example: "Test User"
 *                       email:
 *                         type: string
 *                         example: "test@example.com"
 *                   receiver:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65f0b7c2e7b3f5d123456788"
 *                       name:
 *                         type: string
 *                         example: "Receiver User"
 *                       email:
 *                         type: string
 *                         example: "receiver@example.com"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-02-15T14:35:00.000Z"
 *       400:
 *         description: ID de l'autre utilisateur manquant.
 *       401:
 *         description: Token manquant ou invalide.
 *       500:
 *         description: Erreur serveur.
 */
router.get("/conversation/:userId", authMiddleware, messageController.getConversation);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Crée un nouveau message avec expéditeur et destinataire
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Contenu du message
 *               receiverId:
 *                 type: string
 *                 description: ID du destinataire
 *     responses:
 *       201:
 *         description: Message créé avec succès
 *       400:
 *         description: Destinataire et message requis
 *       500:
 *         description: Erreur serveur
 */
router.post("/", authMiddleware, messageController.createMessage);

module.exports = router;
