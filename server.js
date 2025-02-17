// Importation des modules
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cookieParser = require('cookie-parser');
const messagesRoutes = require('./routes/messages');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

// Création de l'application Express et du serveur HTTP
const app = express();
const server = http.createServer(app);

// Configuration de Socket.IO
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion à MongoDB:", err));

// Middlewares globaux
app.use(cors()); // Devrait être limité à des origines spécifiques en production
app.use(express.json());
app.use(cookieParser());

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

// Routes API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/messages', messagesRoutes);
app.use('/api/v1/users', usersRoutes);

// Démarrer le serveur seulement si ce n'est pas un test
if (process.env.NODE_ENV !== "test") {
    server.listen(process.env.PORT || 3000, () => {
        console.log(`✅ Serveur démarré sur le port ${process.env.PORT || 3000}`);
    });
}

// Exporter l'app et le serveur pour les tests
module.exports = { app, server };
