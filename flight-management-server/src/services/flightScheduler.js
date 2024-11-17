const { updateRandomFlightsStatus } = require('./flightService');

function initializeFlightScheduler() {
    // Update random flight status every 30 seconds
    setInterval(updateRandomFlightsStatus, 5000);
    console.log('Flight scheduler initialized');
}

module.exports = initializeFlightScheduler; 