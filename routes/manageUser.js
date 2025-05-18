const express = require('express');
const { body, validationResult } = require('express-validator');
const { EmployeeMast } = require('../models');
const router = express.Router();
const bcrypt = require('bcrypt');

// GET /get-all-users
router.get('/get-all-users', async (req, res) => {
  try {
    const users = await EmployeeMast.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /get-filtered-users
router.post('/get-filtered-users', async (req, res) => {
  try {
    const { filters = [] } = req.body;

    let query = {};

    if (filters.length > 0) {
      filters.forEach(filter => {
        const { column, criteria, filterwith } = filter;

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

    const users = await EmployeeMast.findAll({
      where: query,
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ✅ ADD employee
router.post(
  '/add-user',
  [
    // Optional validation using express-validator
    body('EmpNo').isLength({ min: 8, max: 8 }).withMessage('EmpNo must be 8 characters'),
    body('EmpName').notEmpty().withMessage('EmpName is required'),
    body('EmpContNo').isMobilePhone().withMessage('EmpContNo should be a valid phone number')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Create the new user without LastLogin
      const newUser = await EmployeeMast.create(req.body);
      res.status(201).json(newUser);
    } catch (err) {
      console.error('Add error:', err);
      res.status(500).json({ error: 'Failed to add user' });
    }
  }
);

// ✅ UPDATE employee by EmpNo
router.put('/update-user/:empNo', async (req, res) => {
  try {
    const user = await EmployeeMast.findOne({ where: { EmpNo: req.params.empNo } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash password if present
    if (req.body.Password) {
      req.body.Password = await bcrypt.hash(req.body.Password, 10);
    }

    // Remove any date/datetime fields to avoid conversion errors
    delete req.body.UpdatedAt;
    delete req.body.LastLogin;
    delete req.body.DateOfBirth; // Remove or adjust depending on your schema

    const [updated] = await EmployeeMast.update(req.body, {
      where: { EmpNo: req.params.empNo }
    });

    if (updated) {
      const updatedUser = await EmployeeMast.findOne({ where: { EmpNo: req.params.empNo } });
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not updated' });
    }
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ✅ DELETE employee by EmpNo
router.delete('/delete-user/:empNo', async (req, res) => {
  try {
    // Check if the EmpNo exists
    const user = await EmployeeMast.findOne({ where: { EmpNo: req.params.empNo } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deleted = await EmployeeMast.destroy({
      where: { EmpNo: req.params.empNo }
    });

    if (deleted) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
