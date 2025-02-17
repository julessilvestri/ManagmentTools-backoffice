// middleware/socketAuthMiddleware.js

const jwt = require('jsonwebtoken');

// Fonction pour vérifier le token de Socket.IO
const verifySocketToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return reject('Token invalide');
            resolve(decoded);
        });
    });
};

// Middleware pour vérifier le token sur les connexions Socket.IO
module.exports = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.query.token;  // Récupère le token depuis la query
        if (!token) return next(new Error('Token manquant ou invalide'));

        verifySocketToken(token)
            .then(decoded => {
                socket.userId = decoded.userId;  // On attache le userId à la socket pour l'utiliser plus tard
                next();  // Le token est valide, on continue avec la connexion WebSocket
            })
            .catch(error => {
                console.error("Erreur de token Socket.IO:", error);
                next(new Error('Token invalide'));  // Refuser la connexion si le token est invalide
            });
    });
};
