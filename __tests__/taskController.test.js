const request = require("supertest");
const { app, server } = require("../server");
const User = require("../models/User");
const Workspace = require("../models/Workspace");
const Task = require("../models/Task");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;
let user;
let workspace;
let task;
let token;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(mongoServer.getUri());

    // Créer un utilisateur
    user = await User.create({
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        password: "password123"
    });

    // Créer un espace de travail
    workspace = await Workspace.create({
        name: "Test Workspace",
        owner: user._id,
        members: [user._id]
    });

    // Créer une tâche
    task = await Task.create({
        title: "Test Task",
        workspace: workspace._id.toString(),
        assignedTo: user._id.toString(),
        owner: user._id.toString(),
        workspace: workspace,
        status: "Backlog",
        priority: "Low",
        dueDate: "2025-12-31"
    });

    // Créer un token JWT pour l'utilisateur
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    // Désactiver les logs d'erreurs dans les tests
    global.console.error = jest.fn();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    server.close();
    global.console.error.mockRestore();
});

describe("TaskController - Gestion des tâches", () => {
    it("devrait retourner les tâches d'un projet", async () => {        
        const res = await request(app)
            .get(`/api/v1/tasks?workspace=${workspace._id.toString()}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty("title", "Test Task");
    });

    it("devrait retourner une erreur si le projet est introuvable", async () => {
        const invalidWorkspaceId = "60b8b14f5f1b2b001c8a0db5";
        const res = await request(app)
            .get(`/api/v1/tasks?workspace=${invalidWorkspaceId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("error", "Projet introuvable");
    });

    it("devrait créer une nouvelle tâche", async () => {        
        const newTaskData = {
            title: "New Task",
            workspaceId: workspace._id,
            assignedTo: user._id,
            status: "Backlog",
            priority: "Medium",
            dueDate: "2025-12-31"
        };

        const res = await request(app)
            .post("/api/v1/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send(newTaskData);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe("Tâche créée avec succès");
        expect(res.body.data).toHaveProperty("title", "New Task");
    });

    it("devrait mettre à jour une tâche existante", async () => {
        const updatedTaskData = { title: "Updated Task" };

        const res = await request(app)
            .put(`/api/v1/tasks/${task._id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updatedTaskData);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Tâche mise à jour avec succès");
        expect(res.body.data).toHaveProperty("title", "Updated Task");
    });

    it("devrait retourner une erreur si la tâche n'est pas trouvée lors de la mise à jour", async () => {
        const invalidTaskId = "60b8b14f5f1b2b001c8a0db7";
        const res = await request(app)
            .put(`/api/v1/tasks/${invalidTaskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Nonexistent Task" });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("error", "Erreur lors de la mise à jour de la tâche");
    });

    it("devrait supprimer une tâche", async () => {
        const res = await request(app)
            .delete(`/api/v1/tasks/${task._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Tâche supprimée avec succès");
    });

    it("devrait retourner une erreur si la tâche n'est pas trouvée lors de la suppression", async () => {
        const invalidTaskId = "60b8b14f5f1b2b001c8a0db7";
        const res = await request(app)
            .delete(`/api/v1/tasks/${invalidTaskId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("error", "Tâche introuvable");
    });
});
