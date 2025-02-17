const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware de vérification du token
const verifyToken = (req) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Token manquant ou invalide");
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
            .populate('sender', 'name email')
            .populate('receiver', 'name email');
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
            .sort({ createdAt: -1 }); // Tri des messages par date décroissante (du plus récent au plus ancien)

        const contactsMap = new Map();

        // Parcourir les messages et mettre à jour la carte avec le dernier message
        messages.forEach(message => {
            const contactId = message.sender.toString() === userId ? message.receiver.toString() : message.sender.toString();

            // Si ce contact n'a pas encore de message dans la carte ou si le message est plus récent que le dernier enregistré
            if (!contactsMap.has(contactId) || message.createdAt > contactsMap.get(contactId).lastMessageTime) {
                contactsMap.set(contactId, {
                    lastMessage: message.message,
                    lastMessageTime: message.createdAt,
                    sender: message.sender, // Ajouter l'expéditeur
                    receiver: message.receiver // Ajouter le destinataire
                });
            }
        });

        // Récupérer les informations des contacts
        const contacts = await User.find({ _id: { $in: [...contactsMap.keys()] } })
            .select("name email"); // Sélectionner uniquement "name" et "email"

        // Récupérer également les informations des expéditeurs et destinataires pour chaque message
        const senderIds = [...new Set(messages.map(message => message.sender.toString()))];
        const receiverIds = [...new Set(messages.map(message => message.receiver.toString()))];

        const senders = await User.find({ _id: { $in: senderIds } }).select("name email");
        const receivers = await User.find({ _id: { $in: receiverIds } }).select("name email");

        // Créer la liste des contacts avec leur dernier message, sender, receiver et détails supplémentaires
        const contactList = contacts.map(contact => {
            const contactData = contactsMap.get(contact._id.toString());

            // Trouver les informations de l'expéditeur et du destinataire
            const senderDetails = senders.find(sender => sender._id.toString() === contactData.sender.toString());
            const receiverDetails = receivers.find(receiver => receiver._id.toString() === contactData.receiver.toString());

            return {
                _id: contact._id,
                name: contact.name,
                email: contact.email,
                lastMessage: contactData.lastMessage,
                lastMessageTime: contactData.lastMessageTime,
                sender: {
                    _id: senderDetails._id,
                    name: senderDetails.name,
                    email: senderDetails.email
                },
                receiver: {
                    _id: receiverDetails._id,
                    name: receiverDetails.name,
                    email: receiverDetails.email
                }
            };
        });

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
            .populate("sender", "name email")
            .populate("receiver", "name email");

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
