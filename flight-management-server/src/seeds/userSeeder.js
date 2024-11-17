const mongoose = require('mongoose');
const User = require('../models/User');
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
    },
];

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Hash passwords and create users
        const hashedUsers = await Promise.all(users.map(async user => ({
            ...user,
            password: await bcrypt.hash(user.password, 10)
        })));

        // Insert users
        await User.insertMany(hashedUsers);
        console.log('Users seeded successfully');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');

    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

// Run seeder if this file is run directly
if (require.main === module) {
    seedUsers();
}

module.exports = seedUsers; 