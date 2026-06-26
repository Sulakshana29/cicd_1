const express = require('express');
const path = require('path');
const { prisma } = require('./db');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));


// ─── Root ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the DevOps Task Manager API!',
    version: '1.0.0',
    endpoints: {
      health:  'GET    /health',
      list:    'GET    /tasks',
      create:  'POST   /tasks',
      get:     'GET    /tasks/:id',
      update:  'PUT    /tasks/:id',
      delete:  'DELETE /tasks/:id',
    },
  });
});

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'OK', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected', error: error.message });
  }
});

// ─── Create Task ───────────────────────────────────────────────────────────
app.post('/tasks', async (req, res) => {
  const { title, description } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }
  try {
    const task = await prisma.task.create({
      data: { title: title.trim(), description: description?.trim() },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get All Tasks ─────────────────────────────────────────────────────────
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Single Task ───────────────────────────────────────────────────────
app.get('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Update Task ───────────────────────────────────────────────────────────
app.put('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  const { title, description, completed } = req.body;
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'Title must be a non-empty string' });
  }
  try {
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined      && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(completed !== undefined   && { completed }),
      },
    });
    res.status(200).json(updatedTask);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// ─── Delete Task ───────────────────────────────────────────────────────────
app.delete('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  try {
    await prisma.task.delete({ where: { id } });
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
