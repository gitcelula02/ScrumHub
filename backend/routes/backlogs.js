const express = require('express');
const router = express.Router();
const BacklogController = require('../controllers/backlogController');

router.get('/projects/:projectId/backlogs', BacklogController.getByProject);
router.post('/projects/:projectId/backlogs', BacklogController.create);
router.patch('/backlogs/:id', BacklogController.update);
router.delete('/backlogs/:id', BacklogController.delete);

module.exports = router;
