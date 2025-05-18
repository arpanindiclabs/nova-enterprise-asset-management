const { Sequelize } = require('sequelize');
require('dotenv').config();


// Initialize Sequelize
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_SERVER, // Replace with your host and server details
  dialect: 'mssql', // Dialect for SQL Server
  port: process.env.DB_PORT, // Replace with the correct port
  dialectOptions: {
    encrypt: false, // Set to true if encryption is needed
  },
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

async function syncDatabase() {
    try {
      // Sync models with the database (do not use force: true in production unless necessary)
      await sequelize.sync({ force: false });
      console.log('Database synced successfully');
    } catch (error) {
      console.error('Error syncing database:', error);
    }
  }
  
syncDatabase();
testConnection();

module.exports = sequelize;
