const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.getMessages = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Token manquant ou invalide" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        }).populate('sender', 'name email')
          .populate('receiver', 'name email');

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération des messages" });
    }
};

exports.getContacts = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Token manquant ou invalide" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 });

        const contactsMap = new Map();

        messages.forEach(message => {
            let contactId = message.sender.toString() === userId ? message.receiver.toString() : message.sender.toString();

            if (!contactsMap.has(contactId)) {
                contactsMap.set(contactId, {
                    lastMessage: message.message,
                    lastMessageTime: message.createdAt
                });
            }
        });

        const contactIds = [...contactsMap.keys()];
        const contacts = await User.find({ _id: { $in: contactIds } }).select("name email");

        const contactList = contacts.map(contact => ({
            _id: contact._id,
            name: contact.name,
            email: contact.email,
            lastMessage: contactsMap.get(contact._id.toString()).lastMessage,
            lastMessageTime: contactsMap.get(contact._id.toString()).lastMessageTime
        }));

        res.status(200).json(contactList);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des contacts" });
    }
};

exports.createMessage = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Token manquant ou invalide" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        
        const sender = await User.findById(userId);
        if (!sender) {
            return res.status(404).json({ error: "Expéditeur non trouvé" });
        }

        const { receiverId, message } = req.body;
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ error: "Destinataire non trouvé" });
        }

        const newMessage = new Message({
            message,
            sender: userId,
            receiver: receiverId
        });

        await newMessage.save();

        res.status(201).json({ message: "Message ajouté avec succès", data: newMessage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ error: "Token manquant ou invalide" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ error: "Message introuvable" });
        }

        if (message.sender.toString() !== userId) {
            return res.status(403).json({ error: "Accès interdit : vous ne pouvez supprimer que vos propres messages" });
        }

        await Message.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Message supprimé avec succès" });

    } catch (error) {
        console.error("❌ Erreur lors de la suppression du message :", error);
        res.status(500).json({ error: "Erreur lors de la suppression du message" });
    }
};
