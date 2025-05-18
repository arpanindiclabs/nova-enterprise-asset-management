// const { body, validationResult } = require('express-validator');
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const express = require('express');
const router = express.Router();
const { sql, pool, poolConnect } = require('../db');
const { SupportCalls } = require('../models');
const { Op } = require('sequelize');

// GET all support calls for a specific employee
router.get('/user-requests/:empno', async (req, res) => {
  try {
    const { empno } = req.params;
    const supportCalls = await SupportCalls.findAll({
      where: { Empno: empno },
      order: [['CallRegDate', 'DESC']]
    });
    res.json(supportCalls);
  } catch (error) {
    console.error('Error fetching support calls:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all support calls
router.get('/', async (req, res) => {
  try {
    const supportCalls = await SupportCalls.findAll({
      order: [['CallRegDate', 'DESC']]
    });
    res.json(supportCalls);
  } catch (error) {
    console.error('Error fetching all support calls:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get filtered support calls
router.post('/get-filtered-support-calls', async (req, res) => {
  try {
    const { filters = [] } = req.body;

    let query = {};

    if (filters.length > 0) {
      filters.forEach(filter => {
        const { column, criteria, filterwith } = filter;

        // For safety: verify column is valid to prevent SQL injection
        const allowedColumns = [
          "AssetCode",
          "AssetType",
          "CallRegDate",
          "Empno",
          "UserName",
          "IssueType",
          "IssueDetails",
          "EnteredBy",
          "CallAssignTo",
          "ServiceCost",
          "CallStatus",
          "ClosedBy",
          "CloseDate",
          "CallRemarks",
          "UpdatedBy",
          "CallDetail_ID",
          "callAssignedDt",
          "CallAttainedBy",
          "ActionTaken",
          "ActionTakenDt",
          "CallEscalationNo",
          "EscalationTo",
          "EscalationDt",
          "CallDetailStatus",
          "CallDetailRemarks",
          "ResolveStatus",
          "EscalationStatus"
        ];

        if (!allowedColumns.includes(column)) return; // skip invalid columns

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

    const supportCalls = await SupportCalls.findAll({
      where: query,
    });

    res.json(supportCalls);
  } catch (error) {
    console.error('Error fetching support calls:', error);
    res.status(500).json({ error: 'Failed to fetch support calls' });
  }
});


// GET a specific support call by CallDetail_ID
router.get('/:id', async (req, res) => {
  try {
    const supportCall = await SupportCalls.findByPk(req.params.id);
    if (!supportCall) return res.status(404).json({ error: 'Not found' });
    res.json(supportCall);
  } catch (error) {
    console.error('Error fetching support call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE a new support call
router.post('/new-support', async (req, res) => {
  try {
    const { CallRegDate, ...rest } = req.body;

    // If no CallRegDate sent, omit it so SQL default (GETDATE) applies
    const newCall = await SupportCalls.create(
      CallRegDate ? { CallRegDate, ...rest } : { ...rest }
    );

    res.status(201).json(newCall);
  } catch (error) {
    console.error('Error creating support call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// UPDATE a support call (e.g., close, escalate, add remarks)
router.put('/:id', async (req, res) => {
  try {
    const supportCall = await SupportCalls.findByPk(req.params.id);
    if (!supportCall) return res.status(404).json({ error: 'Not found' });

    await supportCall.update(req.body);
    console.log('Support call updated:', supportCall);
    res.json(supportCall);
  } catch (error) {
    console.error('Error updating support call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// PUT /manage-support/resolve/:id
router.put("/resolve/:id", async (req, res) => {
  try {
    const supportCall = await SupportCalls.findByPk(req.params.id);
    if (!supportCall) return res.status(404).json({ error: "Support call not found" });

    const now = new Date().toISOString().slice(0, 23).replace("T", " "); // 'YYYY-MM-DD HH:mm:ss.SSS'

    await supportCall.update({
      ResolveStatus: true,
      // CloseDate: now,
      ClosedBy: req.body.ClosedBy,
      UpdatedBy: req.body.UpdatedBy,
    });

    console.log("Support call resolved:", supportCall);
    res.json({ message: "Support call marked as resolved", data: supportCall });
  } catch (error) {
    console.error("Error resolving support call:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /manage-support/escalate/:id
router.put("/escalate/:id", async (req, res) => {
  try {
    const supportCall = await SupportCalls.findByPk(req.params.id);
    if (!supportCall) return res.status(404).json({ error: "Support call not found" });

    const now = new Date().toISOString().slice(0, 23).replace("T", " ");

    await supportCall.update({
      EscalationStatus: true,
      // EscalationDt: now,
      EscalationTo: req.body.escalatedto,
      UpdatedBy: req.body.escalatedby,
    });

    console.log("Support call escalated:", supportCall);
    res.json({ message: "Support call escalated", data: supportCall });
  } catch (error) {
    console.error("Error escalating support call:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE a support call
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await SupportCalls.destroy({ where: { CallDetail_ID: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });

    res.json({ message: 'Support call deleted successfully' });
  } catch (error) {
    console.error('Error deleting support call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
