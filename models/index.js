require('dotenv').config(); // Load environment variables
const { Sequelize } = require('sequelize');
const EmployeeMastModel = require('./EmployeeMast');
const AssetTransferRegisterModel = require('./AssetTransferRegister');

// Sequelize instance using environment variables
const sequelize = new Sequelize({
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT, 10),
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true
    }
  },
  // logging: console.log
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.AssetTransferRegister = AssetTransferRegisterModel(sequelize, Sequelize.DataTypes);
db.EmployeeMast = EmployeeMastModel(sequelize, Sequelize.DataTypes);
db.Asset_Master = require('./Asset_Master')(sequelize, Sequelize.DataTypes);
db.Issue_Register = require('./Issue_Register')(sequelize, Sequelize.DataTypes);
db.SupportCalls = require('./SupportCalls')(sequelize, Sequelize.DataTypes);
db.Company= require('./Company')(sequelize, Sequelize.DataTypes);

module.exports = db;
