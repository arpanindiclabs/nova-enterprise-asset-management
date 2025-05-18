const express = require('express');
const { body, validationResult } = require('express-validator');
const { AssetTransferRegister, EmployeeMast, Asset_Master } = require('../models');;
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const { Op } = require('sequelize');


const router = express.Router();

// CREATE
router.post('/add-transfer', verifyToken, async (req, res) => {


  try {
    const { AssetCode, AssetDesc, TransferFrom, TransferTo, ReasonOfTransfer, ApproveByTransTo, ApproveByAdmin, Remarks } = req.body;
    const EnteredBy = req.user.EmpNo; // Assuming EnteredBy is the logged-in user's EmpNo
    const TransferCode = await generateUniqueTransferCode(); // Generate a unique TransferCode

    // Validate AssetCode exists in Asset_Master
    const asset = await Asset_Master.findOne({ where: { AssetCode } });
    if (!asset) return res.status(404).json({ message: 'AssetCode not found' });

    // Validate TransferFrom and TransferTo exist in EmployeeMast
    const transferFromEmployee = await EmployeeMast.findOne({ where: { EmpNo: TransferFrom } });
    if (!transferFromEmployee) return res.status(404).json({ message: 'TransferFrom employee not found' });

    const transferToEmployee = await EmployeeMast.findOne({ where: { EmpNo: TransferTo } });
    if (!transferToEmployee) return res.status(404).json({ message: 'TransferTo employee not found' });

    // Validate EnteredBy exists in EmployeeMast
    const enteredByEmployee = await EmployeeMast.findOne({ where: { EmpNo: EnteredBy } });
    if (!enteredByEmployee) return res.status(404).json({ message: 'EnteredBy employee not found' });

    // Create the new transfer record
    const transfer = await AssetTransferRegister.create({
      TransferCode,
      AssetCode,
      AssetDesc,
      TransferFrom,
      TransferTo,
      ReasonOfTransfer,
      ApproveByTransTo,
      ApproveByAdmin,
      Remarks,
      EnteredBy
    });

    res.status(200).json({ message: 'Transfer record added successfully', data: transfer });

  } catch (err) {
    console.error('Error adding transfer:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/transfers-list', verifyToken, async (req, res) => {
    const employeeId = req.user.EmpNo;
  
    try {
      const transfers = await AssetTransferRegister.findAll({
        where: {
          [Op.or]: [
            { TransferFrom: employeeId },
            { TransferTo: employeeId }
          ]
        }
      });
  
      if (transfers.length === 0) {
        return res.status(404).json({ message: 'No transfers found for this employee' });
      }
  
      res.json(transfers);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

// READ
router.get('/transfer/:TransferCode', verifyToken, isAdmin, async (req, res) => {
  try {
    const { TransferCode } = req.params;
    const transfer = await AssetTransferRegister.findOne({ where: { TransferCode } });

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer record not found' });
    }

    res.status(200).json(transfer);
  } catch (err) {
    console.error('Error fetching transfer:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/update-transfer/:TransferCode', verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() });

  try {
    const { TransferCode } = req.params;
    const { AssetCode, AssetDesc, TransferFrom, TransferTo, ReasonOfTransfer, ApproveByTransTo, ApproveByAdmin, Remarks, EnteredBy } = req.body;

    const transfer = await AssetTransferRegister.findOne({ where: { TransferCode } });
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer record not found' });
    }

    // Validate AssetCode exists in Asset_Master
    const asset = await Asset_Master.findOne({ where: { AssetCode } });
    if (!asset) return res.status(404).json({ message: 'AssetCode not found' });

    // Validate TransferFrom and TransferTo exist in EmployeeMast
    const transferFromEmployee = await EmployeeMast.findOne({ where: { EmpNo: TransferFrom } });
    if (!transferFromEmployee) return res.status(404).json({ message: 'TransferFrom employee not found' });

    const transferToEmployee = await EmployeeMast.findOne({ where: { EmpNo: TransferTo } });
    if (!transferToEmployee) return res.status(404).json({ message: 'TransferTo employee not found' });

    // Update the transfer record
    await transfer.update({
      AssetCode, AssetDesc, TransferFrom, TransferTo, ReasonOfTransfer,
      ApproveByTransTo, ApproveByAdmin, Remarks, EnteredBy
    });

    res.status(200).json({ message: 'Transfer record updated successfully' });
  } catch (err) {
    console.error('Error updating transfer:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH (Approve Transfer)
// This route is for approving the transfer by the TransferTo employee
router.patch('/approve/:id', verifyToken, async (req, res) => {
    const { id } = req.params; // id = TransferCode
    const { ApproveByTransTo, Remarks } = req.body;
  
    try {
      const transfer = await AssetTransferRegister.findOne({
        where: { TransferCode: id }
      });
  
      if (!transfer) {
        return res.status(404).json({ message: 'Transfer not found' });
      }
  
      if (transfer.TransferTo !== req.user.EmpNo) {
        return res.status(403).json({ message: 'You are not authorized to approve this transfer' });
      }

      transfer.ApproveByTransTo = ApproveByTransTo;
      transfer.Remarks = Remarks;

  
      await transfer.save();
  
      res.status(200).json({ message: 'Transfer approved successfully', transfer });
    } catch (error) {
      console.error('Error approving transfer:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


// Endpoint to get filtered transfers for admin
router.post('/get-filtered-transfers-admin', async (req, res) => {
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

    const transfers = await AssetTransferRegister.findAll({ where: query });

    res.status(200).json(transfers);
  } catch (error) {
    console.error('Error fetching filtered transfers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// PATCH (Approve Transfer by Admin)
  router.patch('/approve-by-admin/:id', async (req, res) => {
    const { id } = req.params; // id = TransferCode
    const { ApproveByAdmin, Remarks } = req.body;
  
    try {
      const transfer = await AssetTransferRegister.findOne({
        where: { TransferCode: id }
      });
  
      if (!transfer) {
        return res.status(404).json({ message: 'Transfer not found' });
      }

      if (transfer.ApproveByAdmin ==  1 & ApproveByAdmin == 1) {
        return res.status(404).json({ message: 'Transfer already approved by admin' });
      }
      
      if (transfer.ApproveByAdmin ==  0 & ApproveByAdmin == 0) {
        return res.status(404).json({ message: 'Transfer already Rejected by admin' });
      }

      // if  (transfer.ApproveByTransTo !== 1 & transfer.ApproveByTransTo !== 0) {

          transfer.ApproveByAdmin = ApproveByAdmin;
          console.log('ApproveByAdmin:', ApproveByAdmin); // Debugging line
          

          if (ApproveByAdmin == 1) {

            const asset = await Asset_Master.findOne({ where: { AssetCode: transfer.AssetCode } });

            asset.CurrentEmpNo = transfer.TransferTo; // Update the CurrentEmpNo in Asset_Master

            console.log('Asset before saving:', asset); // Debugging line
        
            await asset.save(); // Save the changes to Asset_Master
          
            
          }

        // }

      transfer.Remarks = Remarks;
      console.log('Transfer before saving:', transfer); // Debugging line
      await transfer.save();


      res.status(200).json({ message: 'Transfer approved successfully', transfer });
    } catch (error) {
      console.error('Error approving transfer:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  router.get('/pending-requests', verifyToken, async (req, res) => {
    try {
      const EmpNo = req.user.EmpNo;
  
      const transfers = await AssetTransferRegister.findAll({
        where: {
          TransferTo: EmpNo,
          ApproveByTransTo: {
            [Op.is]: null
          }
        }
      });
  
      res.status(200).json(transfers);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


// DELETE
router.delete('/delete-transfer/:TransferCode', verifyToken, isAdmin, async (req, res) => {
  try {
    const { TransferCode } = req.params;
    const transfer = await AssetTransferRegister.findOne({ where: { TransferCode } });

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer record not found' });
    }

    await transfer.destroy();
    res.status(200).json({ message: 'Transfer record deleted successfully' });

  } catch (err) {
    console.error('Error deleting transfer:', err);
    res.status(500).json({ error: err.message });
  }
});



async function generateUniqueTransferCode() {
    const prefix = 'TF';
    const padLength = 5;
  
    // Get the latest code
    const lastRecord = await AssetTransferRegister.findOne({
      order: [['TransferCode', 'DESC']],
    });
  
    let lastNumber = 0;
    if (lastRecord && lastRecord.TransferCode) {
      const match = lastRecord.TransferCode.match(/\d+$/);
      if (match) lastNumber = parseInt(match[0], 10);
    }
  
    let newCode;
    let exists = true;
    do {
      lastNumber += 1;
      newCode = `${prefix}${String(lastNumber).padStart(padLength, '0')}`;
      const existing = await AssetTransferRegister.findOne({ where: { TransferCode: newCode } });
      exists = !!existing;
    } while (exists);
  
    return newCode;
  }

module.exports = router;
