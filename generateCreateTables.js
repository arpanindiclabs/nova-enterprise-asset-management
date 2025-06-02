require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: true
  }
};

async function getTables() {
  const result = await sql.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'
  `);
  return result.recordset.map(row => row.TABLE_NAME);
}

async function getColumns(table) {
  const columnsResult = await sql.query(`
    SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = '${table}'
    ORDER BY ORDINAL_POSITION
  `);
  return columnsResult.recordset;
}

function formatColumnType(col) {
  let type = col.DATA_TYPE.toUpperCase();
  if (col.CHARACTER_MAXIMUM_LENGTH && col.CHARACTER_MAXIMUM_LENGTH > 0) {
    type += `(${col.CHARACTER_MAXIMUM_LENGTH})`;
  } else if (
    (col.DATA_TYPE === 'varchar' || col.DATA_TYPE === 'nvarchar') &&
    col.CHARACTER_MAXIMUM_LENGTH === -1
  ) {
    type += `(MAX)`;
  }
  return type;
}

function generateCreateStatement(table, columns) {
  const cols = columns.map(col => {
    return `  [${col.COLUMN_NAME}] ${formatColumnType(col)} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`;
  });

  return `-- Table: ${table}\nCREATE TABLE [dbo].[${table}] (\n${cols.join(',\n')}\n);\n`;
}

function generateInsertStatement(table, columns) {
  const colNames = columns.map(c => `[${c.COLUMN_NAME}]`).join(', ');
  const values = columns.map(c => {
    // Use simple placeholders based on type
    const dt = c.DATA_TYPE.toLowerCase();
    if (dt.includes('int') || dt === 'decimal' || dt === 'float' || dt === 'numeric' || dt === 'bigint') return '0';
    if (dt === 'bit') return '0'; // boolean false
    if (dt.includes('date') || dt.includes('time')) return `'2025-01-01'`;
    return `'sample_value'`;
  }).join(', ');

  return `-- Sample INSERT for ${table}\nINSERT INTO [dbo].[${table}] (${colNames}) VALUES (${values});\n`;
}

function generateUpdateStatement(table, columns) {
  if (columns.length === 0) return '';
  // Use first column as where condition (usually PK, but we can't be sure)
  const firstCol = columns[0].COLUMN_NAME;
  const setClauses = columns.slice(1).map(c => {
    const dt = c.DATA_TYPE.toLowerCase();
    let val = `'sample_value'`;
    if (dt.includes('int') || dt === 'decimal' || dt === 'float' || dt === 'numeric' || dt === 'bigint') val = '0';
    if (dt === 'bit') val = '0';
    if (dt.includes('date') || dt.includes('time')) val = `'2025-01-01'`;
    return `[${c.COLUMN_NAME}] = ${val}`;
  }).join(', ');

  if (!setClauses) return ''; // no columns to update

  return `-- Sample UPDATE for ${table}\nUPDATE [dbo].[${table}] SET ${setClauses} WHERE [${firstCol}] = /*value*/;\n`;
}

function generateSelectStatement(table, columns) {
  const colNames = columns.map(c => `[${c.COLUMN_NAME}]`).join(', ');
  return `-- Sample SELECT for ${table}\nSELECT ${colNames} FROM [dbo].[${table}] WHERE /* condition */;\n`;
}

async function generateAllScripts() {
  try {
    await sql.connect(config);
    const tables = await getTables();

    const allScripts = [];

    for (const table of tables) {
      const columns = await getColumns(table);
      allScripts.push(generateCreateStatement(table, columns));
      allScripts.push(generateInsertStatement(table, columns));
      allScripts.push(generateUpdateStatement(table, columns));
      allScripts.push(generateSelectStatement(table, columns));
    }

    const outputFile = path.join(__dirname, 'all_sql_statements.txt');
    fs.writeFileSync(outputFile, allScripts.join('\n') + '\n');

    console.log(`✅ All SQL statements written to ${outputFile}`);
    sql.close();
  } catch (err) {
    console.error('❌ Error:', err);
    sql.close();
  }
}

generateAllScripts();
