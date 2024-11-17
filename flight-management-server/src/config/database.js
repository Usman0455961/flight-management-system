const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = 'mongodb://root:example@127.0.0.1:27017/myapp?authSource=admin';
        
        console.log('Attempting to connect to MongoDB...');
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });
        
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB connected successfully');
        }

        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

    } catch (err) {
        console.error('MongoDB connection error details:', {
            name: err.name,
            message: err.message,
            code: err.code
        });
        process.exit(1);
    }
};

module.exports = connectDB;