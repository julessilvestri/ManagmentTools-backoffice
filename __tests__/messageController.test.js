const request = require('supertest');
const { app, server } = require('../server');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let user;
let receiver;
let token;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(mongoServer.getUri());

    user = await User.create({
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        password: 'password123'
    });

    receiver = await User.create({
        firstname: 'Jane',
        lastname: 'Smith',
        username: 'janesmith',
        password: 'password456'
    });

    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    message = await Message.create({
        sender: user._id,
        receiver: receiver._id,
        message: 'Hello, Jane!'
    });

    messageId = message._id.toString();    

    global.console.error = jest.fn();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    server.close();
    global.console.error.mockRestore();
});

describe('MessageController - Messages', () => {
    it('devrait récupérer tous les contacts de l\'utilisateur avec leur dernier message', async () => {
        const res = await request(app)
            .get('/api/v1/messages/contacts')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].lastMessage).toBe('Hello, Jane!');
    });

    it('devrait retourner une erreur 401 si le token est invalide lors de la récupération des contacts', async () => {
        const res = await request(app)
            .get('/api/v1/messages/contacts')
            .set('Authorization', 'Bearer invalid-token');

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Token manquant ou invalide');
    });

    it('devrait retourner une erreur 404 si l\'expéditeur ou le destinataire est introuvable lors de la création d\'un message', async () => {
        const res = await request(app)
            .post('/api/v1/messages')
            .set('Authorization', `Bearer ${token}`)
            .send({
                receiverId: 'invalid-id',
                message: 'New message'
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('ID du destinataire invalide.');
    });
});
