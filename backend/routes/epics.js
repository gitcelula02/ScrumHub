const express = require('express');
const router = express.Router();
const EpicController = require('../controllers/epicController');

router.get('/projects/:projectId/epics', EpicController.getByProject);
router.post('/projects/:projectId/epics', EpicController.create);
router.get('/epics/:id', EpicController.getById);
router.patch('/epics/:id', EpicController.update);
router.delete('/epics/:id', EpicController.delete);
router.post('/epics/:id/tasks', EpicController.assignTasks);

module.exports = router;
