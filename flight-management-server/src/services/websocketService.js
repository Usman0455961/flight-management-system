const WebSocket = require('ws');
const { kafka, isKafkaConnected } = require('./kafkaService');

class WebSocketService {
    constructor() {
        this.wss = null;
        this.clients = new Set();
        this.consumer = null;
    }

    initialize(server) {
        this.wss = new WebSocket.Server({ server });
        
        // Handle WebSocket connections
        this.wss.on('connection', (ws) => {
            console.log('New client connected');
            this.clients.add(ws);

            ws.on('close', () => {
                console.log('Client disconnected');
                this.clients.delete(ws);
            });
        });

        // Initialize Kafka consumer only if Kafka is available
        this.initializeKafkaConsumer().catch(error => {
            console.error('Failed to initialize Kafka consumer:', error);
            console.log('WebSocket service running without Kafka integration');
        });
    }

    async initializeKafkaConsumer() {
        try {
            // Check if Kafka is available
            const kafkaAvailable = await isKafkaConnected();
            if (!kafkaAvailable) {
                console.log('Kafka not available, skipping consumer initialization');
                return;
            }

            this.consumer = kafka.consumer({ groupId: 'websocket-group' });
            
            await this.consumer.connect();
            console.log('Kafka consumer connected');

            await this.consumer.subscribe({ 
                topic: 'flight-status-updates', 
                fromBeginning: false // Changed to false to only get new messages
            });

            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const statusUpdate = JSON.parse(message.value.toString());
                        console.log('Received Kafka message:', statusUpdate);
                        this.broadcast(statusUpdate);
                    } catch (error) {
                        console.error('Error processing Kafka message:', error);
                    }
                },
            });
        } catch (error) {
            console.error('Error setting up Kafka consumer:', error);
            throw error; // Propagate error to be handled by initialize()
        }
    }

    broadcast(message) {
        const messageString = JSON.stringify(message);
        console.log('Broadcasting WebSocket message:', messageString);
        console.log('Number of connected clients:', this.clients.size);
        
        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                console.log('Sending message to client');
                client.send(messageString);
            } else {
                console.log('Client not ready, state:', client.readyState);
            }
        });
    }

    // Add cleanup method
    async cleanup() {
        if (this.consumer) {
            try {
                await this.consumer.disconnect();
                console.log('Kafka consumer disconnected');
            } catch (error) {
                console.error('Error disconnecting Kafka consumer:', error);
            }
        }
    }
}

const websocketService = new WebSocketService();
module.exports = websocketService; 