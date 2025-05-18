const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { sql, pool, poolConnect } = require('./db');
const isInputSafe = require('./middleware/isInputSafe'); // Adjust path if needed

router.post('/register', async (req, res) => {
    var {
      EmpNo,
      EmpName,
      EmpCompID,
      EmpDeptID,
      EmpContNo,
      IsActive,
      Username, // can be null
      Password,
      LastLogin,
      LastLocation,
      IsAdmin,
      token
    } = req.body;
  
    if (!EmpNo || !EmpName || !EmpCompID || !EmpDeptID || !EmpContNo || !Password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    if (token !== 'admin-token' && token !== 'user-token') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (token == 'admin-token') {
        console.log('Admin token verified. Proceeding with registration.');
        IsAdmin=1
    }


    try {
      await poolConnect;
  
      // Check if EmpNo already exists
      const empCheck = await pool
        .request()
        .input('EmpNo', sql.Char(8), EmpNo)
        .query('SELECT 1 FROM EmployeeMast WHERE EmpNo = @EmpNo');
  
      if (empCheck.recordset.length > 0) {
        return res.status(409).json({ message: 'Employee code already exists' });
      }
  
      // If username is provided, check for uniqueness
      if (Username) {
        const usernameCheck = await pool
          .request()
          .input('Username', sql.NVarChar(50), Username)
          .query('SELECT 1 FROM EmployeeMast WHERE Username = @Username');
  
        if (usernameCheck.recordset.length > 0) {
          return res.status(409).json({ message: 'Username already taken' });
        }
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(Password, 10);
  
      // Insert employee
      await pool
        .request()
        .input('EmpNo', sql.Char(8), EmpNo)
        .input('EmpName', sql.NVarChar(100), EmpName)
        .input('EmpCompID', sql.Char(8), EmpCompID)
        .input('EmpDeptID', sql.Char(8), EmpDeptID)
        .input('EmpContNo', sql.NVarChar(20), EmpContNo)
        .input('IsActive', sql.Int, IsActive || 1)
        .input('Username', sql.NVarChar(50), Username || null)
        .input('Password', sql.VarBinary(256), Buffer.from(hashedPassword))
        .input('LastLogin', sql.DateTime, LastLogin || null)
        .input('LastLocation', sql.VarChar(50), LastLocation || null)
        .input('IsAdmin', sql.Bit, IsAdmin || false)
        .query(`
          INSERT INTO EmployeeMast (
            EmpNo, EmpName, EmpCompID, EmpDeptID, EmpContNo,
            IsActive, Username, Password, LastLogin, LastLocation, IsAdmin
          ) VALUES (
            @EmpNo, @EmpName, @EmpCompID, @EmpDeptID, @EmpContNo,
            @IsActive, @Username, @Password, @LastLogin, @LastLocation, @IsAdmin
          )
        `);
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error('Register Error:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  module.exports = router;
