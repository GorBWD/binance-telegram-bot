require('dotenv').config();

const PORT = process.env.PORT || 3000;

if ( !process.env.BOT_TOKEN ) {
    throw new Error('Please specify BOT_TOKEN environment variable');
}

module.exports = {
    PORT,
    BOT_TOKEN: process.env.BOT_TOKEN,
    BACKEND_URL: `http://localhost:${PORT}`,
    ENCRYPTION_KEY: 'aVSrKsMHprZRSuUutYFCVeK5XSNPXcc7',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    IV_KEY: '8qbsr3imxxspbys1'
}



