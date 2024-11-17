const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const { auth, checkPermission } = require('../middleware/auth');

// Get all flights (requires view_flights permission)
router.get('/', auth, checkPermission('view_flights'), async (req, res) => {
    try {
        const flights = await Flight.find()
            .sort({ updatedAt: -1 });
        res.json(flights);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching flights', error: error.message });
    }
});

// Get specific flight (requires view_flights permission)
router.get('/:flightNumber', auth, checkPermission('view_flights'), async (req, res) => {
    try {
        const flight = await Flight.findOne({ flightNumber: req.params.flightNumber });
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        res.json(flight);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching flight', error: error.message });
    }
});

// Update flight status (requires update_flights permission)
router.patch('/:id/status', auth, checkPermission('update_flights'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const flight = await Flight.findById(id);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        flight.status = status;
        await flight.save();

        res.json(flight);
    } catch (error) {
        console.error('Error updating flight status:', error);
        res.status(500).json({ message: 'Error updating flight status' });
    }
});

module.exports = router; 