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
let secondReceiverUserId;

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

    // ✅ Création du premier contact
    const receiverUser = await User.create({
        name: "Receiver User",
        email: "receiver@example.com",
        password: "password"
    });
    receiverUserId = receiverUser._id;

    // ✅ Création d'un deuxième contact pour tester plusieurs conversations
    const secondReceiverUser = await User.create({
        name: "Second Receiver",
        email: "second@example.com",
        password: "password"
    });
    secondReceiverUserId = secondReceiverUser._id;

    // ✅ Insérer plusieurs messages pour tester l'ordre et les contacts
    await Message.insertMany([
        { message: "Hello 1", sender: userId, receiver: receiverUserId, createdAt: new Date("2024-02-15T14:30:00.000Z") },
        { message: "Hello 2", sender: receiverUserId, receiver: userId, createdAt: new Date("2024-02-15T14:35:00.000Z") },
        { message: "Message to second user", sender: userId, receiver: secondReceiverUserId, createdAt: new Date("2024-02-15T14:40:00.000Z") }
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
    it("✅ devrait afficher plusieurs contacts s'il y en a plusieurs", async () => {
        const res = await request(app)
            .get("/api/v1/messages/contacts")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it("✅ devrait afficher le bon dernier message", async () => {
        const res = await request(app)
            .get("/api/v1/messages/contacts")
            .set("Authorization", `Bearer ${token}`);

        expect(res.body.find(c => c.email === "receiver@example.com").lastMessage)
            .toBe("Hello 2");
    });

    it("✅ ne doit pas retourner un message supprimé", async () => {
        const deletedMessage = await Message.create({
            message: "Message supprimé",
            sender: userId,
            receiver: receiverUserId,
            createdAt: new Date(),
            deleted: true
        });

        const res = await request(app)
            .get("/api/v1/messages")
            .set("Authorization", `Bearer ${token}`);

        expect(res.body.find(msg => msg._id === deletedMessage._id)).toBeUndefined();
    });

    it("✅ devrait permettre d’envoyer un message", async () => {
        const newMessage = "Test message";
        const res = await request(app)
            .post("/api/v1/messages")
            .set("Authorization", `Bearer ${token}`) // Token valide de l'utilisateur
            .send({
                receiverId: receiverUserId, // L'ID du destinataire
                message: newMessage // Le message à envoyer
            });
    
        expect(res.status).toBe(201); // Statut attendu 201 pour la création
        expect(res.body.message).toBe("Message ajouté avec succès");
        expect(res.body.data).toHaveProperty("message", newMessage); // Vérifie si le message a bien été créé
        expect(res.body.data.sender.toString()).toBe(userId.toString()); // Vérifie si l'expéditeur est correct
        expect(res.body.data.receiver.toString()).toBe(receiverUserId.toString()); // Vérifie si le destinataire est correct
    });

    it("✅ ne doit pas permettre d’accéder aux messages d’un autre utilisateur", async () => {
        const res = await request(app)
            .get("/api/v1/messages")
            .set("Authorization", `Bearer ${anotherValidToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
    });

    it("✅ doit refuser un token expiré", async () => {
        const expiredToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "-1h" });

        const res = await request(app)
            .get("/api/v1/messages")
            .set("Authorization", `Bearer ${expiredToken}`);

        expect(res.status).toBe(401);
    });

});
