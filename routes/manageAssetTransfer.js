const express = require('express');
const { body, validationResult } = require('express-validator');
const { sql, pool, poolConnect } = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// CREATE
router.post('/add-transfer', verifyToken, isAdmin, [
  body('TransferCode').isLength({ min: 8, max: 8 }).withMessage('TransferCode must be 8 characters'),
  body('AssetCode').isLength({ min: 8, max: 8 }).withMessage('AssetCode must be 8 characters'),
  body('AssetDesc').isString().isLength({ max: 50 }),
  body('TransferFrom').isLength({ min: 8, max: 8 }),
  body('TransferTo').isLength({ min: 8, max: 8 }),
  body('ReasonOfTransfer').optional().isString().isLength({ max: 200 }),
  body('ApproveByTransTo').isInt(),
  body('ApproveByAdmin').isInt(),
  body('Remarks').optional().isString().isLength({ max: 200 }),
  body('EnteredBy').isLength({ min: 8, max: 8 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() });

  try {
    await poolConnect;
    const request = pool.request();

    const fields = [
      'TransferCode', 'AssetCode', 'AssetDesc', 'TransferFrom', 'TransferTo',
      'ReasonOfTransfer', 'ApproveByTransTo', 'ApproveByAdmin', 'Remarks', 'EnteredBy'
    ];

    fields.forEach(field => request.input(field, req.body[field]));

    await request.query(`
      INSERT INTO [dbo].[AssetTransferRegister]
      (${fields.join(', ')})
      VALUES (${fields.map(f => '@' + f).join(', ')})
    `);

    res.status(200).json({ message: 'Transfer record added successfully' });
  } catch (err) {
    if (err.number === 2627) {
      return res.status(409).json({ error: 'TransferCode already exists. Duplicate entry not allowed.' });
    }
    console.error('Error inserting transfer record:', err);
    res.status(500).json({ error: err.message });
  }
});

// READ
router.get('/transfer/:TransferCode', verifyToken, isAdmin, async (req, res) => {
  try {
    await poolConnect;
    const request = pool.request();
    request.input('TransferCode', sql.Char(8), req.params.TransferCode);

    const result = await request.query(`
      SELECT * FROM [dbo].[AssetTransferRegister]
      WHERE TransferCode = @TransferCode
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Transfer record not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching transfer:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/update-transfer/:TransferCode', verifyToken, isAdmin, [
  body('AssetCode').isLength({ min: 8, max: 8 }),
  body('AssetDesc').isString().isLength({ max: 50 }),
  body('TransferFrom').isLength({ min: 8, max: 8 }),
  body('TransferTo').isLength({ min: 8, max: 8 }),
  body('ReasonOfTransfer').optional().isString().isLength({ max: 200 }),
  body('ApproveByTransTo').isInt(),
  body('ApproveByAdmin').isInt(),
  body('Remarks').optional().isString().isLength({ max: 200 }),
  body('EnteredBy').isLength({ min: 8, max: 8 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() });

  try {
    await poolConnect;
    const request = pool.request();

    const { TransferCode } = req.params;
    request.input('TransferCode', sql.Char(8), TransferCode);

    const fields = [
      'AssetCode', 'AssetDesc', 'TransferFrom', 'TransferTo', 'ReasonOfTransfer',
      'ApproveByTransTo', 'ApproveByAdmin', 'Remarks', 'EnteredBy'
    ];

    fields.forEach(field => request.input(field, req.body[field]));

    const result = await request.query(`
      UPDATE [dbo].[AssetTransferRegister]
      SET ${fields.map(f => `${f} = @${f}`).join(', ')}
      WHERE TransferCode = @TransferCode
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Transfer record not found' });
    }

    res.status(200).json({ message: 'Transfer record updated successfully' });
  } catch (err) {
    console.error('Error updating transfer:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/delete-transfer/:TransferCode', verifyToken, isAdmin, async (req, res) => {
  try {
    await poolConnect;
    const request = pool.request();
    request.input('TransferCode', sql.Char(8), req.params.TransferCode);

    const result = await request.query(`
      DELETE FROM [dbo].[AssetTransferRegister]
      WHERE TransferCode = @TransferCode
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Transfer record not found or already deleted' });
    }

    res.status(200).json({ message: 'Transfer record deleted successfully' });
  } catch (err) {
    console.error('Error deleting transfer:', err);
    res.status(500).json({ error: err.message });
  }
});



// READ
router.get('/all-transfers', async (req, res) => {
  try {
    await poolConnect;
    const request = pool.request();
    const result = await request.query(`
      SELECT * FROM [dbo].[AssetTransferRegister]
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Transfer record not found' });
    }

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching transfer:', err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
