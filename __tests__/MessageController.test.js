const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { app, server } = require("../server");
const Message = require("../models/Message");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

let mongoServer;
let token;
let anotherValidToken;
let userId;
let receiverUserId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(mongoServer.getUri());

    // ✅ Création de l'utilisateur principal (testeur)
    const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password"
    });
    userId = user._id;

    token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // ✅ Création d'un contact (receiver)
    const receiverUser = await User.create({
        name: "Receiver User",
        email: "receiver@example.com",
        password: "password"
    });
    receiverUserId = receiverUser._id;

    // ✅ Insérer des messages avec des dates fixes
    await Message.insertMany([
        { 
            message: "Hello 1", 
            sender: userId, 
            receiver: receiverUserId, 
            createdAt: new Date("2024-02-15T14:30:00.000Z") 
        },
        { 
            message: "Hello 2 (dernier message)", 
            sender: receiverUserId, 
            receiver: userId, 
            createdAt: new Date("2024-02-15T14:35:00.000Z") // ✅ Dernier message
        }
    ]);

    // ✅ Création d'un utilisateur sans messages
    const userWithoutMessages = await User.create({
        name: "Another User",
        email: "anotheruser@example.com",
        password: "password123"
    });

    anotherValidToken = jwt.sign({ userId: userWithoutMessages._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    server.close();
});

describe("GET /api/v1/messages", () => {

    it("✅ devrait retourner les messages où l'utilisateur est sender ou receiver", async () => {
        const res = await request(app)
            .get("/api/v1/messages")
            .set("Authorization", `Bearer ${token}`);
        
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2); // ✅ Deux messages

        res.body.forEach(message => {
            const senderId = message.sender._id.toString();
            const receiverId = message.receiver._id.toString();
            expect([senderId, receiverId]).toContain(userId.toString());
        });
    });

    it("✅ devrait renvoyer une erreur si le token est manquant", async () => {
        const res = await request(app).get("/api/v1/messages");

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Token manquant ou invalide");
    });

    it("✅ devrait renvoyer une erreur si le token est invalide", async () => {
        const invalidToken = "invalid_token";
        const res = await request(app)
            .get("/api/v1/messages")
            .set("Authorization", `Bearer ${invalidToken}`);

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Token manquant ou invalide");
    });

    it("✅ devrait retourner une liste vide si l'utilisateur n'a pas de messages", async () => {
        const res = await request(app)
            .get("/api/v1/messages")
            .set("Authorization", `Bearer ${anotherValidToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
    });

    it("✅ devrait retourner la liste des contacts avec qui l'utilisateur a échangé des messages", async () => {
        const res = await request(app)
            .get("/api/v1/messages/contacts")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toMatchObject({
            name: "Receiver User",
            email: "receiver@example.com",
            lastMessage: "Hello 2 (dernier message)",
            lastMessageTime: "2024-02-15T14:35:00.000Z"
        });
    });

    it("✅ devrait ne pas dupliquer un contact s'il y a plusieurs messages", async () => {
        const res = await request(app)
            .get("/api/v1/messages/contacts")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1); // ✅ Vérification qu'il n'y a pas de doublon
    });

    it("✅ devrait retourner une liste vide si aucun contact trouvé", async () => {
        const res = await request(app)
            .get("/api/v1/messages/contacts")
            .set("Authorization", `Bearer ${anotherValidToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
    });
});
