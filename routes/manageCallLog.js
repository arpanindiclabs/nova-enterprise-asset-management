const express = require('express');
const { body, validationResult } = require('express-validator');
const { sql, pool, poolConnect } = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// Helper to generate random Call_Id
function generateCallId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'SUP-' + randomPart;
}

// Helper to ensure unique Call_Id
async function getUniqueCallId(pool) {
  let id, exists = true;

  while (exists) {
    id = generateCallId();
    const result = await pool.request()
      .input('Call_Id', sql.Char(10), id)
      .query('SELECT 1 FROM Call_LogMaster WHERE Call_Id = @Call_Id');
    exists = result.recordset.length > 0;
  }

  return id;
}

// CREATE
router.post('/add-call', verifyToken, async (req, res) => {
  try {
    await poolConnect;
    const request = pool.request();

    // Generate unique Call_Id
    const callId = await getUniqueCallId(pool);

    // Inject Empno from user token
    req.body.Call_Id = callId;
    req.body.Empno = req.user.username;
    req.body.username = req.user.username;
    req.body.EnteredBy = req.user.username;

    const fields = [
      'Call_Id', 'AssetCode', 'CallRegDate', 'AssetType', 'Empno', 'UserName',
      'IssueType', 'IssueDetails', 'EnteredBy', 'CallAssignTo', 'ServiceCost',
      'CallStatus', 'ClosedBy', 'CloseDate', 'CallRemarks', 'UpdatedBy'
    ];

    fields.forEach(field => {
      if (req.body[field] === null || req.body[field] === undefined) {
        request.input(field, null);
      } else {
        request.input(field, req.body[field]);
      }
    });

    const query = `
      INSERT INTO [dbo].[Call_LogMaster] (
        Call_Id, AssetCode, CallRegDate, AssetType, Empno, UserName,
        IssueType, IssueDetails, EnteredBy, CallAssignTo, ServiceCost,
        CallStatus, ClosedBy, CloseDate, CallRemarks, UpdatedBy
      ) VALUES (
        @Call_Id, @AssetCode, @CallRegDate, @AssetType, @Empno, @UserName,
        @IssueType, @IssueDetails, @EnteredBy, @CallAssignTo, @ServiceCost,
        @CallStatus, @ClosedBy, @CloseDate, @CallRemarks, @UpdatedBy
      )
    `;

    await request.query(query);
    console.log('Record inserted successfully.');

    res.status(200).json({
      message: 'Call log added successfully',
      Call_Id: callId
    });
  } catch (err) {
    if (err.number === 2627) {
      return res.status(409).json({ error: 'Duplicate Call_Id. This entry already exists.' });
    }
    console.error('Error inserting call log:', err);
    res.status(500).json({ error: err.message });
  }
});


// READ
router.get('/call', verifyToken, async (req, res) => {
  try {
    await poolConnect;
    const request = pool.request();
    request.input('Call_Id', sql.Char(10), req.user.username);

    console.log('Fetching call log for Call_Id:------------------------------////////////////////', req.user.username);// Log the request body for debugging
    // console.log('Fetching call log for Call_Id:', req.headers);// Log the request body for debugging
    const result = await request.query(`
      SELECT * FROM [dbo].[Call_LogMaster]
      WHERE Empno = @Call_Id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Call log not found' });
    }

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching call log:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/update-call/:Call_Id', verifyToken, isAdmin, [
  body('AssetCode').isLength({ min: 8, max: 8 }),
  body('CallRegDate').isISO8601().toDate(),
  body('AssetType').isString().isLength({ max: 50 }),
  body('Empno').isLength({ min: 8, max: 8 }),
  body('UserName').isString().isLength({ max: 50 }),
  body('IssueType').isString().isLength({ max: 50 }),
  body('IssueDetails').isString().isLength({ max: 300 }),
  body('EnteredBy').isLength({ min: 8, max: 8 }),
  body('CallAssignTo').isLength({ min: 8, max: 8 }),
  body('ServiceCost').isFloat(),
  body('CallStatus').isString().isLength({ max: 20 }),
  body('ClosedBy').optional().isLength({ min: 8, max: 8 }),
  body('CloseDate').optional().isISO8601().toDate(),
  body('CallRemarks').optional().isString().isLength({ max: 300 }),
  body('UpdatedBy').isLength({ min: 8, max: 8 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() });

  try {
    await poolConnect;
    const request = pool.request();
    request.input('Call_Id', sql.Char(10), req.params.Call_Id);

    const fields = [
      'AssetCode', 'CallRegDate', 'AssetType', 'Empno', 'UserName',
      'IssueType', 'IssueDetails', 'EnteredBy', 'CallAssignTo', 'ServiceCost',
      'CallStatus', 'ClosedBy', 'CloseDate', 'CallRemarks', 'UpdatedBy'
    ];

    fields.forEach(field => request.input(field, req.body[field]));

    const result = await request.query(`
      UPDATE [dbo].[Call_LogMaster]
      SET ${fields.map(f => `${f} = @${f}`).join(', ')}
      WHERE Call_Id = @Call_Id
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Call log not found' });
    }

    res.status(200).json({ message: 'Call log updated successfully' });
  } catch (err) {
    console.error('Error updating call log:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/delete-call/:Call_Id', verifyToken, isAdmin, async (req, res) => {
  try {
    await poolConnect;
    const request = pool.request();
    request.input('Call_Id', sql.Char(10), req.params.Call_Id);

    const result = await request.query(`
      DELETE FROM [dbo].[Call_LogMaster]
      WHERE Call_Id = @Call_Id
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Call log not found or already deleted' });
    }

    res.status(200).json({ message: 'Call log deleted successfully' });
  } catch (err) {
    console.error('Error deleting call log:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
