const express = require('express');
const router = express.Router();
const kafkaService = require('../services/kafkaService');

router.post('/', async (req, res) => {
    await kafkaService.sendMessage(req.body);
    res.json({ message: 'Message sent to Kafka' });
});

module.exports = router; 