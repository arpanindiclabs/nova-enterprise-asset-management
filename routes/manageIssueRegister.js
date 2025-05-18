const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const { Issue_Register } = require('../models');  // Assuming you have a sequelize model for Issue_Register
const { sql, pool, poolConnect } = require('../db');
const crypto = require("crypto");


function generateIssuedID() {
  // Generate a 10-digit unique ID (based on timestamp + random number)
  const timestamp = Date.now(); // Current timestamp in milliseconds
  const randomPart = crypto.randomBytes(4).readUInt32LE(0); // 4-byte random number
  const uniqueID = `${timestamp}${randomPart}`.slice(0, 10); // Combine and limit to 10 digits
  return uniqueID;
}


router.use(express.json());

// Endpoint to get filtered issues
router.post('/get-filtered-issues', async (req, res) => {
  try {
    // Extract filters from request body
    const { filters = [] } = req.body;

    // If filters are empty, fetch all issues
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

    // Fetch issues based on the query
    const issues = await Issue_Register.findAll({
      where: query,
    });

    // Send the filtered (or all) issues as the response
    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});



// Endpoint to add a new issue
// This endpoint handles the issuance of assets to employees
router.post('/add-issue', async (req, res) => {
  try {
    const {
      AssetCode,
      IssueDate,
      IssueType,
      IssueEmpno,
      IssueEmpName,
      IssueLocation,
      ReturnDate,
      IssuedBy,
      Remarks1,
      Remarks2,
      userCompany
    } = req.body;

    const IssuedID = generateIssuedID();  // Auto-generate IssuedID
    const fallbackDate = IssueDate || new Date();

    await poolConnect;

    // 🔒 Step 1: Check if last issue entry has IssueStatus = 1
    const checkResult = await pool.request()
      .input('AssetCode', sql.Char(8), AssetCode)
      .query(`
        SELECT TOP 1 * 
        FROM Issue_Register 
        WHERE AssetCode = @assetCode 
      ORDER BY IssueDate DESC, IssueRecID DESC
      `);

    if (checkResult.recordset[0]?.IssueStatus === 1) {
      return res.status(400).json({ error: 'This asset is already issued and not yet returned.' });
    }

    // Step 2: Get Employee Contact No
    const empResult = await pool.request()
      .input('IssueEmpno', sql.Char(8), IssueEmpno)
      .query(`SELECT EmpContNo FROM EmployeeMast WHERE EmpNo = @IssueEmpno`);

    const EmpContNo = empResult.recordset[0]?.EmpContNo || '';

    // Step 3: Insert into Issue_Register
    await pool.request()
      .input('IssuedID', sql.BigInt, IssuedID)
      .input('AssetCode', sql.Char(8), AssetCode)
      .input('IssueDate', sql.DateTime, fallbackDate)
      .input('IssueType', sql.VarChar(20), IssueType)
      .input('IssueEmpno', sql.Char(8), IssueEmpno)
      .input('IssueEmpName', sql.VarChar(50), IssueEmpName)
      .input('IssueLocation', sql.VarChar(50), IssueLocation)
      .input('IssueStatus', sql.Int, 1)
      .input('ReturenStatus', sql.Int, 0)
      .input('ReturnDate', sql.DateTime, ReturnDate || null)
      .input('IssuedBy', sql.VarChar(50), IssuedBy)
      .input('Remarks1', sql.VarChar(200), Remarks1)
      .input('Remarks2', sql.VarChar(200), Remarks2)
      .query(`
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

    // Step 4: Update Asset_Master
    await pool.request()
  .input('AssetCode', sql.Char(8), AssetCode)
  .input('IssueDate', sql.DateTime, fallbackDate)
  .input('EmpContNo', sql.VarChar(20), EmpContNo)
  .input('userCompany', sql.VarChar(50), userCompany)
  .input('IssueLocation', sql.VarChar(50), IssueLocation)
  .input('IssueEmpNo', sql.Char(8), IssueEmpno)
  .query(`
    UPDATE Asset_Master SET
      IsIssued = 1,
      IssuedDate = @IssueDate,
      UserContNo = @EmpContNo,
      OwnerCompany = @userCompany,
      IssuedSite = @IssueLocation,
      CurrentEmpNo = @IssueEmpNo
    WHERE AssetCode = @AssetCode
  `);

    res.status(200).json({ message: 'Asset issued successfully.', IssuedID });
  } catch (err) {
    console.error('Error processing issue:', err);
    res.status(500).json({ error: 'Failed to process asset issue.', details: err.message });
  }
});




// Endpoint to return an asset
router.post('/return/:assetCode', async (req, res) => {
  const assetCode = req.params.assetCode;
  const returnDate = req.body?.returnDate ? new Date(req.body.returnDate) : new Date();

  try {
    await poolConnect;
    const request = pool.request();

    // Check last record of this asset
    const result = await request
      .input('assetCode', sql.Char(8), assetCode)
      .query(`
       SELECT TOP 1 * 
        FROM Issue_Register 
        WHERE AssetCode = @assetCode 
      ORDER BY IssueDate DESC, IssueRecID DESC
      `);

      console.log('Last entry:', result.recordset); // Debugging log
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'No issue record found for this asset.' });
    }

    const lastEntry = result.recordset[0];

    if (lastEntry.ReturenStatus == 1) {
      return res.status(400).json({ error: 'Asset already returned. Cannot return again.' });
    }

    const newIssuedID = generateIssuedID();

    // Insert new return entry in Issue_Register
    const insertReq = pool.request();
    insertReq
      .input('IssuedID', sql.VarChar(10), newIssuedID)
      .input('AssetCode', sql.Char(8), assetCode)
      .input('IssueDate', sql.DateTime, returnDate)
      .input('IssueType', sql.VarChar(20), lastEntry.IssueType)
      .input('IssueEmpno', sql.Char(8), lastEntry.IssueEmpno)
      .input('IssueEmpName', sql.VarChar(50), lastEntry.IssueEmpName)
      .input('IssueLocation', sql.VarChar(50), lastEntry.IssueLocation)
      .input('IssueStatus', sql.Int, 0) // Mark as returned
      .input('ReturenStatus', sql.Int, 1)
      .input('ReturnDate', sql.DateTime, returnDate)
      .input('IssuedBy', sql.VarChar(50), lastEntry.IssuedBy)
      .input('Remarks1', sql.VarChar(200), lastEntry.Remarks1 || '')
      .input('Remarks2', sql.VarChar(200), lastEntry.Remarks2 || '');

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

    // Update Asset_Master to reset issue details
    const updateReq = pool.request();
    await updateReq
      .input('AssetCode', sql.Char(8), assetCode)
      .query(`
        UPDATE Asset_Master SET
          IsIssued = 0,
          IssuedDate = NULL,
          UserContNo = NULL,
          OwnerCompany = NULL,
          IssuedSite = NULL,
          CurrentEmpNo = NULL
        WHERE AssetCode = @AssetCode
      `);

    res.status(200).json({ message: 'Asset return successful.' });
  } catch (err) {
    console.error('Error during return:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


// READ
router.get('/issue/:IssuedID', verifyToken, isAdmin, async (req, res) => {
  const { IssuedID } = req.params;
  try {
    await poolConnect;
    const request = pool.request();
    request.input('IssuedID', sql.Int, IssuedID);

    const result = await request.query(`
      SELECT * FROM [dbo].[Issue_Register] WHERE IssuedID = @IssuedID
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Issue record not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching issue:', err);
    res.status(500).json({ error: err.message });
  }
});

// READ
router.get('/all-issues', async (req, res) => {
  // const { IssuedID } = req.params;
  try {
    await poolConnect;
    const request = pool.request();
    // request.input('IssuedID', sql.Int, IssuedID);

    const result = await request.query(`
      SELECT * FROM [dbo].[Issue_Register] 
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Issue record not found' });
    }

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching issue:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/update-issue/:IssuedID', async (req, res) => {
  const { IssuedID } = req.params;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('IssuedID', sql.Int, IssuedID);

    const fields = [
      'IssueEmpName', 'IssueLocation', 'ReturnDate',
      'IssueStatus', 'ReturenStatus', 'Remarks1', 'Remarks2'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined)
        request.input(field, req.body[field]);
    });

    const setClause = fields
      .filter(f => req.body[f] !== undefined)
      .map(f => `${f} = @${f}`)
      .join(', ');

    if (!setClause) return res.status(400).json({ error: 'No fields provided for update' });

    await request.query(`
      UPDATE [dbo].[Issue_Register]
      SET ${setClause}
      WHERE IssuedID = @IssuedID
    `);

    res.status(200).json({ message: 'Issue record updated successfully' });
  } catch (err) {
    console.error('Error updating issue:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/delete-issue/:IssuedID', async (req, res) => {
  const { IssuedID } = req.params;

  try {
    await poolConnect;
    const request = pool.request();
    request.input('IssuedID', sql.Int, IssuedID);

    const result = await request.query(`
      DELETE FROM [dbo].[Issue_Register] WHERE IssuedID = @IssuedID
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Issue record not found or already deleted' });
    }

    res.status(200).json({ message: 'Issue record deleted successfully' });
  } catch (err) {
    console.error('Error deleting issue:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
