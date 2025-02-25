const mongoose = require("mongoose");
const User = require("../models/User");

/**
 * Recherche des utilisateurs par nom, prénom ou nom d'utilisateur.
 * @param {string} query - La chaîne de recherche entrée par l'utilisateur.
 * @returns {Promise<Array>} - Une liste d'utilisateurs correspondants.
 * @throws {Error} - Erreur si le paramètre de recherche est vide ou en cas de problème de base de données.
 */
const searchUser = async (query) => {
    if (!query || query.trim() === "") {
        throw new Error("Veuillez fournir un terme de recherche valide.");
    }

    try {
        return await User.find({
            $or: [
                { lastname: { $regex: query, $options: "i" } },
                { firstname: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } }
            ]
        }).select("lastname firstname username createdAt");
    } catch (error) {
        throw new Error("Erreur de base de données lors de la recherche des utilisateurs.");
    }
};

/**
 * Récupère tous les utilisateurs.
 * @returns {Promise<Array>} - Liste de tous les utilisateurs.
 */
const getUsers = async (userId) => {
    try {        
        const users = await User.find({ _id: { $ne: userId } });
        return users;
    } catch (error) {
        throw new Error("Erreur lors de la récupération des utilisateurs.");
    }
};

/**
 * Récupère un utilisateur par son ID.
 * @param {string} userId - L'ID de l'utilisateur à rechercher.
 * @returns {Promise<Object>} - L'utilisateur correspondant.
 * @throws {Error} - Erreur si l'ID est invalide ou si l'utilisateur n'est pas trouvé.
 */
const getUserById = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("ID utilisateur invalide.");
    }

    const user = await User.findById(userId).select("lastname firstname username createdAt");

    if (!user) {
        throw new Error("Utilisateur non trouvé.");
    }

    return user;
};

module.exports = {
    searchUser,
    getUsers,
    getUserById
};
