const Flight = require('../models/Flight');
const { producer } = require('./kafkaService');

// List of sample airports
const airports = ['JFK', 'LAX', 'ORD', 'DFW', 'DEN', 'SFO', 'SEA', 'MIA', 'BOS', 'LAS'];

// Generate random flight number
const generateFlightNumber = () => {
    const airlines = ['AA', 'UA', 'DL', 'WN'];
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `${airline}${number}`;
};

// Generate random future date within next 24 hours
const generateFutureDate = () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + Math.random() * 24 * 60 * 60 * 1000);
    return futureDate;
};

// Create new random flights
const createRandomFlights = async () => {
    try {
        const numberOfFlights = Math.floor(Math.random() * 3) + 1; // Create 1-3 flights

        for (let i = 0; i < numberOfFlights; i++) {
            const origin = airports[Math.floor(Math.random() * airports.length)];
            let destination;
            do {
                destination = airports[Math.floor(Math.random() * airports.length)];
            } while (destination === origin);

            const flight = new Flight({
                flightNumber: generateFlightNumber(),
                origin,
                destination,
                scheduledDeparture: generateFutureDate(),
                status: 'ON_TIME'
            });

            await flight.save();
            console.log(`Created new flight: ${flight.flightNumber}`);
        }
    } catch (error) {
        console.error('Error creating flights:', error);
    }
};

// Update random flights status
const updateRandomFlightsStatus = async () => {
    try {
        const flights = await Flight.find({ status: { $ne: 'CANCELLED' } });
        
        if (flights.length === 0) return;

        // Update 1-3 random flights
        const numberOfUpdates = Math.min(Math.floor(Math.random() * 3) + 1, flights.length);
        
        for (let i = 0; i < numberOfUpdates; i++) {
            const randomFlight = flights[Math.floor(Math.random() * flights.length)];
            const statuses = ['ON_TIME', 'DELAYED', 'CANCELLED'];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

            // Update flight status in database
            await Flight.findByIdAndUpdate(randomFlight._id, { status: newStatus });
            console.log(`Updated flight ${randomFlight.flightNumber} status to ${newStatus}`);

            // Produce Kafka message for status update
            try {
                await producer.send({
                    topic: 'flight-status-updates',
                    messages: [
                        {
                            key: randomFlight._id.toString(),
                            value: JSON.stringify({
                                type: 'STATUS_UPDATE',
                                flightId: randomFlight._id,
                                flightNumber: randomFlight.flightNumber,
                                newStatus: newStatus,
                                timestamp: new Date().toISOString()
                            })
                        }
                    ]
                });
                console.log('Kafka message sent for random status update:', randomFlight.flightNumber);
            } catch (kafkaError) {
                console.error('Failed to send Kafka message:', kafkaError);
            }
        }
    } catch (error) {
        console.error('Error updating flights:', error);
    }
};

// Initialize flight service with separate intervals
const initializeFlightCreationService = () => {
    // setInterval returns an interval ID that we store
    const flightCreationInterval = setInterval(createRandomFlights, 5000);
    console.log('Flight creation initialized - Creating flights every 5 seconds');

    // Return a cleanup function that uses clearInterval
    return () => {
        clearInterval(flightCreationInterval); // Stops the interval from running
        console.log('Flight service intervals cleared');
    };
};

const initializeFlightUpdationService = () => {
    // Start flight status update interval (every 10 seconds)
    const flightUpdateInterval = setInterval(updateRandomFlightsStatus, 10000);
    console.log('Flight status updates initialized - Updating statuses every 10 seconds');

    // Return cleanup function
    return () => {
        clearInterval(flightUpdateInterval);
        console.log('Flight service intervals cleared');
    };
};

module.exports = {
    createRandomFlights,
    updateRandomFlightsStatus,
    initializeFlightCreationService,
    initializeFlightUpdationService
}; 