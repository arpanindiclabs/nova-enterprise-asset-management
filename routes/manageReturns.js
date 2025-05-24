const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { StockReturns, Asset_Master } = require('../models'); // Adjust path as needed
const verifyToken = require('../middleware/authMiddleware');
const { sql , pool , poolConnect } = require('../db');

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

    // Create return record
    const stockReturn = await StockReturns.create({
      from_empcode: fromEmpCode,
      assetcode,
      approve_status: null,
      remarks: null,
      approved_by: null,
      approved_at: null,
      remarks_from: null,
    });

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

    res.status(201).json({ message: 'Return request submitted', stockReturn });
  } catch (error) {
    console.error('Error in /return:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /approve-return/:recid/:status
// Approve or reject a return request by recid, status=0|1
// If approved, clear asset info
if (approveStatus === true) {
  const assetCode = returnRecord.assetcode;
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
}


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
