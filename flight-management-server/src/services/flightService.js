const Flight = require('../models/Flight');

class FlightService {
    async getAllFlights() {
        try {
            return await Flight.find().sort({ updatedAt: -1 });
        } catch (error) {
            throw error;
        }
    }

    async getFlightByNumber(flightNumber) {
        try {
            const flight = await Flight.findOne({ flightNumber });
            if (!flight) {
                throw new Error('Flight not found');
            }
            return flight;
        } catch (error) {
            throw error;
        }
    }

    async updateFlightStatus(id, status) {
        try {
            const flight = await Flight.findById(id);
            if (!flight) {
                throw new Error('Flight not found');
            }
            flight.status = status;
            return await flight.save();
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new FlightService(); 