require('dotenv').config();
const sql = require('mssql');

// Logging database config (masking password)
console.log('🟡 Connecting to SQL Server with the following config:');
console.log({
    user: process.env.DB_USER,
    password: '********', // Masked
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_DATABASE
});

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_DATABASE,
    options: {
        trustServerCertificate: true, // Use only in development
        encrypt: false                // Use true if SSL is required
    }
};

const pool = new sql.ConnectionPool(config);

const poolConnect = pool.connect()
    .then(() => {
        console.log(`✅ Connected to SQL Server!
──────────────────────────────
  👤 USER     : ${process.env.DB_USER}
  🖥️  SERVER   : ${process.env.DB_SERVER}
  📡 PORT     : ${process.env.DB_PORT}
  🗄️  DATABASE : ${process.env.DB_DATABASE}
──────────────────────────────`);
    })
    .catch(err => {
        console.error('❌ SQL connection failed!');
        console.error(err);
    });

module.exports = {
    sql,
    pool,
    poolConnect
};
