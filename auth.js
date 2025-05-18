const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const { sql, pool, poolConnect } = require('./db'); // Adjust path if needed
const isInputSafe = require('./middleware/isInputSafe'); // Adjust path if needed
const bcrypt = require('bcrypt');


router.post('/login', async (req, res) => {
    var { EmpNo, password, location } = req.body;

    location = location || 'Unknown'; // Default location if not provided

    // Validate required fields
    if (!EmpNo || !password || !location) {
        return res.status(400).json({ message: 'EmpNo, password, and location are required.' });
    }

    // Basic SQL injection prevention
    if (![EmpNo, password, location].every(isInputSafe)) {
        return res.status(400).json({ message: 'Invalid input detected.' });
    }

    try {
        await poolConnect; // Ensure the DB pool is connected

        // Authenticate user
        const result = await pool.request()
            .input('EmpNo', sql.NVarChar, EmpNo)
            .input('password', sql.VarBinary, Buffer.from(password))
            .query(`
                SELECT EmpNo, Password, IsAdmin , EmpName, EmpCompID, EmpDeptID, EmpContNo, IsActive
                FROM EmployeeMast
                WHERE EmpNo = @EmpNo 
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Invalid Employee No or Code' });
        }

        const userResult = result.recordset[0];

        const passwordMatch = await bcrypt.compare(password, userResult.Password.toString());

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid EmpNo or password' });
        }

        // Update last login and location
        await pool.request()
            .input('EmpNo', sql.NVarChar, EmpNo)
            .input('location', sql.NVarChar, location)
            .query(`
                UPDATE EmployeeMast
                SET lastLogin = GETDATE(),
                    lastLocation = @location
                WHERE EmpNo = @EmpNo
            `);

        const user = result.recordset[0];
        const role = user.IsAdmin > 0 ? 'admin' : 'user';
        const empname = user.EmpName; // Assuming EmpName is in the result set
        const empcode = user.EmpNo; // Assuming EmpNo is in the result set
        const empCompID = user.EmpCompID; // Assuming EmpCompID is in the result set

        // JWT payload
        const payload = {
            EmpNo: user.EmpNo,
            role,
            empname,
            empcode,
            empCompID,
            location
        };

        // Generate token
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });

        // Optional: Decode to confirm
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('Decoded JWT:', decoded);

        return res.status(200).json({
            token,
            message: 'Login successful',
            EmpNo: user.EmpNo,
            role: role,
            empname: decoded.empname,
            empcode: decoded.empcode,
            empCompID: decoded.empCompID,
            location: decoded.location,
        });

    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;



