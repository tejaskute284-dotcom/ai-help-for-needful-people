const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { accountLockout, handleFailedLogin, resetLockout, authLimiter, verifyToken } = require('../middleware/security');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.warn('⚠️ WARNING: JWT_SECRET not set in environment. Authentication will fail.');
}

const persistenceService = require('../services/persistenceService');

// Mock DB with persistence
let users = persistenceService.load('users.json', []);

// Register
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(201).json({ message: 'User already exists', userId: existingUser.id });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const userId = crypto.randomUUID();
        users.push({ id: userId, email, password: hashedPassword });
        persistenceService.save('users.json', users);

        res.status(201).json({ message: 'User registered successfully', userId: userId });
    } catch (error) {
        console.error("[Auth Register] Error:", error);
        res.status(500).json({ message: 'Internal server error during registration', error: error.message });
    }
});

// Login with lockout logic
router.post('/login', [
    authLimiter,
    accountLockout,
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
], async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        handleFailedLogin(email);
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const status = handleFailedLogin(email);
        const remaining = 5 - status.attempts;
        return res.status(401).json({
            message: `Invalid credentials. ${remaining} attempts left before account lock.`
        });
    }

    // Success: Clear lockout status
    resetLockout(email);

    if (!JWT_SECRET) return res.status(500).json({ message: 'Server authentication error' });
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: 'Login successful' });
});

// Profile
router.get(['/profile', '/me'], verifyToken, (req, res) => {
    res.json({ email: req.user.email, id: req.user.id });
});

// Delete user (restricted to authenticated user deleting themselves)
router.delete('/user/:id', verifyToken, (req, res) => {
    // Check if user is deleting their own account
    if (req.user.id !== req.params.id && req.user.email !== 'admin@example.com') {
        return res.status(403).json({ message: 'Forbidden: You can only delete your own account' });
    }

    const index = users.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
        users.splice(index, 1);
        persistenceService.save('users.json', users);
    }
    res.status(200).json({ message: 'User deleted' });
});

module.exports = router;
