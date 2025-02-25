const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Inscription d'un utilisateur.
 * Cette méthode permet de créer un nouvel utilisateur. Elle vérifie d'abord si l'utilisateur existe déjà 
 * dans la base de données en fonction du nom d'utilisateur. Si l'utilisateur existe, une erreur est levée.
 * Si l'utilisateur n'existe pas, son mot de passe est haché avant de créer un nouvel utilisateur dans la base de données.
 * 
 * @param {Object} userData - Un objet contenant les informations de l'utilisateur à inscrire : `lastname`, `firstname`, `username`, `password`.
 * 
 * @throws {Error} - Si l'utilisateur existe déjà avec le même nom d'utilisateur, une erreur est levée.
 * 
 * @returns {Object} - Retourne un objet représentant l'utilisateur créé, y compris son mot de passe haché.
 */
const registerUser = async (userData) => {
    const { lastname, firstname, username, password } = userData;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw new Error("Ce nom d'utilisateur est déjà utilisé");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ lastname, firstname, username, password: hashedPassword });
    await user.save();

    return user;
};

/**
 * Connexion d'un utilisateur.
 * Cette méthode permet de connecter un utilisateur en validant son nom d'utilisateur et son mot de passe.
 * Si le nom d'utilisateur est incorrect ou que le mot de passe ne correspond pas, une erreur est levée.
 * Si les informations sont correctes, un token JWT est généré et renvoyé avec l'objet utilisateur.
 * 
 * @param {string} username - Le nom d'utilisateur de l'utilisateur qui tente de se connecter.
 * @param {string} password - Le mot de passe de l'utilisateur.
 * 
 * @throws {Error} - Si le nom d'utilisateur est inconnu ou si les identifiants sont invalides, une erreur est levée.
 * 
 * @returns {Object} - Retourne un objet contenant le token JWT et l'objet utilisateur.
 */
const loginUser = async (username, password) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error("Nom d'utilisateur inconnu");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Identifiants invalides");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { token, user };
};

module.exports = { registerUser, loginUser };
