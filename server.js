// Importation des modules
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const messageRoutes = require('./routes/messages');
const authRoutes = require('./routes/auth');

require('dotenv').config({ path: '.env.local' });

const app = express();
const server = http.createServer(app); // Création du serveur HTTP pour WebSockets
const io = socketIo(server, {
    cors: {
        origin: "*", // Autorise toutes les origines (à sécuriser en production)
        methods: ["GET", "POST"]
    }
});

mongoose.connect(process.env.MONGO_URI).then(() => console.log("✅ Connecté à MongoDB"))
.catch(err => console.error("❌ Erreur de connexion à MongoDB:", err));

// Middlewares globaux
app.use(cors());
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API ManagementTools",
            version: "1.0.0",
            description: "Documentation de l'API pour la gestion des tâches et le chat"
        },
        servers: [{ url: "http://localhost:3000/api/v1", description: "Serveur local" }],
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

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/messages', messageRoutes);

// 🔥 Démarrer le serveur seulement si ce n'est pas un test
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));
}

// ✅ On exporte `app` et `server` (pour les tests)
module.exports = { app, server };
