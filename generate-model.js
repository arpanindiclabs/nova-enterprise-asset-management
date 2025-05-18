require('dotenv').config(); // Load .env

const SequelizeAuto = require('sequelize-auto');

const auto = new SequelizeAuto(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER,
    dialect: 'mssql',
    port: parseInt(process.env.DB_PORT, 10),
    dialectOptions: {
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true
      }
    },
    directory: './models', // where to write models
    additional: {
      timestamps: false
    }
  }
);

auto.run(err => {
  if (err) throw err;
  console.log('✅ Models generated successfully.');
});
