const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');

// IMPORTANTE: rutas específicas ANTES de las que tienen :id
router.get('/my-tasks', TaskController.getMyTasks);
router.get('/stats', TaskController.getStats);
router.get('/project/:projectId', TaskController.getByProject);

// Ruta general (faltaba en el original)
router.get('/', TaskController.getAll);

router.get('/:id', TaskController.getById);
router.post('/', TaskController.create);
router.patch('/:id', TaskController.update);
router.put('/:id', TaskController.update);
router.delete('/:id', TaskController.delete);
router.post('/:id/comments', TaskController.addComment);

module.exports = router;
