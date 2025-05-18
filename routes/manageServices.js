const express = require('express');
const router = express.Router();
const { sql, pool, poolConnect } = require('../db');

// CREATE
router.post('/add', async (req, res) => {
  await poolConnect;
  const {
    Title, Action_Date, Action_Type, Action_Details,
    In_Out, Received_From, Issue_To, Entered_By,
    Expenses, Remarks
  } = req.body;

  try {
    const result = await pool.request()
      .input('Title', sql.NVarChar, Title)
      .input('Action_Date', sql.DateTime, Action_Date)
      .input('Action_Type', sql.NVarChar, Action_Type)
      .input('Action_Details', sql.NVarChar, Action_Details)
      .input('In_Out', sql.NVarChar, In_Out)
      .input('Received_From', sql.NVarChar, Received_From)
      .input('Issue_To', sql.NVarChar, Issue_To)
      .input('Entered_By', sql.NVarChar, Entered_By)
      .input('Expenses', sql.Decimal(18, 2), Expenses)
      .input('Remarks', sql.NVarChar, Remarks)
      .query(`
        INSERT INTO IT_Hardware_Actions 
        (Title, Action_Date, Action_Type, Action_Details, In_Out, Received_From, Issue_To, Entered_By, Expenses, Remarks)
        VALUES (@Title, @Action_Date, @Action_Type, @Action_Details, @In_Out, @Received_From, @Issue_To, @Entered_By, @Expenses, @Remarks)
      `);

    res.status(201).json({ message: 'Record inserted successfully' });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: 'Failed to insert record' });
  }
});

// READ ALL
router.get('/all', async (req, res) => {
  await poolConnect;
  try {
    const result = await pool.request().query('SELECT * FROM IT_Hardware_Actions');
    res.json(result.recordset);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// UPDATE
router.put('/update/:id', async (req, res) => {
  await poolConnect;
  const { id } = req.params;
  const {
    Title, Action_Date, Action_Type, Action_Details,
    In_Out, Received_From, Issue_To, Entered_By,
    Expenses, Remarks
  } = req.body;

  try {
    const result = await pool.request()
      .input('RecID', sql.Int, id)
      .input('Title', sql.NVarChar, Title)
      .input('Action_Date', sql.DateTime, Action_Date)
      .input('Action_Type', sql.NVarChar, Action_Type)
      .input('Action_Details', sql.NVarChar, Action_Details)
      .input('In_Out', sql.NVarChar, In_Out)
      .input('Received_From', sql.NVarChar, Received_From)
      .input('Issue_To', sql.NVarChar, Issue_To)
      .input('Entered_By', sql.NVarChar, Entered_By)
      .input('Expenses', sql.Decimal(18, 2), Expenses)
      .input('Remarks', sql.NVarChar, Remarks)
      .query(`
        UPDATE IT_Hardware_Actions SET 
          Title = @Title,
          Action_Date = @Action_Date,
          Action_Type = @Action_Type,
          Action_Details = @Action_Details,
          In_Out = @In_Out,
          Received_From = @Received_From,
          Issue_To = @Issue_To,
          Entered_By = @Entered_By,
          Expenses = @Expenses,
          Remarks = @Remarks
        WHERE RecID = @RecID
      `);

    res.json({ message: 'Record updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE
router.delete('/delete/:id', async (req, res) => {
  await poolConnect;
  const { id } = req.params;
  try {
    await pool.request()
      .input('RecID', sql.Int, id)
      .query('DELETE FROM IT_Hardware_Actions WHERE RecID = @RecID');

    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// FILTERED READ
router.post('/get-filtered-actions', async (req, res) => {
  await poolConnect;
  const { filters = [] } = req.body;

  try {
    let query = 'SELECT * FROM IT_Hardware_Actions';
    let conditions = [];
    let request = pool.request();

    filters.forEach((filter, index) => {
      const { column, criteria, filterwith } = filter;
      const paramName = `filter${index}`;

      switch (criteria) {
        case 'Contains':
          conditions.push(`[${column}] LIKE @${paramName}`);
          request.input(paramName, sql.NVarChar, `%${filterwith}%`);
          break;
        case 'DoesNotContain':
          conditions.push(`[${column}] NOT LIKE @${paramName}`);
          request.input(paramName, sql.NVarChar, `%${filterwith}%`);
          break;
        case 'StartsWith':
          conditions.push(`[${column}] LIKE @${paramName}`);
          request.input(paramName, sql.NVarChar, `${filterwith}%`);
          break;
        case 'EndsWith':
          conditions.push(`[${column}] LIKE @${paramName}`);
          request.input(paramName, sql.NVarChar, `%${filterwith}`);
          break;
        case 'EqualTo':
          conditions.push(`[${column}] = @${paramName}`);
          request.input(paramName, sql.NVarChar, filterwith);
          break;
        case 'NotEqualTo':
          conditions.push(`[${column}] <> @${paramName}`);
          request.input(paramName, sql.NVarChar, filterwith);
          break;
        case 'GreaterThan':
          conditions.push(`[${column}] > @${paramName}`);
          request.input(paramName, sql.NVarChar, filterwith);
          break;
        case 'LessThan':
          conditions.push(`[${column}] < @${paramName}`);
          request.input(paramName, sql.NVarChar, filterwith);
          break;
        case 'GreaterThanOrEqualTo':
          conditions.push(`[${column}] >= @${paramName}`);
          request.input(paramName, sql.NVarChar, filterwith);
          break;
        case 'LessThanOrEqualTo':
          conditions.push(`[${column}] <= @${paramName}`);
          request.input(paramName, sql.NVarChar, filterwith);
          break;
      }
    });

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Filter error:', err);
    res.status(500).json({ error: 'Failed to apply filters' });
  }
});

module.exports = router;
