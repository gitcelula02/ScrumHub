const express = require('express');
const router = express.Router();
const SprintController = require('../controllers/sprintController');

router.get('/projects/:projectId/sprints', SprintController.getByProject);
router.post('/projects/:projectId/sprints', SprintController.create);
router.post('/sprints/:id/activate', SprintController.activate);
router.post('/sprints/:id/complete', SprintController.complete);
router.post('/sprints/:id/tasks', SprintController.assignTasks);

module.exports = router;
