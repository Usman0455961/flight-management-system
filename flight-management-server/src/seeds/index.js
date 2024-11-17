const seedUsers = require('./userSeeder');

const seedAll = async () => {
    try {
        await seedUsers();
        console.log('All seeds completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error running seeds:', error);
        process.exit(1);
    }
};

// Run seeder if this file is run directly
if (require.main === module) {
    seedAll();
}

module.exports = seedAll; 