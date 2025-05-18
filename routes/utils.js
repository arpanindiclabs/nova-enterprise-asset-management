const express = require('express');
const router = express.Router();
const { sql, pool, poolConnect } = require('../db');

// GET /asset-types → returns just an array of asset types
router.get('/asset-types', async (req, res) => {
  try {
    await poolConnect;
    const request = pool.request();

    const jsonString = await request.query(`
      SELECT [AssetTypes] FROM [dbo].[OfficeAssetBrands] `);

    const assetArray = jsonString.recordset.map(item => item.AssetTypes);

    res.status(200).json(assetArray); // Return raw array
  } catch (err) {
    console.error('Error fetching asset types:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /brands → returns just an array of brands
router.get('/brands', async (req, res) => {
  try {
    await poolConnect;
    const request = pool.request();

    const jsonString = await request.query(`
      SELECT [Brands] FROM [dbo].[OfficeAssetBrands] `);

      const brandsArray = jsonString.recordset.map(item => item.Brands);

    res.status(200).json(brandsArray); 
  } catch (err) {
    console.error('Error fetching brands:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Get free asset codes with descriptions, type, and vendor
router.get('/get-free-assets', async (req, res) => {
  await poolConnect;

  try {
    const result = await pool.request()
      .query(`
        SELECT AssetCode, AssetDescription, AssetType, VendorName
        FROM [dbo].[Asset_Master]
        WHERE IsIssued = 0
        AND (CurrentEmpNo IS NULL OR LTRIM(RTRIM(CurrentEmpNo)) = '')
      `);

    const freeAssets = result.recordset.map(row => ({
      AssetCode: row.AssetCode,
      AssetDescription: row.AssetDescription,
      AssetType: row.AssetType,
      VendorName: row.VendorName
    }));

    res.status(200).json(freeAssets); // Return array of objects
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



//get employee codes
// This endpoint retrieves all employee codes from the EmployeeMast table
router.get('/get-employee-codes', async (req, res) => {
  await poolConnect;

  try {
    const result = await pool.request()
      .query(`SELECT EmpNo FROM [dbo].[EmployeeMast]`);

    const employeeCodes = result.recordset.map(row => row.EmpNo);

    res.status(200).json(employeeCodes); // Return array of EmpNo
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employees: EmpNo and EmpName
router.get('/get-employees', async (req, res) => {
  await poolConnect;

  try {
    const result = await pool.request()
      .query(`SELECT EmpNo, EmpName FROM [dbo].[EmployeeMast]`);

    res.status(200).json(result.recordset); // Returns array of { EmpNo, EmpName }
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//get company names and codes
router.get('/get-companies', async (req, res) => {
  await poolConnect;

  try {
    const result = await pool.request()
      .query(`SELECT CompCode, CompName FROM [dbo].[Company]`);

    res.status(200).json(result.recordset); // Returns array of objects
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//get company names
router.get('/get-company-names', async (req, res) => {
  await poolConnect;

  try {
    const result = await pool.request()
      .query(`SELECT CompName FROM [dbo].[Company]`);

    const companyNames = result.recordset.map(row => row.CompName);
    res.status(200).json(companyNames);
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//get company code by name
router.post('/get-company-code', async (req, res) => {
  await poolConnect;
  const { companyName } = req.body;

  if (!companyName) {
    return res.status(400).json({ error: 'companyName is required in request body' });
  }

  try {
    const result = await pool.request()
      .input('companyName', sql.VarChar(100), companyName)
      .query(`SELECT CompCode FROM [dbo].[Company] WHERE CompName = @companyName`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.status(200).json({ CompCode: result.recordset[0].CompCode });
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/get-current-assets-by-empcode', async (req, res) => {
  await poolConnect;
  const { empcode } = req.body;

  if (!empcode) {
    return res.status(400).json({ error: 'empcode is required in the request body' });
  }

  try {
    const result = await pool.request()
      .input('empcode', sql.VarChar(10), empcode)
      .query(`
        SELECT AssetCode, AssetType, AssetDescription, AssetBrand, AssetModel, AssetSlno
        FROM [dbo].[Asset_Master]
        WHERE CurrentEmpNo = @empcode
      `);

    res.status(200).json(result.recordset); // Array of asset objects
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all assets for a specific employee
router.get('/assets/:empNo', async (req, res) => {
  const { empNo } = req.params;

  try {
    await poolConnect; // Ensure DB connection is ready

    const result = await pool.request()
      .input('EmpNo', sql.NVarChar, empNo)
      .query(`
        SELECT AssetCode, AssetDescription
        FROM Asset_Master
        WHERE CurrentEmpNo = @EmpNo
      `);

    res.status(200).json({
      message: `Assets for employee ${empNo}`,
      assets: result.recordset
    });
  } catch (err) {
    console.error('DB query error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router;