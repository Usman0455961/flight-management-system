const express = require('express');
const router = express.Router();
const redisService = require('../services/redisService');

router.get('/:key', async (req, res) => {
    const value = await redisService.get(req.params.key);
    res.json({ value });
});

router.post('/', async (req, res) => {
    const { key, value } = req.body;
    await redisService.set(key, value);
    res.json({ message: 'Cached successfully' });
});

module.exports = router; 