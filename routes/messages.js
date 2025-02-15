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

/**
 * @swagger
 * /messages/{id}:
 *   delete:
 *     summary: Supprime un message par ID (nécessite un token)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du message à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message supprimé avec succès
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       404:
 *         description: Message non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", authMiddleware, messageController.deleteMessage);

module.exports = router;
