const request = require('supertest');
const { app, server } = require("../server");
const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require("mongodb-memory-server");

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.connection.close();
});

let user;
let token;

beforeEach(async () => {
    user = await User.create({
        lastname: "lastname_test",
        firstname: "firstname_test",
        username: 'username_test',
        password: 'password123',
    });

    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('ProjectController - Create Project', () => {
    it('should create a project successfully when valid data is provided', async () => {
        const projectData = {
            name: 'New Project',
            description: 'This is a new project created for testing.',
        };

        const response = await request(app)
            .post('/api/v1/projects')
            .set('Authorization', `Bearer ${token}`)
            .send(projectData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Projet créé avec succès');
        expect(response.body.data.name).toBe(projectData.name);
        expect(response.body.data.description).toBe(projectData.description);
    });

    it('should return an error if token is not provided', async () => {
        const projectData = {
            name: 'New Project',
            description: 'This is a new project created for testing.',
        };

        const response = await request(app)
            .post('/api/v1/projects')
            .send(projectData);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Token manquant ou invalide');
    });

    it('should return an error if token is invalid', async () => {
        const projectData = {
            name: 'New Project',
            description: 'This is a new project created for testing.',
        };

        const invalidToken = 'invalid-token';

        const response = await request(app)
            .post('/api/v1/projects')
            .set('Authorization', `Bearer ${invalidToken}`)
            .send(projectData);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Token manquant ou invalide');
    });

    it('should return an error if required fields are missing', async () => {
        const projectData = {
            description: 'Missing name field.',
        };

        const response = await request(app)
            .post('/api/v1/projects')
            .set('Authorization', `Bearer ${token}`)
            .send(projectData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Le nom du projet est requis');
    });
});
