const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');

router.get('/all', ProjectController.getAll);
router.get('/:id', ProjectController.getById);
router.post('/', ProjectController.create);
router.put('/:id', ProjectController.update);
router.delete('/:id', ProjectController.delete);
router.post('/:id/members', ProjectController.addMember);

module.exports = router;
