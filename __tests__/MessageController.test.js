const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, server } = require('../server');
const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;
let anotherValidToken;
let userId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(mongoServer.getUri());

    const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password"
    });
    userId = user._id;

    token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const receiverUser = await User.create({
        name: "Receiver User",
        email: "receiver@example.com",
        password: "password"
    });

    await Message.insertMany([
        { message: "Hello 1", sender: userId, receiver: receiverUser._id },
        { message: "Hello 2", sender: receiverUser._id, receiver: userId }
    ])

    const userWithoutMessages = new User({
        name: "Another User",
        email: "anotheruser@example.com",
        password: "password123",
    });
    await userWithoutMessages.save();

    anotherValidToken = jwt.sign({ userId: userWithoutMessages._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    server.close();
});

describe("GET /api/v1/messages", () => {
    it("devrait retourner les messages où l'utilisateur est sender ou receiver", async () => {
        const res = await request(app)
            .get("/api/v1/messages")
            .set("Authorization", `Bearer ${token}`);
        
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
    
        const messages = res.body;
        messages.forEach(message => {
            const senderId = message.sender._id.toString();
            const receiverId = message.receiver._id.toString();
            
            expect([senderId, receiverId]).toContain(userId.toString());
        });
    });
    
    it("devrait renvoyer une erreur si le token est manquant", async () => {
        const res = await request(app).get("/api/v1/messages");

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Token manquant ou invalide");
    });

    it("devrait renvoyer une erreur si le token est invalide", async () => {
        const invalidToken = "invalid_token";
        const res = await request(app)
            .get("/api/v1/messages")
            .set("Authorization", `Bearer ${invalidToken}`);

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Token manquant ou invalide");
    });

    it("devrait retourner une liste vide si l'utilisateur n'a pas de messages", async () => {
        const res = await request(app)
            .get("/api/v1/messages")
            .set("Authorization", `Bearer ${anotherValidToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
    });
});
