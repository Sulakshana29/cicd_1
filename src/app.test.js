const request = require('supertest');
const app = require('./app');
const { prisma } = require('./db');

beforeAll(async () => {
  await prisma.task.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Task API — CRUD Endpoints', () => {
  let taskId;

  // ─── GET /tasks ───────────────────────────────────────────────────────────
  it('GET /tasks should return empty array initially', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  // ─── POST /tasks ──────────────────────────────────────────────────────────
  it('POST /tasks should create a new task', async () => {
    const res = await request(app).post('/tasks').send({
      title: 'Test Task',
      description: 'Testing description',
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toEqual('Test Task');
    expect(res.body.description).toEqual('Testing description');
    expect(res.body.completed).toEqual(false);
    taskId = res.body.id;
  });

  it('POST /tasks should return 400 if title is missing', async () => {
    const res = await request(app).post('/tasks').send({ description: 'no title' });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /tasks should return 400 if title is an empty string', async () => {
    const res = await request(app).post('/tasks').send({ title: '   ' });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  // ─── GET /tasks (with data) ───────────────────────────────────────────────
  it('GET /tasks should return one task', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].title).toEqual('Test Task');
  });

  // ─── GET /tasks/:id ───────────────────────────────────────────────────────
  it('GET /tasks/:id should return a single task', async () => {
    const res = await request(app).get(`/tasks/${taskId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(taskId);
  });

  it('GET /tasks/:id should return 404 for non-existent task', async () => {
    const res = await request(app).get('/tasks/99999');
    expect(res.statusCode).toEqual(404);
  });

  // ─── PUT /tasks/:id ───────────────────────────────────────────────────────
  it('PUT /tasks/:id should update a task', async () => {
    const res = await request(app).put(`/tasks/${taskId}`).send({
      title: 'Updated Task',
      completed: true,
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual('Updated Task');
    expect(res.body.completed).toEqual(true);
  });

  it('PUT /tasks/:id should return 404 for non-existent task', async () => {
    const res = await request(app).put('/tasks/99999').send({ title: 'Ghost' });
    expect(res.statusCode).toEqual(404);
  });

  // ─── DELETE /tasks/:id ────────────────────────────────────────────────────
  it('DELETE /tasks/:id should delete the task', async () => {
    const res = await request(app).delete(`/tasks/${taskId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Task deleted successfully');
  });

  it('DELETE /tasks/:id should return 404 for non-existent task', async () => {
    const res = await request(app).delete(`/tasks/${taskId}`);
    expect(res.statusCode).toEqual(404);
  });

  it('GET /tasks should return empty after deletion', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(0);
  });
});
