require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./src/config/database');
const initializeUsers = require("./src/config/initUsers");
const websocketService = require('./src/services/websocketService');
const { initializeKafka } = require('./src/services/kafkaService');
const { 
    initializeFlightCreationService, 
    initializeFlightUpdationService 
} = require('./src/services/flightSchedulerService');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require('./src/routes/authRoutes');
const flightRoutes = require('./src/routes/flightRoutes');

app.use('/auth', authRoutes);
app.use('/flights', flightRoutes);

// Initialize WebSocket service
websocketService.initialize(server);

// Connect to MongoDB and start server
async function startServer() {
    try {
        await connectDB();
        await initializeKafka();
        
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
            initializeUsers();
            initializeFlightCreationService();
            initializeFlightUpdationService();
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();
