const request = require("supertest");
const { app, server } = require("../server");
const User = require("../models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
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
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "password123"
    });

    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    global.console.error = jest.fn();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    server.close();
    global.console.error.mockRestore();
});

describe("UserController - Recherche d'utilisateur", () => {
    it("devrait retourner une liste d'utilisateurs correspondant à la recherche", async () => {
        const res = await request(app)
            .get("/api/v1/users/search")
            .query({ query: "John" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty("firstname", "John");
        expect(res.body[0]).toHaveProperty("lastname", "Doe");
        expect(res.body[0]).toHaveProperty("username", "johndoe");
    });

    it("devrait retourner une erreur si aucun paramètre de recherche n'est fourni", async () => {
        const res = await request(app)
            .get("/api/v1/users/search")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error", "Veuillez fournir un terme de recherche valide.");
    });
});

describe("UserController - Récupération d'utilisateur par ID", () => {
    it("devrait retourner un utilisateur valide lorsqu'un ID correct est fourni", async () => {
        const res = await request(app)
            .get(`/api/v1/users/${user._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("firstname", "John");
        expect(res.body).toHaveProperty("lastname", "Doe");
        expect(res.body).toHaveProperty("username", "johndoe");
    });

    it("devrait retourner une erreur si l'utilisateur n'est pas trouvé", async () => {
        const invalidId = "67bae9182a2dccdd3e6992bb" // ID incorrect
        const res = await request(app)
            .get(`/api/v1/users/${invalidId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);  // Utilisateur introuvable
        expect(res.body).toHaveProperty("error", "Utilisateur non trouvé.");
    });

    it("devrait retourner une erreur si l'ID est invalide", async () => {
        const res = await request(app)
            .get("/api/v1/users/123")  // ID mal formé
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);  // ID invalide
        expect(res.body).toHaveProperty("error", "ID utilisateur invalide.");
    });
});

