const express = require('express');
const router = express.Router();
const BacklogController = require('../controllers/backlogController');

const DEFAULT_BACKLOG_TYPES = [
    { id: 'development', name: 'Development', description: 'Development work items' },
    { id: 'qa_testing', name: 'QA/Testing', description: 'Quality assurance and testing items' },
    { id: 'strategic', name: 'Strategic', description: 'Planning and strategic items' }
];

router.get('/projects/:projectId/backlogs', BacklogController.getByProject);
router.post('/projects/:projectId/backlogs', BacklogController.create);
router.patch('/backlogs/:id', BacklogController.update);
router.delete('/backlogs/:id', BacklogController.delete);
router.get('/backlog-types', (req, res) => {
    res.json({ success: true, backlogTypes: DEFAULT_BACKLOG_TYPES });
});
router.post('/backlog-types', (req, res) => {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Name is required' });
    }

    res.status(201).json({
        success: true,
        backlogType: {
            id: name.trim().toLowerCase().replace(/\s+/g, '_'),
            name: name.trim(),
            description: description || ''
        }
    });
});

module.exports = router;
