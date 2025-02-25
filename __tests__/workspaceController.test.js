const request = require('supertest');
const { app, server } = require("../server");
const User = require('../models/User');
const Workspace = require("../models/Workspace");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;
let user;
let token;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(mongoServer.getUri());

    user = await User.create({
        lastname: "lastname_test",
        firstname: "firstname_test",
        username: 'username_test',
        password: 'password123',
    });

    workspace = await Workspace.create({
        name: "Test Workspace",
        owner: user._id,
        members: [user._id]
    });

    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    global.console.error = jest.fn();
});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    server.close();
    global.console.error.mockRestore();
});

describe('WorkspaceController - Create Workspace', () => {
    it('should create a workspace successfully when valid data is provided', async () => {
        const workspaceData = {
            name: 'New Workspace',
            description: 'This is a new workspace created for testing.',
        };

        const response = await request(app)
            .post('/api/v1/workspaces')
            .set('Authorization', `Bearer ${token}`)
            .send(workspaceData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Projet créé avec succès');
        expect(response.body.data.name).toBe(workspaceData.name);
        expect(response.body.data.description).toBe(workspaceData.description);
    });

    it('should return an error if token is not provided', async () => {
        const workspaceData = {
            name: 'New Workspace',
            description: 'This is a new workspace created for testing.',
        };

        const response = await request(app)
            .post('/api/v1/workspaces')
            .send(workspaceData);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Token manquant ou invalide');
    });

    it('should return an error if token is invalid', async () => {
        const workspaceData = {
            name: 'New Workspace',
            description: 'This is a new workspace created for testing.',
        };

        const invalidToken = 'invalid-token';

        const response = await request(app)
            .post('/api/v1/workspaces')
            .set('Authorization', `Bearer ${invalidToken}`)
            .send(workspaceData);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Token manquant ou invalide');
    });

    it('should return an error if required fields are missing', async () => {
        const workspaceData = {
            description: 'Missing name field.'
        };

        const response = await request(app)
            .post('/api/v1/workspaces')
            .set('Authorization', `Bearer ${token}`)
            .send(workspaceData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Le nom du projet est requis');
    });
});
