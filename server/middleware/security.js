const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
}

// Brute-force protection: rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Increased for test runs
    message: {
        message: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const persistenceService = require('../services/persistenceService');

// Mock user "locking" store with persistence
const initialLockouts = persistenceService.load('lockouts.json', []);
const lockoutStore = new Map(initialLockouts);

const syncLockouts = () => {
    persistenceService.save('lockouts.json', Array.from(lockoutStore.entries()));
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const accountLockout = (req, res, next) => {
    const { email } = req.body;
    if (!email) return next();

    const status = lockoutStore.get(email);

    if (status && status.lockedUntil > Date.now()) {
        return res.status(403).json({
            message: `Account is locked. Please try again in ${Math.ceil((status.lockedUntil - Date.now()) / 60000)} minutes.`
        });
    }

    next();
};

const handleFailedLogin = (email) => {
    const status = lockoutStore.get(email) || { attempts: 0, lockedUntil: 0 };
    status.attempts += 1;

    if (status.attempts >= MAX_FAILED_ATTEMPTS) {
        status.lockedUntil = Date.now() + LOCKOUT_DURATION;
        status.attempts = 0; // Reset after locking
    }

    lockoutStore.set(email, status);
    syncLockouts();
    return status;
};

const resetLockout = (email) => {
    lockoutStore.delete(email);
    syncLockouts();
};

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = {
    authLimiter,
    accountLockout,
    handleFailedLogin,
    resetLockout,
    verifyToken
};
