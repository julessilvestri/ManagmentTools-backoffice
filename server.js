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
    origin: "http://localhost:8080", // Front-end qui fait les requêtes
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Si vous avez besoin de gérer des cookies ou des sessions
};
app.use(cors(corsOptions));

// Configuration de Socket.IO avec CORS
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:8080"], // Front-end qui fait les requêtes
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
        servers: [{ url: "http://" + process.env.IP_SERVER + ":3000/api/v1", description: "Serveur distant" }],
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
    // Lorsqu'un client rejoint une room spécifique à une conversation
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);  // Joindre une room basée sur la conversation
    });

    // Lors de l'envoi d'un message
    socket.on("sendMessage", (messageData) => {
        const roomId = generateRoomId(messageData.senderId, messageData.receiverId);
        
        // Vérifiez d'abord si le destinataire est dans la room (sinon, vous ne diffusez pas)
        if (socket.rooms.has(roomId)) {
            // Diffuser le message dans la room spécifique à la conversation
            socket.to(roomId).emit("receiveMessage", messageData);
        }
    });

    // Lorsqu'un client se déconnecte
    socket.on("disconnect", () => {
        // Vous pouvez récupérer toutes les rooms auxquelles ce socket appartient
        const rooms = Object.keys(socket.rooms);
        
        // Si le socket appartient à une ou plusieurs rooms, on le retire de chaque room
        rooms.forEach((roomId) => {
            socket.leave(roomId);
        });
    });
});

const generateRoomId = (user1, user2) => {
    return [user1, user2].sort().join("_");
};

// Démarrer le serveur seulement si ce n'est pas un test
if (process.env.NODE_ENV !== "test") {
    server.listen(process.env.PORT || 3000, () => {
        console.log(`✅ Serveur démarré sur le port ${process.env.PORT || 3000}`);
    });
}

// Exporter l'app et le serveur pour les tests
module.exports = { app, server };
