const { body, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const { sql, pool, poolConnect } = require('../db');
const { Asset_Master } = require('../models');  // Assuming you have a sequelize model for Issue_Register
const { Op } = require('sequelize');


// Add Asset
router.post('/add-asset', verifyToken , [
  // body('AssetCode').isString().isLength({ max: 8 }),
  // body('AssetERP_Code').optional().isString(),
  // body('AssetType').optional().isString(),
  // body('AssetDescription').optional().isString(),
  // body('PurchaseDate').optional().isISO8601(),
  // body('OwnerCompany').optional().isString(),
  // body('PurchaseEmployeeName').optional().isString(),
  // body('PoNo').optional().isString(),
  // body('PoDate').optional().isISO8601(),
  // body('PurchasedPrice').optional().isFloat(),
  // body('VendorName').optional().isString(),
  // body('WarrantyDate').optional().isISO8601(),
  // body('IsIssued').optional().isInt(),
  // body('UserContNo').optional().isString(),
  // body('UserCompany').optional().isString(),
  // body('IssuedDate').optional().isISO8601(),
  // body('IssuedSite').optional().isString(),
  // body('IsActive').optional().isInt(),
  // body('IsScrraped').optional().isBoolean(),
  // body('ScrapedDate').optional().isISO8601(),
  // body('Remarks1').optional().isString(),
  // body('Remarks2').optional().isString(),
  // body('Remarks3').optional().isString(),
  // body('AssetBrand').optional().isString(),
  // body('AssetModel').optional().isString(),
  // body('AssetSlno').optional().isString(),
  // body('Location').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const data = req.body;
  try {
    await poolConnect;
    const request = pool.request();
    for (const key in data) {
      request.input(key, data[key]);
    }
    await request.query(`
      INSERT INTO [dbo].[Asset_Master] (${Object.keys(data).map(k => `[${k}]`).join(', ')})
      VALUES (${Object.keys(data).map(k => `@${k}`).join(', ')})
    `);
    res.status(200).json({ message: 'Asset added successfully' });
  } catch (err) {
    if (err.originalError?.info?.number === 2627) {
      return res.status(400).json({ message: 'AssetCode already exists' });
    }
    console.error('Error adding asset:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/// Get All Assets    
router.get('/get-assets',  async (req, res) => {
  try {
    await poolConnect;
    const request = pool.request();
    const result = await request.query('SELECT * FROM [dbo].[Asset_Master]');
    console.log('Fetched assets:', result.recordset); // Log the fetched assets for debugging

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching assets:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

// Endpoint to get filtered assets
router.post('/get-filtered-assets', async (req, res) => {
  try {
    // Extract filters from request body
    const { filters = [] } = req.body;

    // If filters are empty, fetch all assets
    let query = {};

    if (filters.length > 0) {
      // Apply filters to the query
      filters.forEach(filter => {
        const { column, criteria, filterwith } = filter;

        // Handle different filter criteria
        switch (criteria) {
          case 'Contains':
            query[column] = { [Op.like]: `%${filterwith}%` };
            break;
          case 'DoesNotContain':
            query[column] = { [Op.notLike]: `%${filterwith}%` };
            break;
          case 'StartsWith':
            query[column] = { [Op.like]: `${filterwith}%` };
            break;
          case 'EndsWith':
            query[column] = { [Op.like]: `%${filterwith}` };
            break;
          case 'EqualTo':
            query[column] = filterwith;
            break;
          case 'NotEqualTo':
            query[column] = { [Op.ne]: filterwith };
            break;
          case 'GreaterThan':
            query[column] = { [Op.gt]: filterwith };
            break;
          case 'LessThan':
            query[column] = { [Op.lt]: filterwith };
            break;
          case 'GreaterThanOrEqualTo':
            query[column] = { [Op.gte]: filterwith };
            break;
          case 'LessThanOrEqualTo':
            query[column] = { [Op.lte]: filterwith };
            break;
          default:
            break;
        }
      });
    }

    // Fetch assets based on the query
    const assets = await Asset_Master.findAll({
      where: query,
    });

    // Send the filtered (or all) assets as the response
    res.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Get Asset by AssetCode
router.get('/asset/:AssetCode', verifyToken, isAdmin, async (req, res) => {
  const { AssetCode } = req.params;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('AssetCode', sql.Char(8), AssetCode)
      .query('SELECT * FROM [dbo].[Asset_Master] WHERE AssetCode = @AssetCode');

    if (result.recordset.length === 0) return res.status(404).json({ message: 'Asset not found' });
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching asset:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update Asset
router.put('/update-asset/:AssetCode', verifyToken, isAdmin, async (req, res) => {
  const { AssetCode } = req.params;
  const updates = req.body;

  try {
    await poolConnect;
    const request = pool.request();

    // Add AssetCode separately (for the WHERE clause only)
    request.input('AssetCode', sql.Char(8), AssetCode);

    // Exclude 'AssetCode' and 'AssetRecID' from update inputs
    const excludedFields = ['AssetCode', 'AssetRecID'];

    Object.entries(updates).forEach(([key, val]) => {
      if (!excludedFields.includes(key)) {
        request.input(key, val);
      }
    });

    // Build dynamic SET clause excluding 'AssetCode' and 'AssetRecID'
    const setClause = Object.keys(updates)
      .filter(key => !excludedFields.includes(key))
      .map(key => `[${key}] = @${key}`)
      .join(', ');

    if (!setClause) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    const query = `
      UPDATE [dbo].[Asset_Master]
      SET ${setClause}
      WHERE AssetCode = @AssetCode
    `;

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.status(200).json({ message: 'Asset updated successfully' });
  } catch (err) {
    console.error('Error updating asset:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Delete Asset
router.delete('/delete-asset/:AssetCode', verifyToken, isAdmin, async (req, res) => {
  const { AssetCode } = req.params;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('AssetCode', sql.Char(8), AssetCode)
      .query('DELETE FROM [dbo].[Asset_Master] WHERE AssetCode = @AssetCode');

    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'Asset not found or already deleted' });
    res.status(200).json({ message: 'Asset deleted successfully' });
  } catch (err) {
    console.error('Error deleting asset:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
