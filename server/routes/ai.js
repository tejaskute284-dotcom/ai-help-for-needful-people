const express = require('express');
const { verifyToken } = require('../middleware/security');
const aiService = require('../services/aiService');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.post('/process', [
    verifyToken,
    body('feature').optional().isString().isLength({ max: 100 }).trim(),
    body('action').optional().isString().isLength({ max: 500 }).trim(),
    body('message').optional().isString().isLength({ max: 2000 }).trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { feature, action, message } = req.body;
    const targetFeature = feature || "Conversational AI";
    const targetAction = action || message || "General Inquiry";

    try {
        const response = await aiService.processAccessibilityRequest(targetFeature, targetAction);
        res.json({ response, reply: response });
    } catch (error) {
        console.error("[AI Route] Error:", error);
        res.status(500).json({ message: 'Error processing AI request' });
    }
});

// Alias for converse
router.post('/converse', [
    verifyToken,
    body('message').isString().notEmpty().isLength({ max: 2000 }).trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { message } = req.body;
    try {
        const response = await aiService.processAccessibilityRequest("Conversational AI", message || "Hello");
        res.json({ response, reply: response });
    } catch (error) {
        console.error("[AI Converse] Error:", error);
        res.status(500).json({ message: 'Error processing AI request' });
    }
});

module.exports = router;
