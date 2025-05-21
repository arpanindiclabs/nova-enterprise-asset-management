const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const { sql, pool, poolConnect } = require('./db'); // Adjust path if needed
const isInputSafe = require('./middleware/isInputSafe'); // Adjust path if needed
const bcrypt = require('bcrypt');


router.post('/login', async (req, res) => {
    var { EmpNo, password, location, coordinates } = req.body;

    // Validate required fields
    if (!EmpNo || !password) {
        return res.status(400).json({ message: 'EmpNo and password are required.' });
    }

    try {
        await poolConnect; // Ensure the DB pool is connected

        // Authenticate user
        const result = await pool.request()
            .input('EmpNo', sql.NVarChar, EmpNo)
            .input('password', sql.VarBinary, Buffer.from(password))
            .query(`
                SELECT EmpNo, Password, IsAdmin, EmpName, EmpCompID, EmpDeptID, EmpContNo, IsActive
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

        // Update last login with coordinates and location
        const updateQuery = `
            UPDATE EmployeeMast
            SET LastLogin = GETDATE(),
                lastLocation = @coordinates,
                location = @location
            WHERE EmpNo = @EmpNo
        `;

        const updateRequest = pool.request()
            .input('EmpNo', sql.NVarChar, EmpNo)
            .input('location', sql.VarChar(400), location || null)
            .input('coordinates', sql.VarChar(100), coordinates || null);

        await updateRequest.query(updateQuery);

        const user = result.recordset[0];
        const role = user.IsAdmin > 0 ? 'admin' : 'user';
        const empname = user.EmpName;
        const empcode = user.EmpNo;
        const empCompID = user.EmpCompID;

        // JWT payload
        const payload = {
            EmpNo: user.EmpNo,
            role,
            empname,
            empcode,
            empCompID,
            location,
            coordinates
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
            coordinates: decoded.coordinates
        });

    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;



