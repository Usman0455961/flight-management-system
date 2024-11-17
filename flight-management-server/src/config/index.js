module.exports = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodb: {
        uri: process.env.MONGODB_URI
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD
    },
    kafka: {
        broker: process.env.KAFKA_BROKER,
        clientId: process.env.KAFKA_CLIENT_ID,
        topic: process.env.KAFKA_TOPIC
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION
    },
    cors: {
        origins: process.env.ALLOWED_ORIGINS.split(',')
    }
}; 