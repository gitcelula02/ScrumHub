const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');

router.get('/my-tasks', TaskController.getMyTasks);
router.get('/stats', TaskController.getStats);
router.get('/project/:projectId', TaskController.getByProject);
router.get('/:id', TaskController.getById);
router.post('/', TaskController.create);
router.put('/:id', TaskController.update);
router.delete('/:id', TaskController.delete);
router.post('/:id/comments', TaskController.addComment);

module.exports = router;
