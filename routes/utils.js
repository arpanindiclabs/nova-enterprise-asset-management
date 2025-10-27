const express = require('express');
const router = express.Router();
const { sql, pool, poolConnect } = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

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
        WHERE IsIssued != 1
        AND (IsActive != 0 or IsActive is null)
        AND (IsScrraped != 1 or IsScrraped is null)
      `);

      //  AND (CurrentEmpNo IS NULL OR LTRIM(RTRIM(CurrentEmpNo)) = '')

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
        SELECT AssetCode, AssetType, AssetDescription, AssetBrand, AssetModel, AssetSlno , AssetERP_Code
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

router.get('/assets-for-emp', verifyToken, async (req, res) => {
  const  empNo  = req.user.empcode;
  console.log("EmpNo:", empNo)
  console.log("User:", req.user)

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


router.get('/my-profile', verifyToken, async (req, res) => {
  const  empNo  = req.user.empcode;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('empNo', sql.NVarChar, empNo)
      .query(`
        SELECT EmpNo, EmpName, EmpContNo, Password 
        FROM EmployeeMast
        WHERE EmpNo = @empNo
      `);

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update password
router.put('/update-password/:empNo', verifyToken, async (req, res) => {
  const { empNo } = req.params;
  const { currentPassword, newPassword } = req.body;

  // Verify that the user is updating their own password
  if (req.user.empcode !== empNo) {
    return res.status(403).json({ error: 'Unauthorized: You can only update your own password' });
  }

  // Input validation
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
  }

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ error: 'Passwords must be strings' });
  }

  try {
    await poolConnect;
    
    // First, get the current password hash
    const userResult = await pool.request()
      .input('EmpNo', sql.NVarChar, empNo)
      .query('SELECT Password FROM EmployeeMast WHERE EmpNo = @EmpNo');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Convert the BLOB password data to string
    const storedPassword = userResult.recordset[0].Password;
    let hashedPassword;
    
    try {
      if (storedPassword) {
        // Convert BLOB to string
        if (Buffer.isBuffer(storedPassword)) {
          hashedPassword = storedPassword.toString('utf8');
        } else if (storedPassword.data) {
          hashedPassword = Buffer.from(storedPassword.data).toString('utf8');
        } else {
          console.error('Invalid password format:', storedPassword);
          return res.status(500).json({ error: 'Invalid password format in database' });
        }
      } else {
        return res.status(500).json({ error: 'No password found in database' });
      }

      // Debug logging
      console.log('Password conversion:', {
        originalType: typeof storedPassword,
        isBuffer: Buffer.isBuffer(storedPassword),
        hasData: storedPassword.data ? true : false,
        convertedType: typeof hashedPassword
      });

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, hashedPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash the new password
      const newHashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password - store as BLOB
      const result = await pool.request()
        .input('Password', sql.VarBinary(sql.MAX), Buffer.from(newHashedPassword))
        .input('EmpNo', sql.NVarChar, empNo)
        .query('UPDATE EmployeeMast SET Password = @Password WHERE EmpNo = @EmpNo');

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('Password update error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/update-profile/:empNo', verifyToken, async (req, res) => {
  const { empNo } = req.params;
  const { EmpName, EmpContNo } = req.body;

  // Verify that the user is updating their own profile
  if (req.user.empcode !== empNo) {
    return res.status(403).json({ error: 'Unauthorized: You can only update your own profile' });
  }

  // Input validation
  if (EmpName && typeof EmpName !== 'string') {
    return res.status(400).json({ error: 'EmpName must be a string' });
  }
  if (EmpContNo && typeof EmpContNo !== 'string') {
    return res.status(400).json({ error: 'EmpContNo must be a string' });
  }

  try {
    await poolConnect;
    const request = pool.request();

    // Start building the update query
    let updateQuery = 'UPDATE EmployeeMast SET ';
    const params = [];

    if (EmpName) {
      params.push('EmpName = @EmpName');
      request.input('EmpName', sql.NVarChar, EmpName.trim());
    }

    if (EmpContNo) {
      params.push('EmpContNo = @EmpContNo');
      request.input('EmpContNo', sql.NVarChar, EmpContNo.trim());
    }

    // If no fields to update
    if (params.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Complete the update query
    updateQuery += params.join(', ') + ' WHERE EmpNo = @EmpNo';
    request.input('EmpNo', sql.NVarChar, empNo);

    // Execute the update
    const result = await request.query(updateQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the updated user data
    const updatedUser = await pool.request()
      .input('EmpNo', sql.NVarChar, empNo)
      .query(`
        SELECT EmpNo, EmpName, EmpContNo
        FROM EmployeeMast
        WHERE EmpNo = @EmpNo
      `);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser.recordset[0]
    });
  } catch (err) {
    console.error('SQL error:', err);
    if (err.number === 2627) { // SQL Server unique constraint violation
      return res.status(400).json({ error: 'A user with this information already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed employee information by employee code
router.get('/employee-details/:empNo', async (req, res) => {
  const { empNo } = req.params;

  // Input validation
  if (!empNo || typeof empNo !== 'string') {
    return res.status(400).json({ error: 'Employee number is required and must be a string' });
  }

  try {
    await poolConnect;
    const result = await pool.request()
      .input('empNo', sql.NVarChar, empNo.trim())
      .query(`
        SELECT 
          EmpNo,
          EmpName,
          EmpContNo,
          location
        FROM EmployeeMast
        WHERE EmpNo = @empNo
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Employee not found bla bla bla' });
    }

    const employee = result.recordset[0];
    
    // Remove sensitive information like password
    delete employee.Password;

    res.status(200).json({
      message: `Employee details for ${empNo}`,
      employee: employee
    });
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify if user is admin
router.get('/isadmin', verifyToken, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    res.status(200).json({ isAdmin });
  } catch (err) {
    console.error('Error checking admin status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;