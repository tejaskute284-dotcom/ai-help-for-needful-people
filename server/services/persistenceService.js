const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '../data');

const persistenceService = {
    ensureDir() {
        if (!fs.existsSync(STORAGE_DIR)) {
            fs.mkdirSync(STORAGE_DIR, { recursive: true });
        }
    },

    save(filename, data) {
        this.ensureDir();
        const filePath = path.join(STORAGE_DIR, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    },

    load(filename, defaultValue) {
        this.ensureDir();
        const filePath = path.join(STORAGE_DIR, filename);
        if (fs.existsSync(filePath)) {
            try {
                return JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (error) {
                console.error(`[Persistence] Error loading ${filename}:`, error);
                return defaultValue;
            }
        }
        return defaultValue;
    }
};

module.exports = persistenceService;
