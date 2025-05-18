const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const { sql, pool, poolConnect } = require('../db');

// POST: Add Department
router.post('/add-department', verifyToken, isAdmin, [
  body('DeptCode').isLength({ min: 8, max: 8 }).withMessage('DeptCode must be 8 characters'),
  body('DeptName').isString().isLength({ max: 100 }).optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { DeptCode, DeptName } = req.body;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('DeptCode', sql.Char(8), DeptCode);
    request.input('DeptName', sql.NVarChar(100), DeptName || null);

    await request.query(`
      INSERT INTO [dbo].[Department] ([DeptCode], [DeptName])
      VALUES (@DeptCode, @DeptName)
    `);

    res.status(200).json({ message: 'Department added successfully' });
  } catch (err) {
    console.error('Error inserting department:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET: Get Department by DeptCode
router.get('/department/:DeptCode', verifyToken, isAdmin, async (req, res) => {
  const { DeptCode } = req.params;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('DeptCode', sql.Char(8), DeptCode);

    const result = await request.query(`
      SELECT * FROM [dbo].[Department] WHERE DeptCode = @DeptCode
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching department:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT: Update Department
router.put('/update-department/:DeptCode', verifyToken, isAdmin, [
  body('DeptName').isString().isLength({ max: 100 }).optional()
], async (req, res) => {
  const { DeptCode } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { DeptName } = req.body;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('DeptCode', sql.Char(8), DeptCode);
    request.input('DeptName', sql.NVarChar(100), DeptName || null);

    await request.query(`
      UPDATE [dbo].[Department]
      SET DeptName = @DeptName
      WHERE DeptCode = @DeptCode
    `);

    res.status(200).json({ message: 'Department updated successfully' });
  } catch (err) {
    console.error('Error updating department:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE: Delete Department
router.delete('/delete-department/:DeptCode', verifyToken, isAdmin, async (req, res) => {
  const { DeptCode } = req.params;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('DeptCode', sql.Char(8), DeptCode);

    const result = await request.query(`
      DELETE FROM [dbo].[Department]
      WHERE DeptCode = @DeptCode
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Department not found or already deleted' });
    }

    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (err) {
    console.error('Error deleting department:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
