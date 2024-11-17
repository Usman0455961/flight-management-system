const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initializeUsers = async () => {
    try {
        // Check if users already exist
        const usersCount = await User.countDocuments();
        if (usersCount > 0) {
            console.log('Users already initialized');
            return;
        }

        // Create admin user
        const adminUser = new User({
            username: 'admin',
            password: await bcrypt.hash('admin123', 10),
            role: 'admin',
            permissions: ['view_flights', 'update_flights']
        });

        // Create regular user
        const regularUser = new User({
            username: 'user',
            password: await bcrypt.hash('user123', 10),
            role: 'user',
            permissions: ['view_flights']
        });

        await Promise.all([
            adminUser.save(),
            regularUser.save()
        ]);

        console.log('Default users created successfully');
    } catch (error) {
        console.error('Error creating default users:', error);
    }
};

module.exports = initializeUsers; 