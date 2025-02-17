const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Fonction de gestion des erreurs
const handleError = (res, error, statusCode = 500) => {
    console.error(error);
    res.status(statusCode).json({ error: error.message || "Erreur serveur" });
};

// Fonction pour vérifier les identifiants d'un utilisateur
const verifyUserCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Identifiants invalides");
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Identifiants invalides");
    
    return user;
};

// Inscription d'un utilisateur
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Cet email est déjà utilisé" });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        handleError(res, error, 500);
    }
};

// Connexion d'un utilisateur
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Identifiants invalides" });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Identifiants invalides" });
        }

        // Générer un token JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Définir un cookie avec le token et l'ID de l'utilisateur
        res.cookie('token', token, {
            httpOnly: true,  // Empêche l'accès au cookie depuis le client JavaScript
            secure: process.env.NODE_ENV === 'production', // Assurez-vous que le cookie est envoyé en HTTPS en production
            maxAge: 3600000, // Le cookie expire après 1 heure (3600000 ms)
            sameSite: 'Strict' // Empêche l'envoi du cookie sur des requêtes cross-origin
        });

        res.cookie('userId', user._id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: 'Strict'
        });

        // Répondre avec un message de succès
        res.status(200).json({ message: "Connexion réussie" });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};
