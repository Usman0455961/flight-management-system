const flightService = require('../services/flightService');

class FlightController {
    async getAllFlights(req, res) {
        try {
            const flights = await flightService.getAllFlights();
            res.json(flights);
        } catch (error) {
            console.error('Error fetching flights:', error);
            res.status(500).json({ 
                message: 'Error fetching flights', 
                error: error.message 
            });
        }
    }

    async getFlightByNumber(req, res) {
        try {
            const flight = await flightService.getFlightByNumber(req.params.flightNumber);
            res.json(flight);
        } catch (error) {
            if (error.message === 'Flight not found') {
                return res.status(404).json({ message: 'Flight not found' });
            }
            res.status(500).json({ 
                message: 'Error fetching flight', 
                error: error.message 
            });
        }
    }

    async updateFlightStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updatedFlight = await flightService.updateFlightStatus(id, status);
            res.json(updatedFlight);
        } catch (error) {
            if (error.message === 'Flight not found') {
                return res.status(404).json({ message: 'Flight not found' });
            }
            console.error('Error updating flight status:', error);
            res.status(500).json({ message: 'Error updating flight status' });
        }
    }
}

module.exports = new FlightController(); 