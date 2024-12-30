require('dotenv').config()

// Add any additional setup code here
console.log('Integration test environment variables loaded:', {
  AWS_REGION: process.env.AWS_REGION,
  INTEGRATION_TEST: process.env.INTEGRATION_TEST,
  // Mask sensitive credentials in logs
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? '***' : undefined,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? '***' : undefined
})