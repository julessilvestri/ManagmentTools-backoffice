const Message = require('../models/Message');
const User = require('../models/User');

/**
 * Récupère tous les messages d'un utilisateur (expéditeur ou destinataire).
 * 
 * @param {Object} userId - L'ID de l'utilisateur connecté.
 * @returns {Array} - La liste des messages de l'utilisateur.
 */
const getMessages = async (userId) => {
    return (await Message.find({ $or: [{ sender: userId }, { receiver: userId }] })
        .populate('sender', 'lastname firstname username createdAt')
        .populate('receiver', 'lastname firstname username createdAt'));
};

/**
 * Récupère la liste des contacts de l'utilisateur avec leur dernier message.
 * 
 * @param {Object} userId - L'ID de l'utilisateur connecté.
 * @returns {Array} - La liste des contacts avec leur dernier message.
 */
const getContacts = async (userId) => {
    const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] })
        .sort({ createdAt: -1 });

    const contactsMap = new Map();

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

    const contacts = await User.find({ _id: { $in: [...contactsMap.keys()] } })
        .select("lastname firstname username createdAt");

    const senderIds = [...new Set(messages.map(message => message.sender.toString()))];
    const receiverIds = [...new Set(messages.map(message => message.receiver.toString()))];

    const senders = await User.find({ _id: { $in: senderIds } }).select("lastname firstname username createdAt");
    const receivers = await User.find({ _id: { $in: receiverIds } }).select("lastname firstname username createdAt");

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
            sender: senderDetails,
            receiver: receiverDetails
        };
    }).sort((a, b) => b.lastMessageTime - a.lastMessageTime);

    return contactList;
};

/**
 * Récupère la conversation entre l'utilisateur connecté et un autre utilisateur.
 * 
 * @param {Object} userId - L'ID de l'utilisateur connecté.
 * @param {Object} otherUserId - L'ID de l'autre utilisateur.
 * @returns {Array} - La liste des messages échangés entre les deux utilisateurs.
 */
const getConversation = async (userId, otherUserId) => {
    return await Message.find({
        $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId }
        ]
    })
        .sort({ createdAt: 1 })
        .populate("sender", "lastname firstname username createdAt")
        .populate("receiver", "lastname firstname username createdAt");
};

/**
 * Crée un nouveau message entre deux utilisateurs.
 * 
 * @param {Object} userId - L'ID de l'utilisateur connecté (expéditeur).
 * @param {Object} receiverId - L'ID de l'utilisateur destinataire.
 * @param {string} message - Le contenu du message.
 * @returns {Object} - Le message créé.
 */
const createMessage = async (userId, receiverId, message) => {
    const sender = await User.findById(userId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) throw new Error("Expéditeur ou destinataire introuvable");

    const newMessage = new Message({
        message,
        sender: userId,
        receiver: receiverId
    });

    await newMessage.save();
    return newMessage;
};

module.exports = { getMessages, getContacts, getConversation, createMessage };
