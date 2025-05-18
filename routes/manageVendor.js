const { body, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const { sql, pool, poolConnect } = require('../db');

// Create Vendor
router.post('/add-vendor', verifyToken, isAdmin, [
  body('VendorCode').isLength({ min: 8, max: 8 }).withMessage('VendorCode must be 8 characters'),
  body('VendorName').optional().isString().isLength({ max: 100 }),
  body('VendorDesc').optional().isString().isLength({ max: 200 }),
  body('VendorAddress').optional().isString().isLength({ max: 100 }),
  body('VendorCont').optional().isMobilePhone().withMessage('VendorCont must be a valid phone number'),
  body('VendorRemarks').optional().isString().isLength({ max: 100 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { VendorCode, VendorName, VendorDesc, VendorAddress, VendorCont, VendorRemarks } = req.body;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('VendorCode', sql.Char(8), VendorCode);
    request.input('VendorName', sql.NVarChar(100), VendorName || null);
    request.input('VendorDesc', sql.NVarChar(200), VendorDesc || null);
    request.input('VendorAddress', sql.NVarChar(100), VendorAddress || null);
    request.input('VendorCont', sql.NVarChar(20), VendorCont || null);
    request.input('VendorRemarks', sql.NVarChar(100), VendorRemarks || null);

    await request.query(`
      INSERT INTO [dbo].[VendorMast]
      ([VendorCode], [VendorName], [VendorDesc], [VendorAddress], [VendorCont], [VendorRemarks])
      VALUES (@VendorCode, @VendorName, @VendorDesc, @VendorAddress, @VendorCont, @VendorRemarks)
    `);

    res.status(200).json({ message: 'Vendor added successfully' });
  } catch (err) {
    console.error('Error inserting vendor:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Vendor by Code
router.get('/vendor/:VendorCode', verifyToken, isAdmin, async (req, res) => {
  const { VendorCode } = req.params;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('VendorCode', sql.Char(8), VendorCode);

    const result = await request.query(`
      SELECT * FROM [dbo].[VendorMast] WHERE VendorCode = @VendorCode
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching vendor:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update Vendor
router.put('/update-vendor/:VendorCode', verifyToken, isAdmin, [
  body('VendorName').optional().isString().isLength({ max: 100 }),
  body('VendorDesc').optional().isString().isLength({ max: 200 }),
  body('VendorAddress').optional().isString().isLength({ max: 100 }),
  body('VendorCont').optional().isMobilePhone().withMessage('VendorCont must be a valid phone number'),
  body('VendorRemarks').optional().isString().isLength({ max: 100 })
], async (req, res) => {
  const { VendorCode } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { VendorName, VendorDesc, VendorAddress, VendorCont, VendorRemarks } = req.body;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('VendorCode', sql.Char(8), VendorCode);
    request.input('VendorName', sql.NVarChar(100), VendorName || null);
    request.input('VendorDesc', sql.NVarChar(200), VendorDesc || null);
    request.input('VendorAddress', sql.NVarChar(100), VendorAddress || null);
    request.input('VendorCont', sql.NVarChar(20), VendorCont || null);
    request.input('VendorRemarks', sql.NVarChar(100), VendorRemarks || null);

    const result = await request.query(`
      UPDATE [dbo].[VendorMast]
      SET VendorName = @VendorName,
          VendorDesc = @VendorDesc,
          VendorAddress = @VendorAddress,
          VendorCont = @VendorCont,
          VendorRemarks = @VendorRemarks
      WHERE VendorCode = @VendorCode
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Vendor not found or not updated' });
    }

    res.status(200).json({ message: 'Vendor updated successfully' });
  } catch (err) {
    console.error('Error updating vendor:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete Vendor
router.delete('/delete-vendor/:VendorCode', verifyToken, isAdmin, async (req, res) => {
  const { VendorCode } = req.params;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('VendorCode', sql.Char(8), VendorCode);

    const result = await request.query(`
      DELETE FROM [dbo].[VendorMast] WHERE VendorCode = @VendorCode
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Vendor not found or already deleted' });
    }

    res.status(200).json({ message: 'Vendor deleted successfully' });
  } catch (err) {
    console.error('Error deleting vendor:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
