const { sql, pool, poolConnect } = require('./db')
const fs = require('fs')
const path = require('path')

async function getSchemaHybrid() {
  await poolConnect

  const result = await pool.request().query(`
    SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    ORDER BY TABLE_NAME, ORDINAL_POSITION
  `)

  const schema = {}
  const schemaTextParts = []

  result.recordset.forEach(row => {
    const { TABLE_NAME, COLUMN_NAME, DATA_TYPE } = row

    // JSON schema
    if (!schema[TABLE_NAME]) schema[TABLE_NAME] = []
    schema[TABLE_NAME].push({ column: COLUMN_NAME, type: DATA_TYPE })

    // Plain text schema
    if (!schemaTextParts.find(line => line.startsWith(`Table: ${TABLE_NAME}`))) {
      schemaTextParts.push(`Table: ${TABLE_NAME}`)
    }
    schemaTextParts.push(`- ${COLUMN_NAME} (${DATA_TYPE})`)
  })

  // Organize plain text output
  let schemaText = ''
  let currentTable = ''
  for (const line of schemaTextParts) {
    if (line.startsWith('Table:')) {
      if (currentTable) schemaText += '\n\n'
      currentTable = line
      schemaText += `${line}\n`
    } else {
      schemaText += `${line}\n`
    }
  }

  // Save JSON
  const jsonPath = path.join(__dirname, 'schema.json')
  fs.writeFileSync(jsonPath, JSON.stringify(schema, null, 2))

  // Save plain text
  const textPath = path.join(__dirname, 'schema.txt')
  fs.writeFileSync(textPath, schemaText.trim())

  console.log(`✅ Schema saved to:\n- ${jsonPath}\n- ${textPath}`)

  return { schema, schemaText: schemaText.trim() }
}

// Run once
getSchemaHybrid().catch(console.error)

module.exports = getSchemaHybrid
