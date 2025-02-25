const MessageService = require('../services/MessageService');
const verifyToken = require('../utils/tokenUtils');
const handleError = require('../utils/handleError');
const mongoose = require('mongoose');

exports.getMessages = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ error: "Token invalide ou expiré." });

        const userId = decoded.userId;
        const messages = await MessageService.getMessages(userId);

        res.status(200).json(messages);
    } catch (error) {
        handleError(res, error, "Erreur lors de la récupération des messages.");
    }
};

exports.getContacts = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ error: "Token invalide ou expiré." });

        const userId = decoded.userId;
        const contacts = await MessageService.getContacts(userId);
        res.status(200).json(contacts);
    } catch (error) {
        handleError(res, error, "Erreur lors de la récupération des contacts.");
    }
};

exports.getConversation = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        const userId = decoded.userId;
        const otherUserId = req.params.userId;

        if (!otherUserId) {
            return res.status(400).json({ error: "L'ID de l'autre utilisateur est requis." });
        }

        const messages = await MessageService.getConversation(userId, otherUserId);
        res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la récupération de la conversation" });
    }
};

exports.createMessage = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ error: "Token invalide ou expiré." });

        const userId = decoded.userId;
        const { receiverId, message } = req.body;

        if (!receiverId || !message) {
            return res.status(400).json({ error: "Le destinataire et le message sont requis." });
        }

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ error: "ID du destinataire invalide." });
        }

        const newMessage = await MessageService.createMessage(userId, receiverId, message);
        res.status(201).json({ message: "Message ajouté avec succès", data: newMessage });
    } catch (error) {
        handleError(res, error, "Erreur lors de la création du message.");
    }
};

