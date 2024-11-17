const mongoose = require('mongoose');
const User = require('../models/User');
const redis = require('../services/redisService');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const users = [
    {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        permissions: ['view_flights', 'update_flights']
    },
    {
        username: 'user',
        password: 'user123',
        role: 'user',
        permissions: ['view_flights']
    }
];

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing users from MongoDB
        await User.deleteMany({});
        console.log('Cleared existing users from MongoDB');

        // Clear existing users from Redis
        const redisKeys = await redis.keys('user:*');
        if (redisKeys.length > 0) {
            await redis.del(...redisKeys);
            console.log('Cleared existing users from Redis');
        }

        // Hash passwords and create users
        const hashedUsers = await Promise.all(users.map(async user => ({
            ...user,
            password: await bcrypt.hash(user.password, 10)
        })));

        // Insert users into MongoDB
        const createdUsers = await User.insertMany(hashedUsers);
        console.log('Users seeded in MongoDB successfully');

        // Cache users in Redis
        await Promise.all(createdUsers.map(async user => {
            const userCache = {
                _id: user._id.toString(),
                username: user.username,
                role: user.role,
                permissions: user.permissions
            };
            
            // Cache by username
            await redis.set(
                `user:${user.username}`, 
                JSON.stringify(userCache),
                'EX',
                86400 // 24 hours
            );

            // Cache by ID
            await redis.set(
                `user:id:${user._id}`, 
                JSON.stringify(userCache),
                'EX',
                86400 // 24 hours
            );
        }));
        console.log('Users cached in Redis successfully');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');

        // Disconnect from Redis
        await redis.quit();
        console.log('Disconnected from Redis');

    } catch (error) {
        console.error('Error seeding users:', error);
        // Cleanup connections in case of error
        mongoose.connection.close();
        redis.quit();
        process.exit(1);
    }
};

// Run seeder if this file is run directly
if (require.main === module) {
    seedUsers();
}

module.exports = seedUsers; 