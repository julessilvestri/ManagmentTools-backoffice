const request = require('supertest');
const { app, server } = require("../server");
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { MongoMemoryServer } = require("mongodb-memory-server");
const { getTasksForProject, getTaskByIdAndValidateAccess, createTask, updateTask, deleteTask } = require('../services/taskService');

// Mock des méthodes du service
jest.mock('../services/taskService');

describe('TaskController Tests', () => {
    let user;
    let project;
    let task;

    beforeAll(async () => {
        // Connexion à la base de données pour les tests
        mongoServer = await MongoMemoryServer.create();
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        await mongoose.connect(mongoServer.getUri());

        // Création d'un utilisateur, projet et tâche pour les tests
        user = new User({ lastname: 'Test User', firstname: 'Test User', username: 'testuser', password: 'password123' });
        await user.save();

        project = new Project({
            name: 'Test Project',
            owner: user._id,  // Assurez-vous que l'owner est bien défini
            members: [user._id]
        });
        await project.save();

        task = new Task({ title: 'Test Task', project: project, owner: user._id, assignedTo: user._id });
        await task.save();
    });

    afterAll(async () => {
        // Déconnexion de la base de données après les tests
        await mongoose.disconnect();
    });

    it('should get tasks for a project', async () => {
        getTasksForProject.mockResolvedValue([task]); // Simulation du service
        const res = await request(app)
            .get(`/tasks/${project._id}`)
            .set('Authorization', `Bearer ${user.token}`); // En-tête d'autorisation si nécessaire
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe('Test Task');
    });

    it('should get a specific task by id', async () => {
        getTaskByIdAndValidateAccess.mockResolvedValue(task);
        const res = await request(app)
            .get(`/tasks/${task._id}`)
            .set('Authorization', `Bearer ${user.token}`);
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Test Task');
    });

    it('should create a task', async () => {
        const newTaskData = { name: 'New Task', projectId: project._id, assignedTo: user._id };
        createTask.mockResolvedValue(newTaskData);

        const res = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${user.token}`)
            .send(newTaskData);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Tâche créée avec succès');
        expect(res.body.data.name).toBe('New Task');
    });

    it('should update a task', async () => {
        const updatedTaskData = { name: 'Updated Task' };
        updateTask.mockResolvedValue({ ...task, ...updatedTaskData });

        const res = await request(app)
            .put(`/tasks/task/${task._id}`)
            .set('Authorization', `Bearer ${user.token}`)
            .send(updatedTaskData);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Tâche mise à jour avec succès');
        expect(res.body.data.name).toBe('Updated Task');
    });

    it('should delete a task', async () => {
        deleteTask.mockResolvedValue();

        const res = await request(app)
            .delete(`/tasks/task/${task._id}`)
            .set('Authorization', `Bearer ${user.token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Tâche supprimée avec succès');
    });
});
