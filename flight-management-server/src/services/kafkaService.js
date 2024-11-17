const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'flight-management-app',
    brokers: ['localhost:29092'],
    retry: {
        initialRetryTime: 100,
        retries: 8
    }
});

// Create a producer instance
const producer = kafka.producer();

// Initialize producer connection
const initializeKafka = async () => {
    try {
        await producer.connect();
        console.log('Successfully connected to Kafka');

        // Create topic if it doesn't exist
        const admin = kafka.admin();
        await admin.connect();
        
        try {
            await admin.createTopics({
                topics: [{
                    topic: 'flight-status-updates',
                    numPartitions: 1,
                    replicationFactor: 1
                }]
            });
            console.log('Topic created successfully');
        } catch (error) {
            if (error.message.includes('Topic with this name already exists')) {
                console.log('Topic already exists');
            } else {
                throw error;
            }
        } finally {
            await admin.disconnect();
        }
    } catch (error) {
        console.error('Failed to connect to Kafka:', error);
        throw error; // Propagate error to be handled by caller
    }
};

// Graceful shutdown
const disconnectKafka = async () => {
    try {
        await producer.disconnect();
        console.log('Disconnected from Kafka');
    } catch (error) {
        console.error('Error disconnecting from Kafka:', error);
    }
};

// Handle process termination
process.on('SIGTERM', disconnectKafka);
process.on('SIGINT', disconnectKafka);

// Add a helper function to check if Kafka is connected
const isKafkaConnected = async () => {
    try {
        const admin = kafka.admin();
        await admin.connect();
        const topics = await admin.listTopics();
        await admin.disconnect();
        return true;
    } catch (error) {
        console.error('Kafka connection check failed:', error);
        return false;
    }
};

module.exports = {
    kafka,
    producer,
    initializeKafka,
    isKafkaConnected
}; 