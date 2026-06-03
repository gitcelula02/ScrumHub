const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const ProjectController = require('../controllers/projectController');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

function createRes() {
  let statusCode = 200;
  let payload = null;
  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      payload = data;
      return this;
    },
    get statusCode() {
      return statusCode;
    },
    get payload() {
      return payload;
    }
  };
}

describe('ProjectController', () => {
  beforeEach(() => {
    Project.getByUser = async (userId) => [
      {
        id: '1',
        owner: userId,
        members: [userId],
        name: 'Test Project',
        description: 'Test',
        color: '#000',
        icon: '📁'
      }
    ];

    Task.getStats = async () => ({ total: 0, todo: 0, inProgress: 0, review: 0, done: 0, overdue: 0 });
    User.findById = async (id) => ({ id, name: `User ${id}`, avatar: '👤' });
    Project.create = async (data) => ({ id: '2', ...data });
  });

  it('returns 401 when getAll is called without authentication', async () => {
    const req = { session: null };
    const res = createRes();

    await ProjectController.getAll(req, res);

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.payload, { success: false, message: 'No autenticado' });
  });

  it('returns the authenticated user projects', async () => {
    const req = { session: { userId: '42' } };
    const res = createRes();

    await ProjectController.getAll(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.ok(Array.isArray(res.payload.projects));
    assert.equal(res.payload.projects[0].id, '1');
  });

  it('returns 400 when create is called without a project name', async () => {
    const req = { session: { userId: '42' }, body: { name: '' } };
    const res = createRes();

    await ProjectController.create(req, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.payload, { success: false, message: 'El nombre es requerido' });
  });
});
