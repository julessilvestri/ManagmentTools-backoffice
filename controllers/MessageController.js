const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware de vérification du token
const verifyToken = (req) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Token manquan ou invalide");
    return jwt.verify(token, process.env.JWT_SECRET);
};

// Fonction de gestion des erreurs
const handleError = (res, error, statusCode = 500) => {
    console.error(error);
    res.status(statusCode).json({ error: error.message || "Erreur serveur" });
};

exports.getMessages = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        const userId = decoded.userId;
        const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] })
            .populate('sender', 'lastname firstname username createdAt')
            .populate('receiver', 'lastname firstname username createdAt');
        res.status(200).json(messages);
    } catch (error) {
        handleError(res, error, 401);
    }
};

exports.getContacts = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        const userId = decoded.userId;

        // Récupérer tous les messages où l'utilisateur est soit l'expéditeur, soit le destinataire
        const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] })
            .sort({ createdAt: -1 }); // Tri des messages par date décroissante

        const contactsMap = new Map();

        // Parcourir les messages et mettre à jour la carte avec le dernier message
        messages.forEach(message => {
            const contactId = message.sender.toString() === userId ? message.receiver.toString() : message.sender.toString();

            if (!contactsMap.has(contactId) || message.createdAt > contactsMap.get(contactId).lastMessageTime) {
                contactsMap.set(contactId, {
                    lastMessage: message.message,
                    lastMessageTime: message.createdAt,
                    sender: message.sender,
                    receiver: message.receiver
                });
            }
        });

        // Récupérer les informations des contacts
        const contacts = await User.find({ _id: { $in: [...contactsMap.keys()] } })
            .select("lastname firstname username createdAt");

        // Récupérer les informations des expéditeurs et destinataires
        const senderIds = [...new Set(messages.map(message => message.sender.toString()))];
        const receiverIds = [...new Set(messages.map(message => message.receiver.toString()))];

        const senders = await User.find({ _id: { $in: senderIds } }).select("lastname firstname username createdAt");
        const receivers = await User.find({ _id: { $in: receiverIds } }).select("lastname firstname username createdAt");

        // Créer la liste des contacts avec leur dernier message, triée par lastMessageTime
        const contactList = contacts.map(contact => {
            const contactData = contactsMap.get(contact._id.toString());
            const senderDetails = senders.find(sender => sender._id.toString() === contactData.sender.toString());
            const receiverDetails = receivers.find(receiver => receiver._id.toString() === contactData.receiver.toString());

            return {
                _id: contact._id,
                lastname: contact.lastname,
                firstname: contact.firstname,
                username: contact.username,
                createdAt: contact.createdAt,
                lastMessage: contactData.lastMessage,
                lastMessageTime: contactData.lastMessageTime,
                sender: {
                    _id: senderDetails._id,
                    lastname: senderDetails.lastname,
                    firstname: senderDetails.firstname,
                    username: senderDetails.username,
                    createdAt: senderDetails.createdAt
                },
                receiver: {
                    _id: receiverDetails._id,
                    lastname: receiverDetails.lastname,
                    firstname: receiverDetails.firstname,
                    username: receiverDetails.username,
                    createdAt: receiverDetails.createdAt
                }
            };
        }).sort((a, b) => b.lastMessageTime - a.lastMessageTime);

        res.status(200).json(contactList);
    } catch (error) {
        handleError(res, error, 401);
    }
};


exports.getConversation = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        const userId = decoded.userId;
        const otherUserId = req.params.userId;

        if (!otherUserId) throw new Error("L'ID de l'autre utilisateur est requis.");

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        })
            .sort({ createdAt: 1 })
            .populate("sender", "lastname firstname username createdAt")
            .populate("receiver", "lastname firstname username createdAt");

        res.status(200).json(messages);
    } catch (error) {
        handleError(res, error, 400);
    }
};

exports.createMessage = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        const userId = decoded.userId;
        const { receiverId, message } = req.body;

        const sender = await User.findById(userId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) throw new Error("Expéditeur ou destinataire introuvable");

        const newMessage = new Message({
            message,
            sender: userId,
            receiver: receiverId
        });

        await newMessage.save();
        res.status(201).json({ message: "Message ajouté avec succès", data: newMessage });
    } catch (error) {
        handleError(res, error, 404);
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        const userId = decoded.userId;

        const message = await Message.findById(req.params.id);
        if (!message) throw new Error("Message introuvable");

        if (message.sender.toString() !== userId) throw new Error("Accès interdit : vous ne pouvez supprimer que vos propres messages");

        await Message.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Message supprimé avec succès" });
    } catch (error) {
        handleError(res, error, 403);
    }
};
