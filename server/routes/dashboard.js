const express = require('express');
const { verifyToken } = require('../middleware/security');
const router = express.Router();

// Mock data for the dashboard graph
const getAccessibilityScoreTrend = () => [
    { name: 'Mon', score: 65 },
    { name: 'Tue', score: 72 },
    { name: 'Wed', score: 68 },
    { name: 'Thu', score: 85 },
    { name: 'Fri', score: 82 },
    { name: 'Sat', score: 90 },
    { name: 'Sun', score: 95 },
];

const persistenceService = require('../services/persistenceService');

let stats = persistenceService.load('dashboard_stats.json', { globalStatsCounter: 0 });
let globalStatsCounter = stats.globalStatsCounter;

router.get('/stats', verifyToken, (req, res) => {
    globalStatsCounter += 1;
    persistenceService.save('dashboard_stats.json', { globalStatsCounter });
    res.json({
        totalScans: 1240 + globalStatsCounter,
        issuesFixed: 856 + globalStatsCounter,
        complianceLevel: `${92 + (globalStatsCounter % 5)}%`,
        scoreTrend: getAccessibilityScoreTrend(),
        realTimeAccessibilityStats: {
            score: 85 + (globalStatsCounter % 10),
            criticalIssues: 0,
            warnings: 5
        },
        complianceTrends: getAccessibilityScoreTrend().map(t => t.score),
        user: req.user
    });
});

module.exports = router;
