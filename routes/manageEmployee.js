const { body, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const { sql, pool, poolConnect } = require('../db'); // Adjust the path as necessary

router.post('/add-employee', verifyToken, isAdmin, [
  body('EmpName').isString().isLength({ max: 100 }).withMessage('EmpName must be a string and less than 100 characters'),
  body('EmpContNo').isMobilePhone().withMessage('EmpContNo must be a valid phone number').optional(),
  body('IsActive').isInt({ min: 0, max: 1 }).withMessage('IsActive must be 0 or 1')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { EmpNo, EmpName, EmpCompID, EmpDeptID, EmpContNo, IsActive } = req.body;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('EmpNo', sql.Char(8), EmpNo);
    request.input('EmpName', sql.NVarChar(100), EmpName);
    request.input('EmpCompID', sql.Char(8), EmpCompID);
    request.input('EmpDeptID', sql.Char(8), EmpDeptID);
    request.input('EmpContNo', sql.NVarChar(20), EmpContNo || null);
    request.input('IsActive', sql.Int, IsActive);

    await request.query(`
      INSERT INTO [dbo].[EmployeeMast]
      ([EmpNo], [EmpName], [EmpCompID], [EmpDeptID], [EmpContNo], [IsActive])
      VALUES (@EmpNo, @EmpName, @EmpCompID, @EmpDeptID, @EmpContNo, @IsActive)
    `);

    res.status(200).json({ message: 'Employee added successfully' });
  } catch (err) {
    console.error('Error inserting employee:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/employee/:EmpNo', verifyToken, isAdmin, async (req, res) => {
  const { EmpNo } = req.params;
  try {
    await poolConnect;
    const request = pool.request();
    request.input('EmpNo', sql.Char(8), EmpNo);

    const result = await request.query(`
      SELECT * FROM [dbo].[EmployeeMast] WHERE EmpNo = @EmpNo
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/update-employee/:EmpNo', verifyToken, isAdmin, [
  body('EmpName').isString().isLength({ max: 100 }).withMessage('EmpName must be a string and less than 100 characters'),
  body('EmpContNo').isMobilePhone().withMessage('EmpContNo must be a valid phone number').optional(),
  body('IsActive').isInt({ min: 0, max: 1 }).withMessage('IsActive must be 0 or 1')
], async (req, res) => {
  const { EmpNo } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { EmpName, EmpCompID, EmpDeptID, EmpContNo, IsActive } = req.body;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('EmpNo', sql.Char(8), EmpNo);
    request.input('EmpName', sql.NVarChar(100), EmpName || null);
    request.input('EmpCompID', sql.Char(8), EmpCompID || null);
    request.input('EmpDeptID', sql.Char(8), EmpDeptID || null);
    request.input('EmpContNo', sql.NVarChar(20), EmpContNo || null);
    request.input('IsActive', sql.Int, IsActive ?? null);

    await request.query(`
      UPDATE [dbo].[EmployeeMast]
      SET EmpNo = @EmpNo,
          EmpName = @EmpName,
          EmpCompID = @EmpCompID,
          EmpDeptID = @EmpDeptID,
          EmpContNo = @EmpContNo,
          IsActive = @IsActive
      WHERE EmpNo = @EmpNo
    `);

    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/delete-employee/:EmpNo', verifyToken, isAdmin, async (req, res) => {
  const { EmpNo } = req.params;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('EmpNo', sql.Char(8), EmpNo);

    const result = await request.query(`
      DELETE FROM [dbo].[EmployeeMast] WHERE EmpNo = @EmpNo
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Employee not found or already deleted' });
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

