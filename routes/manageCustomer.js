const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const { sql, pool, poolConnect } = require('../db');

// POST: Add Customer
router.post('/add-customer', verifyToken, isAdmin, [
  body('CustomerID').isInt().withMessage('CustomerID must be an integer'),
  body('Name').isString().isLength({ max: 100 }).withMessage('Name must be a string up to 100 characters'),
  body('Email').isEmail().withMessage('Invalid email address'),
  body('CustomerDescription').isString().optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { CustomerID, Name, Email, CustomerDescription } = req.body;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('CustomerID', sql.Int, CustomerID);
    request.input('Name', sql.NVarChar(100), Name);
    request.input('Email', sql.NVarChar(100), Email);
    request.input('CustomerDescription', sql.VarChar(sql.MAX), CustomerDescription || null);

    await request.query(`
      INSERT INTO [dbo].[Customers] 
      ([CustomerID], [Name], [Email], [CustomerDescription])
      VALUES (@CustomerID, @Name, @Email, @CustomerDescription)
    `);

    res.status(200).json({ message: 'Customer added successfully' });
  } catch (err) {
    console.error('Error inserting customer:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET: Get Customer by ID
router.get('/customer/:CustomerID', verifyToken, isAdmin, async (req, res) => {
  const { CustomerID } = req.params;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('CustomerID', sql.Int, CustomerID);

    const result = await request.query(`
      SELECT * FROM [dbo].[Customers] WHERE CustomerID = @CustomerID
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT: Update Customer
router.put('/update-customer/:CustomerID', verifyToken, isAdmin, [
  body('Name').isString().isLength({ max: 100 }).optional(),
  body('Email').isEmail().optional(),
  body('CustomerDescription').isString().optional()
], async (req, res) => {
  const { CustomerID } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { Name, Email, CustomerDescription } = req.body;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('CustomerID', sql.Int, CustomerID);
    request.input('Name', sql.NVarChar(100), Name || null);
    request.input('Email', sql.NVarChar(100), Email || null);
    request.input('CustomerDescription', sql.VarChar(sql.MAX), CustomerDescription || null);

    await request.query(`
      UPDATE [dbo].[Customers]
      SET Name = @Name,
          Email = @Email,
          CustomerDescription = @CustomerDescription
      WHERE CustomerID = @CustomerID
    `);

    res.status(200).json({ message: 'Customer updated successfully' });
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE: Delete Customer
router.delete('/delete-customer/:CustomerID', verifyToken, isAdmin, async (req, res) => {
  const { CustomerID } = req.params;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('CustomerID', sql.Int, CustomerID);

    const result = await request.query(`
      DELETE FROM [dbo].[Customers]
      WHERE CustomerID = @CustomerID
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Customer not found or already deleted' });
    }

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
