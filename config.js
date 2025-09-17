/**
 * Configuration module for the school children management system
 * Centralizes all configuration values and environment variables
 */

require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5500,
    corsOrigin: process.env.CORS_ORIGIN || 'http://127.0.0.1:5500'
  },

  // Twilio configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },

  // File paths
  files: {
    dataFile: process.env.DATA_FILE || 'data.csv',
    messageLogFile: process.env.MESSAGE_LOG_FILE || 'messageDetails.json'
  },

  // API endpoints
  endpoints: {
    sendText: '/send-text',
    saveData: '/save-data',
    getData: '/get-data',
    downloadCsv: '/download-csv'
  }
};

// Validate required environment variables
const requiredEnvVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

module.exports = config;
