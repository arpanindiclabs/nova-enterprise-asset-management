const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { sql, pool, poolConnect } = require('../db'); // Adjust the path as necessary

const tableMap = {
  "assets": "Asset_Master",
  "assetTransferRegister": "AssetTransferRegister",
  "callLogs": "Call_LogMaster",
  "callDetails": "CallDetails",
  "company": "Company",
  "customers": "Customers",
  "departments": "Department",
  "employees": "EmployeeMast",
  "issueRegister": "Issue_Register",
  "orders": "Orders",
  "users": "UserMast",
  "vendors": "VendorMast"
};


// Route to get data from a specific table based on the table name in the request parameters
// This route is protected and requires a valid JWT token
router.get('/tables/:tableName', verifyToken , async (req, res) => {
  const role  = req.user.role; // Extract username from the token payload
  const { tableName } = req.params; // Extract table name from the request parameters


  console.log(tableName); // Log the request body for debugging
  
  
  const actualTableName = tableMap[tableName];
  if (!actualTableName) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  // Check if the user has the required role
  if (role !== 'admin' && role !== 'user') {
    console.log('Access denied for user:', role); // Log the access denied message
    return res.status(403).json({ message: 'Access denied' });
  }


  try {
    if (role === 'user') {
      console.log('User role detected, restricting access to user data'); // Log the user role
      if (["AssetTransferRegister", "Company", "Department"].includes(actualTableName)) {
        try {
            await poolConnect;
            const { recordset } = await pool.request().query(`SELECT * FROM ${actualTableName}`);
            res.json(recordset);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    } else {
        res.status(403).json({ message: "Forbidden" });
    }
    


    }

    if (role === 'admin') {
    await poolConnect;
    const result = await pool.request().query(`SELECT * FROM ${actualTableName}`);
    res.json(result.recordset);
    }
    
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }

});






// Route to get all tables for admin and user
// This route is protected and requires a valid JWT token
router.get('/tables', verifyToken, async (req, res) => {
  const role  = req.user.role; // Extract username from the token payload
  console.log('User route accessed by:', role ); // Log the username from the token payload

  // Check if the user has the required role
  if (role !== 'admin' && role !== 'user') {
    console.log('Access denied for user:', role); // Log the access denied message
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    if (role === 'user') {
      res.json({ message: 'User' });
    }

    if (role === 'admin') {
      res.json({ message: 'Admin' });
    }
    
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }

})

module.exports = router;
