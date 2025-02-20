// Importation des modules
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const messagesRoutes = require('./routes/messages');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const cors = require('cors');

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

// Création de l'application Express et du serveur HTTP
const app = express();
const server = http.createServer(app);

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion à MongoDB:", err));

app.use(express.json());
app.use(cookieParser());

// CORS pour Express
const corsOptions = {
    origin: "http://" + process.env.IP_SERVER + ":3000", // Front-end qui fait les requêtes
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Si vous avez besoin de gérer des cookies ou des sessions
};
app.use(cors(corsOptions));

// Configuration de Socket.IO avec CORS
const io = socketIo(server, {
    cors: {
        origin: ["http://" + process.env.IP_SERVER + ":3000"], // Front-end qui fait les requêtes
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true, // Gérer les cookies/sessions
    },
});

// Configuration Swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API ManagementTools",
            version: "1.0.0",
            description: "Documentation de l'API pour la gestion des tâches et le chat"
        },
        servers: [{ url: "http://" + process.env.IP_SERVER + ":" + process.env.PORT + "/api/v1", description: "Serveur distant" }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ["./routes/*.js"]
};

// Initialisation de la documentation Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/messages', messagesRoutes);
app.use('/api/v1/users', usersRoutes);

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return reject('Token invalide');
            resolve(decoded);
        });
    });
};

io.on("connection", (socket) => {

    // Joindre une room correspondant à l'ID de l'utilisateur
    socket.on("joinRoom", (userId) => {
        if (userId) {
            socket.join(userId);
        }
    });

    // Lorsqu'un message est envoyé
    socket.on("sendMessage", (messageData) => {

        if (!messageData.senderId || !messageData.receiverId) {
            console.error("Message invalide : senderId ou receiverId manquant");
            return;
        }

        // Création de la room unique pour cette conversation
        const roomId = generateRoomId(messageData.senderId, messageData.receiverId);

        io.to(messageData.senderId).emit("receiveMessage", messageData);

        io.to(messageData.receiverId).emit("receiveMessage", messageData);

    });

    // Lorsqu'un client se déconnecte
    socket.on("disconnect", () => {
    });
});


const generateRoomId = (user1, user2) => {
    return [user1, user2].sort().join("_");
};

// Démarrer le serveur seulement si ce n'est pas un test
if (process.env.NODE_ENV !== "test") {
    server.listen(process.env.PORT || 5000, () => {
        console.log(`✅ Serveur démarré sur le port ${process.env.PORT || 5000}`);
    });
}

// Exporter l'app et le serveur pour les tests
module.exports = { app, server };
