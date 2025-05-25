const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { StockReturns, Asset_Master } = require('../models'); // Adjust path as needed
const verifyToken = require('../middleware/authMiddleware');
const { sql , pool , poolConnect } = require('../db');
const crypto = require("crypto");



function generateIssuedID() {
  // Generate a 10-digit unique ID (based on timestamp + random number)
  const timestamp = Date.now(); // Current timestamp in milliseconds
  const randomPart = crypto.randomBytes(4).readUInt32LE(0); // 4-byte random number
  const uniqueID = `${timestamp}${randomPart}`.slice(0, 10); // Combine and limit to 10 digits
  return uniqueID;
}

// POST /return/:assetcode
// Submit a return request for an asset by logged-in user
router.post('/return/:assetcode', verifyToken, async (req, res) => {
  try {
    const fromEmpCode = req.user.EmpNo;
    const { assetcode } = req.params;
    console.log(`Return request for asset ${assetcode} by employee ${fromEmpCode}`);

    // Verify asset ownership
    const asset = await Asset_Master.findOne({
      where: {
        AssetCode: assetcode,
        CurrentEmpNo: fromEmpCode
      }
    });

    if (!asset) {
      return res.status(403).json({ message: 'Asset not assigned to this employee or does not exist' });
    }

    if (asset.InProcess == 1) {
      return res.status(400).json({ message: 'Asset is already in transfer' });
    }

    const request = pool.request();
    request.input('FromEmpCode', sql.VarChar(50), fromEmpCode);
    request.input('AssetCode', sql.VarChar(50), assetcode);
    request.input('RequestTime', sql.DateTime, new Date());

    await request.query(`
      INSERT INTO StockReturns (
        from_empcode,
        assetcode,
        approve_status,
        remarks,
        approved_by,
        approved_at,
        remarks_from,
        request_time
      )
      VALUES (
        @FromEmpCode,
        @AssetCode,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        @RequestTime
      );
    `);
 

    await Asset_Master.update(
      {
        InProcess: 1,
        ProcessID: "return",
        InTransit: 1
      },
      {
        where: { AssetCode: assetcode }
      }
    );

    res.status(201).json({ message: 'Return request submitted', assetCode: assetcode });
  } catch (error) {
    console.error('Error in /return:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /approve-return/:recid/:status
// Approve or reject a return request by recid, status=0|1
// If approved, clear asset info
router.post('/approve-return/:recid/:status', verifyToken, async (req, res) => {
  try {
    const approvedBy = req.user.EmpNo;
    const { recid, status } = req.params;
    const { remarks } = req.body;

    const approveStatus = status === '1' ? true : status === '0' ? false : null;
    if (approveStatus === null) {
      return res.status(400).json({ error: 'Invalid status, must be 0 or 1' });
    }

    const returnRecord = await StockReturns.findByPk(recid);
    if (!returnRecord) {
      return res.status(404).json({ error: 'Return record not found' });
    }

    // Update all fields except `approved_at`
    await returnRecord.update({
      approve_status: approveStatus,
      approved_by: approvedBy,
      remarks: remarks || null,
    });

    // ✅ Set approved_at using direct SQL (avoids datetime conversion issues in some ORMs)
    await poolConnect;
    const request = pool.request();
    request.input('RecID', sql.Int, recid);
    request.input('ApprovedAt', sql.DateTime, new Date());
    request.input('ApprovedBy', sql.VarChar(50), approvedBy);

    await request.query(`
      UPDATE StockReturns
      SET approved_at = @ApprovedAt
      WHERE recid = @RecID
    `);

    // Extract assetCode from return record
    const assetCode = returnRecord.assetcode;

    // If approved, reset asset assignment fields
    if (approveStatus === true) {
      const assetRecord = await Asset_Master.findOne({ where: { AssetCode: assetCode } });

      if (assetRecord) {
        await assetRecord.update({
          IsIssued: 0,
          UserContNo: null,
          UserCompany: null,
          IssuedDate: null,
          IssuedSite: null,
          CurrentEmpNo: null,
        });
      } else {
        console.warn(`Asset with code ${assetCode} not found in Asset_Master`);
      }
    }

    // Reset process-related fields regardless of approval/rejection
    await Asset_Master.update(
      {
        InProcess: 0,
        ProcessID: null,
        InTransit: 0
      },
      {
        where: { AssetCode: assetCode }
      }
    );

    const newIssuedID = generateIssuedID();

    const insertReq = pool.request();
    insertReq
      .input('IssuedID', sql.VarChar(10), newIssuedID)
      .input('AssetCode', sql.Char(8), assetCode)
      .input('IssueDate', sql.DateTime, null)
      .input('IssueType', sql.VarChar(20), null)
      .input('IssueEmpno', sql.Char(8), 
    returnRecord.from_empcode)
      .input('IssueEmpName', sql.VarChar(50), returnRecord.from_empcode)
      .input('IssueLocation', sql.VarChar(50),null)
      .input('IssueStatus', sql.Int, 0) 
      .input('ReturenStatus', sql.Int, 1)
      .input('ReturnDate', sql.DateTime, new Date())
      .input('IssuedBy', sql.VarChar(50), approvedBy)
      .input('Remarks1', sql.VarChar(200), remarks || '')
      .input('Remarks2', sql.VarChar(200), null);

    await insertReq.query(`
      INSERT INTO Issue_Register (
        IssuedID, AssetCode, IssueDate, IssueType,
        IssueEmpno, IssueEmpName, IssueLocation,
        IssueStatus, ReturenStatus, ReturnDate,
        IssuedBy, Remarks1, Remarks2
      ) VALUES (
        @IssuedID, @AssetCode, @IssueDate, @IssueType,
        @IssueEmpno, @IssueEmpName, @IssueLocation,
        @IssueStatus, @ReturenStatus, @ReturnDate,
        @IssuedBy, @Remarks1, @Remarks2
      )
    `);

    res.json({ message: 'Return request updated', returnRecord });

  } catch (error) {
    console.error('Error in /approve-return:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// POST /get-all-transfers
// Get all StockReturns records, optionally filtered by filters in body
router.post('/get-filtered-returns', async (req, res) => {
  try {
    const { filters = [] } = req.body;
    const where = {};

    filters.forEach(({ column, criteria, filterwith }) => {
      switch (criteria) {
        case 'Contains':
          where[column] = { [Op.like]: `%${filterwith}%` };
          break;
        case 'DoesNotContain':
          where[column] = { [Op.notLike]: `%${filterwith}%` };
          break;
        case 'StartsWith':
          where[column] = { [Op.like]: `${filterwith}%` };
          break;
        case 'EndsWith':
          where[column] = { [Op.like]: `%${filterwith}` };
          break;
        case 'EqualTo':
          where[column] = filterwith;
          break;
        case 'NotEqualTo':
          where[column] = { [Op.ne]: filterwith };
          break;
        case 'GreaterThan':
          where[column] = { [Op.gt]: filterwith };
          break;
        case 'LessThan':
          where[column] = { [Op.lt]: filterwith };
          break;
        case 'GreaterThanOrEqualTo':
          where[column] = { [Op.gte]: filterwith };
          break;
        case 'LessThanOrEqualTo':
          where[column] = { [Op.lte]: filterwith };
          break;
      }
    });

    const returns = await StockReturns.findAll({ where });
    res.json(returns);
  } catch (error) {
    console.error('Error in /get-all-transfers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
