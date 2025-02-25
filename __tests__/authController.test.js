const request = require('supertest');
const { app, server } = require('../server');
const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let user;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(mongoServer.getUri());

    // Créer un utilisateur pour les tests
    user = await User.create({
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        password: 'password123'
    });

    // Créer un token JWT pour l'utilisateur
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    global.console.error = jest.fn();
});


afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    server.close();
    global.console.error.mockRestore();
});

describe('AuthController - Authentification', () => {
    it('devrait inscrire un utilisateur', async () => {
        const userData = {
            lastname: 'Smith',
            firstname: 'Jane',
            username: 'janesmith',
            password: 'password456'
        };

        const res = await request(app)
            .post('/api/v1/auth/register')
            .send(userData);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Utilisateur créé avec succès');
    });

    // Test pour l'inscription avec des données invalides (ex : mot de passe manquant)
    it('devrait retourner une erreur si les données sont invalides lors de l\'inscription', async () => {
        const userData = {
            lastname: 'Smith',
            firstname: 'Jane',
            username: '',
            password: 'password456'
        };

        const res = await request(app)
            .post('/api/v1/auth/register')
            .send(userData);

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    // Test pour la connexion avec un utilisateur valide
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
        const loginData = {
            username: 'janesmith',
            password: 'password456'
        };

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send(loginData);

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.userId).toBeDefined();
    });

    // Test pour la connexion avec un mot de passe incorrect
    it('devrait retourner une erreur si les identifiants sont incorrects', async () => {
        const loginData = {
            username: 'johndoe',
            password: 'wrongpassword'
        };

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send(loginData);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Identifiants invalides");
    });

    // Test pour la connexion avec un utilisateur inconnu
    it('devrait retourner une erreur si le nom d\'utilisateur est inconnu', async () => {
        const loginData = {
            username: 'unknownuser',
            password: 'password123'
        };

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send(loginData);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Nom d'utilisateur inconnu");
    });
});
